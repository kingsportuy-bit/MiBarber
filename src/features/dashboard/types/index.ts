export type TabType = 'sucursales' | 'barberos' | 'clientes';

export interface FilterState {
  activeTab: TabType;
  filtroBarbero: 'todos' | 'porSucursal' | 'individual';
  sucursalSeleccionada: string | null;
  barberoSeleccionado: string | null;
  fechaDesde: string;
  fechaHasta: string;
}

export interface KPIData {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

export interface ChartData {
  nombre: string;
  valor: number;
  color?: string;
}

export interface LineChartData {
  fecha: string;
  valor: number;
}

export interface PieChartData {
  nombre: string;
  valor: number;
  color: string;
}