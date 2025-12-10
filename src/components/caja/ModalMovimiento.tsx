import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { MovimientoCaja, FormularioMovimiento, TipoMovimiento } from '@/types/caja';
import { TIPOS_MOVIMIENTO, METODOS_PAGO, TIPOS_FACTURA } from '@/types/caja';
import { z, ZodError } from 'zod';

// Esquema de validación
const MovimientoSchema = z.object({
  tipo: z.enum(['ingreso', 'gasto_barbero', 'gasto_barberia']),
  fecha: z.string().min(1, 'La fecha es requerida'),
  hora: z.string().min(1, 'La hora es requerida'),
  concepto: z.string().min(3, 'El concepto debe tener al menos 3 caracteres'),
  monto: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  metodoPago: z.string().optional(),
  nroFactura: z.string().optional(),
  tipoFactura: z.enum(['A', 'B', 'C', 'E']).optional(),
  propina: z.number().min(0).optional(),
  notas: z.string().optional(),
});

interface ModalMovimientoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (datos: FormularioMovimiento) => void;
  movimiento?: MovimientoCaja | null;
  isLoading?: boolean;
  userInfo: {
    idBarberia: string;
    idSucursal: string;
    idBarbero: string;
    isAdmin: boolean;
  };
  barberos?: Array<{ id_barbero: string; nombre: string }>; // Para select de barberos (admin)
}

/**
 * Modal para agregar o editar movimiento de caja
 */
export function ModalMovimiento({
  isOpen,
  onClose,
  onSubmit,
  movimiento,
  isLoading = false,
  userInfo,
  barberos = [],
}: ModalMovimientoProps) {
  const esEdicion = !!movimiento;
  
  // Estado del formulario
  const [formData, setFormData] = useState<Partial<FormularioMovimiento>>({
    tipo: 'ingreso',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    concepto: '',
    monto: 0,
    metodoPago: 'efectivo',
    propina: 0,
  });

  const [errores, setErrores] = useState<Record<string, string>>({});

  // Cargar datos si es edición
  useEffect(() => {
    if (movimiento) {
      setFormData({
        tipo: movimiento.tipo,
        fecha: movimiento.fecha,
        hora: movimiento.hora.substring(0, 5),
        concepto: movimiento.concepto,
        monto: movimiento.monto,
        metodoPago: movimiento.metodoPago || '',
        nroFactura: movimiento.nroFactura || '',
        tipoFactura: movimiento.tipoFactura || undefined,
        propina: movimiento.propina || 0,
        notas: movimiento.notas || '',
      });
    } else {
      // Reset para nuevo movimiento
      setFormData({
        tipo: 'ingreso',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().slice(0, 5),
        concepto: '',
        monto: 0,
        metodoPago: 'efectivo',
        propina: 0,
      });
    }
    setErrores({});
  }, [movimiento, isOpen]);

  const handleChange = (field: keyof FormularioMovimiento, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errores[field]) {
      setErrores(prev => {
        const nuevos = { ...prev };
        delete nuevos[field];
        return nuevos;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar con Zod
    const result = MovimientoSchema.safeParse(formData);

    if (!result.success) {
      const nuevosErrores: Record<string, string> = {};
      if (result.error instanceof ZodError) {
        result.error.issues.forEach(issue => {
          if (issue.path[0]) {
            nuevosErrores[issue.path[0] as string] = issue.message;
          }
        });
      }
      setErrores(nuevosErrores);
      return;
    }

    // Preparar datos completos
    const datosCompletos: FormularioMovimiento = {
      ...result.data,
      idSucursal: userInfo.idSucursal,
      idBarbero: formData.idBarbero || userInfo.idBarbero, // Admin puede cambiar barbero
    };

    onSubmit(datosCompletos);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Contenido del modal */}
        <div className="inline-block align-bottom bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-white">
                  {esEdicion ? 'Editar Movimiento' : 'Nuevo Movimiento'}
                </h3>
                <div className="mt-2">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tipo de movimiento */}
                    <div>
                      <label className="v2-label">Tipo *</label>
                      <select
                        className="v2-input w-full"
                        value={formData.tipo}
                        onChange={(e) => handleChange('tipo', e.target.value as TipoMovimiento)}
                        disabled={esEdicion} // No se puede cambiar en edición
                      >
                        {TIPOS_MOVIMIENTO.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                      {errores.tipo && <span className="text-xs v2-text-danger">{errores.tipo}</span>}
                    </div>

                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="v2-label">Fecha *</label>
                        <input
                          type="date"
                          className="v2-input w-full"
                          value={formData.fecha}
                          onChange={(e) => handleChange('fecha', e.target.value)}
                        />
                        {errores.fecha && <span className="text-xs v2-text-danger">{errores.fecha}</span>}
                      </div>
                      <div>
                        <label className="v2-label">Hora *</label>
                        <input
                          type="time"
                          className="v2-input w-full"
                          value={formData.hora}
                          onChange={(e) => handleChange('hora', e.target.value)}
                        />
                        {errores.hora && <span className="text-xs v2-text-danger">{errores.hora}</span>}
                      </div>
                    </div>

                    {/* Concepto */}
                    <div>
                      <label className="v2-label">Concepto *</label>
                      <textarea
                        className="v2-textarea w-full"
                        rows={2}
                        value={formData.concepto}
                        onChange={(e) => handleChange('concepto', e.target.value)}
                        placeholder="Descripción del movimiento"
                      />
                      {errores.concepto && <span className="text-xs v2-text-danger">{errores.concepto}</span>}
                    </div>

                    {/* Monto y Propina */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="v2-label">Monto * ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="v2-input w-full"
                          value={formData.monto}
                          onChange={(e) => handleChange('monto', parseFloat(e.target.value) || 0)}
                        />
                        {errores.monto && <span className="text-xs v2-text-danger">{errores.monto}</span>}
                      </div>
                      {formData.tipo === 'ingreso' && (
                        <div>
                          <label className="v2-label">Propina ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="v2-input w-full"
                            value={formData.propina}
                            onChange={(e) => handleChange('propina', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Método de pago */}
                    <div>
                      <label className="v2-label">Método de Pago</label>
                      <select
                        className="v2-select w-full"
                        value={formData.metodoPago}
                        onChange={(e) => handleChange('metodoPago', e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        {METODOS_PAGO.map(metodo => (
                          <option key={metodo.value} value={metodo.value}>
                            {metodo.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Factura */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="v2-label">N° Factura</label>
                        <input
                          type="text"
                          className="v2-input w-full"
                          value={formData.nroFactura}
                          onChange={(e) => handleChange('nroFactura', e.target.value)}
                          placeholder="001-001-000123"
                        />
                      </div>
                      <div>
                        <label className="v2-label">Tipo Factura</label>
                        <select
                          className="v2-select w-full"
                          value={formData.tipoFactura}
                          onChange={(e) => handleChange('tipoFactura', e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {TIPOS_FACTURA.map(tipo => (
                            <option key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Barbero (solo admin puede cambiar) */}
                    {userInfo.isAdmin && barberos.length > 0 && (
                      <div>
                        <label className="v2-label">Barbero *</label>
                        <select
                          className="v2-select w-full"
                          value={formData.idBarbero || userInfo.idBarbero}
                          onChange={(e) => handleChange('idBarbero', e.target.value)}
                        >
                          {barberos.map(barbero => (
                            <option key={barbero.id_barbero} value={barbero.id_barbero}>
                              {barbero.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Notas */}
                    <div>
                      <label className="v2-label">Notas</label>
                      <textarea
                        className="v2-textarea w-full"
                        rows={2}
                        value={formData.notas}
                        onChange={(e) => handleChange('notas', e.target.value)}
                        placeholder="Información adicional (opcional)"
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button 
              type="button" 
              variant="primary" 
              onClick={handleSubmit as any}
              disabled={isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {isLoading ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear'}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}