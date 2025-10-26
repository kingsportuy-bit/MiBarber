import { z } from 'zod';

/**
 * Schema de validación para variables de entorno
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY es requerida'),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

/**
 * Tipo inferido del schema
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Valida y parsea las variables de entorno
 * Lanza un error si alguna variable requerida falta o es inválida
 */
export function validateEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    console.error('❌ Variables de entorno inválidas:');
    parsed.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    throw new Error('Faltan variables de entorno requeridas. Revisa el archivo .env.local');
  }

  return parsed.data;
}

/**
 * Variables de entorno validadas
 * Se exportan para uso en toda la aplicación
 */
export const env = validateEnv();
