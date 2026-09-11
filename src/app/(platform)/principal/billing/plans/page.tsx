"use client";

import { useEffect, useState } from "react";
import { Check, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/platform/toast";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  currency: string;
  maxStudents: number;
  maxStaff: number;
  features: Record<string, boolean>;
  sortOrder: number;
}

interface CurrentPlan {
  slug: string;
}

function formatPrice(amount: number, currency: string) {
  if (amount === 0) return "Free";
  const formatted = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100);
  return formatted;
}

function formatLimit(limit: number) {
  return limit === -1 ? "Unlimited" : limit.toLocaleString();
}

const FEATURE_LABELS: Record<string, string> = {
  attendance: "Attendance Tracking",
  academics: "Academics",
  timetable: "Timetable Management",
  fees: "Fee Management",
  reports: "Reports & Analytics",
  admissions: "Admissions",
  messaging: "Messaging",
  ai: "AI Assistant",
  api: "API Access",
  custom_roles: "Custom Roles",
  website_builder: "School Website Builder",
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const [plansRes, subRes] = await Promise.all([
          fetch("/api/billing/plans"),
          fetch("/api/billing/subscription"),
        ]);
        const plansData = await plansRes.json();
        const subData = await subRes.json();
        setPlans(plansData.plans ?? []);
        setCurrentPlan(subData.plan ? { slug: subData.plan.slug } : null);
      } catch {
        console.error("Failed to load plans");
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  async function handlePlanSelect(slug: string) {
    setUpgrading(slug);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: slug }),
      });
      const data = await res.json();
      if (res.ok) {
        toast(
          data.action === "upgrade"
            ? "Subscription upgraded!"
            : data.action === "downgrade"
              ? "Subscription downgraded"
              : "Plan updated"
        );
        window.location.href = "/principal/billing";
      } else {
        toast(data.message || "Failed to change plan");
      }
    } catch {
      toast("Failed to change plan");
    } finally {
      setUpgrading(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plans</h1>
          <p className="text-muted-foreground mt-1">Loading plans...</p>
        </div>
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  // Collect all unique feature keys across plans
  const allFeatures = Array.from(
    new Set(plans.flatMap((p) => Object.keys(p.features)))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Plans</h1>
        <p className="text-muted-foreground mt-1">
          Choose the right plan for your school
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrent = currentPlan?.slug === plan.slug;
          const isUpgrade = !currentPlan || plan.sortOrder > (plans.find(p => p.slug === currentPlan?.slug)?.sortOrder ?? -1);
          const isLoading = upgrading === plan.slug;

          return (
            <div
              key={plan.id}
              className={`rounded-xl border bg-card p-6 flex flex-col ${
                isCurrent
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              }`}
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-2xl font-bold text-primary mt-2">
                  {formatPrice(plan.priceMonthly, plan.currency)}
                  {plan.priceMonthly > 0 && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      / mo
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-2 text-sm mb-6 flex-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Students</span>
                  <span className="font-medium">{formatLimit(plan.maxStudents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Staff</span>
                  <span className="font-medium">{formatLimit(plan.maxStaff)}</span>
                </div>
              </div>

              <div className="space-y-1.5 mb-6">
                {allFeatures.slice(0, 6).map((feature) => {
                  const enabled = plan.features[feature] === true;
                  return (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Check
                        className={`h-3 w-3 shrink-0 ${
                          enabled ? "text-green-600" : "text-muted-foreground/30"
                        }`}
                      />
                      <span
                        className={
                          enabled ? "text-foreground" : "text-muted-foreground/50"
                        }
                      >
                        {FEATURE_LABELS[feature] ?? feature}
                      </span>
                    </div>
                  );
                })}
              </div>

              {isCurrent ? (
                <Button variant="outline" size="sm" disabled className="w-full">
                  Current Plan
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handlePlanSelect(plan.slug)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                  )}
                  {isUpgrade ? "Upgrade" : "Downgrade"}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">
            Feature Comparison
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-left font-medium text-muted-foreground">
                  Feature
                </th>
                {plans.map((plan) => (
                  <th
                    key={plan.id}
                    className={`p-4 text-center font-medium ${
                      currentPlan?.slug === plan.slug
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((feature) => (
                <tr
                  key={feature}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="p-4 text-foreground">
                    {FEATURE_LABELS[feature] ?? feature}
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="p-4 text-center">
                      {plan.features[feature] === true ? (
                        <Check className="h-4 w-4 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground/30">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
