"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { createPortal } from "react-dom";
import { tokens } from "../tokens";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

type Size = NonNullable<ModalProps["size"]>;

const sizeStyles: Record<Size, string> = {
  sm: "max-w-sm",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

const Modal = forwardRef<HTMLDivElement | null, ModalProps>(
  ({ isOpen, onClose, title, children, footer, size = "md", ...props }, ref) => {
    const [mounted, setMounted] = useState(false);
    const modalRef = useRef<HTMLDivElement | null>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(ref, () => modalRef.current, []);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!isOpen) return;

      previousActiveElement.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
        if (e.key === "Tab" && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        previousActiveElement.current?.focus();
      };
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    const s: Size = size ?? "md";

    return createPortal(
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm p-4 pt-16 pb-8"
        onClick={onClose}
        aria-hidden="true"
      >
        <div
          ref={modalRef}
          className={`flex flex-col w-full mx-auto bg-white rounded-xl shadow-xl border border-gray-200 max-h-[calc(100vh-6rem)] ${sizeStyles[s]}`}
          onClick={(e) => e.stopPropagation()}
          style={{ overscrollBehavior: "contain" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          {...props}
        >
          {/* Sticky header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
            {children}
          </div>

          {/* Sticky footer */}
          {footer && (
            <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  }
);
Modal.displayName = "Modal";

export { Modal };