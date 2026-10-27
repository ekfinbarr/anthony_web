import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2, Sheet } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notify } from "@/lib/notify";
import { exportRows, type ExportColumn, type ExportFormat } from "@/lib/export/tableExport";
import { EXPORT_ROW_LIMIT } from "./fetchAllPages";

const FORMATS: Array<{ key: ExportFormat; label: string; icon: typeof FileText }> = [
  { key: "xlsx", label: "Excel (.xlsx)", icon: FileSpreadsheet },
  { key: "pdf", label: "PDF report", icon: FileText },
  { key: "csv", label: "CSV", icon: Sheet },
];

interface ExportMenuProps<T> {
  title: string;
  filename: string;
  columns: ExportColumn<T>[];
  /** Fetch every row matching the current filters. */
  fetchAll: () => Promise<{ rows: T[]; truncated: boolean }>;
  /** Currently selected rows (offers "export selected"). */
  selected?: T[];
  /** Describes the active filters, printed on the PDF. */
  subtitle?: string;
  currency?: string;
  /** Compact trigger for the bulk bar. */
  variant?: "default" | "bar";
  className?: string;
  size?: ButtonProps["size"];
}

export function ExportMenu<T>({ title, filename, columns, fetchAll, selected = [], subtitle, currency, variant = "default", className, size }: ExportMenuProps<T>) {
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (format: ExportFormat, scope: "selected" | "all") => {
    setBusy(`${scope}-${format}`);
    try {
      let rows = selected;
      let truncated = false;
      if (scope === "all") ({ rows, truncated } = await fetchAll());
      if (rows.length === 0) {
        notify.error("Nothing to export", "No records match the current filters.");
        return;
      }
      await exportRows(format, {
        title,
        filename: scope === "selected" ? `${filename}-selected` : filename,
        columns,
        rows,
        currency,
        subtitle: scope === "selected" ? `Selected records${subtitle ? ` · ${subtitle}` : ""}` : subtitle,
      });
      notify.success(
        `Exported ${rows.length} record${rows.length === 1 ? "" : "s"}`,
        truncated ? `Limited to the first ${EXPORT_ROW_LIMIT}. Narrow the filters to export the rest.` : undefined
      );
    } catch (error) {
      notify.error(error, { description: "The export could not be created." });
    } finally {
      setBusy(null);
    }
  };

  const trigger =
    variant === "bar" ? (
      <Button size="sm" variant="ghost" className="h-9 rounded-xl px-3 text-church-pearl hover:bg-white/10" disabled={!!busy} aria-label="Export">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        <span className="ml-1.5 hidden md:inline">Export</span>
      </Button>
    ) : (
      <Button variant="outline" size={size} className={className} disabled={!!busy}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Export
      </Button>
    );

  const items = (scope: "selected" | "all") =>
    FORMATS.map((f) => (
      <DropdownMenuItem key={`${scope}-${f.key}`} onClick={() => run(f.key, scope)} disabled={!!busy} className="gap-2">
        <f.icon className="h-4 w-4 text-church-gold-warm" aria-hidden />
        {f.label}
      </DropdownMenuItem>
    ));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={variant === "bar" ? "top" : "bottom"} className="w-60">
        {selected.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Selected ({selected.length})</DropdownMenuLabel>
            {items("selected")}
            {variant !== "bar" && <DropdownMenuSeparator />}
          </>
        )}
        {variant !== "bar" && (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">All matching results</DropdownMenuLabel>
            {items("all")}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
