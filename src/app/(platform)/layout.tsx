"use client";

import { useState } from "react";
import { Sidebar } from "@/components/platform/sidebar";
import { Header } from "@/components/platform/header";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  principal: "Principal",
  teacher: "Teacher",
  parent: "Parent",
};

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // In production, this would come from auth context
  const role = "super_admin" as const;

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <Sidebar
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          roleLabel={roleLabels[role]}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
