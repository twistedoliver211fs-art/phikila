import { createAdminClient } from "@/lib/supabase/server-admin";
import { ValidationError } from "@/lib/errors";

export interface ParentStudentRelationship {
  id: string;
  parentUserId: string;
  studentId: string;
  relationshipType: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface ParentStudentView {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  className: string;
  gradeName: string;
  relationshipType: string;
  isPrimary: boolean;
}

function mapRelationship(row: Record<string, unknown>): ParentStudentRelationship {
  return {
    id: row.id as string,
    parentUserId: row.parent_user_id as string,
    studentId: row.student_id as string,
    relationshipType: row.relationship_type as string,
    isPrimary: row.is_primary as boolean,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  };
}

export async function getChildrenForParent(
  parentId: string,
  schoolId?: string
): Promise<ParentStudentView[]> {
  const admin = createAdminClient();

  let query = admin
    .from("parent_student_relationships")
    .select(`
      id,
      student_id,
      relationship_type,
      is_primary,
      students!inner(
        first_name,
        last_name,
        admission_number,
        school_id,
        class_id,
        classes!inner(
          name,
          grades!inner(name)
        )
      )
    `)
    .eq("parent_user_id", parentId)
    .eq("is_active", true);

  if (schoolId) {
    query = query.eq("students.school_id", schoolId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map((row) => {
    const student = row.students as unknown as Record<string, unknown>;
    const classes = student.classes as unknown as Record<string, unknown>;
    const grades = classes.grades as unknown as Record<string, unknown>;
    return {
      id: row.id as string,
      studentId: row.student_id as string,
      firstName: student.first_name as string,
      lastName: student.last_name as string,
      admissionNumber: student.admission_number as string,
      className: classes.name as string,
      gradeName: grades.name as string,
      relationshipType: row.relationship_type as string,
      isPrimary: row.is_primary as boolean,
    };
  });
}

export async function getParentsForStudent(
  studentId: string
): Promise<ParentStudentRelationship[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("parent_student_relationships")
    .select("*")
    .eq("student_id", studentId)
    .eq("is_active", true);

  if (error) throw error;
  return (data ?? []).map(mapRelationship);
}

export async function linkParentToStudent(params: {
  parentUserId: string;
  studentId: string;
  relationshipType?: string;
  isPrimary?: boolean;
}): Promise<ParentStudentRelationship> {
  const admin = createAdminClient();

  const existing = await admin
    .from("parent_student_relationships")
    .select("id")
    .eq("parent_user_id", params.parentUserId)
    .eq("student_id", params.studentId)
    .single();

  if (existing.data) {
    throw new ValidationError("Parent is already linked to this student");
  }

  const { data, error } = await admin
    .from("parent_student_relationships")
    .insert({
      parent_user_id: params.parentUserId,
      student_id: params.studentId,
      relationship_type: params.relationshipType ?? "parent",
      is_primary: params.isPrimary ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return mapRelationship(data);
}

export async function unlinkParentFromStudent(
  relationshipId: string
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("parent_student_relationships")
    .update({ is_active: false })
    .eq("id", relationshipId);

  if (error) throw error;
}

export async function getStudentAttendanceForParent(
  studentId: string,
  limit?: number
): Promise<Array<{
  date: string;
  status: string;
  className: string;
}>> {
  const admin = createAdminClient();
  let query = admin
    .from("attendance_records")
    .select("date, status, classes!inner(name)")
    .eq("student_id", studentId)
    .order("date", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => {
    const classes = row.classes as unknown as Record<string, unknown>;
    return {
      date: row.date as string,
      status: row.status as string,
      className: classes.name as string,
    };
  });
}

export async function getStudentFeesForParent(
  studentId: string
): Promise<Array<{
  invoiceId: string;
  invoiceNumber: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: string;
  dueDate: string | null;
  feeName: string;
}>> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invoices")
    .select(`
      id,
      invoice_number,
      amount_due,
      amount_paid,
      balance,
      status,
      due_date,
      fee_structures!inner(name)
    `)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const feeStructures = row.fee_structures as unknown as Record<string, unknown>;
    return {
      invoiceId: row.id as string,
      invoiceNumber: row.invoice_number as string,
      amountDue: Number(row.amount_due),
      amountPaid: Number(row.amount_paid),
      balance: Number(row.balance),
      status: row.status as string,
      dueDate: row.due_date as string | null,
      feeName: feeStructures.name as string,
    };
  });
}
