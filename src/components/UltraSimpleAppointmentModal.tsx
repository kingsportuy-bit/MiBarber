import React, { useState, useEffect } from 'react';
import { 
  UltraSimpleModal 
} from './UltraSimpleModal';
import { 
  UltraSimpleForm,
  UltraSimpleFormGroup,
  UltraSimpleLabel,
  UltraSimpleInput,
  UltraSimpleSelect,
  UltraSimpleTextarea,
  UltraSimpleButton,
  UltraSimpleModalFooter
} from './UltraSimpleForm';
import type { Appointment } from '@/types/db';

interface UltraSimpleAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Appointment>;
  onSave: (values: Partial<Appointment>) => Promise<void>;
}

export function UltraSimpleAppointmentModal({
  open,
  onOpenChange,
  initial,
  onSave
}: UltraSimpleAppointmentModalProps) {
  const [formData, setFormData] = useState({
    cliente_nombre: initial?.cliente_nombre || '',
    telefono: initial?.telefono || '',
    fecha: initial?.fecha || '',
    hora: initial?.hora || '',
    servicio: initial?.servicio || '',
    barbero: initial?.barbero || '',
    duracion: initial?.duracion || '',
    ticket: initial?.ticket?.toString() || '',
    nota: initial?.nota || '',
    estado: initial?.estado || 'pendiente'
  });

  useEffect(() => {
    if (initial) {
      setFormData({
        cliente_nombre: initial.cliente_nombre || '',
        telefono: initial.telefono || '',
        fecha: initial.fecha || '',
        hora: initial.hora || '',
        servicio: initial.servicio || '',
        barbero: initial.barbero || '',
        duracion: initial.duracion || '',
        ticket: initial.ticket?.toString() || '',
        nota: initial.nota || '',
        estado: initial.estado || 'pendiente'
      });
    }
  }, [initial]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const appointmentData: Partial<Appointment> = {
      ...formData,
      ticket: formData.ticket ? parseFloat(formData.ticket) : undefined,
    };
    
    if (initial?.id_cita) {
      appointmentData.id_cita = initial.id_cita;
    }
    
    try {
      await onSave(appointmentData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el turno');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <UltraSimpleModal
      open={open}
      onOpenChange={onOpenChange}
      title={initial?.id_cita ? "Editar Turno" : "Crear Nuevo Turno"}
    >
      <UltraSimpleForm onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: '1fr'
        }}>
          <UltraSimpleFormGroup>
            <UltraSimpleLabel htmlFor="cliente_nombre">Nombre del Cliente *</UltraSimpleLabel>
            <UltraSimpleInput
              id="cliente_nombre"
              value={formData.cliente_nombre}
              onChange={(e) => handleChange('cliente_nombre', e.target.value)}
              placeholder="Nombre completo"
              required
            />
          </UltraSimpleFormGroup>

          <UltraSimpleFormGroup>
            <UltraSimpleLabel htmlFor="telefono">Teléfono *</UltraSimpleLabel>
            <UltraSimpleInput
              id="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              placeholder="Ej: +598 99 123 456"
              required
            />
          </UltraSimpleFormGroup>

          <div style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: '1fr 1fr'
          }}>
            <UltraSimpleFormGroup>
              <UltraSimpleLabel htmlFor="fecha">Fecha *</UltraSimpleLabel>
              <UltraSimpleInput
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => handleChange('fecha', e.target.value)}
                required
              />
            </UltraSimpleFormGroup>

            <UltraSimpleFormGroup>
              <UltraSimpleLabel htmlFor="hora">Hora *</UltraSimpleLabel>
              <UltraSimpleInput
                id="hora"
                type="time"
                value={formData.hora}
                onChange={(e) => handleChange('hora', e.target.value)}
                required
              />
            </UltraSimpleFormGroup>
          </div>

          <UltraSimpleFormGroup>
            <UltraSimpleLabel htmlFor="servicio">Servicio *</UltraSimpleLabel>
            <UltraSimpleSelect
              id="servicio"
              value={formData.servicio}
              onChange={(e) => handleChange('servicio', e.target.value)}
              required
            >
              <option value="">Seleccionar servicio</option>
              <option value="Corte de Cabello">Corte de Cabello</option>
              <option value="Arreglo de Barba">Arreglo de Barba</option>
              <option value="Combo Corte + Barba">Combo Corte + Barba</option>
              <option value="Lavado">Lavado</option>
              <option value="Peinado">Peinado</option>
            </UltraSimpleSelect>
          </UltraSimpleFormGroup>

          <UltraSimpleFormGroup>
            <UltraSimpleLabel htmlFor="barbero">Barbero *</UltraSimpleLabel>
            <UltraSimpleSelect
              id="barbero"
              value={formData.barbero}
              onChange={(e) => handleChange('barbero', e.target.value)}
              required
            >
              <option value="">Seleccionar barbero</option>
              <option value="Juan Pérez">Juan Pérez</option>
              <option value="María González">María González</option>
              <option value="Carlos López">Carlos López</option>
            </UltraSimpleSelect>
          </UltraSimpleFormGroup>

          <div style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: '1fr 1fr'
          }}>
            <UltraSimpleFormGroup>
              <UltraSimpleLabel htmlFor="duracion">Duración (minutos) *</UltraSimpleLabel>
              <UltraSimpleInput
                id="duracion"
                type="number"
                value={formData.duracion}
                onChange={(e) => handleChange('duracion', e.target.value)}
                placeholder="Ej: 30"
                required
              />
            </UltraSimpleFormGroup>

            <UltraSimpleFormGroup>
              <UltraSimpleLabel htmlFor="ticket">Precio ($) *</UltraSimpleLabel>
              <UltraSimpleInput
                id="ticket"
                type="number"
                step="0.01"
                value={formData.ticket}
                onChange={(e) => handleChange('ticket', e.target.value)}
                placeholder="Ej: 250"
                required
              />
            </UltraSimpleFormGroup>
          </div>

          {initial?.id_cita && (
            <UltraSimpleFormGroup>
              <UltraSimpleLabel htmlFor="estado">Estado</UltraSimpleLabel>
              <UltraSimpleSelect
                id="estado"
                value={formData.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </UltraSimpleSelect>
            </UltraSimpleFormGroup>
          )}

          <UltraSimpleFormGroup>
            <UltraSimpleLabel htmlFor="nota">Nota</UltraSimpleLabel>
            <UltraSimpleTextarea
              id="nota"
              value={formData.nota}
              onChange={(e) => handleChange('nota', e.target.value)}
              placeholder="Agregar nota..."
              rows={3}
            />
          </UltraSimpleFormGroup>
        </div>

        <UltraSimpleModalFooter>
          <UltraSimpleButton 
            type="button" 
            variant="secondary" 
            onClick={handleClose}
          >
            Cancelar
          </UltraSimpleButton>
          <UltraSimpleButton type="submit" variant="primary">
            Guardar Turno
          </UltraSimpleButton>
        </UltraSimpleModalFooter>
      </UltraSimpleForm>
    </UltraSimpleModal>
  );
}