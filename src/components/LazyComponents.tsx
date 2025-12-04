import dynamic from 'next/dynamic';

// Simple skeleton components
const CalendarSkeleton = () => (
  <div className="animate-pulse h-96 bg-gray-700 rounded"></div>
);

const TableSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-700 rounded"></div>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <div className="animate-pulse h-64 bg-gray-700 rounded"></div>
);

// COMPONENTES DE CALENDARIO (FullCalendar)
// =============================================

export const LazyCalendar = dynamic(
  () => import('@/components/Calendar').then(mod => mod.Calendar),
  {
    loading: () => <CalendarSkeleton />,
    ssr: false, // FullCalendar no funciona bien con SSR
  }
);

export const LazySimpleCalendar = dynamic(
  () => import('@/components/SimpleCalendar').then(mod => mod.SimpleCalendar),
  {
    loading: () => <CalendarSkeleton />,
    ssr: false,
  }
);

export const LazyKanbanBoard = dynamic(
  () => import('@/components/KanbanBoardDndKit').then(mod => mod.KanbanBoardDndKit),
  {
    loading: () => <TableSkeleton />,
    ssr: false, // DndKit funciona con SSR
  }
);

export const LazyAgendaBoard = dynamic(
  () => import('@/features/appointments/components/AgendaBoard').then(mod => mod.AgendaBoard),
  {
    loading: () => <TableSkeleton />,
    ssr: false,
  }
);

// =============================================
// COMPONENTES DE TABLAS Y LISTAS
// =============================================

export const LazyClientsTable = dynamic(
  () => import('@/components/ClientsTable').then(mod => mod.ClientsTable),
  {
    loading: () => <TableSkeleton />,
  }
);

export const LazyBarberosTable = dynamic(
  () => import('@/components/BarberosTable').then(mod => mod.BarberosTable),
  {
    loading: () => <TableSkeleton />,
  }
);

export const LazyAppointmentList = dynamic(
  () => import('@/components/AppointmentList').then(mod => mod.AppointmentList),
  {
    loading: () => <TableSkeleton />,
  }
);

// =============================================
// COMPONENTES DE MODALES
// =============================================

export const LazyAppointmentModal = dynamic(
  () => import('@/components/SingleFormAppointmentModalWithSucursal').then(mod => mod.SingleFormAppointmentModalWithSucursal),
  {
    ssr: false,
  }
);

export const LazyClientModal = dynamic(
  () => import('@/components/ClientModal').then(mod => mod.ClientModal),
  {
    ssr: false,
  }
);

export const LazyBarberoModal = dynamic(
  () => import('@/components/BarberoModal').then(mod => mod.BarberoModal),
  {
    ssr: false,
  }
);

export const LazyServicioModal = dynamic(
  () => import('@/components/ServicioModal').then(mod => mod.ServicioModal),
  {
    ssr: false,
  }
);

// =============================================
// COMPONENTES DE GESTIÓN DE SUCURSALES
// =============================================

export const LazySucursalesManager = dynamic(
  () => import('@/components/SucursalesManager').then(mod => mod.SucursalesManager),
  {
    loading: () => <TableSkeleton />,
  }
);

export const LazyEditarSucursalModal = dynamic(
  () => import('@/components/EditarSucursalModal').then(mod => mod.EditarSucursalModal),
  {
    ssr: false,
  }
);

// =============================================
// EJEMPLO DE USO EN COMPONENTES
// =============================================

/*
// En lugar de:
import Calendar from '@/components/Calendar';

// Usar:
import { LazyCalendar } from '@/components/LazyComponents';

// Y en el componente:
<LazyCalendar {...props} />
*/