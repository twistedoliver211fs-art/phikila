export type PlanTier = "free" | "pro" | "team" | "enterprise";

export interface PlanLimits {
  name: string;
  price: number;
  databaseSizeMB: number;
  apiRequestsPerMin: number;
  connections: number;
  storageGB: number;
  dailyBackups: boolean;
  support: string;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    name: "Free",
    price: 0,
    databaseSizeMB: 500,
    apiRequestsPerMin: 500,
    connections: 60,
    storageGB: 1,
    dailyBackups: false,
    support: "Community",
  },
  pro: {
    name: "Pro",
    price: 25,
    databaseSizeMB: 8192,
    apiRequestsPerMin: 10000,
    connections: 200,
    storageGB: 100,
    dailyBackups: true,
    support: "Email",
  },
  team: {
    name: "Team",
    price: 599,
    databaseSizeMB: 8192,
    apiRequestsPerMin: 10000,
    connections: 200,
    storageGB: 100,
    dailyBackups: true,
    support: "Priority",
  },
  enterprise: {
    name: "Enterprise",
    price: 0,
    databaseSizeMB: 102400,
    apiRequestsPerMin: 100000,
    connections: 1000,
    storageGB: 1024,
    dailyBackups: true,
    support: "Dedicated",
  },
};

export const PLAN_ORDER: PlanTier[] = ["free", "pro", "team", "enterprise"];

export function getNextTier(current: PlanTier): PlanTier | null {
  const idx = PLAN_ORDER.indexOf(current);
  if (idx < 0 || idx >= PLAN_ORDER.length - 1) return null;
  return PLAN_ORDER[idx + 1];
}

export function getUsageColor(percent: number): string {
  if (percent < 50) return "green";
  if (percent < 70) return "yellow";
  if (percent < 90) return "orange";
  return "red";
}

export function getUsageLabel(percent: number): string {
  if (percent < 50) return "Healthy";
  if (percent < 70) return "Moderate";
  if (percent < 90) return "High";
  return "Critical";
}

export interface CapacityMetric {
  label: string;
  used: number;
  limit: number;
  unit: string;
  percent: number;
  color: string;
  status: string;
}

export interface CapacityData {
  plan: PlanTier;
  planLimits: PlanLimits;
  nextTier: PlanTier | null;
  nextTierLimits: PlanLimits | null;
  metrics: CapacityMetric[];
  schools: { total: number; limit: number };
  users: { total: number; limit: number };
  students: { total: number; limit: number };
  rowCounts: Record<string, number>;
}
