import React, { useState, useEffect } from 'react';
import { 
  LegacyV2Modal, 
  LegacyV2Form, 
  LegacyV2FormSection, 
  LegacyV2FormGroup, 
  LegacyV2Label, 
  LegacyV2Input, 
  LegacyV2Select, 
  LegacyV2Textarea,
  LegacyV2Button,
  LegacyV2ModalFooter
} from './LegacyV2Modal';
import type { Appointment } from '@/types/db';

interface SimpleAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Appointment>;
  onSave: (values: Partial<Appointment>) => Promise<void>;
}

export function SimpleAppointmentModal({
  open,
  onOpenChange,
  initial,
  onSave
}: SimpleAppointmentModalProps) {
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
      duracion: formData.duracion
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
    <LegacyV2Modal
      open={open}
      onOpenChange={onOpenChange}
      title={initial?.id_cita ? "Editar Turno" : "Crear Nuevo Turno"}
    >
      <LegacyV2Form onSubmit={handleSubmit}>
        <LegacyV2FormSection>
          <div className="v2-form-grid">
            <LegacyV2FormGroup>
              <LegacyV2Label htmlFor="cliente_nombre">Nombre del Cliente *</LegacyV2Label>
              <LegacyV2Input
                id="cliente_nombre"
                value={formData.cliente_nombre}
                onChange={(e) => handleChange('cliente_nombre', e.target.value)}
                placeholder="Nombre completo"
                required
              />
            </LegacyV2FormGroup>

            <LegacyV2FormGroup>
              <LegacyV2Label htmlFor="telefono">Teléfono *</LegacyV2Label>
              <LegacyV2Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="Ej: +598 99 123 456"
                required
              />
            </LegacyV2FormGroup>

            <LegacyV2FormGroup>
              <LegacyV2Label htmlFor="fecha">Fecha *</LegacyV2Label>
              <LegacyV2Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => handleChange('fecha', e.target.value)}
                required
              />
            </LegacyV2FormGroup>

            <LegacyV2FormGroup>
              <LegacyV2Label htmlFor="hora">Hora *</LegacyV2Label>
              <LegacyV2Input
                id="hora"
                type="time"
                value={formData.hora}
                onChange={(e) => handleChange('hora', e.target.value)}
                required
              />
            </LegacyV2FormGroup>

            <LegacyV2FormGroup>
              <LegacyV2Label htmlFor="servicio">Servicio *</LegacyV2Label>
              <LegacyV2Select
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
              </LegacyV2Select>
            </LegacyV2FormGroup>

            <LegacyV2FormGroup>
              <LegacyV2Label htmlFor="barbero">Barbero *</LegacyV2Label>
              <LegacyV2Select
                id="barbero"
                value={formData.barbero}
                onChange={(e) => handleChange('barbero', e.target.value)}
                required
              >
                <option value="">Seleccionar barbero</option>
                <option value="Juan Pérez">Juan Pérez</option>
                <option value="María González">María González</option>
                <option value="Carlos López">Carlos López</option>
              </LegacyV2Select>
            </LegacyV2FormGroup>

            <LegacyV2FormGroup>
              <LegacyV2Label htmlFor="duracion">Duración (minutos) *</LegacyV2Label>
              <LegacyV2Input
                id="duracion"
                type="number"
                value={formData.duracion}
                onChange={(e) => handleChange('duracion', e.target.value)}
                placeholder="Ej: 30"
                required
              />
            </LegacyV2FormGroup>

            <LegacyV2FormGroup>
              <LegacyV2Label htmlFor="ticket">Precio ($) *</LegacyV2Label>
              <LegacyV2Input
                id="ticket"
                type="number"
                step="0.01"
                value={formData.ticket}
                onChange={(e) => handleChange('ticket', e.target.value)}
                placeholder="Ej: 250"
                required
              />
            </LegacyV2FormGroup>

            {initial?.id_cita && (
              <LegacyV2FormGroup>
                <LegacyV2Label htmlFor="estado">Estado</LegacyV2Label>
                <LegacyV2Select
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => handleChange('estado', e.target.value)}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </LegacyV2Select>
              </LegacyV2FormGroup>
            )}

            <LegacyV2FormGroup className="full-width">
              <LegacyV2Label htmlFor="nota">Nota</LegacyV2Label>
              <LegacyV2Textarea
                id="nota"
                value={formData.nota}
                onChange={(e) => handleChange('nota', e.target.value)}
                placeholder="Agregar nota..."
                rows={3}
              />
            </LegacyV2FormGroup>
          </div>
        </LegacyV2FormSection>

        <LegacyV2ModalFooter>
          <LegacyV2Button 
            type="button" 
            variant="secondary" 
            onClick={handleClose}
          >
            Cancelar
          </LegacyV2Button>
          <LegacyV2Button type="submit" variant="primary">
            Guardar Turno
          </LegacyV2Button>
        </LegacyV2ModalFooter>
      </LegacyV2Form>
    </LegacyV2Modal>
  );
}