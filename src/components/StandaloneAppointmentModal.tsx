"use client";

import { useState, useEffect } from "react";
import { V2StandaloneModal } from "./V2StandaloneModal";
import { V2Form, V2FormHeader, V2FormTitle, V2FormBody, V2FormFooter, V2FormGroup, V2Label, V2Input, V2Select, V2Textarea, V2Button } from "./V2Form";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { useBarberos } from "@/hooks/useBarberos";
import { useServicios } from "@/hooks/useServicios";
// import { useClientePorTelefono } from "@/hooks/useClientes";
import { normalizePhoneNumber } from "@/shared/utils/phoneUtils";
import type { Appointment } from "@/types/db";
import { toast } from "sonner";

interface StandaloneAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Appointment>;
  onSave: (values: Partial<Appointment>) => Promise<void>;
  sucursalId?: string;
}

const normalizePhoneNumberLocal = (phone: string): string => {
  return normalizePhoneNumber(phone);
};

export function StandaloneAppointmentModal({
  open,
  onOpenChange,
  onSave,
  initial,
  sucursalId: propSucursalId
}: StandaloneAppointmentModalProps) {
  console.log("=== DEBUG StandaloneAppointmentModal ===");
  console.log("initial recibido:", initial);
  console.log("fecha en initial:", initial?.fecha);
  console.log("hora en initial:", initial?.hora);
  console.log("=== FIN DEBUG StandaloneAppointmentModal ===");

  const { idBarberia, isAdmin, barbero: barberoActual } = useBarberoAuth();
  const { sucursales: allSucursales, isLoading: isLoadingSucursales } = useSucursales(idBarberia || undefined);
  
  // Estados para los campos del formulario
  const [selectedSucursalId, setSelectedSucursalId] = useState<string | undefined>(propSucursalId);
  const [isInitialSelectionDone, setIsInitialSelectionDone] = useState(false);
  const [clientId, setClientId] = useState<string | null>(initial?.id_cliente || null);
  const [clientName, setClientName] = useState<string>(initial?.cliente_nombre || "");
  const [clientPhone, setClientPhone] = useState<string>(initial?.telefono || "");
  const [date, setDate] = useState<string>(initial?.fecha || "");
  const [time, setTime] = useState<string>(initial?.hora || "");
  const [service, setService] = useState<string>(initial?.servicio || "");
  const [barbero, setBarbero] = useState<string>(initial?.barbero || "");
  const [duration, setDuration] = useState<string>(initial?.duracion?.toString() || "");
  const [price, setPrice] = useState<string>(initial?.ticket?.toString() || "");
  const [note, setNote] = useState<string>(initial?.nota || "");
  const [appointmentStatus, setAppointmentStatus] = useState<string>(initial?.estado || "pendiente");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Hooks para obtener datos relacionados
  const { data: barberos, isLoading: isBarberosLoading } = useBarberos(selectedSucursalId);
  const { servicios, isLoading: isServiciosLoading } = useServicios(selectedSucursalId);
  // const { data: clientData } = useClientePorTelefono(clientPhone, selectedSucursalId);
  
  // Filtrar sucursales según permisos
  const availableSucursales = isAdmin 
    ? allSucursales 
    : allSucursales?.filter(suc => suc.id === barberoActual?.id_sucursal) || [];
  
  // Establecer sucursal inicial
  useEffect(() => {
    if (!isInitialSelectionDone && availableSucursales && availableSucursales.length > 0) {
      if (propSucursalId) {
        setSelectedSucursalId(propSucursalId);
      } else if (!isAdmin && barberoActual?.id_sucursal) {
        setSelectedSucursalId(barberoActual.id_sucursal);
      } else if (isAdmin && availableSucursales.length > 0) {
        if (availableSucursales && availableSucursales.length > 0) {
          setSelectedSucursalId(availableSucursales[0].id);
        }
      }
      setIsInitialSelectionDone(true);
    }
  }, [availableSucursales, propSucursalId, isAdmin, barberoActual, isInitialSelectionDone]);
  
  // Actualizar cliente cuando cambia el teléfono
  // useEffect(() => {
  //   if (clientData) {
  //     setClientId(clientData.id_cliente.toString());
  //     setClientName(clientData.nombre);
  //   } else {
  //     setClientId(null);
  //   }
  // }, [clientData]);
  
  // Resetear formulario cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      // Resetear estados
      setSelectedSucursalId(propSucursalId);
      setClientId(initial?.id_cliente || null);
      setClientName(initial?.cliente_nombre || "");
      setClientPhone(initial?.telefono || "");
      setDate(initial?.fecha || "");
      setTime(initial?.hora || "");
      setService(initial?.servicio || "");
      setBarbero(initial?.barbero || "");
      setDuration(initial?.duracion?.toString() || "");
      setPrice(initial?.ticket?.toString() || "");
      setNote(initial?.nota || "");
      setAppointmentStatus(initial?.estado || "pendiente");
      setErrors({});
    }
  }, [open, initial, propSucursalId]);
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedSucursalId) newErrors.sucursal = "La sucursal es obligatoria";
    if (!clientName.trim()) newErrors.clientName = "El nombre del cliente es obligatorio";
    if (!clientPhone.trim()) newErrors.clientPhone = "El teléfono del cliente es obligatorio";
    if (!date) newErrors.date = "La fecha es obligatoria";
    if (!time) newErrors.time = "La hora es obligatoria";
    if (!service) newErrors.service = "El servicio es obligatorio";
    if (!barbero) newErrors.barbero = "El barbero es obligatorio";
    if (!duration) newErrors.duration = "La duración es obligatoria";
    if (!price) newErrors.price = "El precio es obligatorio";
    
    // Validar formato de hora (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (time && !timeRegex.test(time)) {
      newErrors.time = "Formato de hora inválido (HH:MM)";
    }
    
    // Validar duración numérica
    if (duration && isNaN(Number(duration))) {
      newErrors.duration = "La duración debe ser un número";
    }
    
    // Validar precio numérico
    if (price && isNaN(Number(price))) {
      newErrors.price = "El precio debe ser un número";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const appointmentData: Partial<Appointment> = {
        id_cliente: clientId ?? null,
        cliente_nombre: clientName,
        telefono: normalizePhoneNumberLocal(clientPhone),
        fecha: date,
        hora: time,
        servicio: service,
        barbero: barbero,
        duracion: duration,
        ticket: parseFloat(price),
        nota: note,
        estado: appointmentStatus as "pendiente" | "confirmado" | "cancelado" | "completado" | undefined,
        id_sucursal: selectedSucursalId
      };
      
      // Si es una edición, incluir el ID
      if (initial?.id_cita) {
        appointmentData.id_cita = initial.id_cita;
      }
      
      console.log('📤 Datos a enviar:', appointmentData);
      await onSave(appointmentData);
      handleClose();
    } catch (error) {
      console.error('Error al guardar turno:', error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Error al guardar el turno');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    onOpenChange(false);
  };
  
  // Calcular duración automáticamente cuando se selecciona un servicio
  useEffect(() => {
    if (service && servicios) {
      const selectedService = servicios.find(s => s.nombre === service);
      if (selectedService) {
        setDuration(selectedService.duracion_minutos.toString());
        setPrice(selectedService.precio.toString());
      }
    }
  }, [service, servicios]);
  
  // Manejar cambio de sucursal
  const handleSucursalChange = (sucursalId: string) => {
    setSelectedSucursalId(sucursalId);
    // Resetear valores dependientes
    setBarbero("");
    setService("");
    setDuration("");
    setPrice("");
  };

  return (
    <V2StandaloneModal
      open={open}
      onOpenChange={onOpenChange}
      title={initial?.id_cita ? "Editar Turno" : "Crear Nuevo Turno"}
    >
      <V2Form onSubmit={handleSubmit}>
        <V2FormBody>
          {/* Selección de sucursal (solo para admin o cuando se permite cambiar) */}
          {isAdmin && (
            <V2FormGroup>
              <V2Label htmlFor="sucursal">Sucursal *</V2Label>
              <V2Select
                id="sucursal"
                value={selectedSucursalId || ""}
                onChange={(e) => handleSucursalChange(e.target.value)}
                required
                disabled={isLoadingSucursales || !!propSucursalId}
              >
                <option value="">Seleccionar sucursal</option>
                {availableSucursales?.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
                  </option>
                ))}
              </V2Select>
              {errors.sucursal && <div className="v2-error-message">{errors.sucursal}</div>}
            </V2FormGroup>
          )}

          {/* Información del Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <V2FormGroup>
              <V2Label htmlFor="clientName">Nombre del Cliente *</V2Label>
              <V2Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nombre completo"
                required
              />
              {errors.clientName && <div className="v2-error-message">{errors.clientName}</div>}
            </V2FormGroup>

            <V2FormGroup>
              <V2Label htmlFor="clientPhone">Teléfono *</V2Label>
              <V2Input
                id="clientPhone"
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ej: +598 99 123 456"
                required
              />
              {errors.clientPhone && <div className="v2-error-message">{errors.clientPhone}</div>}
              {/* {clientData && (
                <div className="text-sm text-green-400 mt-1">
                  Cliente encontrado: {clientData.nombre}
                </div>
              )} */}
            </V2FormGroup>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <V2FormGroup>
              <V2Label htmlFor="date">Fecha *</V2Label>
              <V2Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              {errors.date && <div className="v2-error-message">{errors.date}</div>}
            </V2FormGroup>

            <V2FormGroup>
              <V2Label htmlFor="time">Hora *</V2Label>
              <V2Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
              {errors.time && <div className="v2-error-message">{errors.time}</div>}
            </V2FormGroup>
          </div>

          {/* Servicio */}
          <V2FormGroup>
            <V2Label htmlFor="service">Servicio *</V2Label>
            <V2Select
              id="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
              disabled={isServiciosLoading || !selectedSucursalId}
            >
              <option value="">Seleccionar servicio</option>
              {servicios?.map((servicio) => (
                <option key={servicio.id_servicio} value={servicio.nombre}>
                  {servicio.nombre} - ${servicio.precio} ({servicio.duracion_minutos} min)
                </option>
              ))}
            </V2Select>
            {errors.service && <div className="v2-error-message">{errors.service}</div>}
          </V2FormGroup>

          {/* Barbero */}
          <V2FormGroup>
            <V2Label htmlFor="barbero">Barbero *</V2Label>
            <V2Select
              id="barbero"
              value={barbero}
              onChange={(e) => setBarbero(e.target.value)}
              required
              disabled={isBarberosLoading || !selectedSucursalId}
            >
              <option value="">Seleccionar barbero</option>
              {barberos?.map((barberoItem) => (
                <option key={barberoItem.id_barbero} value={barberoItem.nombre}>
                  {barberoItem.nombre}
                </option>
              ))}
            </V2Select>
            {errors.barbero && <div className="v2-error-message">{errors.barbero}</div>}
          </V2FormGroup>

          {/* Duración y Precio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <V2FormGroup>
              <V2Label htmlFor="duration">Duración (minutos) *</V2Label>
              <V2Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ej: 30"
                required
              />
              {errors.duration && <div className="v2-error-message">{errors.duration}</div>}
            </V2FormGroup>

            <V2FormGroup>
              <V2Label htmlFor="price">Precio ($) *</V2Label>
              <V2Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ej: 250"
                required
              />
              {errors.price && <div className="v2-error-message">{errors.price}</div>}
            </V2FormGroup>
          </div>

          {/* Estado de la cita (solo para edición) */}
          {initial?.id_cita && (
            <V2FormGroup>
              <V2Label htmlFor="status">Estado</V2Label>
              <V2Select
                id="status"
                value={appointmentStatus}
                onChange={(e) => setAppointmentStatus(e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </V2Select>
            </V2FormGroup>
          )}

          {/* Nota */}
          <V2FormGroup>
            <V2Label htmlFor="note">Nota</V2Label>
            <V2Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Agregar nota..."
            />
          </V2FormGroup>
        </V2FormBody>

        <V2FormFooter>
          <V2Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </V2Button>
          <V2Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar Turno"}
          </V2Button>
        </V2FormFooter>
      </V2Form>
    </V2StandaloneModal>
  );
}