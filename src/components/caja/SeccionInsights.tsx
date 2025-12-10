import { Card } from '@/components/ui/Card';
import type { EstadisticasCaja, RankingBarbero } from '@/types/caja';
import { formatearMonto } from '@/types/caja';

interface SeccionInsightsProps {
  estadisticas: EstadisticasCaja;
  ranking?: RankingBarbero[];
  className?: string;
}

/**
 * Sección de insights y análisis inteligente (solo admin)
 */
export function SeccionInsights({ estadisticas, ranking = [], className = '' }: SeccionInsightsProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Día más rentable */}
      {estadisticas.diaMasRentable && (
        <Card className="v2-card">
          <h3 className="text-lg font-semibold mb-3">💡 Día Más Rentable</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold capitalize">
              {estadisticas.diaMasRentable.dia}
            </span>
            <span className="text-xl v2-text-success">
              {formatearMonto(estadisticas.diaMasRentable.monto)}
            </span>
          </div>
          <p className="text-sm opacity-60 mt-2">Promedio de ingresos en este día</p>
        </Card>
      )}

      {/* Distribución por método de pago */}
      <Card className="v2-card">
        <h3 className="text-lg font-semibold mb-3">💳 Métodos de Pago</h3>
        <div className="space-y-2">
          {Object.entries(estadisticas.metodosPago)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([metodo, monto]) => (
              <div key={metodo} className="flex items-center justify-between">
                <span className="text-sm capitalize">{metodo}</span>
                <span className="font-semibold">{formatearMonto(monto)}</span>
              </div>
            ))}
        </div>
      </Card>

      {/* Ranking de barberos */}
      {ranking.length > 0 && (
        <Card className="v2-card md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">🏆 Ranking de Barberos</h3>
          <div className="space-y-3">
            {ranking.map((barbero, index) => {
              // Crear una key única combinando el idBarbero con el índice
              const uniqueKey = barbero.idBarbero ? 
                `${barbero.idBarbero}-${index}` : 
                `barbero-${index}`;
                
              return (
                <div key={uniqueKey} className="flex items-center gap-4">
                  <span className="text-2xl font-bold opacity-60 w-8 text-center">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold">{barbero.nombreBarbero}</div>
                    <div className="text-sm opacity-60">
                      {barbero.cantidadMovimientos} movimientos
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold v2-text-success">
                      {formatearMonto(barbero.totalIngresos)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}