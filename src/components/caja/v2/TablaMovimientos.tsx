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
      <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-12 bg-gray-700 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Buscador */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por concepto, factura o barbero..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-[var(--border-primary)] rounded-md bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none"
          />
          {busqueda && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                className="boton-simple"
                onClick={() => setBusqueda('')}
                title="Limpiar búsqueda"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-primary)]">
              <th className="text-left p-3 text-sm font-semibold text-[var(--text-primary)]">Fecha</th>
              <th className="text-left p-3 text-sm font-semibold text-[var(--text-primary)]">Hora</th>
              <th className="text-left p-3 text-sm font-semibold text-[var(--text-primary)]">Concepto</th>
              <th className="text-left p-3 text-sm font-semibold text-[var(--text-primary)]">Barbero</th>
              <th className="text-right p-3 text-sm font-semibold text-[var(--text-primary)]">Monto</th>
              <th className="text-left p-3 text-sm font-semibold text-[var(--text-primary)]">Pago</th>
              <th className="text-left p-3 text-sm font-semibold text-[var(--text-primary)]">Factura</th>
              <th className="text-center p-3 text-sm font-semibold text-[var(--text-primary)]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-8 text-[var(--text-muted)]">
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
                    className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <td className="p-3 text-sm text-[var(--text-primary)]">{formatearFecha(movimiento.fecha)}</td>
                    <td className="p-3 text-sm text-[var(--text-muted)]">{formatearHora(movimiento.hora)}</td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[var(--text-primary)]">{movimiento.concepto}</span>
                        {movimiento.citaInfo && (
                          <span className="text-xs text-[var(--text-muted)]">
                            Cliente: {movimiento.citaInfo.clienteNombre}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-[var(--text-primary)]">{movimiento.nombreBarberoRegistro || 'Barbero desconocido'}</td>
                    <td className={`p-3 text-right font-bold ${
                      movimiento.tipo === 'ingreso' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {movimiento.tipo === 'ingreso' ? '+' : '-'}
                      {formatearMonto(movimiento.monto)}
                    </td>
                    <td className="p-3 text-sm text-[var(--text-primary)]">
                      {movimiento.metodoPago || '-'}
                    </td>
                    <td className="p-3 text-sm text-[var(--text-muted)]">
                      {movimiento.nroFactura || '-'}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-500 hover:text-blue-300 bg-transparent !bg-none border-none p-1"
                          onClick={() => onEditar(movimiento)}
                          disabled={!puedeEditar}
                          title={puedeEditar ? 'Editar' : 'No tienes permisos'}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        
                        <button 
                          className="text-red-500 hover:text-red-300 bg-transparent !bg-none border-none p-1"
                          onClick={() => onEliminar(movimiento.idRegistro)}
                          disabled={!puedeEliminar}
                          title={puedeEliminar ? 'Eliminar' : 'No tienes permisos'}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
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
      <div className="mt-4 pt-4 border-t border-[var(--border-primary)] flex justify-between items-center">
        <span className="text-sm text-[var(--text-muted)]">
          Mostrando {movimientosFiltrados.length} de {movimientos.length} movimientos
        </span>
        {movimientos.length > 0 && (
          <div className="text-sm">
            <span className="text-[var(--text-muted)]">Total: </span>
            <span className="font-bold text-[var(--text-primary)]">
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