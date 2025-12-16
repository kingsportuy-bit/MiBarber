import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import type { Appointment, Client } from '@/types/db';
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { useClientes } from "@/hooks/useClientes";
import { useServiciosListPorSucursal } from "@/hooks/useServiciosListPorSucursal";
import { useBarberosList } from "@/hooks/useBarberosList";
import { useCitas } from "@/hooks/useCitas";
import { useHorariosDisponiblesCompleto } from "@/hooks/useHorariosDisponiblesCompleto";
import { getLocalDateString } from "@/utils/dateUtils";
import { normalizePhoneNumber, isValidPhoneNumber } from "@/shared/utils/phoneUtils";
import { isTimeSlotOccupied } from "@/features/appointments/utils/citasHelpers";

// Función para validar el formato del número de teléfono
const isValidPhoneNumberLocal = (phone: string): boolean => {
  return isValidPhoneNumber(phone);
};

// Función para normalizar números de teléfono
const normalizePhoneNumberLocal = (phone: string): string => {
  return normalizePhoneNumber(phone);
};

interface EnhancedAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Appointment>;
  onSave: (values: Partial<Appointment>) => Promise<void>;
  sucursalId?: string;
}

export function EnhancedAppointmentModal({
  open,
  onOpenChange,
  initial,
  onSave,
  sucursalId: propSucursalId
}: EnhancedAppointmentModalProps) {
  const { idBarberia, isAdmin, barbero: barberoActual } = useBarberoAuth();
  const { sucursales: allSucursales, isLoading: isLoadingSucursales } = useSucursales(idBarberia || undefined);
  
  // Estados para los campos del formulario
  const [selectedSucursalId, setSelectedSucursalId] = useState<string | undefined>(propSucursalId);
  const [isInitialSelectionDone, setIsInitialSelectionDone] = useState(false);
  const [clientId, setClientId] = useState<string | null>(initial?.id_cliente || null);
  const [clientName, setClientName] = useState<string>(initial?.cliente_nombre || "");
  const [serviceId, setServiceId] = useState<string | null>(initial?.id_servicio || null);
  const [serviceName, setServiceName] = useState<string>(initial?.servicio || "");
  const [duration, setDuration] = useState<string>(initial?.duracion || ""); // Nuevo estado para duración
  const [barberId, setBarberId] = useState<string | null>(initial?.id_barbero || null);
  const [barberName, setBarberName] = useState<string>(initial?.barbero || "");
  const [date, setDate] = useState<string>(initial?.fecha || getLocalDateString(new Date()));
  const [time, setTime] = useState<string>(initial?.hora || "");
  const [note, setNote] = useState<string>(initial?.nota || "");
  const [clientPhone, setClientPhone] = useState<string | null>(initial?.telefono || null);
  const [appointmentStatus, setAppointmentStatus] = useState<string>(initial?.estado || "pendiente");
  const [showQuickClientForm, setShowQuickClientForm] = useState(false);
  const [quickClientData, setQuickClientData] = useState({
    nombre: "",
    telefono: "",
  });
  
  // Estados adicionales para la búsqueda de clientes
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  
  // Estado para verificar solapamiento
  const [isOverlapping, setIsOverlapping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Efecto para reiniciar los estados cuando se abre el modal o cambia la cita
  useEffect(() => {
    if (open) {
      setClientId(initial?.id_cliente || null);
      setClientName(initial?.cliente_nombre || "");
      setServiceId(initial?.id_servicio || null);
      setServiceName(initial?.servicio || "");
      setDuration(initial?.duracion || "");
      setBarberId(initial?.id_barbero || null);
      setBarberName(initial?.barbero || "");
      setDate(initial?.fecha || getLocalDateString(new Date()));
      setTime(initial?.hora || "");
      setNote(initial?.nota || "");
      setClientPhone(initial?.telefono || null);
      setAppointmentStatus(initial?.estado || "pendiente");
      setIsOverlapping(false);
      setShowClientSuggestions(false);
    }
  }, [open, initial]);
  
  // Preseleccionar la sucursal cuando se carguen las sucursales
  useEffect(() => {
    if (allSucursales && allSucursales.length > 0 && !isInitialSelectionDone) {
      // Si se proporciona una sucursalId como prop, usarla
      if (propSucursalId) {
        setSelectedSucursalId(propSucursalId);
      } 
      // Para barberos normales, seleccionar automáticamente su sucursal
      else if (!isAdmin && barberoActual?.id_sucursal) {
        setSelectedSucursalId(barberoActual.id_sucursal);
      } else {
        // Para administradores, seleccionar la primera sucursal por defecto
        setSelectedSucursalId(allSucursales[0].id);
      }
      // Marcar que se ha hecho la selección inicial
      setIsInitialSelectionDone(true);
    }
  }, [allSucursales, isInitialSelectionDone, isAdmin, barberoActual?.id_sucursal, propSucursalId]);
  
  // Efecto para asegurar que la sucursal se establezca correctamente cuando se proporciona una
  useEffect(() => {
    if (propSucursalId && propSucursalId !== selectedSucursalId) {
      setSelectedSucursalId(propSucursalId);
      // Marcar que se ha hecho la selección inicial si aún no se ha hecho
      if (!isInitialSelectionDone) {
        setIsInitialSelectionDone(true);
      }
    }
  }, [propSucursalId, selectedSucursalId, isInitialSelectionDone]);
  
  // Hooks para obtener datos
  const { data: clientesData, isLoading: isLoadingClientes, createMutation: createClientMutation } = useClientes(
    undefined, 
    "ultimo_agregado", 
    selectedSucursalId
  );
  
  const { data: serviciosData, isLoading: isLoadingServicios } = useServiciosListPorSucursal(selectedSucursalId);
  const { data: barberosData, isLoading: isLoadingBarberos } = useBarberosList(idBarberia || undefined, selectedSucursalId);
  
  // Obtener citas existentes para verificar solapamiento
  const { data: citasExistentes } = useCitas({
    barberoId: barberId || undefined,
    fecha: date,
  });
  
  // Verificar solapamiento cuando cambian los valores relevantes
  useEffect(() => {
    if (barberId && date && time && duration && citasExistentes) {
      // Filtrar solo citas pendientes y confirmadas
      const citasFiltradas = citasExistentes.filter(cita => 
        cita.estado === "pendiente" || cita.estado === "confirmado"
      );
      
      // Si estamos editando, excluir la cita actual
      const citasParaVerificar = initial?.id_cita 
        ? citasFiltradas.filter(cita => cita.id_cita !== initial.id_cita)
        : citasFiltradas;
      
      if (citasParaVerificar.length > 0) {
        // Extraer hora y minutos
        const [hora, minutos] = time.split(":").map(Number);
        const duracion = parseInt(duration) || 30; // Por defecto 30 minutos
        
        // Verificar solapamiento
        const solapado = isTimeSlotOccupied(
          hora,
          minutos,
          citasParaVerificar,
          barberId,
          date,
          duracion,
          !!initial?.id_cita, // isEdit
          initial?.id_cita
        );
        
        setIsOverlapping(solapado);
      } else {
        setIsOverlapping(false);
      }
    } else {
      setIsOverlapping(false);
    }
  }, [barberId, date, time, duration, citasExistentes, initial?.id_cita]);
  
  // Obtener horarios disponibles usando el nuevo hook
  const { horariosDisponibles, isLoading: isLoadingHorarios } = useHorariosDisponiblesCompleto({
    sucursalId: selectedSucursalId,
    barberoId: barberId || undefined,
    fecha: date,
    idCitaEditando: initial?.id_cita,
    duracionServicio: duration ? parseInt(duration, 10) : undefined,
  });
  
  // Filtrar barberos según el servicio seleccionado
  const filteredBarberos = barberosData?.filter((barbero: any) => {
    // Si no hay servicio seleccionado, mostrar todos los barberos
    if (!serviceId) return true;
    
    // Filtrar barberos que pueden ofrecer el servicio seleccionado
    // Esta lógica puede necesitar ajustes según cómo se almacenen las especialidades
    return true; // Por ahora mostramos todos
  }) || [];
  
  // Generar las horas disponibles
  const availableTimes = useMemo(() => {
    return horariosDisponibles || [];
  }, [horariosDisponibles]);
  
  // Función para obtener el valor formateado de la hora
  const getFormattedTimeValue = useMemo(() => {
    return time ? time.slice(0, 5) : ""; // Formato HH:MM
  }, [time]);
  
  // Función para convertir hora a minutos
  const horaAMinutos = (hora: string): number => {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  };
  
  // Verificar si el horario seleccionado se solapa con una cita existente
  const isTimeOverlapping = useMemo(() => {
    if (!time || !citasExistentes || !duration) return false;
    
    const selectedTimeMinutes = horaAMinutos(time);
    const serviceDuration = parseInt(duration, 10);
    
    return citasExistentes.some((cita: Appointment) => {
      // Excluir la cita que se está editando
      if (initial?.id_cita && cita.id_cita === initial.id_cita) {
        return false;
      }
      
      const citaStart = horaAMinutos(cita.hora);
      const citaDuration = parseInt(cita.duracion || "30", 10);
      const citaEnd = citaStart + citaDuration;
      
      // Verificar solapamiento
      return selectedTimeMinutes < citaEnd && selectedTimeMinutes + serviceDuration > citaStart;
    });
  }, [time, citasExistentes, duration, initial?.id_cita]);

  const handleCreateQuickClient = async () => {
    if (!quickClientData.nombre.trim()) {
      alert("Por favor ingrese el nombre del cliente");
      return;
    }

    // Validar el formato del número de teléfono si se ingresó uno
    if (quickClientData.telefono) {
      const isValid = isValidPhoneNumberLocal(quickClientData.telefono);
      if (!isValid) {
        alert("El formato del número de celular debe ser: 09xxxxxxx o +5989xxxxxxx");
        return;
      }
    }

    if (!selectedSucursalId) {
      alert("No se ha seleccionado una sucursal");
      return;
    }

    try {
      // Normalizar el número de teléfono antes de crear el cliente
      const normalizedPhone = quickClientData.telefono ? normalizePhoneNumberLocal(quickClientData.telefono) : null;
      
      // Crear el cliente con los datos proporcionados
      const newClientArray: any[] = (await createClientMutation.mutateAsync({
        nombre: quickClientData.nombre,
        telefono: normalizedPhone !== null ? normalizedPhone : undefined,
        id_sucursal: selectedSucursalId,
      })) as any[];

      // Tomar el primer cliente del array
      const newClient = newClientArray[0];

      // Actualizar los valores del turno con el nuevo cliente
      setClientId(newClient.id_cliente);
      setClientName(newClient.nombre);
      setClientPhone(newClient.telefono || null);

      // Limpiar el formulario y ocultarlo
      setQuickClientData({ nombre: "", telefono: "" });
      setShowQuickClientForm(false);
      setShowClientSuggestions(false);

    } catch (error) {
      console.error("Error al crear cliente rápido:", error);
      alert("Error al crear el cliente. Por favor intente nuevamente.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validaciones básicas
      if (!clientName) {
        alert("Por favor seleccione un cliente");
        setIsSubmitting(false);
        return;
      }
      
      if (!serviceName) {
        alert("Por favor seleccione un servicio");
        setIsSubmitting(false);
        return;
      }
      
      if (!barberName) {
        alert("Por favor seleccione un barbero");
        setIsSubmitting(false);
        return;
      }
      
      if (!date || !time) {
        alert("Por favor seleccione fecha y hora");
        setIsSubmitting(false);
        return;
      }
      
      // ✅ OBTENER Y VALIDAR DURACIÓN
      let finalDuration = duration || '';
      
      if (!finalDuration && serviceId) {
        const selectedService = serviciosData?.find((s: any) => s.id_servicio === serviceId);
        if (selectedService && selectedService.duracion_minutos) {
          finalDuration = selectedService.duracion_minutos.toString();
        }
      }
      
      if (!finalDuration) {
        alert("No se pudo determinar la duración del servicio");
        setIsSubmitting(false);
        return;
      }
      
      // ✅ OBTENER Y VALIDAR TELÉFONO
      let finalPhone = clientPhone;
      
      if (clientId && !clientPhone) {
        const selectedClient = clientesData?.find((c: any) => c.id_cliente === clientId);
        if (selectedClient?.telefono) {
          finalPhone = selectedClient.telefono;
          setClientPhone(selectedClient.telefono);
        } else {
          alert("El cliente seleccionado no tiene teléfono registrado. Por favor actualice sus datos.");
          setIsSubmitting(false);
          return;
        }
      }
      
      if (!finalPhone || finalPhone.trim() === '') {
        alert("El teléfono del cliente es obligatorio");
        setIsSubmitting(false);
        return;
      }
      
      if (!isValidPhoneNumberLocal(finalPhone)) {
        alert("El formato del teléfono debe ser: 09xxxxxxx, 9xxxxxxx o +5989xxxxxxx");
        setIsSubmitting(false);
        return;
      }
      
      const normalizedPhone = normalizePhoneNumberLocal(finalPhone);
      
      // ✅ OBTENER PRECIO DEL SERVICIO
      const selectedService = serviciosData?.find((s: any) => s.id_servicio === serviceId);
      const ticket = selectedService?.precio || null;
      
      // ✅ OBTENER ESTADO DE LA CITA
      const estadoCita = appointmentStatus as "pendiente" | "completado" | "cancelado";

      // ✅ CONSTRUIR OBJETO COMPLETO
      const appointmentData: Partial<Appointment> = {
        fecha: date,
        hora: time,
        cliente_nombre: clientName,
        servicio: serviceName,
        barbero: barberName,
        telefono: normalizedPhone,
        id_barbero: barberId || '',
        id_sucursal: selectedSucursalId || '',
        id_barberia: idBarberia || '',
        duracion: finalDuration,
        estado: estadoCita,
        nota: note?.trim() || null,
        id_cliente: clientId || null,
        id_servicio: serviceId || null,
        ticket: ticket || undefined,
        nro_factura: initial?.nro_factura || undefined,
        notificacion_barbero: initial?.notificacion_barbero || undefined,
        notificacion_cliente: initial?.notificacion_cliente || undefined,
        metodo_pago: initial?.metodo_pago || undefined,
        created_at: initial?.created_at || undefined,
        updated_at: initial?.updated_at || undefined,
      };
      
      await onSave(appointmentData);
      onOpenChange(false);
      
      // Resetear formulario
      setClientId(null);
      setClientName("");
      setServiceId(null);
      setServiceName("");
      setDuration("");
      setBarberId(null);
      setBarberName("");
      setDate(getLocalDateString(new Date()));
      setTime("");
      setNote("");
      setClientPhone(null);
      setAppointmentStatus("pendiente");
      setShowClientSuggestions(false);
      
    } catch (error) {
      console.error("Error al guardar el turno:", error);
      alert("Error al guardar el turno. Por favor intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Actualizar duración y precio cuando se selecciona un servicio
  const handleServiceChange = (value: string) => {
    const selectedService = serviciosData?.find((s: any) => s.id_servicio === value);
    setServiceId(value || null);
    setServiceName(selectedService?.nombre || "");
    // Actualizar la duración cuando se selecciona un servicio
    if (selectedService) {
      setDuration(selectedService.duracion_minutos.toString());
    }
  };

  // Actualizar barbero cuando se selecciona uno
  const handleBarberChange = (value: string) => {
    const selectedBarber = filteredBarberos.find((b: any) => b.id_barbero === value);
    setBarberId(value || null);
    setBarberName(selectedBarber?.nombre || "");
  };

  // Manejar cambio en el nombre del cliente para mostrar sugerencias
  const handleClientNameChange = (value: string) => {
    setClientName(value);
    // Mostrar sugerencias si hay texto
    setShowClientSuggestions(value.length > 0);
    // Limpiar la selección si el usuario modifica el texto
    if (clientId) {
      setClientId(null);
      setClientPhone(null);
    }
  };

  // Seleccionar un cliente de las sugerencias
  const selectClient = (client: Client) => {
    setClientId(client.id_cliente);
    setClientName(client.nombre);
    setClientPhone(client.telefono || null);
    setShowClientSuggestions(false);
  };

  // Filtrar clientes según el texto ingresado
  const filteredClients = useMemo(() => {
    if (!clientName || !clientesData) return [];
    
    const searchTerm = clientName.toLowerCase().trim();
    if (!searchTerm) return [];
    
    return clientesData.filter((cliente: Client) => 
      (cliente.nombre && cliente.nombre.toLowerCase().includes(searchTerm)) ||
      (cliente.telefono && cliente.telefono.includes(searchTerm))
    ).slice(0, 10); // Limitar a 10 resultados
  }, [clientName, clientesData]);

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
          {/* Filtro de sucursal (solo para administradores) */}
          {isAdmin && (
            <UltraSimpleFormGroup>
              <UltraSimpleLabel htmlFor="sucursal">Sucursal</UltraSimpleLabel>
              <UltraSimpleSelect
                id="sucursal"
                value={selectedSucursalId || ""}
                onChange={(e) => setSelectedSucursalId(e.target.value || undefined)}
                disabled={isLoadingSucursales}
              >
                {allSucursales?.map((sucursal: any) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
                  </option>
                ))}
              </UltraSimpleSelect>
            </UltraSimpleFormGroup>
          )}
          
          {/* Servicio y Duración (en la misma línea) */}
          <div style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: '1fr 1fr'
          }}>
            <UltraSimpleFormGroup>
              <UltraSimpleLabel htmlFor="servicio">Servicio *</UltraSimpleLabel>
              <UltraSimpleSelect
                id="servicio"
                value={serviceId || ""}
                onChange={(e) => handleServiceChange(e.target.value)}
                disabled={isLoadingServicios}
              >
                <option value="">Seleccione un servicio</option>
                {serviciosData?.map((servicio: any) => (
                  <option key={servicio.id_servicio} value={servicio.id_servicio}>
                    {servicio.nombre} - ${servicio.precio}
                  </option>
                ))}
              </UltraSimpleSelect>
            </UltraSimpleFormGroup>
            
            <UltraSimpleFormGroup>
              <UltraSimpleLabel htmlFor="duracion">Duración (minutos) *</UltraSimpleLabel>
              <UltraSimpleInput
                id="duracion"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ej: 30"
                min="1"
              />
            </UltraSimpleFormGroup>
          </div>
          
          {/* Barbero */}
          <UltraSimpleFormGroup>
            <UltraSimpleLabel htmlFor="barbero">Barbero *</UltraSimpleLabel>
            <UltraSimpleSelect
              id="barbero"
              value={barberId || ""}
              onChange={(e) => handleBarberChange(e.target.value)}
              disabled={isLoadingBarberos}
            >
              <option value="">Seleccione un barbero</option>
              {filteredBarberos.map((barbero: any) => (
                <option key={barbero.id_barbero} value={barbero.id_barbero}>
                  {barbero.nombre}
                </option>
              ))}
            </UltraSimpleSelect>
          </UltraSimpleFormGroup>
          
          {/* Fecha y Hora (en la misma línea) */}
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
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </UltraSimpleFormGroup>
            
            <UltraSimpleFormGroup>
              <UltraSimpleLabel htmlFor="hora">Hora *</UltraSimpleLabel>
              <UltraSimpleSelect
                id="hora"
                value={getFormattedTimeValue}
                onChange={(e) => setTime(e.target.value)}
                disabled={isLoadingHorarios}
              >
                <option value="">Seleccione una hora</option>
                {availableTimes.map((timeOption) => (
                  <option key={timeOption} value={timeOption}>
                    {timeOption}
                  </option>
                ))}
              </UltraSimpleSelect>
              {isTimeOverlapping && (
                <div style={{ 
                  color: '#eab308', 
                  fontSize: '0.75rem', 
                  marginTop: '0.25rem' 
                }}>
                  ⚠️ Este horario se solapa con una cita existente. El turno se creará de todos modos.
                </div>
              )}
              {isLoadingHorarios && (
                <div style={{ 
                  color: 'rgba(255, 255, 255, 0.6)', 
                  fontSize: '0.75rem', 
                  marginTop: '0.25rem' 
                }}>
                  Cargando horarios disponibles...
                </div>
              )}
            </UltraSimpleFormGroup>
          </div>
          
          {/* Cliente */}
          <UltraSimpleFormGroup>
            <UltraSimpleLabel htmlFor="cliente_nombre">Cliente *</UltraSimpleLabel>
            <div style={{ position: 'relative' }}>
              <UltraSimpleInput
                id="cliente_nombre"
                value={clientName}
                onChange={(e) => handleClientNameChange(e.target.value)}
                placeholder="Buscar cliente..."
              />
              
              {/* Sugerencias de clientes */}
              {showClientSuggestions && filteredClients.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  marginTop: '0.25rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }}>
                  {filteredClients.map((client: Client) => (
                    <div
                      key={client.id_cliente}
                      onClick={() => selectClient(client)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid #374151',
                        color: '#ffffff'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d2d2d'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                    >
                      <div style={{ fontWeight: 500 }}>{client.nombre}</div>
                      {client.telefono && (
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#9ca3af',
                          marginTop: '0.125rem'
                        }}>
                          {client.telefono}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Botón para crear cliente rápido */}
            <button
              type="button"
              onClick={() => setShowQuickClientForm(!showQuickClientForm)}
              style={{
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: '#ff7700',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              + Crear cliente rápido
            </button>
            
            {/* Formulario de cliente rápido */}
            {showQuickClientForm && (
              <div style={{ 
                marginTop: '0.75rem', 
                padding: '0.75rem', 
                backgroundColor: '#1a1a1a', 
                borderRadius: '0.5rem' 
              }}>
                <div style={{
                  display: 'grid',
                  gap: '0.5rem',
                  gridTemplateColumns: '1fr 1fr'
                }}>
                  <UltraSimpleFormGroup>
                    <UltraSimpleLabel>Nombre *</UltraSimpleLabel>
                    <UltraSimpleInput
                      type="text"
                      value={quickClientData.nombre}
                      onChange={(e) => setQuickClientData({...quickClientData, nombre: e.target.value})}
                      placeholder="Nombre completo"
                    />
                  </UltraSimpleFormGroup>
                  
                  <UltraSimpleFormGroup>
                    <UltraSimpleLabel>Teléfono</UltraSimpleLabel>
                    <UltraSimpleInput
                      type="text"
                      value={quickClientData.telefono}
                      onChange={(e) => setQuickClientData({...quickClientData, telefono: e.target.value})}
                      placeholder="Teléfono"
                    />
                  </UltraSimpleFormGroup>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  marginTop: '0.5rem' 
                }}>
                  <UltraSimpleButton 
                    type="button" 
                    variant="secondary"
                    onClick={() => setShowQuickClientForm(false)}
                  >
                    Cancelar
                  </UltraSimpleButton>
                  <UltraSimpleButton 
                    type="button" 
                    variant="primary"
                    onClick={handleCreateQuickClient}
                  >
                    Crear
                  </UltraSimpleButton>
                </div>
              </div>
            )}
          </UltraSimpleFormGroup>
          
          {/* Estado de la cita (solo para edición) */}
          {initial?.id_cita && (
            <UltraSimpleFormGroup>
              <UltraSimpleLabel htmlFor="estado">Estado</UltraSimpleLabel>
              <UltraSimpleSelect
                id="estado"
                value={appointmentStatus}
                onChange={(e) => setAppointmentStatus(e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </UltraSimpleSelect>
            </UltraSimpleFormGroup>
          )}
          
          {/* Nota */}
          <UltraSimpleFormGroup>
            <UltraSimpleLabel htmlFor="nota">Nota</UltraSimpleLabel>
            <UltraSimpleTextarea
              id="nota"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Agregar nota..."
              rows={3}
            />
          </UltraSimpleFormGroup>
        </div>
        
        {/* Botones de acción */}
        <UltraSimpleModalFooter>
          <UltraSimpleButton 
            type="button" 
            variant="secondary" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </UltraSimpleButton>
          <UltraSimpleButton 
            type="submit" 
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar Turno"}
          </UltraSimpleButton>
        </UltraSimpleModalFooter>
      </UltraSimpleForm>
    </UltraSimpleModal>
  );
}