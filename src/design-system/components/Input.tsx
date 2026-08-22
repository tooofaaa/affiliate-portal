"use client";

import * as React from "react";
import { tokens } from "../tokens";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 start-3 flex items-center text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 text-sm",
              "transition-[border-color,box-shadow,background-color] duration-200",
              "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent focus-visible:outline-none",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              error
                ? "border-red-300 focus-visible:ring-red-500"
                : "border-gray-200 focus-visible:ring-indigo-500",
              leftIcon ? "ps-10" : "",
              rightIcon ? "pe-10" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 end-3 flex items-center text-gray-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";