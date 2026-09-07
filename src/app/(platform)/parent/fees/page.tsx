import { createClient } from "@/lib/supabase/server";
import { getCurrentSchoolId } from "@/lib/supabase/helpers";

export default async function ParentFeesPage() {
  const supabase = await createClient();
  const schoolId = await getCurrentSchoolId();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: children } = await supabase
    .from("students")
    .select("id, first_name, last_name, class_id, classes(name, grades(name))")
    .eq("school_id", schoolId)
    .eq("parent_user_id", user?.id)
    .eq("is_active", true);

  const childIds = children?.map((c) => c.id) ?? [];

  const { data: accounts } = await supabase
    .from("student_accounts")
    .select("student_id, amount_due, amount_paid, balance, fee_structures(name)")
    .eq("school_id", schoolId)
    .in("student_id", childIds.length > 0 ? childIds : ["00000000-0000-0000-0000-000000000000"]);

  const getChildFees = (childId: string) => {
    const accs = accounts?.filter((a) => a.student_id === childId) ?? [];
    const totalDue = accs.reduce((a, acc) => a + Number(acc.amount_due), 0);
    const totalPaid = accs.reduce((a, acc) => a + Number(acc.amount_paid), 0);
    const totalBalance = accs.reduce((a, acc) => a + Number(acc.balance), 0);
    return { totalDue, totalPaid, totalBalance, accounts: accs };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fees</h1>
        <p className="text-muted-foreground mt-1">Fee balances for your children</p>
      </div>

      {children && children.length > 0 ? (
        children.map((child) => {
          const fees = getChildFees(child.id);
          const className = `${(child.classes as any)?.grades?.[0]?.name ?? ""} ${(child.classes as any)?.name ?? ""}`.trim();
          return (
            <div key={child.id} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{child.first_name} {child.last_name}</h2>
                  <p className="text-sm text-muted-foreground">{className}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className={`text-2xl font-bold ${fees.totalBalance > 0 ? "text-amber-600" : "text-green-600"}`}>
                    KES {fees.totalBalance.toLocaleString()}
                  </p>
                </div>
              </div>
              {fees.accounts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-3 text-left font-medium text-muted-foreground">Fee</th>
                        <th className="p-3 text-left font-medium text-muted-foreground">Due</th>
                        <th className="p-3 text-left font-medium text-muted-foreground">Paid</th>
                        <th className="p-3 text-left font-medium text-muted-foreground">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.accounts.map((a, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="p-3 font-medium text-foreground">{(a as any).fee_structures?.name ?? "—"}</td>
                          <td className="p-3 text-muted-foreground">KES {Number(a.amount_due).toLocaleString()}</td>
                          <td className="p-3 text-green-600">KES {Number(a.amount_paid).toLocaleString()}</td>
                          <td className={`p-3 font-medium ${Number(a.balance) > 0 ? "text-amber-600" : "text-green-600"}`}>
                            KES {Number(a.balance).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No fee records found.</p>
              )}
            </div>
          );
        })
      ) : (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No children linked to your account.</p>
        </div>
      )}
    </div>
  );
}
