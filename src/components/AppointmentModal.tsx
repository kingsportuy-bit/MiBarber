"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import type { Appointment } from "@/types/db";
import { useCitaById } from "@/hooks/useCitaById";
import { useBarberosList } from "@/hooks/useBarberosList";
import { useServiciosListPorSucursal } from "@/hooks/useServiciosListPorSucursal";
import { useClientes } from "@/hooks/useClientes";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import { useCitas } from "@/hooks/useCitas"; // Importar el hook para obtener citas
import { getLocalDateString, isDateBefore, convertJsDayToDbDay } from "@/utils/dateUtils";
import { CustomDatePicker } from "@/components/CustomDatePicker"; // Agregar esta importación

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Appointment>;
  onSave: (values: Partial<Appointment>) => Promise<void>;
  onDelete?: () => Promise<void>;
  sucursalId?: string; // Agregar el ID de la sucursal como prop
};

export function AppointmentModal({ open, onOpenChange, initial, onSave, onDelete, sucursalId }: Props) {
  const [values, setValues] = useState<Partial<Appointment>>({});
  const [isCreatingNewClient, setIsCreatingNewClient] = useState(false);
  const [newClientData, setNewClientData] = useState({ nombre: "", telefono: "", email: "" });
  const isEdit = Boolean(initial?.id_cita);
  
  // Obtener el ID de la barbería del usuario autenticado
  const { idBarberia, isAdmin, barbero: barberoActual } = useBarberoAuth();
  
  // Obtener información de la barbería y servicios
  const { sucursales: sucursalesData } = useSucursales();
  const { data: serviciosData, isLoading: isLoadingServicios } = useServiciosListPorSucursal(sucursalId);
  const servicios = serviciosData || [];
  
  // Obtener horarios de la sucursal
  const { horarios: horariosSucursal } = useHorariosSucursales(sucursalId);
  
  console.log("AppointmentModal - Props recibidas:", { open, initial, sucursalId, isEdit });
  console.log("AppointmentModal - Auth info:", { idBarberia, isAdmin, barberoActual });
  console.log("AppointmentModal - Servicios obtenidos:", serviciosData, "Loading:", isLoadingServicios);
  
  // Encontrar la sucursal seleccionada
  const sucursalSeleccionada = sucursalesData && Array.isArray(sucursalesData) 
    ? sucursalesData.find(s => s.id === sucursalId)
    : undefined;
  
  // Usar los hooks para obtener barberos y clientes filtrados por la barbería actual
  // Corregir para filtrar barberos por sucursal también
  const { data: barberos, isLoading: isLoadingBarberos } = useBarberosList(idBarberia, sucursalId);
  
  // Efecto para asegurarse de que se actualicen los barberos cuando cambie la sucursal
  useEffect(() => {
    console.log("Sucursal ID cambiada a:", sucursalId);
  }, [sucursalId]);
  
  const { data: clientes, isLoading: isLoadingClientes } = useClientes(undefined, "ultimo_agregado", undefined);
  
  // Usar el hook para obtener los datos del turno si es edición
  const { data: citaData, isLoading: isLoadingCita } = useCitaById(
    isEdit && initial?.id_cita ? initial.id_cita : undefined
  );
  
  // Obtener las citas ya agendadas para este barbero en la fecha seleccionada
  const selectedDate = values.fecha;
  const { data: citasDelBarbero } = useCitas(
    sucursalId,
    selectedDate,
    isAdmin ? undefined : (barberoActual?.id_barbero || undefined)
  );

  function update<K extends keyof Appointment>(k: K, v: Appointment[K]) {
    setValues((prev) => {
      const newValues = { ...prev, [k]: v };
      
      // Si se cambia la hora, verificar si es hh:15 o hh:45 y ajustar el servicio
      if (k === "hora") {
        const hourStr = v as string;
        if (hourStr) {
          const minutes = parseInt(hourStr.split(':')[1] || '0');
          // Si los minutos son 15 o 45, solo permitir barba
          if (minutes === 15 || minutes === 45) {
            newValues.servicio = "Barba";
          }
        }
      }
      
      return newValues;
    });
  }

  // Efecto para cargar los datos iniciales cuando se abre el modal
  useEffect(() => {
    console.log(" useEffect - open:", open, "isEdit:", isEdit, "citaData:", citaData, "initial:", initial);
    if (open) {
      if (isEdit && citaData) {
        console.log("Cargando datos desde useCitaById:", citaData);
        // Formatear la hora para que coincida con el formato del select (HH:mm)
        const formattedInitial = {
          ...citaData,
          hora: citaData.hora ? citaData.hora.slice(0, 5) : ""
        };
        setValues(formattedInitial);
      } else if (initial && !isEdit) {
        // Para nuevo turno, usar los valores iniciales proporcionados
        console.log("Cargando datos iniciales para nuevo turno:", initial);
        const formattedInitial = {
          ...initial,
          hora: initial.hora ? initial.hora.slice(0, 5) : "",
          // Para barberos normales, establecer el barbero actual si no está definido
          barbero: initial.barbero || (!isAdmin && barberoActual?.nombre ? barberoActual.nombre : "")
        };
        setValues(formattedInitial);
      } else if (!isEdit) {
        // Establecer valores por defecto para nuevo turno
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        
        // Para barberos normales, establecer el barbero actual por defecto
        const defaultBarbero = !isAdmin && barberoActual?.nombre ? barberoActual.nombre : "";
        
        setValues({
          fecha: formattedDate,
          barbero: defaultBarbero
        });
      }
    } else {
      // Resetear los valores cuando el modal se cierra
      setValues({});
      setIsCreatingNewClient(false);
      setNewClientData({ nombre: "", telefono: "", email: "" });
    }
  }, [open, initial, isEdit, citaData, sucursalId, isAdmin, barberoActual]);

  // Función para generar horas disponibles a partir de la hora actual
  const generateAvailableTimes = () => {
    const now = new Date();
    const selectedDate = values.fecha;
    // Usar la utilidad de fecha corregida
    const today = getLocalDateString();
    
    // Validaciones iniciales
    if (!sucursalId || !selectedDate || !values.servicio) {
      console.log("Faltan datos para generar horarios:", { sucursalId, selectedDate, servicio: values.servicio });
      return [];
    }
    
    // Para administradores, también se necesita un barbero seleccionado
    if (isAdmin && !values.barbero) {
      console.log("Falta barbero para administrador");
      return [];
    }
    
    console.log("=== DEBUG GENERATE TIMES ===");
    console.log("Fecha seleccionada:", selectedDate, "Fecha actual:", today);
    console.log("sucursalId recibido:", sucursalId);
    console.log("servicios disponibles:", servicios);
    console.log("horarios de sucursal:", horariosSucursal);
    console.log("barbero seleccionado:", values.barbero);
    
    // Obtener la duración del servicio seleccionado
    const servicioSeleccionado = servicios.find(s => s.nombre === values.servicio);
    const duracionServicio = servicioSeleccionado ? servicioSeleccionado.duracion_minutos : 30; // Por defecto 30 minutos
    
    // Si no se puede determinar la duración del servicio, no mostrar horarios
    if (!duracionServicio || duracionServicio <= 0) {
      console.log("No se puede determinar la duración del servicio seleccionado");
      return [];
    }
    
    console.log("Duración del servicio seleccionado:", duracionServicio);
    
    // Obtener el horario de la sucursal si está disponible
    let horaInicio = 9; // Valor por defecto
    let horaFin = 20; // Valor por defecto (para 20:30)
    let horaInicioTarde = 13; // Hora de inicio de la tarde (por defecto)
    let horaFinManana = 12; // Hora de fin de la mañana (por defecto)
    let diasAbierto = true; // Por defecto asumir que está abierto
    
    // Verificar si tenemos horarios de sucursal
    if (horariosSucursal && horariosSucursal.length > 0) {
      console.log("Horarios de la sucursal:", horariosSucursal);
      
      // Obtener el día de la semana de la fecha seleccionada (0 = Domingo, 1 = Lunes, etc.)
      const selectedDateObj = new Date(selectedDate);
      const dayOfWeek = selectedDateObj.getDay();
      
      // Convertir el día de la semana de JavaScript al ID de día en la base de datos
      // JavaScript: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
      // Base de datos: 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado, 7=Domingo
      const diaId = convertJsDayToDbDay(dayOfWeek);
      
      console.log("Día de la semana seleccionado (0=Domingo, 1=Lunes, etc.):", dayOfWeek);
      console.log("ID del día para la base de datos (1=Lunes, 7=Domingo):", diaId);
      
      const horarioDelDia = horariosSucursal.find(h => h.id_dia === diaId && h.activo);
      
      console.log("Día de la semana seleccionado (0=Domingo, 1=Lunes, etc.):", dayOfWeek);
      console.log("ID del día para la base de datos (1=Lunes, 7=Domingo):", diaId);
      console.log("Horario del día encontrado:", horarioDelDia);
      
      // Verificar si la sucursal está cerrada ese día
      if (!horarioDelDia) {
        console.log("Sucursal cerrada este día (no hay horario definido)");
        diasAbierto = false;
      } else {
        // Parsear las horas de apertura y cierre
        try {
          // Extraer horas y minutos de apertura
          const [horaApertura, minutoApertura] = horarioDelDia.hora_apertura.split(':').map(Number);
          horaInicio = horaApertura;
          
          // Extraer horas y minutos de cierre
          const [horaCierre, minutoCierre] = horarioDelDia.hora_cierre.split(':').map(Number);
          horaFin = horaCierre;
          
          // Verificar si hay horario de almuerzo
          if (horarioDelDia.hora_inicio_almuerzo && horarioDelDia.hora_fin_almuerzo) {
            const [horaInicioAlmuerzo, minutoInicioAlmuerzo] = horarioDelDia.hora_inicio_almuerzo.split(':').map(Number);
            const [horaFinAlmuerzo, minutoFinAlmuerzo] = horarioDelDia.hora_fin_almuerzo.split(':').map(Number);
            
            horaFinManana = horaInicioAlmuerzo;
            horaInicioTarde = horaFinAlmuerzo;
          } else {
            // No hay descanso
            horaFinManana = horaFin;
            horaInicioTarde = horaFin;
          }
          
          console.log("Horario parseado - Inicio:", horaInicio, "Fin Mañana:", horaFinManana, "Inicio Tarde:", horaInicioTarde, "Fin:", horaFin);
        } catch (e) {
          console.warn("Error al parsear horario de sucursal:", e);
        }
      }
    } else {
      console.log("No se encontraron horarios para la sucursal");
      // Si no hay horarios definidos, asumir que está cerrado
      diasAbierto = false;
    }
    
    // Si la sucursal no está abierta ese día, no mostrar horarios
    if (!diasAbierto) {
      console.log("No hay horarios disponibles - sucursal cerrada ese día");
      return [];
    }
    
    // Ajustar el horario de fin para que sea el último bloque disponible
    // El último turno debe ser 20:30
    horaFin = 20; // Hora de cierre es 20:30
    
    const times = [];
    
    // Función para verificar si un horario está ocupado considerando la duración del servicio
    const isTimeSlotOccupied = (hour: number, minute: number): boolean => {
      // Convertir a string con formato HH:mm
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Verificar si hay alguna cita que se solape con este horario
      return citasDelBarbero?.some((cita: Appointment) => {
        // Excluir la cita actual si estamos en modo edición
        if (isEdit && cita.id_cita === initial?.id_cita) {
          return false;
        }
        
        // Solo considerar citas del mismo barbero
        // Si no hay barbero seleccionado, considerar todas las citas
        if (values.barbero && cita.barbero !== values.barbero) {
          return false;
        }
        
        // Obtener la hora de la cita
        const citaHora = cita.hora?.slice(0, 5);
        if (!citaHora) return false;
        
        // Encontrar el servicio de la cita para obtener su duración
        const servicioCita = servicios?.find(s => s.nombre === cita.servicio);
        const duracionCita = servicioCita ? servicioCita.duracion_minutos : 30; // Por defecto 30 minutos
        
        // Convertir la hora de la cita a minutos desde medianoche
        const [citaHour, citaMinute] = citaHora.split(':').map(Number);
        const citaStartMinutes = citaHour * 60 + citaMinute;
        const citaEndMinutes = citaStartMinutes + duracionCita;
        
        // Convertir la hora que estamos verificando a minutos desde medianoche
        const checkMinutes = hour * 60 + minute;
        const checkEndMinutes = checkMinutes + duracionServicio;
        
        // Verificar si hay solapamiento
        // Hay solapamiento si el inicio de uno es menor que el fin del otro y viceversa
        return checkMinutes < citaEndMinutes && checkEndMinutes > citaStartMinutes;
      }) || false;
    };
    
    // Calcular la hora mínima para el día actual (hora actual + 30 minutos)
    let minHour = 0;
    let minMinute = 0;
    let isToday = selectedDate === today;
    
    if (isToday) {
      const minTime = (now.getHours() * 60 + now.getMinutes()) + 30;
      minHour = Math.floor(minTime / 60);
      minMinute = minTime % 60;
      
      // Redondear al siguiente bloque de duracionServicio
      const blocks = Math.ceil(minMinute / duracionServicio);
      minMinute = blocks * duracionServicio;
      
      // Si los minutos superan 59, ajustar la hora
      if (minMinute >= 60) {
        minHour += Math.floor(minMinute / 60);
        minMinute = minMinute % 60;
      }
      
      // Asegurarse de que minMinute sea un múltiplo válido de duracionServicio
      if (minMinute % duracionServicio !== 0) {
        minMinute = Math.ceil(minMinute / duracionServicio) * duracionServicio;
        if (minMinute >= 60) {
          minHour += 1;
          minMinute = minMinute % 60;
        }
      }
      
      // Asegurarse de que la hora mínima no exceda el horario de la sucursal
      if (minHour < horaInicio) {
        minHour = horaInicio;
        minMinute = 0;
      }
      
      // Si la hora mínima excede el horario de la sucursal, ajustar para permitir mostrar horarios
      // pero solo los que estén dentro del horario de la sucursal
      if (minHour > horaFin) {
        console.log("Hora mínima excede el horario de la sucursal");
        // Ajustar la hora mínima para permitir mostrar horarios dentro del horario de la sucursal
        minHour = horaFin;
        minMinute = 0;
      } else if (minHour === horaFin && minMinute > 30) {
        // Si la hora mínima es exactamente la hora de cierre pero los minutos exceden 30,
        // ajustar para permitir mostrar el último horario disponible (20:30)
        minHour = horaFin;
        minMinute = 30;
      }
      
      console.log("Hora mínima para hoy:", minHour, ":", minMinute);
    }
    
    // Generar horarios dentro del rango de la sucursal (mañana)
    for (let hour = horaInicio; hour < horaFinManana; hour++) {
      // Generar bloques según la duración del servicio seleccionado
      for (let minute = 0; minute < 60; minute += duracionServicio) {
        // Si es hoy, solo mostrar horas futuras (hora actual + 30 minutos)
        if (isToday) {
          // Solo agregar horas futuras o iguales al tiempo mínimo
          if (hour > minHour || (hour === minHour && minute >= minMinute)) {
            // Verificar si este slot está ocupado
            if (!isTimeSlotOccupied(hour, minute)) {
              const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              times.push(timeString);
            }
          }
        } else {
          // Para fechas futuras, mostrar todos los horarios que no estén ocupados
          if (!isTimeSlotOccupied(hour, minute)) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            times.push(timeString);
          }
        }
      }
    }
    
    // Generar horarios dentro del rango de la sucursal (tarde)
    // Verificar si hay un descanso real (más de 30 minutos de diferencia)
    const tieneDescanso = (horaInicioTarde - horaFinManana) > 0.5;
    
    if (tieneDescanso) {
      for (let hour = horaInicioTarde; hour <= horaFin; hour++) {
        // Para la última hora, solo generar hasta 30 minutos (ej: 20:30)
        const maxMinutes = hour === horaFin ? 30 : 59;
        
        // Generar bloques según la duración del servicio seleccionado
        for (let minute = 0; minute <= maxMinutes; minute += duracionServicio) {
          // Si es hoy, solo mostrar horas futuras (hora actual + 30 minutos)
          if (isToday) {
            // Solo agregar horas futuras
            if (hour > minHour || (hour === minHour && minute >= minMinute)) {
              // Verificar si este slot está ocupado
              if (!isTimeSlotOccupied(hour, minute)) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                times.push(timeString);
              }
            }
          } else {
            // Para fechas futuras, mostrar todos los horarios que no estén ocupados
            if (!isTimeSlotOccupied(hour, minute)) {
              const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              times.push(timeString);
            }
          }
        }
      }
    } else {
      // Si no hay descanso real, continuar generando horarios desde la mañana hasta la tarde
      for (let hour = horaFinManana; hour <= horaFin; hour++) {
        // Para la última hora, solo generar hasta 30 minutos (ej: 20:30)
        const maxMinutes = hour === horaFin ? 30 : 59;
        
        // Generar bloques según la duración del servicio seleccionado
        for (let minute = 0; minute <= maxMinutes; minute += duracionServicio) {
          // Si es hoy, solo mostrar horas futuras (hora actual + 30 minutos)
          if (isToday) {
            // Solo agregar horas futuras
            if (hour > minHour || (hour === minHour && minute >= minMinute)) {
              // Verificar si este slot está ocupado
              if (!isTimeSlotOccupied(hour, minute)) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                times.push(timeString);
              }
            }
          } else {
            // Para fechas futuras, mostrar todos los horarios que no estén ocupados
            if (!isTimeSlotOccupied(hour, minute)) {
              const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              times.push(timeString);
            }
          }
        }
      }
    }
    
    // Asegurar que el último horario sea 20:30 si es compatible con la duración del servicio
    const lastTime = "20:30";
    if (!times.includes(lastTime)) {
      // Verificar si 20:30 es un bloque válido según la duración del servicio
      if (30 % duracionServicio === 0) {
        // Verificar si está ocupado
        const [lastHour, lastMinute] = lastTime.split(':').map(Number);
        if (!isTimeSlotOccupied(lastHour, lastMinute)) {
          times.push(lastTime);
        }
      }
    }
    
    console.log("Horarios generados:", times);
    console.log("=== FIN DEBUG ===");
    return times;
  };

  // Función para manejar el cambio en el cliente
  const handleClientChange = (clientId: string) => {
    if (clientId === "new") {
      setIsCreatingNewClient(true);
      update("id_cliente", null as any);
      update("cliente_nombre", "");
    } else {
      setIsCreatingNewClient(false);
      const selectedClient = clientes?.find(client => client.id_cliente === clientId);
      if (selectedClient) {
        update("id_cliente", clientId);
        update("cliente_nombre", selectedClient.nombre);
      }
    }
  };

  // Función para manejar cambios en los datos del nuevo cliente
  const handleNewClientChange = (field: keyof typeof newClientData, value: string) => {
    setNewClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Obtener la fecha mínima (hoy) para el input de fecha
  // Usar la utilidad de fecha corregida
  const today = getLocalDateString();
  
  // Generar las horas disponibles
  // Modificar para que solo se ejecute cuando haya suficientes datos
  const availableTimes = (sucursalId && values.fecha && values.servicio && (!isAdmin || values.barbero)) 
    ? generateAvailableTimes() 
    : [];

  // Función para obtener los servicios filtrados según las especialidades del barbero
  const getFilteredServicios = () => {
    // Si es administrador, mostrar todos los servicios
    if (isAdmin) {
      return servicios;
    }
    
    // Si no es administrador y hay un barbero actual con especialidades
    if (barberoActual?.especialidades && barberoActual.especialidades.length > 0) {
      // Filtrar servicios según las especialidades del barbero
      // Las especialidades del barbero son IDs de servicios, no nombres
      return servicios.filter(service => 
        barberoActual.especialidades?.includes(service.id_servicio)
      );
    }
    
    // Si no hay especialidades definidas, mostrar todos los servicios
    return servicios;
  };

  // Obtener los servicios filtrados
  const serviciosFiltrados = getFilteredServicios();

  // Determinar qué servicios están disponibles según la hora seleccionada
  const getAvailableServices = () => {
    const minutes = values.hora ? parseInt(values.hora.split(':')[1] || '0') : 0;
    const isSpecialTime = minutes === 15 || minutes === 45;
    
    console.log("getAvailableServices - serviciosFiltrados:", serviciosFiltrados);
    console.log("getAvailableServices - hora seleccionada:", values.hora);
    console.log("getAvailableServices - minutos:", minutes);
    console.log("getAvailableServices - isSpecialTime:", isSpecialTime);
    
    // Usar servicios filtrados
    if (serviciosFiltrados && serviciosFiltrados.length > 0) {
      return serviciosFiltrados.map(service => ({
        value: service.nombre,
        label: `${service.nombre} - $${service.precio} (${service.duracion_minutos} min)`,
        disabled: isSpecialTime && service.duracion_minutos !== 15
      }));
    }
    
    // Si no hay servicios cargados, no devolver ningún servicio
    return [];
  };
  
  const availableServices = getAvailableServices();

  // Mostrar un indicador de carga mientras se obtienen los datos
  if (isEdit && isLoadingCita) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="qoder-dark-window">
              <Dialog.Title className="qoder-dark-window-header-modal">
                Cargando...
              </Dialog.Title>
              <div className="p-6">
                <p className="text-qoder-dark-text-primary">Cargando datos del turno...</p>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  // Función para guardar la cita con los IDs adicionales
  const handleSave = async (values: Partial<Appointment>) => {
    // Encontrar el servicio seleccionado para obtener su ID
    const servicioSeleccionado = servicios?.find(s => s.nombre === values.servicio);
    
    // Asegurarse de incluir los IDs adicionales
    const valuesWithIds = {
      ...values,
      id_barberia: idBarberia,
      id_sucursal: sucursalId,
      id_servicio: servicioSeleccionado?.id_servicio, // Agregar el ID del servicio
    };
    
    await onSave(valuesWithIds);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[95vw] max-w-md md:max-w-lg -translate-x-1/2 -translate-y-1/2 z-50">
          {/* Cambiamos qoder-dark-card por qoder-dark-window para evitar el hover effect */}
          <div className="qoder-dark-window max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="qoder-dark-window-header-modal pt-4 pb-2 px-6">
              {isEdit ? "Editar turno" : "Nuevo turno"}
            </Dialog.Title>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 pt-2">
              <div>
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">Fecha</label>
                <CustomDatePicker
                  value={values.fecha || ""}
                  onChange={(date) => update("fecha", date)}
                  min={today} // Deshabilitar fechas anteriores a hoy
                  disabled={!sucursalId} // Deshabilitar si no hay sucursal seleccionada
                  isDateDisabled={(date) => {
                    // Si no hay sucursal seleccionada, deshabilitar todas las fechas
                    if (!sucursalId) {
                      return true;
                    }
                    
                    // Verificar si la fecha está en el pasado
                    if (date < new Date(today)) {
                      return true;
                    }
                    
                    // Aquí podríamos agregar la verificación de disponibilidad de la sucursal
                    // pero como este componente no tiene acceso a los horarios, dejamos esta
                    // verificación para cuando se selecciona la fecha
                    return false;
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">Barbero</label>
                {isAdmin ? (
                  // Para administradores, mostrar el selector de barberos
                  <select 
                    className="qoder-dark-select w-full p-3" 
                    value={values.barbero || ""} 
                    onChange={(e) => update("barbero", e.target.value)}
                    disabled={isLoadingBarberos || !sucursalId}
                  >
                    <option value="">Seleccionar barbero</option>
                    {isLoadingBarberos ? (
                      <option value="" disabled>Cargando barberos...</option>
                    ) : barberos && barberos.length > 0 ? (
                      barberos.map((barbero) => (
                        <option key={barbero.id_barbero} value={barbero.nombre}>
                          {barbero.nombre}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No hay barberos disponibles</option>
                    )}
                  </select>
                ) : (
                  // Para barberos normales, mostrar solo el nombre del barbero actual (no editable)
                  <div className="qoder-dark-input w-full p-3 bg-qoder-dark-bg-secondary text-qoder-dark-text-primary">
                    {barberoActual?.nombre || "Cargando..."}
                  </div>
                )}
                {isLoadingBarberos && (
                  <p className="text-xs text-qoder-dark-text-secondary mt-1">Cargando barberos...</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">Servicio</label>
                <select 
                  className="qoder-dark-select w-full p-3" 
                  value={values.servicio || ""} 
                  onChange={(e) => update("servicio", e.target.value)}
                  disabled={isLoadingServicios || (servicios && servicios.length === 0) || !sucursalId}
                >
                  <option value="">Seleccionar servicio</option>
                  {isLoadingServicios ? (
                    <option value="" disabled>Cargando servicios...</option>
                  ) : availableServices && availableServices.length > 0 ? (
                    availableServices.map((service) => (
                      <option 
                        key={service.value || "empty"} 
                        value={service.value} 
                        disabled={service.disabled}
                      >
                        {service.label}
                        {service.disabled && service.value ? " - No disponible para esta hora" : ""}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {servicios && servicios.length === 0 
                        ? "No hay servicios disponibles" 
                        : "No hay servicios disponibles para esta hora"}
                    </option>
                  )}
                </select>
                {(servicios && servicios.length === 0) && (
                  <p className="text-xs text-qoder-dark-text-secondary mt-1">
                    No hay servicios disponibles. Agregue servicios en la sección "Mi Barbería".
                  </p>
                )}
                {isLoadingServicios && (
                  <p className="text-xs text-qoder-dark-text-secondary mt-1">
                    Cargando servicios...
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">Hora</label>
                <select 
                  className="w-full qoder-dark-select p-3" 
                  value={values.hora || ""} 
                  onChange={(e) => update("hora", (e.target.value + ":00") as Appointment["hora"])}
                  disabled={!sucursalId || !values.fecha || !values.servicio || (isAdmin && !values.barbero)}
                >
                  <option value="">Seleccionar hora</option>
                  {availableTimes.length > 0 ? (
                    availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {servicios && servicios.length === 0 
                        ? "No hay servicios disponibles" 
                        : !sucursalId
                        ? "Seleccione una sucursal primero"
                        : !values.fecha
                        ? "Seleccione una fecha primero"
                        : !values.servicio
                        ? "Seleccione un servicio primero"
                        : isAdmin && !values.barbero
                        ? "Seleccione un barbero primero"
                        : !horariosSucursal || horariosSucursal.length === 0
                        ? "No hay horarios definidos para esta sucursal"
                        : "No hay horarios disponibles"}
                    </option>
                  )}
                </select>
                {availableTimes.length === 0 && (
                  <p className="text-xs text-qoder-dark-text-secondary mt-1">
                    {servicios && servicios.length === 0 
                      ? "Agregue servicios en la sección 'Mi Barbería' para poder programar turnos."
                      : !sucursalId
                      ? "Para programar un turno, primero debe seleccionar una sucursal."
                      : !values.fecha
                      ? "Para programar un turno, primero debe seleccionar una fecha."
                      : !values.servicio
                      ? "Para programar un turno, primero debe seleccionar un servicio."
                      : isAdmin && !values.barbero
                      ? "Para programar un turno, primero debe seleccionar un barbero."
                      : !horariosSucursal || horariosSucursal.length === 0
                      ? "No hay horarios definidos para esta sucursal. Configure los horarios en la sección 'Mi Barbería'."
                      : "No hay horarios disponibles para la fecha seleccionada."}
                  </p>
                )}
              </div>
              
              {/* Selector de cliente o creación de nuevo cliente */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">Cliente</label>
                {isCreatingNewClient ? (
                  <div className="space-y-2">
                    <input 
                      className="w-full qoder-dark-input p-3 mb-2" 
                      value={newClientData.nombre} 
                      onChange={(e) => handleNewClientChange("nombre", e.target.value)}
                      placeholder="Nombre completo"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input 
                        className="w-full qoder-dark-input p-3" 
                        value={newClientData.telefono} 
                        onChange={(e) => handleNewClientChange("telefono", e.target.value)}
                        placeholder="Teléfono"
                      />
                      <input 
                        className="w-full qoder-dark-input p-3" 
                        value={newClientData.email} 
                        onChange={(e) => handleNewClientChange("email", e.target.value)}
                        placeholder="Email (opcional)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewClient(false)}
                      className="text-sm text-qoder-dark-accent-primary hover:underline"
                    >
                      Seleccionar cliente existente
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select 
                      className="w-full qoder-dark-select p-3" 
                      value={values.id_cliente || ""} 
                      onChange={(e) => handleClientChange(e.target.value)}
                      disabled={isLoadingClientes}
                    >
                      <option value="">Seleccionar cliente</option>
                      {isLoadingClientes ? (
                        <option value="" disabled>Cargando clientes...</option>
                      ) : (
                        <>
                          {clientes?.map((cliente) => (
                            <option key={cliente.id_cliente} value={cliente.id_cliente}>
                              {cliente.nombre} - {cliente.telefono || cliente.id_cliente}
                            </option>
                          ))}
                          <option value="new">+ Crear nuevo cliente</option>
                        </>
                      )}
                    </select>
                    {isLoadingClientes && (
                      <p className="text-xs text-qoder-dark-text-secondary">Cargando clientes...</p>
                    )}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">Notas</label>
                <textarea 
                  className="w-full qoder-dark-input p-3 h-20 resize-none" 
                  value={values.nota || ""} 
                  onChange={(e) => update("nota", e.target.value as Appointment["nota"])}
                  placeholder="Notas adicionales sobre el turno..."
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between p-6 pt-0">
              {onDelete && isEdit ? (
                <button 
                  className="qoder-dark-button px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition" 
                  onClick={async () => {
                    await onDelete?.();
                    onOpenChange(false);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Eliminar</span>
                </button>
              ) : (
                <div></div>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="qoder-dark-button px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
                >
                  <span>Cancelar</span>
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    // Si estamos creando un nuevo cliente, podríamos manejarlo aquí
                    // Por ahora, solo guardamos el turno
                    await handleSave(values);
                    onOpenChange(false);
                  }} 
                  className="qoder-dark-button-primary px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
                >
                  <span>{isEdit ? "Actualizar" : "Crear turno"}</span>
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
