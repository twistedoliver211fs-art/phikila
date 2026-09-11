"use client";

import { useState } from "react";
import { Sidebar } from "@/components/platform/sidebar";
import { Header } from "@/components/platform/header";
import { SchoolModeBanner } from "@/components/platform/school-mode-banner";
import { SyncConflicts } from "@/components/platform/sync-conflicts";

interface PlatformShellProps {
  role: string;
  roleLabel: string;
  userName: string;
  /** Set when a super admin is operating inside a school as principal. */
  schoolContext?: { schoolName: string } | null;
  children: React.ReactNode;
}

export function PlatformShell({
  role,
  roleLabel,
  userName,
  schoolContext = null,
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
        {schoolContext && (
          <SchoolModeBanner schoolName={schoolContext.schoolName} />
        )}
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
          <SyncConflicts />
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
