"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  lines?: number;
  animation?: "pulse" | "wave" | "none";
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className = "",
      variant = "text",
      width = "100%",
      height = "1rem",
      lines = 1,
      animation = "wave",
    },
    ref
  ) => {
    const baseStyles = `
      animate-${animation === "wave" ? "skeleton-wave" : animation === "pulse" ? "skeleton-pulse" : "none"}
      bg-gray-200 dark:bg-gray-700 rounded
      overflow-hidden
      relative
    `;

    const variants = {
      text: "h-4 w-full",
      circular: "rounded-full",
      rectangular: "rounded-lg",
    };

    if (lines > 1) {
      return (
        <div ref={ref} className={`${className} ${baseStyles} space-y-2`} style={{ width, height: lines * 1.5 }} >
          {Array.from({ length: lines }, (_, i) => (
            <div
              key={i}
              className={`${variants.text} ${i === lines - 1 ? "w-3/4" : ""}`}
              style={{ width: i === lines - 1 ? "75%" : "100%" }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`${className} ${baseStyles} ${variants[variant]}`}
        style={{
          width,
          height: variant === "text" ? "1rem" : height,
        }}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

export const SkeletonText = ({ lines = 3, className = "" }) => (
  <Skeleton variant="text" lines={lines} className={className} />
);

export const SkeletonCard = ({ className = "" }) => (
  <div className={`${className} space-y-4 p-4`}>
    <Skeleton variant="circular" width="48" height="48" className="mx-auto" />
    <Skeleton variant="text" lines={2} width="80%" />
    <Skeleton variant="text" lines={1} width="60%" />
    <Skeleton variant="rectangular" width="100%" height="120" />
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = "" }) => (
  <div className={`${className} space-y-3`}>
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }, (_, i) => (
        <Skeleton key={i} variant="text" width="80%" height="1rem" />
      ))}
    </div>
    {Array.from({ length: rows }, (_, row) => (
      <div key={row} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={`${row}-${i}`} variant="text" width="90%" height="1rem" />
        ))}
      </div>
    ))}
  </div>
);