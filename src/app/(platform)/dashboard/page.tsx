import { redirect } from "next/navigation";

export default function DashboardPage() {
  // In production, check auth and redirect to correct role portal
  // For now, redirect to super admin
  redirect("/platform/super-admin");
}
