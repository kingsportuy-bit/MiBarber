import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Configuración para desarrollo local */
  // Configuración para optimizar el rendimiento
  reactStrictMode: false, // Desactivado temporalmente para compatibilidad con react-beautiful-dnd
  
  // Especificar la raíz del workspace para evitar advertencias
  outputFileTracingRoot: __dirname,
  
  // Configuración para el entorno de desarrollo
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  // Configuración para build standalone (necesario para Docker)
  output: 'standalone',
  
  // Configuraciones específicas para producción
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: '',
};

export default nextConfig;