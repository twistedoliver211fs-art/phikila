"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";

type ImportType = "students" | "staff" | "fees";

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

export default function ImportPage() {
  const [importType, setImportType] = useState<ImportType>("students");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImport() {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", importType);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
      } else {
        const err = await res.json();
        setResult({
          success: false,
          imported: 0,
          skipped: 0,
          errors: [err.error || "Import failed"],
        });
      }
    } catch {
      setResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: ["Network error"],
      });
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Import Data</h1>
          <p className="text-muted-foreground">Bulk import students, staff, or fees from CSV files</p>
        </div>
        <Upload className="h-5 w-5 text-muted-foreground" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Import Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {(["students", "staff", "fees"] as ImportType[]).map((type) => (
              <Button
                key={type}
                variant={importType === type ? "default" : "outline"}
                onClick={() => {
                  setImportType(type);
                  handleReset();
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            {file ? (
              <div className="space-y-2">
                <FileText className="h-8 w-8 mx-auto text-primary" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Click to select a CSV file
                </p>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {importType === "students" && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium">Required columns: name (or first_name)</p>
              <p>Optional columns: admission_number, gender, date_of_birth</p>
            </div>
          )}
          {importType === "staff" && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium">Required columns: name (or first_name)</p>
            </div>
          )}
          {importType === "fees" && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium">Required columns: name, amount</p>
            </div>
          )}

          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? "Importing..." : "Import Data"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Import {result.success ? "Complete" : "Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Imported</p>
                <p className="text-2xl font-bold text-green-600">{result.imported}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Skipped</p>
                <p className="text-2xl font-bold text-yellow-600">{result.skipped}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm">Errors:</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-sm text-red-600">{err}</p>
                  ))}
                </div>
              </div>
            )}

            <Button variant="outline" onClick={handleReset}>
              Import Another File
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
