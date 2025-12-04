# 🎨 Design System V2 – MiBarber

## 📍 Fuente de Verdad

**Archivo CSS**: `app/(v2)/globals-v2.css`

Este archivo contiene el sistema completo de diseño en 3 capas:
1. Tokens Primitivos
2. Tokens Semánticos  
3. Componentes CSS

**⚠️ Esta guía documenta las REGLAS DE USO, no replica el CSS completo.**

---

## 🏗️ Arquitectura del Sistema

### Capa 1: Tokens Primitivos

**Qué son**: Valores base sin contexto semántico

**Prefijo**: `--primitive-*`

**Ejemplos**:
--primitive-orange-primary: #ff7700;
--primitive-black: #000000;
--primitive-gray-darkest: #1a1a1a;
--space-md: 16px;
--font-size-base: 16px;

text

**Cuándo usar**: NUNCA directamente. Solo para definir tokens semánticos.

---

### Capa 2: Tokens Semánticos

**Qué son**: Referencias con significado de uso

**Prefijos**: `--color-*`, `--bg-*`, `--text-*`, `--spacing-*`, `--border-*`

**Ejemplos**:
--color-primary: var(--primitive-orange-primary);
--bg-secondary: var(--primitive-gray-darkest);
--text-muted: var(--primitive-white-60);
--spacing-component: var(--space-md);
--border-focus: var(--color-primary);

text

**Cuándo usar**: SIEMPRE en componentes CSS y código.

---

### Capa 3: Componentes CSS

**Qué son**: Clases reutilizables con prefijo `v2-`

**Categorías**:
- Contenedores: `.v2-container`, `.v2-card`
- Botones: `.v2-btn`, `.v2-btn-primary`, `.v2-btn-sm`
- Inputs: `.v2-input`, `.v2-label`
- Layouts: `.v2-grid`, `.v2-flex`, `.v2-stack`
- Estados: `.v2-badge-success`, `.v2-badge-danger`

**Cuándo usar**: En JSX/TSX para construir UI.

---

## 🎨 Paleta de Colores (Referencia)

Extraída de `globals.css` legacy, adaptada a V2:

### Principales
- Naranja primario: `#ff7700`
- Naranja oscuro: `#cc5500`
- Naranja hover: `#ffa500`
- Naranja claro: `#ffb733`
- Cian acento: `#00CCC2`

### Fondos
- Negro: `#000000`
- Gris muy oscuro: `#1a1a1a`
- Gris oscuro: `#2a2a2a`
- Gris medio-oscuro: `#3a3a3a`

### Bordes
- Primario: `#333333`
- Secundario: `#444444`

### Textos
- Blanco: `#ffffff` / `rgba(255,255,255,0.87)`
- Secundario: `rgba(255,255,255,0.8)`
- Muted: `rgba(255,255,255,0.6)`
- Disabled: `rgba(255,255,255,0.2)`

### Estados
- Success: `#10b981`
- Warning: `#f59e0b`
- Danger: `#ef4444`
- Info: `#0ea5e9`

---

## ✅ Reglas de Uso

### Regla 1: Consultar antes de crear

Antes de escribir CSS nuevo:

Ver tokens disponibles
grep "^ --" app/(v2)/globals-v2.css

Ver componentes disponibles
grep "^.v2-" app/(v2)/globals-v2.css

text

---

### Regla 2: Nunca hardcodear valores

/* ❌ INCORRECTO */
.my-component {
padding: 16px;
color: #ff7700;
background: #1a1a1a;
}

/* ✅ CORRECTO */
.my-component {
padding: var(--spacing-component);
color: var(--color-primary);
background: var(--bg-secondary);
}

text
undefined
/* ❌ INCORRECTO */

<div style={{ padding: 16, color: '#ff7700' }}>...</div>
/* ✅ CORRECTO */

<div className="v2-card">...</div> ```
Regla 3: Extensión con className
Todos los componentes React deben aceptar className:

text
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  className?: string  // ⭐ Siempre incluir
  // ...
}

export function Button({ variant, className = '', ...props }: ButtonProps) {
  return (
    <button className={`v2-btn v2-btn-${variant} ${className}`} {...props} />
  )
}
Uso:

text
// Extender con Tailwind o clases custom
<Button className="v2-mt-lg w-full md:w-auto">
  Guardar
</Button>
Regla 4: Crear nuevos tokens sistemáticamente
Si necesitas un valor que no existe:

Paso 1: Agregar primitivo en globals-v2.css

text
:root {
  /* Nuevos primitivos */
  --primitive-purple-500: #8b5cf6;
  --space-3xl: 64px;
}
Paso 2: Agregar semántico (si aplica)

text
:root {
  /* Nuevos semánticos */
  --color-highlight: var(--primitive-purple-500);
  --spacing-section-large: var(--space-3xl);
}
Paso 3: Crear componente CSS (si aplica)

text
.v2-highlight-box {
  background: var(--color-highlight);
  padding: var(--spacing-section-large);
}
Paso 4: Usar en código

text
<div className="v2-highlight-box">...</div>
🧩 Componentes React (Wrappers)
Ubicación
src/components/ui/[Componente].tsx

Anatomía estándar
text
// src/components/ui/Button.tsx

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

/**
 * Botón base del sistema V2
 * @param variant - Estilo visual (default: 'secondary')
 * @param size - Tamaño del botón (default: 'md')
 */
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
Checklist componente wrapper
 Props tipadas con interface

 Acepta className prop

 Spread ...props para atributos nativos

 Named export (no default)

 JSDoc si tiene >3 props

 Valores por defecto sensatos

 Solo concatena clases CSS (no inline styles)

📐 Patrón de Composición (Atomic Design)
Átomos (Atoms)
Componentes más pequeños e indivisibles:

text
<Button>Click</Button>
<Input placeholder="Nombre" />
<Badge variant="success">Activo</Badge>
Moléculas (Molecules)
Combinación de átomos:

text
// FormField = Label + Input + ErrorMessage
<FormField 
  label="Email" 
  name="email"
  error={errors.email}
/>
Organismos (Organisms)
Secciones complejas de UI:

text
<Card>
  <CardHeader>
    <h2>Título</h2>
    <Button>Acción</Button>
  </CardHeader>
  <CardBody>
    <Form>...</Form>
  </CardBody>
</Card>
Templates
Estructura de página:

text
<DashboardLayout>
  <Sidebar />
  <MainContent>
    {children}
  </MainContent>
</DashboardLayout>
Pages
Páginas completas:

text
// app/(v2)/perfil/page.tsx
export default function PerfilPage() {
  return (
    <DashboardLayout>
      <Card>...</Card>
    </DashboardLayout>
  )
}
🎯 CSS vs Tailwind
Usar globals-v2.css para:
✅ Tokens de diseño (colores, espaciados, tipografía)

✅ Componentes base reutilizables (.v2-btn, .v2-card)

✅ Estados globales (:hover, :focus, :disabled)

✅ Breakpoints responsive base

Usar Tailwind para:
✅ Layout específico de página (flex, grid, items-center)

✅ Spacing one-off (mt-4, gap-6, p-8)

✅ Responsive específico (md:grid-cols-4, lg:flex-row)

✅ Utilidades (hidden, truncate, opacity-50)

Ejemplo combinado (correcto)
text
<div className="v2-card flex flex-col md:flex-row gap-4">
  <div className="flex-1">
    <h2 className="text-xl font-bold mb-4">Título</h2>
    <p className="text-[var(--text-muted)]">Descripción</p>
  </div>
  <Button className="v2-btn-primary w-full md:w-auto">
    Acción
  </Button>
</div>
Explicación:

v2-card: Componente base del sistema

flex flex-col md:flex-row gap-4: Layout específico con Tailwind

v2-btn-primary: Componente base del sistema

w-full md:w-auto: Responsive específico con Tailwind

text-[var(--text-muted)]: Token CSS usado en Tailwind

🚫 Anti-patrones
❌ Duplicar valores en el código
text
// MAL
const primaryColor = '#ff7700'
<div style={{ color: primaryColor }}>...</div>

// BIEN
<div className="text-[var(--color-primary)]">...</div>
❌ Crear clases ultra-específicas
text
/* MAL: Clase one-off sin reutilización */
.profile-page-submit-button-with-icon { ... }

/* BIEN: Composición */
.v2-btn-primary + utilidades de Tailwind
❌ Modificar globals-v2.css sin sistema
text
/* MAL: Clase suelta sin tokens */
.my-special-card {
  background: #1a1a1a;
  padding: 20px;
}

/* BIEN: Usar tokens o crear componente v2-* */
.v2-card-highlighted {
  background: var(--bg-secondary);
  padding: var(--spacing-component);
  border: 2px solid var(--color-primary);
}
❌ Mezclar sistemas de estilos
text
// MAL
<div className="qoder-dark-card v2-btn">...</div>

// BIEN (elegir uno)
<div className="v2-card">...</div>
❌ Usar inline styles
text
// MAL
<div style={{ padding: '16px', backgroundColor: '#1a1a1a' }}>...</div>

// BIEN
<div className="v2-card">...</div>
✅ Checklist Componente Nuevo
Antes de crear/modificar un componente:

 ¿Revisé globals-v2.css para ver tokens disponibles?

 ¿El token que necesito existe?

✅ Sí → Usar directamente

❌ No → Agregarlo en globals-v2.css primero

 ¿Componente CSS .v2-* existe?

✅ Sí → Crear wrapper React si falta

❌ No → Crear en globals-v2.css + wrapper React

 ¿Está en carpeta correcta?

Página → app/(v2)/[nombre]/page.tsx

Componente UI → src/components/ui/[Nombre].tsx

 ¿Usa solo clases v2-* y Tailwind?

 ¿Incluye prop className?

 ¿Props tipadas con interface?

 ¿Named export (no default)?

 ¿JSDoc si tiene >3 props?

 ¿Máximo 2 niveles de anidación?

 ¿Responsive si aplica?

📊 Jerarquía de Tokens (Referencia Visual)
text
Primitivos (valores base)
    ↓
Semánticos (significado)
    ↓
Componentes CSS (.v2-*)
    ↓
Componentes React (Button, Card, etc.)
    ↓
Páginas (combinan todo)
Ejemplo flujo completo:

text
--primitive-orange-primary: #ff7700
    ↓
--color-primary: var(--primitive-orange-primary)
    ↓
.v2-btn-primary { background: var(--color-primary); }
    ↓
<Button variant="primary">Click</Button>
    ↓
<LoginPage> usa <Button variant="primary"> </LoginPage>
🎯 Principios del Sistema
Single Source of Truth: globals-v2.css es la única fuente de diseño V2

Tokens sobre valores: Nunca hardcodear colores, espaciados, etc.

Composición sobre modificación: Combinar clases pequeñas, no crear gigantes

Extensibilidad: Todo componente acepta className

Consistencia: Si existe .v2-*, úsalo; si no, créalo para todos

Aislamiento: V2 no mezcla con código legacy

Documentación: Código auto-documentado con TypeScript + JSDoc

📚 Recursos
Ver tokens disponibles
text
# Colores
grep "color" app/(v2)/globals-v2.css

# Espaciados
grep "space\|spacing" app/(v2)/globals-v2.css

# Componentes
grep "^\.v2-" app/(v2)/globals-v2.css
Buscar uso de un token
text
grep -r "var(--color-primary)" src/
Validar que no hay valores hardcoded
text
# Buscar colores hex en componentes
grep -r "#[0-9a-fA-F]\{6\}" src/components/ui/
# No debería haber resultados
Última actualización: Diciembre 2025
Sistema: Design System V2
Proyecto: MiBarber Web App

text

***