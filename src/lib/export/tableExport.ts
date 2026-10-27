import { format as formatDate } from "date-fns";
import { site } from "@/config/site";
import { buildXlsx, type XlsxCell, type XlsxCellFormat } from "./xlsx";

/**
 * One column definition drives all three formats, so a table's CSV, Excel
 * and PDF exports always agree.
 */
export interface ExportColumn<T> {
  header: string;
  value: (row: T) => XlsxCell;
  type?: XlsxCellFormat;
  /** Sum this column in a totals row (Excel and PDF). */
  total?: boolean;
  /** Excel column width in characters. */
  width?: number;
}

export type ExportFormat = "csv" | "xlsx" | "pdf";

export interface ExportOptions<T> {
  /** Report title, e.g. "Mass bookings". */
  title: string;
  /** File name without extension; a date is appended. */
  filename: string;
  columns: ExportColumn<T>[];
  rows: T[];
  /** One line describing the filters/scope, printed under the PDF title. */
  subtitle?: string;
  currency?: string;
}

const today = () => formatDate(new Date(), "yyyy-MM-dd");

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Normalise API values (ISO strings, numeric strings) into typed cells. */
function cell<T>(column: ExportColumn<T>, row: T): XlsxCell {
  const raw = column.value(row);
  if (raw === null || raw === undefined || raw === "") return null;
  switch (column.type) {
    case "number":
    case "money": {
      const n = typeof raw === "number" ? raw : Number(raw);
      return Number.isFinite(n) ? n : String(raw);
    }
    case "date":
    case "datetime": {
      if (raw instanceof Date) return raw;
      const d = new Date(String(raw).length === 10 ? `${raw}T00:00:00` : String(raw));
      return Number.isNaN(d.getTime()) ? String(raw) : d;
    }
    default:
      return typeof raw === "boolean" ? raw : String(raw);
  }
}

function display(value: XlsxCell, type: XlsxCellFormat | undefined, currency: string, forPdf = false): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return formatDate(value, type === "datetime" ? "d MMM yyyy, HH:mm" : "d MMM yyyy");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (type === "money") {
      // jsPDF's standard fonts have no ₦ glyph, so PDFs show the ISO code ("NGN 2,500.00").
      const text = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        currencyDisplay: forPdf ? "code" : "symbol",
        maximumFractionDigits: 2,
      }).format(value);
      return forPdf ? pdfSafe(text) : text;
    }
    if (type === "number") return new Intl.NumberFormat("en-NG").format(value);
  }
  return String(value);
}

/** Standard PDF fonts only cover Latin-1; normalise the spaces Intl inserts. */
const pdfSafe = (text: string) => text.replace(/[\u00A0\u202F]/g, " ");

// ---- CSV --------------------------------------------------------------------

/** Quote, and neutralise spreadsheet formula injection (=, +, -, @ prefixes). */
const csvField = (value: string) => {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

function toCsv<T>(opts: ExportOptions<T>): Blob {
  const currency = opts.currency ?? "NGN";
  const lines = [opts.columns.map((c) => csvField(c.header)).join(",")];
  for (const row of opts.rows) {
    lines.push(
      opts.columns
        .map((c) => {
          const v = cell(c, row);
          // Keep numbers machine-readable in CSV; format dates for humans.
          if (typeof v === "number") return String(v);
          return csvField(display(v, c.type, currency));
        })
        .join(",")
    );
  }
  // BOM so Excel opens UTF-8 (₦, accents) correctly.
  return new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
}

// ---- PDF --------------------------------------------------------------------

async function toPdf<T>(opts: ExportOptions<T>): Promise<Blob> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const currency = opts.currency ?? "NGN";
  const landscape = opts.columns.length > 5;
  const doc = new jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 36;

  const charcoal: [number, number, number] = [33, 33, 33];
  const gold: [number, number, number] = [188, 133, 82];

  const body = opts.rows.map((row) => opts.columns.map((c) => pdfSafe(display(cell(c, row), c.type, currency, true))));
  const totalsWanted = opts.columns.some((c) => c.total);
  const foot = totalsWanted
    ? [
        opts.columns.map((c, i) => {
          if (c.total) {
            const sum = opts.rows.reduce((acc, row) => {
              const v = cell(c, row);
              return acc + (typeof v === "number" ? v : 0);
            }, 0);
            return display(sum, c.type, currency, true);
          }
          return i === 0 ? "Total" : "";
        }),
      ]
    : undefined;

  const numericAlign = Object.fromEntries(
    opts.columns.map((c, i) => [i, c.type === "money" || c.type === "number" ? { halign: "right" as const } : {}])
  );

  autoTable(doc, {
    head: [opts.columns.map((c) => c.header)],
    body,
    foot,
    startY: 112,
    margin: { left: margin, right: margin, top: 70, bottom: 48 },
    styles: { fontSize: 8.5, cellPadding: 5, overflow: "linebreak", textColor: [40, 40, 40], lineColor: [235, 230, 224], lineWidth: 0.5 },
    headStyles: { fillColor: charcoal, textColor: [255, 255, 255], fontStyle: "bold" },
    footStyles: { fillColor: [245, 233, 211], textColor: charcoal, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 248, 245] },
    columnStyles: numericAlign,
    showFoot: "lastPage",
    didDrawPage: (data) => {
      // Branded header on every page.
      doc.setFillColor(...charcoal);
      doc.rect(0, 0, pageWidth, 54, "F");
      doc.setFillColor(...gold);
      doc.rect(0, 54, pageWidth, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(site.name, margin, 33);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Generated ${formatDate(new Date(), "d MMM yyyy, HH:mm")}`, pageWidth - margin, 33, { align: "right" });

      if (data.pageNumber === 1) {
        doc.setTextColor(...charcoal);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(opts.title, margin, 84);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(110, 104, 96);
        doc.text(
          `${opts.subtitle ? `${opts.subtitle} · ` : ""}${opts.rows.length} record${opts.rows.length === 1 ? "" : "s"}`,
          margin,
          100
        );
      }
    },
  });

  // Footer with page numbers once the page count is known.
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(140, 134, 126);
    doc.text(`${site.name} · Confidential parish record`, margin, h - 20);
    doc.text(`Page ${i} of ${pages}`, pageWidth - margin, h - 20, { align: "right" });
  }

  return doc.output("blob");
}

// ---- Dispatcher -----------------------------------------------------------------

export async function exportRows<T>(fmt: ExportFormat, opts: ExportOptions<T>): Promise<void> {
  const base = `${opts.filename}-${today()}`;

  if (fmt === "csv") {
    download(toCsv(opts), `${base}.csv`);
    return;
  }

  if (fmt === "xlsx") {
    const blob = buildXlsx({
      name: opts.title,
      headers: opts.columns.map((c) => c.header),
      rows: opts.rows.map((row) => opts.columns.map((c) => cell(c, row))),
      formats: opts.columns.map((c) => c.type ?? "text"),
      widths: opts.columns.map((c) => c.width ?? 0).map((w) => (w > 0 ? w : undefined)) as number[],
      totals: opts.columns.flatMap((c, i) => (c.total ? [i] : [])),
    });
    download(blob, `${base}.xlsx`);
    return;
  }

  download(await toPdf(opts), `${base}.pdf`);
}
