"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BellIcon } from "@/lib/icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getNotifications, markAsRead, markAllAsRead } from "@/lib/actions/notifications";
import { Notification } from "@/lib/types";

function getRelativeTime(
  createdAt: string,
  t: {
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
  }
): string {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return t.justNow;
  if (diffMin < 60) return t.minutesAgo.replace("{n}", String(diffMin));
  const diffH = Math.floor(diffMin / 60);
  return t.hoursAgo.replace("{n}", String(diffH));
}

export default function NotificationDropdown() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = useCallback(async () => {
    const { data } = await getNotifications();
    setNotifications(data);
  }, []);

  // Load user id and initial notifications
  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!active || !user) return;
        setUserId(user.id);
      } catch {
        // ignore
      }
    }
    init();
    loadNotifications();
    return () => { active = false; };
  }, [loadNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channelRef: any = null;

    async function subscribe() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        channelRef = supabase
          .channel("notifications-affiliate")
          .on(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "postgres_changes" as any,
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${userId}`,
            },
            () => {
              loadNotifications();
            }
          )
          .subscribe();
      } catch {
        // ignore
      }
    }

    subscribe();

    return () => {
      if (channelRef) {
        import("@/lib/supabase/client").then(({ createClient }) => {
          const supabase = createClient();
          supabase.removeChannel(channelRef);
        });
      }
    };
  }, [userId, loadNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    await loadNotifications();
  };

  const handleNotificationClick = async (notification: Notification) => {
    setIsOpen(false);
    if (!notification.read) {
      await markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const nt = t.notifications;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative cursor-pointer p-2 rounded-xl transition-all duration-200 focus:outline-none"
        style={{ color: "#64748b" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.08)";
          (e.currentTarget as HTMLButtonElement).style.color = "#6366f1";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
        }}
        aria-label={nt.title}
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -end-0.5 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
            style={{
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              border: "2px solid white",
              boxShadow: "0 2px 8px rgba(239,68,68,0.4)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute end-0 top-full mt-3 w-80 rounded-2xl overflow-hidden z-50"
          style={{
            background: "rgba(255,255,255,0.98)",
            border: "1px solid rgba(99,102,241,0.12)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(99,102,241,0.08)",
            backdropFilter: "blur(20px)",
            animation: "dropdownIn 0.15s ease-out",
          }}
        >
          {/* Header */}
          <div
            className="p-4 flex justify-between items-center"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(129,140,248,0.03))",
              borderBottom: "1px solid rgba(99,102,241,0.08)",
            }}
          >
            <h3 className="font-bold text-gray-900 text-sm">{nt.title}</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium cursor-pointer transition-colors"
                style={{ color: "#6366f1" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#4338ca"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6366f1"; }}
              >
                {nt.markAllRead}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(99,102,241,0.08)" }}
                >
                  <BellIcon className="w-6 h-6" style={{ color: "#6366f1" }} />
                </div>
                <p className="text-sm font-medium text-gray-700">{nt.noNotifications}</p>
              </div>
            ) : (
              <ul>
                {notifications.slice(0, 10).map((item) => (
                  <li
                    key={item.id}
                    className={`border-b border-gray-100 last:border-0 transition-colors duration-150 ${!item.read ? "bg-indigo-50/30" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(item)}
                      className="w-full flex items-start gap-3 p-3 text-start cursor-pointer"
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
                        style={{
                          background: "rgba(99,102,241,0.1)",
                          color: "#6366f1",
                        }}
                      >
                        <BellIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{item.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {getRelativeTime(item.created_at, nt)}
                        </p>
                      </div>
                      {!item.read && (
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                          style={{ background: "#6366f1" }}
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
