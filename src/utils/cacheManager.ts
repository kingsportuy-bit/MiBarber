// Gestor de caché para mejorar el rendimiento en dispositivos móviles
import { useState, useEffect } from "react";

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheManager {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutos por defecto

  // Establecer un elemento en la caché
  set<T>(key: string, data: T, ttl?: number): void {
    const ttlMs = ttl ?? this.defaultTTL;
    const timestamp = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp,
      expiresAt: timestamp + ttlMs
    });
  }

  // Obtener un elemento de la caché
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Verificar si el elemento ha expirado
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  // Verificar si un elemento existe en la caché y no ha expirado
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Eliminar un elemento de la caché
  remove(key: string): void {
    this.cache.delete(key);
  }

  // Limpiar toda la caché
  clear(): void {
    this.cache.clear();
  }

  // Limpiar elementos expirados
  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Obtener el tamaño de la caché
  size(): number {
    return this.cache.size;
  }

  // Establecer el TTL por defecto
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }

  // Obtener el TTL por defecto
  getDefaultTTL(): number {
    return this.defaultTTL;
  }

  // Obtener estadísticas de la caché
  getStats(): {
    size: number;
    defaultTTL: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      defaultTTL: this.defaultTTL,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Crear una instancia global del gestor de caché
export const cacheManager = new CacheManager();

// Hook personalizado para usar la caché en componentes React
export function useCache<T>(key: string, fetcher: () => Promise<T>, ttl?: number): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Intentar obtener datos de la caché primero
      const cachedData = cacheManager.get<T>(key);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }
      
      // Si no hay datos en caché, obtenerlos del fetcher
      const result = await fetcher();
      
      // Guardar en caché
      cacheManager.set(key, result, ttl);
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [key]);

  const refresh = () => {
    cacheManager.remove(key);
    fetchData();
  };

  return { data, loading, error, refresh };
}

export default CacheManager;