import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequiredLabel } from "@/components/admin/shared/RequiredLabel";

export type CsvImportResult = {
  imported: number;
  failed: number;
  errors?: Array<{ row: number; message: string }>;
};

type CsvImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  sampleHeaders: string;
  isLoading?: boolean;
  onImport: (file: File) => Promise<CsvImportResult | void>;
};

export function CsvImportDialog({
  open,
  onOpenChange,
  title,
  description,
  sampleHeaders,
  isLoading,
  onImport,
}: CsvImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Expected columns: <code className="text-foreground">{sampleHeaders}</code>
          </p>
          <div className="space-y-2">
            <RequiredLabel htmlFor="csv-file">CSV file</RequiredLabel>
            <Input
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setResult(null);
                setError(null);
              }}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {result ? (
            <div className="rounded-md border p-3 text-sm space-y-1">
              <p>
                Imported: <strong>{result.imported}</strong> · Failed: <strong>{result.failed}</strong>
              </p>
              {result.errors?.length ? (
                <ul className="text-xs text-muted-foreground list-disc pl-4 max-h-32 overflow-y-auto">
                  {result.errors.map((err) => (
                    <li key={`${err.row}-${err.message}`}>
                      Row {err.row}: {err.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Close
          </Button>
          <Button
            disabled={!file || isLoading}
            onClick={async () => {
              if (!file) return;
              setError(null);
              try {
                const res = await onImport(file);
                if (res) setResult(res);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Import failed");
              }
            }}
          >
            {isLoading ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CsvImportDialog;
