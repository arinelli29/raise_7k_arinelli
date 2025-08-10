"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { getOptimizedUrl } from "@/lib/imageUtils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number | string;
  format?: string;
  onClick?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  quality = "auto",
  format = "auto",
  onClick,
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Otimizar URL se for do Cloudinary
  const optimizedSrc = getOptimizedUrl(src, {
    width,
    height,
    quality,
    format,
  });

  if (error) {
    return (
      <div
        className={`bg-gray-800 flex items-center justify-center ${className}`}
      >
        <div className="text-gray-500 text-sm">Erro ao carregar imagem</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.img
        src={optimizedSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setError(true)}
        onClick={onClick}
        loading="lazy"
        whileHover={onClick ? { scale: 1.02 } : {}}
        transition={{ duration: 0.3 }}
      />

      {/* Loading placeholder */}
      {!imageLoaded && !error && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="text-gray-600 text-sm">Carregando...</div>
        </div>
      )}
    </div>
  );
}
