import { Navbar } from "@/components/landing/navbar";
import { SiteFooter } from "@/components/landing/site-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 relative">{children}</main>
      <SiteFooter />
    </div>
  );
}
