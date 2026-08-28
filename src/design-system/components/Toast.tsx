"use client";

import { useEffect, useState } from "react";
import { tokens } from "../tokens";

export interface ToastProps {
  id: string;
  title: string;
  message?: string;
  type?: "success" | "error" | "warning" | "info";
  onClose?: (id: string) => void;
  duration?: number;
}

type ToastType = NonNullable<ToastProps["type"]>;

const typeStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "🎉",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "❌",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: "⚠️",
  },
  info: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    icon: "🔔",
  },
};

export function Toast({
  id,
  title,
  message,
  type = "info",
  onClose,
  duration = 4000,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const t: ToastType = type ?? "info";
  const styles = typeStyles[t];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose?.(id), 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const baseStyles = "flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl max-w-sm transition-all duration-200";
  const exitStyles = isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0";

  return (
    <div
      className={`${baseStyles} ${exitStyles} ${styles.bg} ${styles.border}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      style={{
        background: "rgba(255,255,255,0.98)",
        boxShadow: "0 8px 32px rgba(99,102,241,0.15)",
        animation: isExiting ? "toastOut 0.2s ease-in" : "toastIn 0.2s ease-out",
      }}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
        {styles.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 line-clamp-1">{title}</p>
        {message && <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{message}</p>}
      </div>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose?.(id), 200);
        }}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) {
  // Inject keyframes once
  useEffect(() => {
    const styleId = "toast-animations";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes toastIn {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes toastOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  return (
    <div className="fixed bottom-4 end-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}