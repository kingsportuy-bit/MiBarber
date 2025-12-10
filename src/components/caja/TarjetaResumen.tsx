import { Card } from '@/components/ui/Card';

interface TarjetaResumenProps {
  titulo: string;
  monto: number;
  porcentajeCambio?: number;
  icono: string;
  tipo: 'ingreso' | 'gasto' | 'balance';
  letraIdentificadora?: string;
  className?: string;
}

/**
 * Tarjeta de resumen para mostrar métricas de caja
 */
export function TarjetaResumen({
  titulo,
  monto,
  porcentajeCambio,
  icono,
  tipo,
  letraIdentificadora,
  className = '',
}: TarjetaResumenProps) {
  // Determinar color según tipo
  const colorClasses = {
    ingreso: 'v2-text-success',
    gasto: 'v2-text-danger',
    balance: monto >= 0 ? 'v2-text-success' : 'v2-text-danger',
  };

  const colorTexto = colorClasses[tipo];

  // Determinar color del porcentaje
  const porcentajePositivo = porcentajeCambio && porcentajeCambio >= 0;
  const colorPorcentaje = porcentajePositivo ? 'v2-text-success' : 'v2-text-danger';
  const iconoPorcentaje = porcentajePositivo ? '↑' : '↓';

  return (
    <Card className={className || 'v2-card'}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm opacity-80">{titulo}</span>
        <span className="text-2xl">{icono}</span>
      </div>
      
      <div className={`text-3xl font-bold ${colorTexto} mb-1`}>
        ${monto.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      {porcentajeCambio !== undefined && (
        <div className={`text-sm ${colorPorcentaje} flex items-center gap-1`}>
          <span>{iconoPorcentaje}</span>
          <span>{Math.abs(porcentajeCambio).toFixed(1)}%</span>
          <span className="opacity-60">vs período anterior</span>
        </div>
      )}
      
      {letraIdentificadora && (
        <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
          {letraIdentificadora}
        </div>
      )}
    </Card>
  );
}