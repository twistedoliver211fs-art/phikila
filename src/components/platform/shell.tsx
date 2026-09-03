"use client";

import { useState } from "react";
import { Sidebar } from "@/components/platform/sidebar";
import { Header } from "@/components/platform/header";

interface PlatformShellProps {
  role: string;
  roleLabel: string;
  userName: string;
  children: React.ReactNode;
}

export function PlatformShell({
  role,
  roleLabel,
  userName,
  children,
}: PlatformShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          roleLabel={roleLabel}
          userName={userName}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
