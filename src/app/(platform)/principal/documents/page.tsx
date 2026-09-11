"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, FolderOpen, Download, Trash2 } from "lucide-react";

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isPublic: boolean;
  downloadCount: number;
  createdAt: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetch("/api/documents");
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents ?? []);
        }
      } catch {
        console.error("Failed to fetch documents");
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Manage school documents and files</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.reduce((sum, d) => sum + d.downloadCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-4 text-muted-foreground">Loading...</p>
          ) : documents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Name</th>
                    <th className="p-3 text-left font-medium">Size</th>
                    <th className="p-3 text-left font-medium">Type</th>
                    <th className="p-3 text-left font-medium">Visibility</th>
                    <th className="p-3 text-left font-medium">Downloads</th>
                    <th className="p-3 text-left font-medium">Uploaded</th>
                    <th className="p-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="p-3 font-medium">{doc.title}</td>
                      <td className="p-3">{formatSize(doc.fileSize)}</td>
                      <td className="p-3 text-muted-foreground">{doc.mimeType}</td>
                      <td className="p-3">
                        <Badge variant={doc.isPublic ? "default" : "secondary"}>
                          {doc.isPublic ? "Public" : "Private"}
                        </Badge>
                      </td>
                      <td className="p-3">{doc.downloadCount}</td>
                      <td className="p-3">{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
