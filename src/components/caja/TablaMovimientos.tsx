import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { MovimientoCaja } from '@/types/caja';
import { 
  formatearMonto, 
  formatearFecha, 
  formatearHora, 
  getColorTipo,
  puedeEditarMovimiento,
  puedeEliminarMovimiento,
} from '@/types/caja';

interface TablaMovimientosProps {
  movimientos: MovimientoCaja[];
  isLoading: boolean;
  userRole: string;
  userId: string;
  onEditar: (movimiento: MovimientoCaja) => void;
  onEliminar: (idRegistro: string) => void;
  className?: string;
}

/**
 * Tabla de movimientos de caja con acciones
 */
export function TablaMovimientos({
  movimientos,
  isLoading,
  userRole,
  userId,
  onEditar,
  onEliminar,
  className = '',
}: TablaMovimientosProps) {
  const [busqueda, setBusqueda] = useState('');

  // Filtrar movimientos por búsqueda
  const movimientosFiltrados = movimientos.filter(m =>
    m.concepto.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.nroFactura?.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.nombreBarbero?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="v2-card">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`v2-card ${className}`}>
      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Buscar por concepto, factura o barbero..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="v2-input w-full"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-3 text-sm font-semibold">Fecha</th>
              <th className="text-left p-3 text-sm font-semibold">Hora</th>
              <th className="text-left p-3 text-sm font-semibold">Concepto</th>
              <th className="text-left p-3 text-sm font-semibold">Barbero</th>
              <th className="text-right p-3 text-sm font-semibold">Monto</th>
              <th className="text-left p-3 text-sm font-semibold">Pago</th>
              <th className="text-left p-3 text-sm font-semibold">Factura</th>
              <th className="text-center p-3 text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-8 opacity-60">
                  {busqueda ? 'No se encontraron resultados' : 'No hay movimientos registrados'}
                </td>
              </tr>
            ) : (
              movimientosFiltrados.map((movimiento, index) => {
                const puedeEditar = puedeEditarMovimiento(movimiento, userRole, userId);
                const puedeEliminar = puedeEliminarMovimiento(movimiento, userRole, userId);

                // Crear una key única combinando idRegistro con el índice
                const uniqueKey = movimiento.idRegistro ? 
                  `${movimiento.idRegistro}-${index}` : 
                  `movimiento-${index}`;

                return (
                  <tr 
                    key={uniqueKey} 
                    className="border-b border-gray-800 hover:bg-gray-800 transition-colors"
                  >
                    <td className="p-3 text-sm">{formatearFecha(movimiento.fecha)}</td>
                    <td className="p-3 text-sm opacity-80">{formatearHora(movimiento.hora)}</td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{movimiento.concepto}</span>
                        {movimiento.citaInfo && (
                          <span className="text-xs opacity-60">
                            Cliente: {movimiento.citaInfo.clienteNombre}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm">{movimiento.nombreBarbero}</td>
                    <td className={`p-3 text-right font-bold ${
                      movimiento.tipo === 'ingreso' ? 'v2-text-success' : 'v2-text-danger'
                    }`}>
                      {movimiento.tipo === 'ingreso' ? '+' : '-'}
                      {formatearMonto(movimiento.monto)}
                    </td>
                    <td className="p-3 text-sm">
                      {movimiento.metodoPago || '-'}
                    </td>
                    <td className="p-3 text-sm opacity-80">
                      {movimiento.nroFactura || '-'}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onEditar(movimiento)}
                          disabled={!puedeEditar}
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            if (confirm('¿Estás seguro de eliminar este movimiento?')) {
                              onEliminar(movimiento.idRegistro);
                            }
                          }}
                          disabled={!puedeEliminar}
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen inferior */}
      <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
        <span className="text-sm opacity-60">
          Mostrando {movimientosFiltrados.length} de {movimientos.length} movimientos
        </span>
        {movimientos.length > 0 && (
          <div className="text-sm">
            <span className="opacity-60">Total: </span>
            <span className="font-bold">
              {formatearMonto(
                movimientos.reduce((sum, m) => 
                  sum + (m.tipo === 'ingreso' ? m.monto : -m.monto), 0
                )
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}