import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";

export default async function FeeStructuresPage() {
  const schoolId = await getCurrentSchoolId();
  const supabase = await createClient();

  const { data: structures } = await supabase
    .from("fee_structures")
    .select("id, name, amount, academic_year_id")
    .eq("school_id", schoolId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fee Structures</h1>
        <p className="text-muted-foreground mt-1">{structures?.length ?? 0} fee structures configured</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-left font-medium text-muted-foreground">Name</th>
                <th className="p-4 text-left font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {structures && structures.length > 0 ? (
                structures.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{s.name}</td>
                    <td className="p-4 text-muted-foreground">KES {Number(s.amount).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="p-8 text-center text-muted-foreground">
                    No fee structures configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
