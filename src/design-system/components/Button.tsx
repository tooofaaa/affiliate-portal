"use client";

import * as React from "react";
import { tokens } from "../tokens";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

type Variant = NonNullable<ButtonProps["variant"]>;
type Size = NonNullable<ButtonProps["size"]>;

const variantStyles: Record<Variant, string> = {
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

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-base rounded-xl",
  lg: "px-6 py-3 text-lg rounded-xl",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 font-medium transition-[transform,box-shadow,background-color,border-color,color] duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none";

const loadingStyles = "animate-spin";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary", size = "md", isLoading, ...props }, ref) => {
    const v: Variant = variant ?? "primary";
    const s: Size = size ?? "md";
    const mergedClasses = [
      baseStyles,
      variantStyles[v],
      sizeStyles[s],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button className={mergedClasses} ref={ref} {...props} disabled={props.disabled || isLoading}>
        {isLoading && (
          <svg
            className={loadingStyles + " w-4 h-4"}
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {!isLoading && children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { tokens };