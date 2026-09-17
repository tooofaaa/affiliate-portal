"use client";

import { useCallback, useMemo } from "react";
import * as React from "react";
import { tokens } from "../tokens";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 border border-transparent",
  secondary:
    "bg-white text-gray-800 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm",
  outline:
    "bg-transparent text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  danger:
    "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 border border-transparent",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-base rounded-xl",
  lg: "px-6 py-3 text-lg rounded-xl",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 font-medium transition-[transform,box-shadow,background-color,border-color,color] duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center justify-center gap-2";

const disabledStyles =
  "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none";

export const Button = React.memo(
  ({ className, children, variant = "primary", size = "md", isLoading, onClick, disabled, ...props }: ButtonProps) => {
    const v = variant ?? "primary";
    const s = size ?? "md";

    const mergedClasses = useMemo(
      () =>
        [
          baseStyles,
          variantStyles[v],
          sizeStyles[s],
          disabledStyles,
          className,
        ]
          .filter(Boolean)
          .join(" "),
      [v, s, className]
    );

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isLoading || disabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      },
      [isLoading, disabled, onClick]
    );

    return (
      <button
        className={mergedClasses}
        onClick={handleClick}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {!isLoading && children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { tokens };