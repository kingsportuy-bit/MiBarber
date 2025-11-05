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
// COMPONENTES DE GRÁFICAS (Recharts)
// =============================================

export const LazyGraficaCitasSemana = dynamic(
  () => import('@/components/GraficaCitasSemana').then(mod => mod.GraficaCitasSemana),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyGraficaBarberosSemana = dynamic(
  () => import('@/components/GraficaBarberosSemana').then(mod => mod.GraficaBarberosSemana),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyGraficaIngresosDiarios = dynamic(
  () => import('@/components/GraficaIngresosDiarios').then(mod => mod.GraficaIngresosDiarios),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyGraficaServiciosVendidos = dynamic(
  () => import('@/components/GraficaServiciosVendidos').then(mod => mod.GraficaServiciosVendidos),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyGraficaIngresosPorBarbero = dynamic(
  () => import('@/components/GraficaIngresosPorBarbero').then(mod => mod.GraficaIngresosPorBarbero),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyGraficaEvolucionClientes = dynamic(
  () => import('@/components/GraficaEvolucionClientes').then(mod => mod.GraficaEvolucionClientes),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyGraficaDistribucionMetodosPago = dynamic(
  () => import('@/components/GraficaDistribucionMetodosPago').then(mod => mod.GraficaDistribucionMetodosPago),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyCajaChart = dynamic(
  () => import('@/components/CajaChart').then(mod => mod.CajaChart),
  {
    loading: () => <ChartSkeleton />,
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

export const LazyCajaModal = dynamic(
  () => import('@/components/CajaModal').then(mod => mod.CajaModal),
  {
    ssr: false,
  }
);

export const LazyCompletarCitaModal = dynamic(
  () => import('@/components/CompletarCitaModal').then(mod => mod.CompletarCitaModal),
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
// COMPONENTES DE DASHBOARD
// =============================================

export const LazyDashboardKPIsCompleto = dynamic(
  () => import('@/components/DashboardKPIsCompleto').then(mod => mod.DashboardKPIsCompleto),
  {
    loading: () => (
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-700 rounded"></div>
        ))}
      </div>
    ),
  }
);

export const LazyKPIsAvanzados = dynamic(
  () => import('@/components/KPIsAvanzados').then(mod => mod.KPIsAvanzados),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-700 rounded"></div>
      </div>
    ),
  }
);

export const LazyResumenEjecutivo = dynamic(
  () => import('@/components/ResumenEjecutivo').then(mod => mod.ResumenEjecutivo),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-gray-700 rounded"></div>
      </div>
    ),
  }
);

// =============================================
// COMPONENTES DE CHAT
// =============================================

export const LazyChatLayout = dynamic(
  () => import('@/components/ChatLayout').then(mod => mod.ChatLayout),
  {
    loading: () => (
      <div className="animate-pulse h-screen">
        <div className="h-full bg-gray-700 rounded"></div>
      </div>
    ),
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