# ⚙️ Reglas de Desarrollo - MiBarber

## 📋 Aplicación de Estas Reglas

### Durante Refactorización
Estas reglas guían la reorganización del código existente sin romper funcionalidades.

### Después de Refactorización
Estas reglas se aplican a TODO código nuevo o modificado en el proyecto.

---

## Principios Fundamentales

- **Código limpio sobre rapidez**
- **Tipado fuerte obligatorio**
- **Testing antes de producción**
- **Accesibilidad desde el día 1**
- **Performance como prioridad**
- **No romper funcionalidades existentes**

---

## Tipado y TypeScript

### Obligatorio
- Strict mode: `"strict": true` (ya configurado)
- No usar `any` ni `unknown` sin justificación explícita
- Generar tipos desde Supabase: `npx supabase gen types typescript`
- Interfaces para props de componentes
- Tipos utilitarios: `Partial<>`, `Pick<>`, `Omit<>`

### Prohibido

// ❌ MAL
const { data } = await (supabase as any).from('tabla').select('*');
const props: any = { ... };

// ✅ BIEN
const { data } = await supabase
.from('mibarber_citas')
.select('*')
.returns<Appointment[]>();

interface ButtonProps {
readonly label: string;
readonly onClick: () => void;
}

text

---

## Organización del Código

### Límites Estrictos
- **Máximo 200 líneas por archivo** (excepto `/config/`)
- **Máximo 150 líneas por componente**
- **Máximo 100 líneas por hook**
- **Máximo 50 líneas por función**

### Estructura por Features

src/
├── features/ # Funcionalidades agrupadas
│ ├── auth/
│ │ ├── components/ # Componentes específicos
│ │ ├── hooks/ # Hooks de auth
│ │ ├── services/ # Lógica de autenticación
│ │ ├── types/ # Tipos de auth
│ │ └── index.ts # Exports públicos
│ ├── appointments/ # Sistema de citas
│ ├── barbershop/ # Gestión de barberías
│ ├── cash-register/ # Caja
│ ├── dashboard/ # Estadísticas
│ └── whatsapp/ # Historial WhatsApp
├── shared/ # Código compartido
│ ├── components/ # Componentes UI reutilizables
│ ├── hooks/ # Hooks genéricos
│ ├── types/ # Tipos globales
│ ├── utils/ # Funciones utilitarias
│ └── config/ # Configuraciones
└── app/ # Next.js App Router

text

### Separación Lógica/Presentación

// ❌ MAL: Todo en un componente
export function AgendaBoard() {
const [state, setState] = useState();
// 500 líneas de lógica + JSX mezclados
}

// ✅ BIEN: Hook + Componente
// hooks/useAgenda.ts
export function useAgenda(sucursalId?: string) {
// Toda la lógica aquí
return { citas, isLoading, createCita, updateCita };
}

// components/AgendaBoard.tsx
export function AgendaBoard({ sucursalId }: Props) {
const { citas, isLoading } = useAgenda(sucursalId);
// Solo render (máx 100 líneas)
return <div>...</div>;
}

text

---

## Componentes

### Anatomía Estándar

import type { FC } from 'react';

interface ButtonProps {
readonly label: string;
readonly onClick: () => void;
readonly variant?: 'primary' | 'secondary';
readonly disabled?: boolean;
}

/**

Botón reutilizable con variantes de estilo

@example

tsx
undefined
<Button label="Guardar" onClick={handleSave} variant="primary" />
text
undefined
*/
export const Button: FC<ButtonProps> = ({
label,
onClick,
variant = 'primary',
disabled = false
}) => {
return (
<button
onClick={onClick}
disabled={disabled}
className={btn btn-${variant}}
aria-label={label}
>
{label}
</button>
);
};

text

### Reglas de Componentes
- Usar `FC<Props>` o declaración explícita de props
- Props como `readonly` cuando sea posible
- Exportar con nombre (no default)
- Colocar tipos antes del componente
- Memo solo cuando sea necesario (validar con profiler)
- Lazy loading para componentes pesados (>50KB)

---

## Hooks

### Convenciones
- Prefijo `use` obligatorio
- Un hook = una responsabilidad
- Separar hooks de datos (TanStack Query) de hooks de UI
- Documentar dependencias y efectos secundarios

### Hooks de TanStack Query

// ✅ BIEN: Hook específico con tipado
export function useCitas(sucursalId?: string, fecha?: string) {
return useQuery({
queryKey: ['citas', sucursalId, fecha],
queryFn: async () => {
const { data, error } = await supabase
.from('mibarber_citas')
.select('*')
.eq('id_sucursal', sucursalId)
.eq('fecha', fecha)
.returns<Appointment[]>();

text
  if (error) throw error;
  return data;
},
enabled: Boolean(sucursalId && fecha),
staleTime: 5 * 60 * 1000, // 5 minutos
});
}

text

### Mutations

export function useCreateCita() {
const queryClient = useQueryClient();

return useMutation({
mutationFn: async (nuevaCita: CreateCitaData) => {
const { data, error } = await supabase
.from('mibarber_citas')
.insert(nuevaCita)
.select()
.single();

text
  if (error) throw error;
  return data;
},
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['citas'] });
  toast.success('Cita creada exitosamente');
},
onError: (error) => {
  toast.error('Error al crear cita');
  logger.error('Create cita failed', { error });
},
});
}

text

---

## UI/UX y Accesibilidad

### Radix UI
- Usar Radix para modales, dropdowns, selects
- Personalizar estilos con Tailwind
- No duplicar componentes de Radix

### Accesibilidad WCAG AA

#### Atributos ARIA Obligatorios
// Botones sin texto visible
<button aria-label="Cerrar modal" onClick={onClose}>
<XIcon />
</button>

// Descripciones
<input aria-describedby="email-helper" id="email" />
<span id="email-helper">Ingrese su correo electrónico</span>

// Roles en elementos custom

<div role="tablist"> <button role="tab" aria-selected="true">Tab 1</button> </div> ```
Contraste y Navegación
Contraste mínimo: 4.5:1 para texto normal

Touch targets: Mínimo 44x44px en mobile

Navegación por teclado: Siempre funcional

Focus visible: Outline claro en elementos interactivos

Responsive Design
Mobile-first: Diseñar para 375px primero

text
// Tailwind breakpoints
sm: 640px   // Tablet pequeña
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Desktop grande
SEO
Metadata API de Next.js 15
text
// app/agenda/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agenda de Citas - MiBarber',
  description: 'Gestiona las citas de tu barbería de forma profesional',
  openGraph: {
    title: 'Agenda de Citas - MiBarber',
    description: 'Sistema profesional de gestión de citas',
    images: ['/og-image-agenda.jpg'],
  },
};

export default function AgendaPage() {
  return <AgendaBoard />;
}
Estructura HTML Semántica
text
<main>
  <header>
    <h1>Agenda de Citas</h1>
  </header>
  
  <nav aria-label="Navegación principal">
    {/* links */}
  </nav>
  
  <section aria-labelledby="citas-hoy">
    <h2 id="citas-hoy">Citas de Hoy</h2>
    {/* contenido */}
  </section>
  
  <footer>
    {/* info */}
  </footer>
</main>
Performance
Optimizaciones Obligatorias
1. Lazy Loading de Features
text
import dynamic from 'next/dynamic';

const DashboardStats = dynamic(() => import('@/features/dashboard/Stats'), {
  loading: () => <Skeleton />,
  ssr: false,
});
2. Memoización Estratégica
text
// Cálculos pesados
const citasPorHora = useMemo(() => {
  return calcularCitasPorHora(citas);
}, [citas]);

// Callbacks en props
const handleUpdate = useCallback((id: string) => {
  updateCita(id);
}, [updateCita]);

// Componentes que re-renderizan frecuentemente
const AppointmentCard = memo(({ cita }: Props) => {
  return <div>{cita.servicio}</div>;
});
3. TanStack Query Caché
text
// Citas: 5 minutos
staleTime: 5 * 60 * 1000

// Estadísticas: 30 minutos
staleTime: 30 * 60 * 1000

// Configuración (servicios, sucursales): Infinito
staleTime: Infinity
Testing
Cobertura Mínima: 70%
Herramientas
Vitest - Tests unitarios y de integración

Testing Library - Tests de componentes

Playwright - Tests E2E (opcional)

Estructura de Tests
text
// __tests__/hooks/useCitas.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCitas } from '@/features/appointments/hooks/useCitas';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useCitas', () => {
  it('debe cargar citas correctamente', async () => {
    const { result } = renderHook(
      () => useCitas('sucursal-1', '2025-10-29'),
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toBeDefined();
  });

  it('debe manejar errores', async () => {
    // Mock error de Supabase
    const { result } = renderHook(
      () => useCitas('sucursal-invalida', '2025-10-29'),
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
Tests Obligatorios
Hooks críticos: useCitas, useBarberoAuth, useEstadisticas

Componentes de formulario: AppointmentModal, ClientForm

Utilidades: dateUtils, formatters, validators

Flujos críticos: Login, Crear cita, Completar servicio

Manejo de Errores
Estrategia Unificada
text
// shared/utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// En componentes
try {
  await createCita(data);
  toast.success('Cita creada exitosamente');
} catch (error) {
  if (error instanceof AppError) {
    toast.error(error.message);
    logger.error('Expected error', { code: error.code });
  } else {
    toast.error('Error inesperado. Contacte soporte.');
    logger.error('Unexpected error', { error, context: 'create-cita' });
  }
}
Logging
Desarrollo: console.log/error permitido

Producción: Solo usar logger configurado

NO logs sensibles: Contraseñas, tokens, datos personales

Integración con N8N (Contexto)
⚠️ NO MODIFICAR Durante Refactorización
Mantener intacta la lógica de:

Queries a Supabase (SELECT)

Mutations (INSERT, UPDATE, DELETE)

Real-time subscriptions

Llamadas al webhook de N8N

Ejemplo: Mantener Lógica Existente
text
// ✅ CORRECTO: Refactorizar sin cambiar queries

// ANTES (useCitas.ts - 408 líneas)
const { data } = await supabase
  .from('mibarber_citas')
  .select('*')
  .eq('id_sucursal', sucursalId);

// DESPUÉS (useCitasList.ts - 100 líneas)
const { data } = await supabase
  .from('mibarber_citas')
  .select('*')
  .eq('id_sucursal', sucursalId);
// Misma query, solo reorganizado en archivo más pequeño
Al Refactorizar Hooks de Datos
text
// ❌ MAL: Cambiar lógica de queries
const { data } = await supabase
  .from('citas')  // ← Cambió nombre de tabla
  .select('id, fecha');  // ← Cambió campos

// ✅ BIEN: Solo reorganizar, mantener lógica
const { data } = await supabase
  .from('mibarber_citas')  // ← Mismo nombre
  .select('*')  // ← Mismos campos
  .eq('id_sucursal', sucursalId);  // ← Misma lógica
Real-time Subscriptions (Mantener)
text
// No modificar la lógica de subscriptions existente
const channel = supabase
  .channel('historial')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'mibarber_historial',
    filter: `id_cliente=eq.${clienteId}`,
  }, (payload) => {
    queryClient.invalidateQueries(['whatsapp-historial']);
  })
  .subscribe();
Documentación
JSDoc Obligatorio
text
/**
 * Hook para gestionar citas de una sucursal específica
 * 
 * @param sucursalId - ID de la sucursal
 * @param fecha - Fecha en formato YYYY-MM-DD
 * @returns Query con citas, loading state y funciones de mutación
 * 
 * @example
 * ```tsx
 * const { data: citas, isLoading } = useCitas('sucursal-1', '2025-10-29');
 * 
 * if (isLoading) return <Spinner />;
 * return <CitasList citas={citas} />;
 * ```
 */
export function useCitas(sucursalId?: string, fecha?: string) {
  // ...
}
Definition of Done (DoD)
Antes de considerar una tarea completa:

 Tipado fuerte sin any

 ESLint sin warnings

 Build exitoso (npm run build)

 Tests con cobertura ≥70%

 Componentes <200 líneas

 Hooks <100 líneas

 Accesibilidad WCAG AA validada

 Performance sin regresiones

 Documentación (JSDoc) actualizada

 Sin console.logs en producción

 Funcionalidades NO rotas

Comandos de Validación
text
# Verificación completa antes de commit
npm run pre-commit

# Comandos individuales
npm run type-check      # TypeScript sin errores
npm run lint            # ESLint limpio
npm run lint:fix        # Auto-fix de ESLint
npm run test            # Tests con Vitest
npm run test:coverage   # Reporte de cobertura
npm run build           # Build de producción
Scripts a agregar en package.json:
text
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "pre-commit": "npm run type-check && npm run lint && npm run test && npm run build"
  }
}
Migración Gradual: Convivencia de Código
Durante la refactorización conviven código legacy y código refactorizado.

Código Legacy (No Refactorizado)
text
// TODO: [LEGACY] Este componente será refactorizado en Fase 3
// NO agregar más lógica aquí, solo bugfixes críticos
export function AgendaBoard() {
  // 690 líneas...
}
Código Refactorizado
text
/**
 * [REFACTORED] Fase 3 - Header de la agenda
 * Siguiendo nuevas reglas: <150 líneas, tipado fuerte, testeado
 */
export function AgendaHeader({ onDateChange }: AgendaHeaderProps) {
  // Máx 100 líneas
}
Regla de "No Retroceso"
Una vez refactorizado un componente/hook:

❌ NO volver a patrones legacy (componentes >200 líneas)

❌ NO agregar any en código nuevo

❌ NO mezclar lógica y presentación

✅ Mantener estándares en modificaciones futuras

✅ Actualizar tests cuando se modifique

Prioridad de Refactorización
Críticos primero: Auth → Appointments (Agenda)

Dependencias después: Clientes → Servicios

Secundarios al final: WhatsApp → Admin panel

Casos Especiales
Archivos de Configuración
Permitido >200 líneas: /config/columns.ts, /config/forms.ts

Son declarativos, no ejecutables

Contienen definiciones de estructuras, no lógica

Componentes de Terceros
FullCalendar, Recharts: Permitir configuraciones extensas

Extraer configuraciones a /config/ cuando sea posible

Notas Finales
Estas reglas son una guía para:

Refactorizar el proyecto actual de forma segura y consistente

Mantener calidad en todo código nuevo que se agregue después

Regla de oro: Cuando dudes, prioriza no romper funcionalidades existentes sobre "hacer perfecto" [file:15][file:17][file:18][file:19][file:20].