"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { SyncIndicator } from "@/components/platform/sync-indicator";
import { SyncConflictBadge } from "@/components/platform/sync-conflicts";
import { SearchModal } from "@/components/platform/search-modal";
import { ThemeToggle } from "@/components/platform/theme-toggle";
import { SchoolSwitcher } from "@/components/platform/school-switcher";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface HeaderProps {
  onMenuClick: () => void;
  roleLabel: string;
  userName: string;
}

export function Header({ onMenuClick, roleLabel, userName }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("notifications")
        .select("id, title, message, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8)
        .then(({ data, error }) => {
          if (!error && data) {
            setNotifications(data);
            setUnreadCount(data.filter((n) => !n.is_read).length);
          }
          setLoadingNotifs(false);
        });
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const markAllRead = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const initials = userName
    .split("@")[0]
    .split(/[._-]/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-9 w-9"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 flex items-center gap-2 max-w-md">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex-1 flex items-center gap-2 rounded-lg border border-border bg-muted/50 pl-9 pr-4 py-2 text-sm text-muted-foreground hover:bg-muted/80 transition-colors text-left"
        >
          <Search className="h-4 w-4 shrink-0" />
          Search...
        </button>
      </div>

      <SchoolSwitcher />

      <div className="flex items-center gap-2">
        <SyncIndicator />
        <SyncConflictBadge />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors outline-none">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-sm font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            {loadingNotifs ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-lg p-2">
                    <div className="h-3 w-3/4 bg-muted rounded" />
                    <div className="h-2 w-1/2 bg-muted rounded mt-1.5" />
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex items-start gap-2 py-2 px-2 cursor-pointer"
                  >
                    <div
                      className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                        n.is_read ? "bg-transparent" : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {n.message}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors outline-none">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={async () => {
                await fetch("/api/auth/signout", { method: "POST" });
                window.location.href = "/login";
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    </>
  );
}
