"use client";

import Image from "next/image";
import React, { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  quality?: number;
  loading?: "lazy" | "eager";
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      fill = false,
      priority = false,
      sizes = "100vw",
      className = "",
      placeholder = "blur",
      blurDataURL,
      quality = 75,
      loading = "lazy",
      style,
      onLoad,
      onError,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
      setIsLoading(false);
      onLoad?.();
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
      onError?.();
    };

    if (hasError) {
      return (
        <div
          ref={ref}
          className={className}
          style={{
            ...style,
            backgroundColor: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            fontSize: "0.875rem",
          }}
        >
          Failed to load image
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={className}
        style={{
          ...style,
          position: fill ? "absolute" : "relative",
          overflow: "hidden",
        }}
      >
        {!fill && width && height && (
          <div
            style={{
              width,
              height,
              backgroundColor: "#f3f4f6",
              position: "relative",
            }}
          />
        )}
        <Image
          ref={ref}
          src={src}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          priority={priority}
          sizes={sizes}
          quality={85}
          loading={loading}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          style={{
            objectFit: "cover",
            transition: "opacity 300ms ease-in-out",
            opacity: isLoading ? 0 : 1,
          }}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
        {isLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            <svg
              className="animate-spin text-gray-300"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
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
          </div>
        )}
      </div>
    );
  },
);

OptimizedImage.displayName = "OptimizedImage";;