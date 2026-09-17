"use client";

import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { tokens } from "../tokens";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  debounceMs?: number;
  onChangeDebounced?: (value: string) => void;
}

const baseInputStyles =
  "w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 text-sm transition-[border-color,box-shadow,background-color] duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed";

const iconWrapperStyles = "absolute inset-y-0 flex items-center text-gray-400 pointer-events-none";

const errorStyles = "border-red-300 focus-visible:ring-red-500";

const successStyles = "border-gray-200 focus-visible:ring-indigo-500";

const labelStyles = "text-sm font-semibold text-gray-700 mb-1.5 block";

const hintStyles = "text-sm text-gray-500 mt-1";

const errorStylesText = "text-sm text-red-600 mt-1";

const Input = React.memo(
  React.forwardRef<HTMLInputElement, InputProps>(
    (
      {
        className,
        label,
        error,
        hint,
        leftIcon,
        rightIcon,
        debounceMs = 300,
        onChangeDebounced,
        id,
        ...props
      },
      ref
    ) => {
      const inputId = id || React.useId();
      const [debouncedValue, setDebouncedValue] = useState(props.value ?? "");
      const debouncedRef = useRef<ReturnType<typeof setTimeout> | null>(null);

      const mergedClasses = useMemo(
        () =>
          [
            baseInputStyles,
            error ? errorStyles : successStyles,
            props.disabled ? "opacity-60 cursor-not-allowed" : "",
            className,
          ]
            .filter(Boolean)
            .join(" "),
        [error, className, props.disabled, leftIcon, rightIcon]
      );

      const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          props.onChange?.(e);

          if (debouncedRef.current) {
            clearTimeout(debouncedRef.current);
          }

          setDebouncedValue(value);

          debouncedRef.current = setTimeout(() => {
            onChangeDebounced?.(value);
          }, debounceMs);
        },
        [debounceMs, onChangeDebounced, props.onChange]
      );

      const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
          if (debouncedRef.current) {
            clearTimeout(debouncedRef.current);
            onChangeDebounced?.(e.target.value);
          }
          props.onBlur?.(e);
        },
        [onChangeDebounced, props.onBlur]
      );

      const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter" && debouncedRef.current) {
            clearTimeout(debouncedRef.current);
            onChangeDebounced?.(e.currentTarget.value);
          }
          props.onKeyDown?.(e);
        },
        [props.onKeyDown, onChangeDebounced]
      );

      return (
        <div className="flex flex-col gap-1.5">
          {label && (
            <label
              htmlFor={inputId}
              className="text-sm font-semibold text-gray-700 mb-1.5 block"
            >
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
              className={mergedClasses}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={
                error
                  ? `${inputId}-error`
                  : hint
                  ? `${inputId}-hint`
                  : undefined
              }
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              {...props}
            />
            {rightIcon && (
              <div className="absolute inset-y-0 end-3 flex items-center text-gray-400 pointer-events-none">
                {rightIcon}
              </div>
            )}
          </div>
          {error && (
            <p id={`${inputId}-error`} className="text-sm text-red-600 mt-1" role="alert">
              {error}
            </p>
          )}
          {hint && !error && (
            <p id={`${inputId}-hint`} className="text-sm text-gray-500 mt-1">
              {hint}
            </p>
          )}
        </div>
      );
    }
  )
);

Input.displayName = "Input";

export { Input }
export default Input;