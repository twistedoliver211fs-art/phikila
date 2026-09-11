import { createAdminClient } from "@/lib/supabase/server-admin";
import { NotFoundError, ValidationError } from "@/lib/errors";

export interface Document {
  id: string;
  schoolId: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string | null;
  isPublic: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentCategory {
  id: string;
  schoolId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

function mapDocument(row: Record<string, unknown>): Document {
  return {
    id: row.id as string,
    schoolId: row.school_id as string,
    categoryId: row.category_id as string | null,
    title: row.title as string,
    description: row.description as string | null,
    fileName: row.file_name as string,
    filePath: row.file_path as string,
    fileSize: Number(row.file_size),
    mimeType: row.mime_type as string,
    uploadedBy: row.uploaded_by as string | null,
    isPublic: row.is_public as boolean,
    downloadCount: Number(row.download_count),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapCategory(row: Record<string, unknown>): DocumentCategory {
  return {
    id: row.id as string,
    schoolId: row.school_id as string,
    name: row.name as string,
    description: row.description as string | null,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  };
}

export async function getDocuments(schoolId: string): Promise<Document[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("documents")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapDocument);
}

export async function getDocumentById(documentId: string): Promise<Document> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (error || !data) throw new NotFoundError("Document not found");
  return mapDocument(data);
}

export async function createDocument(params: {
  schoolId: string;
  categoryId?: string;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy?: string;
  isPublic?: boolean;
}): Promise<Document> {
  const admin = createAdminClient();

  if (!params.title || !params.fileName || !params.filePath) {
    throw new ValidationError("title, fileName, and filePath are required");
  }

  const { data, error } = await admin
    .from("documents")
    .insert({
      school_id: params.schoolId,
      category_id: params.categoryId ?? null,
      title: params.title,
      description: params.description ?? null,
      file_name: params.fileName,
      file_path: params.filePath,
      file_size: params.fileSize,
      mime_type: params.mimeType,
      uploaded_by: params.uploadedBy ?? null,
      is_public: params.isPublic ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return mapDocument(data);
}

export async function updateDocument(
  documentId: string,
  updates: Partial<Pick<Document, "title" | "description" | "categoryId" | "isPublic">>
): Promise<Document> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("documents")
    .update({
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.categoryId !== undefined && { category_id: updates.categoryId }),
      ...(updates.isPublic !== undefined && { is_public: updates.isPublic }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .select()
    .single();

  if (error) throw error;
  return mapDocument(data);
}

export async function deleteDocument(documentId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (error) throw error;
}

export async function getCategories(schoolId: string): Promise<DocumentCategory[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("document_categories")
    .select("*")
    .eq("school_id", schoolId)
    .order("name");

  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function createCategory(params: {
  schoolId: string;
  name: string;
  description?: string;
}): Promise<DocumentCategory> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("document_categories")
    .insert({
      school_id: params.schoolId,
      name: params.name,
      description: params.description ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapCategory(data);
}
