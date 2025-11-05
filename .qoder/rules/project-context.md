# 🧠 Project Context – MiBarber Web

## Stack
- Next.js 15 (App Router) + React 19 + TypeScript estricto [CSR principalmente]  
- Tailwind CSS para estilos utilitarios  
- Supabase (Auth + DB) como backend-as-a-service  
- TanStack Query (React Query) para estado de servidor  
- Zod para validaciones y parsing  
- dnd-kit para drag & drop (Kanban)  

## Arquitectura (carpetas)
src/
├─ app/ # Rutas y páginas (App Router)
├─ components/ # UI y componentes reusables (incluye Kanban)
├─ features/ # Dominios (appointments, auth, dashboard)
├─ hooks/ # Hooks reutilizables (datos, estado, UI)
├─ lib/ # Integraciones (supabaseClient, config)
├─ types/ # Tipos de dominio (Appointment, Barbero, etc.)
└─ utils/ # Helpers (date, formatters, etc.)

text

## Dominios y flujos
- Autenticación: Supabase + AuthContext; roles Admin / Barbero  
- Filtros globales esperados: barbería (implícita por sesión), sucursal (admin editable, barbero fija), barbero opcional y fecha  
- Citas (appointments): CRUD con React Query; Kanban usa dnd-kit para mover estados válidos  
- Reglas críticas: todo acceso a datos debe estar scoped por id_barberia; barbero común no puede cambiar sucursal  

## React Query (lineamientos)
- Query Keys: ["citas", fecha, sucursalId, barberoId], ["sucursales", idBarberia], ["barberos", idBarberia, sucursalId]  
- Optimistic updates al mover estados en Kanban, con invalidateQueries seguro ante error  
- Stale/caching acorde a vista (dashboard/agenda)  

## UI/UX
- Tailwind; componentes accesibles (focus, aria); feedback con toasts  
- dnd-kit: sensors con activationConstraint, closestCorners, DragOverlay con animación suave  
- Kanban: columnas con ids de estado ("pendiente" | "confirmado" | "completado" | "cancelado")  

## Seguridad de datos
- Todas las consultas/mutaciones deben incluir id_barberia de sesión (no derivar de UI)  
- Validar transiciones de estado de cita según constraint de DB (mibarber_citas_estado_check)  