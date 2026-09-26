"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Package } from "lucide-react";

export interface OptimizedImageProps extends Omit<ImageProps, "onError" | "onLoad"> {
  fallbackSrc?: string;
  className?: string;
  aspectRatio?: string;
}

/**
 * Optimized Image Component wrapping next/image
 * Implements WebP/AVIF format optimization, blur fallback, lazy loading, and error handling.
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 120,
  height = 120,
  fallbackSrc,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-500 ${className}`}
        style={{ width: typeof width === "number" ? `${width}px` : width, height: typeof height === "number" ? `${height}px` : height }}
      >
        <Package className="w-5 h-5 text-slate-400" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${isLoading ? "animate-pulse bg-slate-800/50" : ""} ${className}`}>
      <Image
        src={src}
        alt={alt || "Product image"}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        className={`object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        {...props}
      />
    </div>
  );
};

export default React.memo(OptimizedImage);
