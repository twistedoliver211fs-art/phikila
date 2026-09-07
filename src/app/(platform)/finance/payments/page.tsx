import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";
import { PaymentsList } from "@/components/platform/payments-list";

export default async function PaymentsPage() {
  const schoolId = await getCurrentSchoolId();
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select(`
      id, amount, payment_date, reference_number, notes,
      student_accounts!inner(student_id, students(first_name, last_name, classes(name, grades(name))))
    `)
    .eq("school_id", schoolId)
    .order("payment_date", { ascending: false });

  return <PaymentsList payments={payments ?? []} />;
}
