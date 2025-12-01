"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect, useMemo, useCallback } from "react";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import type { Appointment, Client, Service, Barbero } from "@/types/db";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { useClientes } from "@/hooks/useClientes";
import { useServiciosListPorSucursal } from "@/hooks/useServiciosListPorSucursal";
import { useBarberosList } from "@/hooks/useBarberosList";
import { useCitas } from "@/hooks/useCitas";
import { useHorariosDisponiblesCompleto } from "@/hooks/useHorariosDisponiblesCompleto";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import { getLocalDateString } from "@/utils/dateUtils";
import { useBarberias } from "@/hooks/useBarberias";
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

interface SingleFormAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Appointment>;
  onSave: (values: Partial<Appointment>) => Promise<void>;
  sucursalId?: string;
}

export function SingleFormAppointmentModal({
  open,
  onOpenChange,
  onSave,
  initial,
  sucursalId: propSucursalId
}: SingleFormAppointmentModalProps) {
  console.log("=== DEBUG SingleFormAppointmentModal ===");
  console.log("initial recibido:", initial);
  console.log("fecha en initial:", initial?.fecha);
  console.log("hora en initial:", initial?.hora);
  console.log("=== FIN DEBUG SingleFormAppointmentModal ===");

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
  const [appointmentStatus, setAppointmentStatus] = useState<string>(initial?.estado || "pendiente"); // Nuevo estado para el estado de la cita
  const [showQuickClientForm, setShowQuickClientForm] = useState(false);
  const [quickClientData, setQuickClientData] = useState({
    nombre: "",
    telefono: "",
  });
  
  // Estado para verificar solapamiento
  const [isOverlapping, setIsOverlapping] = useState(false);
  
  // Efecto para reiniciar los estados cuando se abre el modal o cambia la cita
  useEffect(() => {
    if (open) {
      console.log("=== DEBUG Reiniciando estados con initial ===");
      console.log("initial:", initial);
      console.log("initial?.id_cita:", initial?.id_cita);
      setClientId(initial?.id_cliente || null);
      setClientName(initial?.cliente_nombre || "");
      setServiceId(initial?.id_servicio || null);
      setServiceName(initial?.servicio || "");
      setDuration(initial?.duracion || ""); // Inicializar duración
      setBarberId(initial?.id_barbero || null);
      setBarberName(initial?.barbero || "");
      setDate(initial?.fecha || getLocalDateString(new Date()));
      setTime(initial?.hora || "");
      setNote(initial?.nota || "");
      setClientPhone(initial?.telefono || null);
      setAppointmentStatus(initial?.estado || "pendiente"); // Inicializar estado de la cita
      setIsOverlapping(false); // Resetear estado de solapamiento
      console.log("=== FIN DEBUG Reiniciando estados con initial ===");
    }
  }, [open, initial]); // Eliminado initial?.id_cita y usado initial completo

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
  
  // Obtener horarios de la sucursal
  const { horarios: horariosSucursal } = useHorariosSucursales(selectedSucursalId);

  // Filtrar barberos según el servicio seleccionado
  const filteredBarberos = barberosData?.filter((barbero: Barbero) => {
    // Si no hay servicio seleccionado, mostrar todos los barberos
    if (!serviceId) return true;
    
    // Filtrar barberos que pueden ofrecer el servicio seleccionado
    // Esta lógica puede necesitar ajustes según cómo se almacenen las especialidades
    return true; // Por ahora mostramos todos
  }) || [];

  // Reemplazar la función generateAvailableTimes con una versión simplificada
  const generateAvailableTimes = useCallback(() => {
    console.log("=== INICIO GENERATE AVAILABLE TIMES (NUEVA LÓGICA) ===");
    console.log("selectedSucursalId:", selectedSucursalId);
    console.log("date:", date);
    console.log("barberId:", barberId);
    console.log("initial?.id_cita:", initial?.id_cita);

    // Verificar que tengamos todos los datos necesarios
    if (!selectedSucursalId || !date || !barberId) {
      console.log("=== FALTAN DATOS MÍNIMOS PARA GENERAR HORARIOS ===");
      return [];
    }

    // Si estamos cargando los horarios, devolver array vacío
    if (isLoadingHorarios) {
      return [];
    }

    console.log("Horarios disponibles:", horariosDisponibles);
    console.log("=== FIN GENERATE AVAILABLE TIMES (NUEVA LÓGICA) ===");
    
    return horariosDisponibles || [];
  }, [selectedSucursalId, date, barberId, initial?.id_cita, isLoadingHorarios, horariosDisponibles]);

  // Generar las horas disponibles
  const availableTimes = useMemo(() => {
    return generateAvailableTimes();
  }, [generateAvailableTimes]);

  // Efecto para asegurar que el valor seleccionado en el dropdown coincida con el estado
  useEffect(() => {
    if (time && availableTimes.length > 0) {
      const horaFormateada = time.slice(0, 5); // Formato HH:MM
      if (!availableTimes.includes(horaFormateada)) {
        // Si la hora no está en la lista, agregarla
        console.log("Agregando hora al estado de availableTimes:", horaFormateada);
      }
    }
  }, [time, availableTimes]);

  // Función para obtener el valor formateado de la hora
  const getFormattedTimeValue = useMemo(() => {
    return time ? time.slice(0, 5) : ""; // Formato HH:MM
  }, [time]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateQuickClient = async () => {
    console.log('=== DEBUG handleCreateQuickClient ===');
    console.log('Datos del cliente rápido:', quickClientData);
    console.log('Teléfono ingresado:', quickClientData.telefono);
    
    if (!quickClientData.nombre.trim()) {
      alert("Por favor ingrese el nombre del cliente");
      return;
    }

    // Validar el formato del número de teléfono si se ingresó uno
    if (quickClientData.telefono) {
      console.log('Validando teléfono...');
      
      // Usar la función compartida de validación
      const isValid = isValidPhoneNumberLocal(quickClientData.telefono);
      console.log('Resultado de validación:', isValid);
      
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
      const normalizedPhone = quickClientData.telefono ? normalizePhoneNumber(quickClientData.telefono) : null;
      
      // Crear el cliente con los datos proporcionados
      const newClientArray: Client[] = (await createClientMutation.mutateAsync({
        nombre: quickClientData.nombre,
        telefono: normalizedPhone !== null ? normalizedPhone : undefined,
        id_sucursal: selectedSucursalId,
      })) as Client[];

      // Tomar el primer cliente del array
      const newClient = newClientArray[0];

      // Actualizar los valores del turno con el nuevo cliente
      setClientId(newClient.id_cliente);
      setClientName(newClient.nombre);
      setClientPhone(newClient.telefono || null);

      // Limpiar el formulario y ocultarlo
      setQuickClientData({ nombre: "", telefono: "" });
      setShowQuickClientForm(false);

    } catch (error) {
      console.error("Error al crear cliente rápido:", error);
      alert("Error al crear el cliente. Por favor intente nuevamente.");
    }
  };

const handleSubmit = async () => {
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
      const selectedService = serviciosData?.find((s: Service) => s.id_servicio === serviceId);
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
      const selectedClient = clientesData?.find((c: Client) => c.id_cliente === clientId);
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
    const selectedService = serviciosData?.find((s: Service) => s.id_servicio === serviceId);
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
      duracion: finalDuration,  // ✅ Ahora está definido
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
    
    console.log('📤 appointmentData con teléfono:', appointmentData);
    
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
    setAppointmentStatus("pendiente"); // Resetear el estado de la cita
    
  } catch (error) {
    console.error("Error al guardar el turno:", error);
    alert("Error al guardar el turno. Por favor intente nuevamente.");
  } finally {
    setIsSubmitting(false);
  }
};

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

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 qoder-dark-modal-overlay-global" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="qoder-dark-client-modal">
            <div className="content">
              <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold text-qoder-dark-text-primary">
              {initial?.id_cita ? "Editar Turno" : "Crear Nuevo Turno"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-2 rounded-full hover:bg-qoder-dark-bg-hover text-qoder-dark-text-secondary"
                aria-label="Cerrar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </Dialog.Close>
          </div>
          
          <div className="space-y-4">
            {/* Filtro de sucursal (solo para administradores) */}
            {isAdmin && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                  Sucursal
                </label>
                <select
                  value={selectedSucursalId || ""}
                  onChange={(e) => setSelectedSucursalId(e.target.value || undefined)}
                  className="qoder-dark-select w-full px-3 py-2 rounded-lg"
                  disabled={isLoadingSucursales}
                >
                  {allSucursales?.map((sucursal: any) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Servicio y Duración (en la misma línea) */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                  Servicio
                </label>
                <select
                  value={serviceId || ""}
                  onChange={(e) => {
                    const selectedService = serviciosData?.find((s: Service) => s.id_servicio === e.target.value);
                    setServiceId(e.target.value || null);
                    setServiceName(selectedService?.nombre || "");
                    // Actualizar la duración cuando se selecciona un servicio
                    if (selectedService) {
                      setDuration(selectedService.duracion_minutos.toString());
                    }
                  }}
                  className="qoder-dark-select w-full px-3 py-2 rounded-lg"
                  disabled={isLoadingServicios}
                >
                  <option value="">Seleccione un servicio</option>
                  {serviciosData?.map((servicio: Service) => (
                    <option key={servicio.id_servicio} value={servicio.id_servicio}>
                      {servicio.nombre} - ${servicio.precio}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="qoder-dark-input w-full px-3 py-2 rounded-lg"
                  placeholder="Ej: 30"
                  min="1"
                />
              </div>
            </div>
            
            {/* Barbero */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                Barbero
              </label>
              <select
                value={barberId || ""}
                onChange={(e) => {
                  const selectedBarber = filteredBarberos.find((b: Barbero) => b.id_barbero === e.target.value);
                  setBarberId(e.target.value || null);
                  setBarberName(selectedBarber?.nombre || "");
                }}
                className="qoder-dark-select w-full px-3 py-2 rounded-lg"
                disabled={isLoadingBarberos}
              >
                <option value="">Seleccione un barbero</option>
                {filteredBarberos.map((barbero: Barbero) => (
                  <option key={barbero.id_barbero} value={barbero.id_barbero}>
                    {barbero.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Fecha y Hora (en la misma línea) */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                  Fecha
                </label>
                <div className="w-full">
                  <CustomDatePicker
                    value={date}
                    onChange={setDate}
                    placeholder="Seleccionar fecha"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                  Hora
                </label>
                <select
                  value={getFormattedTimeValue}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full qoder-dark-select p-3 rounded-lg ${isTimeOverlapping ? 'border-yellow-500' : ''}`}
                  disabled={isLoadingHorarios}
                >
                  <option value="">Seleccione una hora</option>
                  {availableTimes.map((timeOption) => (
                    <option key={timeOption} value={timeOption}>
                      {timeOption}
                    </option>
                  ))}
                </select>
                {isTimeOverlapping && (
                  <p className="text-yellow-500 text-xs mt-1">
                    ⚠️ Este horario se solapa con una cita existente. El turno se creará de todos modos.
                  </p>
                )}
                {isLoadingHorarios && (
                  <p className="text-qoder-dark-text-secondary text-xs mt-1">
                    Cargando horarios disponibles...
                  </p>
                )}
              </div>
            </div>

            {/* Cliente */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                Cliente
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    // Limpiar la selección si el usuario modifica el texto
                    if (clientId) {
                      setClientId(null);
                      setClientPhone(null);
                    }
                  }}
                  className="qoder-dark-input w-full px-3 py-2 rounded-lg"
                  placeholder="Buscar cliente..."
                />
                {clientName && !clientId && (
                  <div className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto border border-qoder-dark-border rounded-lg bg-qoder-dark-bg-primary">
                    {clientesData
                      ?.filter((cliente: Client) => 
                        (cliente.nombre && cliente.nombre.toLowerCase().includes(clientName.toLowerCase())) ||
                        (cliente.telefono && cliente.telefono.includes(clientName))
                      )
                      .map((cliente: Client) => (
                        <div
                          key={cliente.id_cliente}
                          className="px-3 py-2 hover:bg-qoder-dark-bg-hover cursor-pointer text-qoder-dark-text-primary"
                          onClick={() => {
                            setClientId(cliente.id_cliente);
                            setClientName(cliente.nombre);
                            setClientPhone(cliente.telefono || null);
                          }}
                        >
                          {cliente.nombre}
                          {cliente.telefono && (
                            <span className="text-qoder-dark-text-secondary text-sm ml-2">
                              ({cliente.telefono})
                            </span>
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
                className="mt-2 text-xs text-qoder-dark-accent-primary boton-simple"
              >
                + Crear cliente rápido
              </button>
              
              {/* Formulario de cliente rápido */}
              {showQuickClientForm && (
                <div className="mt-3 p-3 bg-qoder-dark-bg-secondary rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-qoder-dark-text-primary mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={quickClientData.nombre}
                        onChange={(e) => setQuickClientData({...quickClientData, nombre: e.target.value})}
                        className="qoder-dark-input w-full px-2 py-1 text-sm rounded"
                        placeholder="Nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-qoder-dark-text-primary mb-1">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        value={quickClientData.telefono}
                        onChange={(e) => setQuickClientData({...quickClientData, telefono: e.target.value})}
                        className="qoder-dark-input w-full px-2 py-1 text-sm rounded"
                        placeholder="Teléfono"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickClientForm(false)}
                      className="cancel-button px-3 py-1 text-sm rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateQuickClient}
                      className="qoder-dark-button px-3 py-1 text-sm rounded"
                    >
                      Crear
                    </button>
                    
                  </div>
                </div>
              )}
            </div>

            {/* Estado de la cita (solo para edición) */}
            {initial?.id_cita && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                  Estado
                </label>
                <select
                  value={appointmentStatus}
                  onChange={(e) => setAppointmentStatus(e.target.value)}
                  className="qoder-dark-select w-full px-3 py-2 rounded-lg"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            )}

            {/* Nota */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                Nota
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="qoder-dark-input w-full px-3 py-2 rounded-lg"
                rows={3}
                placeholder="Agregar nota..."
              />
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="cancel-button px-4 py-2 rounded-lg"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="action-button px-4 py-2 rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Guardar Turno"}
              </button>
              </div>
            </div>
          </div>
        </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}