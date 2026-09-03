import { SchoolProvider } from "@/components/platform/school-context";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SchoolProvider>{children}</SchoolProvider>;
}
