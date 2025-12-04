# 🧠 Project Context – MiBarber Web V2

## 🎯 Sistema de Desarrollo Dual

Este proyecto está en **desarrollo incremental**:
- **Código existente**: Usa `globals.css` y rutas directas en `app/`
- **Código V2 (NUEVO)**: Usa `globals-v2.css` y route group `app/(v2)/`

**REGLA FUNDAMENTAL**: Cuando crees código nuevo, SIEMPRE trabaja en `app/(v2)/` con el sistema V2.

---

## 📚 Stack Tecnológico

### Core
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19
- **Lenguaje**: TypeScript (modo estricto)
- **Estilos**: Tailwind CSS + Sistema de diseño V2

### Backend y Estado
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Estado servidor**: @tanstack/react-query v5
- **Estado global**: Zustand
- **Validación**: Zod

### Funcionalidades específicas
- **Calendario**: FullCalendar
- **Drag & Drop**: dnd-kit (sistema Kanban)

---

## 🗂️ Arquitectura de Carpetas

src/
├─ app/
│ ├─ layout.tsx # Root layout
│ ├─ client-layout.tsx # ⭐ Detecta rutas V2 vs legacy
│ ├─ globals.css # Estilos legacy (NO USAR en código nuevo)
│ ├─ admin/ # Páginas existentes
│ ├─ login/ # (no modificar sin necesidad)
│ ├─ mi-barberia/
│ ├─ ...
│ │
│ └─ (v2)/ # ⭐ TRABAJAR AQUÍ para código nuevo
│ ├─ layout.tsx # Import './globals-v2.css'
│ ├─ globals-v2.css # Sistema de diseño V2
│ ├─ perfil/ # Página de perfil (estructura completa)
│ ├─ estadisticas/ # Nuevas páginas con template base
│ ├─ caja/
│ └─ agente-ia/
│
├─ components/
│ ├─ ui/ # ⭐ Componentes base V2 (Button, Input, Card)
│ └─ shared/ # Componentes legacy (NO USAR en V2)
│
├─ features/ # Lógica de dominio
│ ├─ appointments/
│ ├─ auth/
│ └─ dashboard/
│
├─ hooks/ # Custom hooks reutilizables
├─ lib/ # Integraciones (supabaseClient, etc.)
├─ types/ # Tipos TypeScript globales
└─ utils/ # Funciones helper

text

---

## 🔄 Client Layout - Detección de Rutas V2

**Ubicación**: `src/app/client-layout.tsx`

El ClientLayout detecta rutas V2 para **NO aplicar componentes visuales legacy** (NavBar, BottomNav, GeneralLayout). Esto evita la duplicación de menús.

### Implementación correcta:

'use client';

import { usePathname } from 'next/navigation';
import { Providers } from '@/components/Providers';
import { GlobalFiltersProvider } from '@/contexts/GlobalFiltersContext';
import { ConditionalNavBar } from '@/components/ConditionalNavBar';
import { GeneralLayout } from '@/components/GeneralLayout';
import { BottomNav } from '@/components/BottomNav';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { FloatingNewAppointmentButton } from '@/components/FloatingNewAppointmentButton';

export default function ClientLayout({
children,
}: {
children: React.ReactNode;
}) {
const pathname = usePathname();

// ⭐ Lista de rutas V2 - ACTUALIZAR al crear nuevas páginas
const v2Routes = ['/perfil', '/estadisticas', '/caja', '/agente-ia'];
const isV2Route = v2Routes.some(route => pathname?.startsWith(route));

// Para rutas V2: SOLO providers, sin componentes visuales
if (isV2Route) {
return (
<Providers>
<GlobalFiltersProvider>
{children}
</GlobalFiltersProvider>
</Providers>
);
}

// Para rutas legacy: layout completo
return (
<Providers>
<GlobalFiltersProvider>
<ConditionalNavBar />
<GeneralLayout>
{children}
</GeneralLayout>
<BottomNav />
<OfflineIndicator />
<FloatingNewAppointmentButton />
</GlobalFiltersProvider>
</Providers>
);
}

text

**⚠️ IMPORTANTE**: 
- Al crear una nueva página V2, **agregar su ruta al array `v2Routes`**
- Los route groups como `(v2)` NO aparecen en `pathname`
- Ejemplo: `app/(v2)/perfil/page.tsx` → `pathname = "/perfil"`

---

## 📄 Template Base para Nuevas Páginas V2

### Estructura estándar

**Ubicación**: `app/(v2)/[nombre-pagina]/page.tsx`

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabContent } from '@/components/ui/Tabs';

export default function NombrePage() {
const { barbero, idBarberia } = useAuth();
const [activeTab, setActiveTab] = useState('principal');

const tabs = [
{ id: 'principal', label: 'Principal' },
{ id: 'secundario', label: 'Secundario' }
];

const handleAction = () => {
console.log('Acción principal');
};

return (
<>
{/* Card principal con botón de acción */}
<Card className="mb-8">
<div className="flex justify-between items-center p-6">
<h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] text-left relative pb-2">
Título de la Página
</h1>
<Button variant="primary" onClick={handleAction} className="w-auto uppercase text-sm font-semibold px-6" >
Acción Principal
</Button>
</div>
</Card>

text
  {/* Pestañas */}
  <div className="mb-6">
    <Tabs
      tabs={tabs}
      defaultTab="principal"
      onValueChange={setActiveTab}
    />
  </div>

  {/* Contenido de la pestaña Principal */}
  <TabContent value="principal" activeTab={activeTab}>
    {/* Primera fila: 4 tarjetas pequeñas */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {.map((num) => ([1][2]
        <Card key={num} className="v2-card-small">
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
            <p className="font-semibold">Tarjeta {num}</p>
            <p className="text-xs mt-2">Contenido</p>
          </div>
        </Card>
      ))}
    </div>

    {/* Segunda fila: 3 tarjetas grandes */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {.map((num) => (
        <Card key={num} className="v2-card-large">
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
            <p className="font-semibold">Tarjeta {num}</p>
            <p className="text-xs mt-2">Contenido</p>
          </div>
        </Card>
      ))}
    </div>
  </TabContent>

  {/* Contenido de la pestaña Secundario */}
  <TabContent value="secundario" activeTab={activeTab}>
    <Card className="p-12 text-center">
      <p className="text-[var(--text-muted)] text-lg">Contenido secundario</p>
    </Card>
  </TabContent>
</>
);
}

text

### Características del template:

- ✅ Card principal con título (h1) y botón de acción
- ✅ Subrayado automático en h1 (via CSS en globals-v2.css)
- ✅ Sistema de pestañas funcional
- ✅ Grid responsive: 4 tarjetas pequeñas + 3 grandes
- ✅ Clases CSS predefinidas (`v2-card-small`, `v2-card-large`)
- ✅ Hereda automáticamente NavBar y BottomNav del layout V2
- ✅ AuthContext disponible vía `useAuth()`
- ✅ Padding lateral controlado por `v2-content` (10px mobile, 20px tablet, 30px desktop)

### Pasos para crear nueva página:

1. **Crear archivo**: `app/(v2)/[nombre]/page.tsx` con el template
2. **Actualizar ClientLayout**: Agregar ruta a `v2Routes` en `client-layout.tsx`
3. **Personalizar**: Cambiar título, acción del botón y contenido de tarjetas

**⚠️ NOTA**: La página `/perfil` tiene estructura completa personalizada. Solo las nuevas páginas usan este template simplificado.

---

## ♻️ Reutilización de Código Existente

### ✅ SÍ Reutilizar (lógica sin estilos)

#### Hooks de datos y estado
// Ejemplo: Reutilizar hook de citas
import { useCitas } from '@/hooks/useCitas'
import { useAuth } from '@/features/auth/hooks/useAuth'

// En tu componente V2
export function PerfilPage() {
const { user } = useAuth() // ✅ Hook existente
const { citas } = useCitas({ barberoId: user.id }) // ✅ Hook existente

return (
<div className="v2-card"> {/* Estilos V2 /}
{/ ... */}
</div>
)
}

text

#### Context providers
// AuthContext ya existe, reutilizarlo
import { AuthProvider } from '@/features/auth/context'

// En tu layout V2
export default function V2Layout({ children }) {
return (
<AuthProvider> {/* ✅ Reutilizar */}
<div className="v2-container">
{children}
</div>
</AuthProvider>
)
}

text

#### Utilidades y helpers
// Reutilizar funciones de formateo, validación, etc.
import { formatDate } from '@/utils/date'
import { getSupabaseClient } from '@/lib/supabaseClient'
import type { Cita, Barbero } from '@/types'

text

**Qué reutilizar:**
- ✅ `src/hooks/` - Todos los custom hooks
- ✅ `src/lib/` - Integraciones y configuración
- ✅ `src/utils/` - Funciones helper
- ✅ `src/types/` - Tipos TypeScript
- ✅ `src/features/[dominio]/hooks/` - Hooks de dominio
- ✅ `src/features/[dominio]/context.tsx` - Context providers
- ✅ `src/features/[dominio]/types.ts` - Tipos de dominio
- ✅ `src/features/[dominio]/utils.ts` - Utilidades de dominio

---

### ❌ NO Reutilizar (componentes con estilos legacy)

#### Componentes visuales existentes
// ❌ NO HACER: Importar componente con estilos legacy
import { Button } from '@/components/shared/Button'
// Este tiene className="qoder-dark-button"

// ✅ HACER: Crear nuevo componente V2
import { Button } from '@/components/ui/Button'
// Este tiene className="v2-btn"

text

**Qué NO reutilizar:**
- ❌ `src/components/shared/` - Componentes con estilos legacy
- ❌ `src/features/[dominio]/components/` - Componentes visuales legacy
- ❌ `app/[página]/` - Páginas completas legacy

---

### 🔄 Migrar componentes legacy a V2

Si un componente tiene lógica útil pero estilos legacy:

**Paso 1**: Extraer la lógica (hooks, handlers, tipos)  
**Paso 2**: Crear nuevo componente en `src/components/ui/`  
**Paso 3**: Reescribir JSX con componentes V2  
**Paso 4**: Reemplazar clases CSS legacy con `v2-*`

**Ejemplo**:
// ANTES (legacy) - src/components/shared/CitaCard.tsx
export function CitaCard({ cita }) {
const { deleteCita } = useCitas() // ✅ Lógica OK

return (
<div className="qoder-dark-card"> {/* ❌ Estilo legacy */}
<h3>{cita.cliente_nombre}</h3>
<button
className="qoder-dark-button"
onClick={() => deleteCita(cita.id)}
>
Eliminar
</button>
</div>
)
}

// DESPUÉS (V2) - src/components/ui/CitaCard.tsx
import { Button } from '@/components/ui/Button'

export function CitaCard({ cita }) {
const { deleteCita } = useCitas() // ✅ Misma lógica

return (
<div className="v2-card"> {/* ✅ Estilo V2 */}
<h3 className="v2-text-heading">{cita.cliente_nombre}</h3>
<Button
variant="danger"
onClick={() => deleteCita(cita.id)}
>
Eliminar
</Button>
</div>
)
}

text

---

### 📦 Estructura recomendada

src/
├─ hooks/ # ✅ Reutilizar (sin cambios)
│ ├─ useAuth.ts
│ ├─ useCitas.ts
│ └─ useSucursales.ts
│
├─ lib/ # ✅ Reutilizar (sin cambios)
│ ├─ supabaseClient.ts
│ └─ config.ts
│
├─ utils/ # ✅ Reutilizar (sin cambios)
│ ├─ date.ts
│ └─ formatters.ts
│
├─ types/ # ✅ Reutilizar (sin cambios)
│ ├─ cita.ts
│ └─ barbero.ts
│
├─ features/
│ └─ [dominio]/
│ ├─ hooks/ # ✅ Reutilizar
│ ├─ types.ts # ✅ Reutilizar
│ ├─ utils.ts # ✅ Reutilizar
│ ├─ context.tsx # ✅ Reutilizar
│ └─ components/ # ❌ NO reutilizar (crear nuevos en V2)
│
└─ components/
├─ shared/ # ❌ Legacy (no tocar)
└─ ui/ # ✅ Nuevos componentes V2
├─ Button.tsx
├─ Card.tsx
├─ Input.tsx
└─ Tabs.tsx

text

---

### 🎯 Regla Simple

**Si tiene estilos CSS → crear nuevo en V2**  
**Si es solo lógica → reutilizar directamente**

---

## 🎨 Sistema de Estilos V2

### Ubicación del CSS
**Archivo**: `app/(v2)/globals-v2.css`

### Arquitectura de 3 capas

1. **Tokens Primitivos**: Valores base
--primitive-orange-primary: #ff7700;
--space-md: 16px;

text

2. **Tokens Semánticos**: Significado de uso
--color-primary: var(--primitive-orange-primary);
--spacing-component: var(--space-md);

text

3. **Componentes CSS**: Clases reutilizables
.v2-btn { ... }
.v2-card { ... }
.v2-card-small { padding: var(--space-md); min-height: 180px; }
.v2-card-large { padding: var(--space-lg); min-height: 240px; }

text

### Regla de nomenclatura
**TODAS las clases V2 deben tener prefijo `v2-`**

// ✅ CORRECTO
<button className="v2-btn v2-btn-primary">Click</button>
<Card className="v2-card-small">Widget</Card>

// ❌ INCORRECTO (mezcla sistemas)
<button className="qoder-dark-button v2-btn">Click</button>

text

### Variantes de Cards predefinidas

// Card pequeña para widgets/métricas
<Card className="v2-card-small">

<p>Métrica</p> </Card>
// Card grande para contenido principal
<Card className="v2-card-large">

<p>Contenido</p> </Card> ```
Títulos con subrayado automático
Los <h1> tienen subrayado automático definido en globals-v2.css:

text
h1::after {
  content: '';
  position: absolute;
  left: 0;  /* Sigue alineación del texto */
  bottom: 0;
  width: 60px;
  height: 3px;
  background-color: var(--color-primary);
}
text
// El subrayado se aplica automáticamente
<h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] text-left relative pb-2">
  Título de la Página
</h1>
⚠️ Nota: El subrayado usa left: 0 para seguir la alineación del texto (left, center, right).

Layout V2 - Paddings laterales
El sistema V2 tiene contenedores anidados:

text
// app/(v2)/layout.tsx
<div className="v2-root">      {/* Padding top para navbar */}
  <NavBar />
  <main className="v2-main">   {/* Padding vertical */}
    <div className="v2-content"> {/* Padding lateral responsive */}
      {children}
    </div>
  </main>
  <BottomNav />
</div>
Paddings laterales en v2-content:

Mobile (<768px): 10px

Tablet (768px-1023px): 20px

Desktop (1024px+): 30px

🔧 Reglas de TypeScript
1. Tipado estricto (sin any)
text
// ✅ CORRECTO
interface ButtonProps {
  variant: 'primary' | 'secondary'
  onClick: () => void
  children: React.ReactNode
}

export function Button({ variant, onClick, children }: ButtonProps) {
  // ...
}

// ❌ INCORRECTO
function Button(props: any) {
  // ...
}
2. Props con interface (no type)
text
// ✅ CORRECTO
interface CardProps {
  title: string
  children: React.ReactNode
  className?: string
}

// ❌ INCORRECTO
type CardProps = {
  title: string
  children: React.ReactNode
}
3. Named exports (no default exports)
text
// ✅ CORRECTO
export function Button() { }
export function Card() { }

// ❌ INCORRECTO
export default function Button() { }
🧩 Componentes Reutilizables
Ubicación
Componentes base V2: src/components/ui/

Componentes de negocio V2: Crear nuevos, no usar legacy

Estructura obligatoria
text
// src/components/ui/Button.tsx

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string  // ⭐ Siempre incluir para extensibilidad
}

export function Button({
  variant = 'secondary',
  size = 'md',
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = `v2-btn v2-btn-${variant} v2-btn-${size} ${className}`.trim()
  
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
Reglas componentes
✅ Props tipadas con interface

✅ Named export

✅ Prop className para extensibilidad

✅ Spread ...props para atributos HTML nativos

✅ Máximo 2 niveles de anidación de componentes

✅ JSDoc para props complejas (>5 props)

❌ No usar inline styles

❌ No crear componentes ultra-específicos

🔄 React Query (TanStack Query)
Query Keys Canon
Formato: [recurso, ...filtros]

text
// Citas
["citas", fecha, sucursalId, barberoId]

// Sucursales
["sucursales", idBarberia]

// Barberos
["barberos", idBarberia, sucursalId]

// Clientes
["clientes", idBarberia]
Ejemplo completo
text
const { data: citas, isLoading } = useQuery({
  queryKey: ["citas", selectedDate, sucursalId, barberoId],
  queryFn: () => fetchCitas({
    fecha: selectedDate,
    sucursalId,
    barberoId,
    id_barberia: user.id_barberia  // ⚠️ SIEMPRE desde sesión
  }),
  staleTime: 5 * 60 * 1000,  // 5 minutos
})
Mutaciones con optimistic update
text
const mutation = useMutation({
  mutationFn: updateCita,
  onMutate: async (newData) => {
    // Cancelar queries en progreso
    await queryClient.cancelQueries({ queryKey: ["citas"] })
    
    // Guardar estado anterior
    const previous = queryClient.getQueryData(["citas"])
    
    // Actualizar optimistamente
    queryClient.setQueryData(["citas"], (old) => {
      return optimisticUpdate(old, newData)
    })
    
    return { previous }
  },
  onError: (err, variables, context) => {
    // Revertir en caso de error
    if (context?.previous) {
      queryClient.setQueryData(["citas"], context.previous)
    }
  },
  onSettled: () => {
    // Refrescar datos reales
    queryClient.invalidateQueries({ queryKey: ["citas"] })
  },
})
🔐 Seguridad de Datos (CRÍTICO)
Regla de oro: id_barberia desde sesión
text
// ✅ CORRECTO: id_barberia desde AuthContext/sesión
const { user } = useAuth()  // user.id_barberia viene de sesión

const { data } = useQuery({
  queryKey: ["citas", user.id_barberia, ...],
  queryFn: () => supabase
    .from('citas')
    .select('*')
    .eq('id_barberia', user.id_barberia)  // ⭐ Desde sesión
})

// ❌ INCORRECTO: id_barberia desde UI (manipulable)
const { data } = useQuery({
  queryKey: ["citas", selectedBarberia, ...],
  queryFn: () => supabase
    .from('citas')
    .select('*')
    .eq('id_barberia', selectedBarberia)  // ❌ Usuario puede manipular
})
Scoping obligatorio
Todas las queries y mutaciones DEBEN:

Incluir id_barberia del usuario en sesión

Validar permisos según rol (Admin / Barbero)

Barbero común no puede cambiar de sucursal

✅ Validación con Zod
En formularios
text
import { z } from 'zod'

const CitaSchema = z.object({
  cliente_nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  cliente_telefono: z.string().regex(/^\+?[0-9]{10,}$/, 'Teléfono inválido'),
  fecha: z.string().datetime(),
  estado: z.enum(['pendiente', 'confirmado', 'completado', 'cancelado']),
  id_barberia: z.string().uuid(),
  id_barbero: z.string().uuid(),
})

type CitaInput = z.infer<typeof CitaSchema>

// Uso en formulario
const handleSubmit = (data: unknown) => {
  const validated = CitaSchema.parse(data)  // Lanza error si inválido
  // O
  const result = CitaSchema.safeParse(data)
  if (!result.success) {
    console.error(result.error.flatten())
    return
  }
  // Usar result.data
}
🎯 Filtros Globales
Fuente única de verdad
Context o Zustand (elegir uno):

text
interface GlobalFilters {
  id_barberia: string       // Desde sesión (inmutable)
  sucursalId: string | null // Admin: editable, Barbero: fija
  barberoId: string | null  // Opcional
  fecha: Date               // Fecha actual por defecto
}
Regla
Prohibido duplicar lógica de filtros por página. Consumir siempre del contexto global.

🏗️ Dominios Principales
Autenticación
Provider: Supabase Auth

Context: AuthContext (reutilizar existente)

Roles: Admin | Barbero

Restricción: Barbero no puede cambiar sucursal

Citas (Appointments)
Estados válidos: "pendiente" | "confirmado" | "completado" | "cancelado"

Constraint DB: mibarber_citas_estado_check

Operaciones: CRUD completo con React Query

Hooks: Reutilizar useCitas existente

Kanban (dnd-kit)
text
import {
  DndContext,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: { distance: 8 }
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  })
)

<DndContext
  sensors={sensors}
  collisionDetection={closestCorners}
  onDragEnd={handleDragEnd}
>
  {/* Columnas droppables */}
</DndContext>
📋 Checklist Antes de Crear Código
 ¿Estoy trabajando en app/(v2)/?

 ¿Componente usa solo clases v2-*?

 ¿Props tipadas con interface?

 ¿Componente incluye prop className?

 ¿Reutilicé hooks existentes de src/hooks/?

 ¿Reutilicé tipos de src/types/?

 ¿Queries incluyen id_barberia desde sesión?

 ¿Formulario valida con Zod?

 ¿Query key según formato canon?

 ¿Máximo 2 niveles de anidación?

 ¿Named export (no default)?

 ¿Sin any ni valores hardcoded?

 ¿Nueva página V2 agregada a v2Routes en client-layout.tsx?

🚫 Anti-patrones Comunes
❌ Mezclar sistemas de estilos
text
// MAL
<div className="qoder-dark-card v2-btn">...</div>

// BIEN
<div className="v2-card">...</div>
❌ Importar componentes legacy
text
// MAL
import { Button } from '@/components/shared/Button'

// BIEN
import { Button } from '@/components/ui/Button'
❌ Seguridad: id desde UI
text
// MAL
.eq('id_barberia', selectedFromDropdown)

// BIEN
.eq('id_barberia', user.id_barberia)
❌ Componentes monolíticos
text
// MAL
<SuperComplexFormWithEverything />

// BIEN
<Form>
  <Input />
  <Select />
  <Button />
</Form>
❌ Duplicar query keys
text
// MAL: Keys inconsistentes
["appointments", date]
["citas", date, sucursal]

// BIEN: Key canon
["citas", date, sucursalId, barberoId]
❌ Recrear hooks que ya existen
text
// MAL: Crear hook duplicado
function useMyCitas() { ... }

// BIEN: Reutilizar existente
import { useCitas } from '@/hooks/useCitas'
❌ Olvidar agregar ruta a client-layout.tsx
text
// MAL: Crear página V2 sin actualizar v2Routes
// Resultado: Menús duplicados

// BIEN: Agregar al array v2Routes
const v2Routes = ['/perfil', '/estadisticas', '/nueva-pagina']
📚 Referencias Oficiales
Next.js App Router

TanStack Query v5

Supabase JS Client

dnd-kit

Zod

Tailwind CSS

text

***