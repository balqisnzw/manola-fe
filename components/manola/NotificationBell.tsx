"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell } from "lucide-react";
import { notificationService, type Notification } from "@/lib/services/miscServices";
import { authService } from "@/lib/services/authService";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  }, []);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.role === "USER") {
      loadNotifications();
    }
  }, [loadNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkAsRead(id: number) {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications(); // refresh on open
        }}
        className="relative p-2 text-[var(--brand-muted)] hover:text-[var(--brand-black)] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[var(--brand-white)]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b border-[var(--brand-border)] flex items-center justify-between">
            <h3 className="font-semibold text-[var(--brand-black)]">Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-[var(--brand-muted)] hover:text-[var(--brand-black)] underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-[var(--brand-muted)]">
                Belum ada notifikasi
              </div>
            ) : (
              <div className="divide-y divide-[var(--brand-border)]">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 transition-colors ${
                      n.is_read ? "bg-transparent" : "bg-[var(--brand-gray)]"
                    }`}
                    onClick={() => {
                      if (!n.is_read) handleMarkAsRead(n.id);
                      router.push("/profil");
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex gap-3 cursor-pointer">
                      {!n.is_read && (
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--brand-black)]">
                          {n.judul}
                        </h4>
                        <p className="text-xs text-[var(--brand-muted)] mt-0.5 line-clamp-2">
                          {n.pesan}
                        </p>
                        <p className="text-[10px] text-[var(--brand-muted)] mt-1 opacity-70">
                          {new Date(n.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
