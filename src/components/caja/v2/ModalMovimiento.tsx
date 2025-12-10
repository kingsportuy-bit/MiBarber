import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { MovimientoCaja, FormularioMovimiento, TipoMovimiento } from '@/types/caja';
import { TIPOS_MOVIMIENTO, METODOS_PAGO, TIPOS_FACTURA } from '@/types/caja';
import { z } from 'zod';

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
    nroFactura: '',
    tipoFactura: undefined,
    propina: 0,
    notas: '',
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
        nroFactura: '',
        tipoFactura: undefined,
        propina: 0,
        notas: '',
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
      result.error.issues.forEach(issue => {
        if (issue.path[0]) {
          nuevosErrores[issue.path[0] as string] = issue.message;
        }
      });
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
    <div className="v2-overlay" onClick={onClose}>
      <div className="v2-modal" onClick={(e) => e.stopPropagation()}>
        <div className="v2-modal-header">
          <h2 className="v2-modal-title">
            {esEdicion ? 'Editar Movimiento' : 'Nuevo Movimiento'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="v2-modal-body">
          <div className="space-y-4">
            {/* Tipo de movimiento */}
            <div>
              <label className="v2-label">Tipo *</label>
              <select
                className="v2-select"
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
              {errores.tipo && <span className="v2-error-message">{errores.tipo}</span>}
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="v2-label">Fecha *</label>
                <input
                  type="date"
                  className="v2-input"
                  value={formData.fecha}
                  onChange={(e) => handleChange('fecha', e.target.value)}
                />
                {errores.fecha && <span className="v2-error-message">{errores.fecha}</span>}
              </div>
              <div>
                <label className="v2-label">Hora *</label>
                <input
                  type="time"
                  className="v2-input"
                  value={formData.hora}
                  onChange={(e) => handleChange('hora', e.target.value)}
                />
                {errores.hora && <span className="v2-error-message">{errores.hora}</span>}
              </div>
            </div>

            {/* Concepto */}
            <div>
              <label className="v2-label">Concepto *</label>
              <textarea
                className="v2-textarea"
                rows={2}
                value={formData.concepto}
                onChange={(e) => handleChange('concepto', e.target.value)}
                placeholder="Descripción del movimiento"
              />
              {errores.concepto && <span className="v2-error-message">{errores.concepto}</span>}
            </div>

            {/* Monto y Propina */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="v2-label">Monto * ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="v2-input"
                  value={formData.monto}
                  onChange={(e) => handleChange('monto', parseFloat(e.target.value) || 0)}
                />
                {errores.monto && <span className="v2-error-message">{errores.monto}</span>}
              </div>
              {formData.tipo === 'ingreso' && (
                <div>
                  <label className="v2-label">Propina ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="v2-input"
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
                className="v2-select"
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
                  className="v2-input"
                  value={formData.nroFactura}
                  onChange={(e) => handleChange('nroFactura', e.target.value)}
                  placeholder="001-001-000123"
                />
              </div>
              <div>
                <label className="v2-label">Tipo Factura</label>
                <select
                  className="v2-select"
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
                  className="v2-select"
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
                className="v2-textarea"
                rows={2}
                value={formData.notas}
                onChange={(e) => handleChange('notas', e.target.value)}
                placeholder="Información adicional (opcional)"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="v2-modal-footer">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}