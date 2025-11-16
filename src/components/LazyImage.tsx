"use client";

import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/useDeviceDetection";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  quality?: 'low' | 'medium' | 'high';
}

export function LazyImage({ 
  src, 
  alt, 
  className = '',
  placeholder = '/placeholder.png',
  width,
  height,
  quality = 'medium'
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(placeholder);
  const isMobile = useIsMobile();
  const imgRef = useRef<HTMLImageElement>(null);

  // Optimizar la calidad de imagen según el dispositivo
  const getOptimizedSrc = (source: string): string => {
    if (!isMobile) return source;
    
    // Para dispositivos móviles, reducir la calidad para mejorar el rendimiento
    const qualityParam = quality === 'low' ? 'q=50' : quality === 'high' ? 'q=90' : 'q=70';
    
    // Si es una URL de imagen optimizable, agregar parámetros
    if (source.includes('?')) {
      return `${source}&${qualityParam}&w=${width || 300}`;
    } else {
      return `${source}?${qualityParam}&w=${width || 300}`;
    }
  };

  useEffect(() => {
    if (!src) return;

    const optimizedSrc = getOptimizedSrc(src);
    setImgSrc(optimizedSrc);

    const img = new Image();
    img.src = optimizedSrc;
    
    img.onload = () => {
      setIsLoading(false);
      setImgSrc(optimizedSrc);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      setImgSrc(placeholder);
    };
  }, [src, isMobile, quality, width, placeholder]);

  // Efecto para manejar la intersección (Intersection Observer)
  useEffect(() => {
    if (!imgRef.current || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // La imagen está en el viewport, cargarla
            setIsLoading(true);
            setHasError(false);
            
            const img = new Image();
            img.src = getOptimizedSrc(src);
            
            img.onload = () => {
              setIsLoading(false);
              setImgSrc(getOptimizedSrc(src));
            };
            
            img.onerror = () => {
              setIsLoading(false);
              setHasError(true);
              setImgSrc(placeholder);
            };
            
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Cargar 50px antes de que entre en el viewport
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [src, isMobile, quality, width, placeholder]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {hasError ? (
        <div className="flex items-center justify-center bg-gray-800 text-gray-500 w-full h-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading="lazy"
        />
      )}
    </div>
  );
}