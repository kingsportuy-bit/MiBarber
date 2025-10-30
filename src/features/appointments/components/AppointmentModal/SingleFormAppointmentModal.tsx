"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect, useMemo } from "react";
import type { Appointment, Client, Service, Barbero } from "@/types/db";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { useClientes } from "@/hooks/useClientes";
import { useServiciosListPorSucursal } from "@/hooks/useServiciosListPorSucursal";
import { useBarberosList } from "@/hooks/useBarberosList";
import { useCitas } from "@/hooks/useCitas";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales"; // Importar useHorariosSucursales
import { getLocalDateString } from "@/utils/dateUtils";

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
  initial,
  onSave,
  sucursalId: propSucursalId,
}: SingleFormAppointmentModalProps) {
  const { idBarberia, isAdmin, barbero: barberoActual } = useBarberoAuth();
  const { sucursales: allSucursales, isLoading: isLoadingSucursales } = useSucursales(idBarberia || undefined);
  
  // Estados para los campos del formulario
  const [selectedSucursalId, setSelectedSucursalId] = useState<string | undefined>(propSucursalId);
  const [isInitialSelectionDone, setIsInitialSelectionDone] = useState(false);
  const [clientId, setClientId] = useState<string | null>(initial?.id_cliente || null);
  const [clientName, setClientName] = useState<string>(initial?.cliente_nombre || "");
  const [serviceId, setServiceId] = useState<string | null>(initial?.id_servicio || null);
  const [serviceName, setServiceName] = useState<string>(initial?.servicio || "");
  const [barberId, setBarberId] = useState<string | null>(initial?.id_barbero || null);
  const [barberName, setBarberName] = useState<string>(initial?.barbero || "");
  const [date, setDate] = useState<string>(initial?.fecha || getLocalDateString(new Date()));
  const [time, setTime] = useState<string>(initial?.hora || "");
  const [note, setNote] = useState<string>(initial?.nota || "");
  const [clientPhone, setClientPhone] = useState<string | null>(initial?.telefono || null);
  const [showQuickClientForm, setShowQuickClientForm] = useState(false);
  const [quickClientData, setQuickClientData] = useState({
    nombre: "",
    telefono: "",
  });
  
  // Preseleccionar la sucursal cuando se carguen las sucursales
  useEffect(() => {
    if (allSucursales && allSucursales.length > 0 && !isInitialSelectionDone && !propSucursalId) {
      // Para barberos normales, seleccionar automáticamente su sucursal
      if (!isAdmin && barberoActual?.id_sucursal) {
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
    }
  }, [propSucursalId, selectedSucursalId]);

  // Hooks para obtener datos
  const { data: clientesData, isLoading: isLoadingClientes, createMutation: createClientMutation } = useClientes(
    undefined, 
    "ultimo_agregado", 
    selectedSucursalId
  );
  
  const { data: serviciosData, isLoading: isLoadingServicios } = useServiciosListPorSucursal(selectedSucursalId);
  const { data: barberosData, isLoading: isLoadingBarberos } = useBarberosList(idBarberia || undefined, selectedSucursalId);
  
  // Obtener citas existentes para verificar disponibilidad
  const { data: citasData, isLoading: isLoadingCitas } = useCitas({
    sucursalId: selectedSucursalId,
    fecha: date,
    barberoId: barberId || undefined,
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

  // Generar horas disponibles basadas en la sucursal, barbero, servicio y citas existentes
  const generateAvailableTimes = () => {
    console.log("=== INICIO GENERATE AVAILABLE TIMES (REAL) ===");
    console.log("selectedSucursalId:", selectedSucursalId);
    console.log("serviciosData length:", serviciosData?.length);
    console.log("date:", date);
    console.log("serviceName:", serviceName);
    console.log("barberName:", barberName);
    console.log("isAdmin:", isAdmin);
    console.log("barberoActual:", barberoActual);
    console.log("barberoActual?.id_barbero:", barberoActual?.id_barbero);
    console.log("initial?.id_cita:", initial?.id_cita);
    console.log("time (de la cita existente):", time);

    // Verificar que tengamos todos los datos necesarios
    // Para barberos no administradores, el barbero ya está establecido automáticamente
    const tieneBarbero =
      barberName || (!isAdmin && barberoActual?.id_barbero);
    console.log("tieneBarbero:", tieneBarbero);

    // Requerir sucursal y fecha como mínimo
    if (!selectedSucursalId || !date) {
      console.log("=== FALTAN DATOS MÍNIMOS PARA GENERAR HORARIOS ===");
      console.log("Datos mínimos:", {
        selectedSucursalId,
        fecha: date,
      });
      console.log("=== FIN FALTAN DATOS MÍNIMOS ===");
      return [];
    }

    // Si tenemos servicios pero no hay ninguno, devolver array vacío
    if (serviciosData && serviciosData.length === 0) {
      console.log("No hay servicios disponibles");
      return [];
    }

    // Si no hay barbero seleccionado, devolver array vacío
    if (!tieneBarbero) {
      console.log("No hay barbero seleccionado");
      return [];
    }

    // Obtener el servicio seleccionado para obtener su duración
    const servicioSeleccionado = serviciosData?.find(
      (s) => s.nombre === serviceName,
    );
    const duracionServicio = servicioSeleccionado
      ? servicioSeleccionado.duracion_minutos
      : 30; // Por defecto 30 minutos

    console.log("Servicio seleccionado:", servicioSeleccionado);
    console.log("Duración del servicio:", duracionServicio);

    // Si no se puede determinar la duración del servicio, usar 30 minutos por defecto
    const duracionReal =
      duracionServicio && duracionServicio > 0 ? duracionServicio : 30;

    console.log("Generando horarios con duración:", duracionReal);

    // Obtener horario de la sucursal desde los horarios de sucursal
    let horaInicio = 9;
    let horaFin = 20;
    let horaInicioTarde = 13; // Hora de inicio de la tarde (por defecto)
    let horaFinManana = 12; // Hora de fin de la mañana (por defecto)
    let diasAbierto = true; // Por defecto asumir que está abierto

    // Verificar si tenemos horarios de sucursal
    if (horariosSucursal && horariosSucursal.length > 0) {
      // Obtener el día de la semana de la fecha seleccionada (0 = Domingo, 1 = Lunes, etc.)
      // Usar el mismo método que en dateUtils para mantener consistencia
      const [year, month, day] = date.split("-").map(Number);
      const selectedDateObj = new Date(year, month - 1, day); // Mes es 0-indexado en Date
      // Ajustar manualmente a UTC-3 (Uruguay) para mantener consistencia con dateUtils
      selectedDateObj.setMinutes(
        selectedDateObj.getMinutes() +
          selectedDateObj.getTimezoneOffset() +
          -180,
      );
      const dayOfWeek = selectedDateObj.getDay();

      // Ahora JavaScript y la base de datos usan el mismo esquema:
      // 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
      const diaId = dayOfWeek;

      console.log("Día de la semana seleccionado:", dayOfWeek);
      console.log("ID del día para la base de datos:", diaId);

      // Buscar el horario para el día correcto
      const horarioDelDia = horariosSucursal.find(
        (h) => h.id_dia === diaId && h.activo,
      );

      console.log("Horario del día encontrado:", horarioDelDia);

      // Verificar si la sucursal está cerrada ese día
      if (!horarioDelDia) {
        diasAbierto = false;
      } else {
        // Parsear las horas de apertura y cierre
        try {
          // Extraer horas y minutos de apertura
          const [horaApertura, minutoApertura] = horarioDelDia.hora_apertura
            .split(":")
            .map(Number);
          horaInicio = horaApertura;

          // Extraer horas y minutos de cierre
          const [horaCierre, minutoCierre] = horarioDelDia.hora_cierre
            .split(":")
            .map(Number);
          horaFin = horaCierre;

          // Verificar si hay horario de almuerzo
          if (
            horarioDelDia.hora_inicio_almuerzo &&
            horarioDelDia.hora_fin_almuerzo
          ) {
            const [horaInicioAlmuerzo, minutoInicioAlmuerzo] =
              horarioDelDia.hora_inicio_almuerzo.split(":").map(Number);
            const [horaFinAlmuerzo, minutoFinAlmuerzo] =
              horarioDelDia.hora_fin_almuerzo.split(":").map(Number);

            horaFinManana = horaInicioAlmuerzo;
            horaInicioTarde = horaFinAlmuerzo;
          } else {
            // No hay descanso
            horaFinManana = horaFin;
            horaInicioTarde = horaFin;
          }
        } catch (e) {
          console.warn("Error al parsear horario de sucursal:", e);
        }
      }
    } else {
      // Si no hay horarios definidos, asumir que está cerrado
      diasAbierto = false;
    }

    console.log("Horario de sucursal:", {
      horaInicio,
      horaFin,
      horaInicioTarde,
      horaFinManana,
      diasAbierto,
    });

    // Si la sucursal no está abierta ese día, devolver array vacío
    if (!diasAbierto) {
      console.log("La sucursal no está abierta ese día");
      return [];
    }

    const times: string[] = [];

    // Función para verificar si un horario está ocupado considerando la duración del servicio
    const isTimeSlotOccupied = (hour: number, minute: number): boolean => {
      // Si no hay datos de citas, no marcar como ocupado
      if (!citasData || citasData.length === 0) {
        return false;
      }

      // Convertir a string con formato HH:mm
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

      // Verificar si hay alguna cita que se solape con este horario
      const occupied = citasData.some((cita: Appointment) => {
        // Solo considerar citas del mismo barbero
        // Para barberos no administradores, usar el ID del barbero actual
        const idBarberoActual =
          !isAdmin && barberoActual?.id_barbero
            ? barberoActual.id_barbero
            : barberId;
        if (cita.id_barbero !== idBarberoActual) {
          return false;
        }

        // Solo considerar citas de la misma fecha
        if (cita.fecha !== date) {
          return false;
        }

        // Si estamos editando una cita, ignorar la propia cita que estamos editando
        if (initial?.id_cita && cita.id_cita === initial?.id_cita) {
          console.log(`Ignorando cita propia durante edición: ${cita.id_cita}`);
          return false;
        }

        // Obtener la hora de la cita
        const citaHora = cita.hora?.slice(0, 5);
        if (!citaHora) return false;

        // Encontrar el servicio de la cita para obtener su duración
        const servicioCita = serviciosData?.find((s) => s.nombre === cita.servicio);
        const duracionCita = servicioCita ? servicioCita.duracion_minutos : 30; // Por defecto 30 minutos

        // Convertir la hora de la cita a minutos desde medianoche
        const [citaHour, citaMinute] = citaHora.split(":").map(Number);
        const citaStartMinutes = citaHour * 60 + citaMinute;
        const citaEndMinutes = citaStartMinutes + (duracionCita || 30);

        // Convertir la hora que estamos verificando a minutos desde medianoche
        const checkMinutes = hour * 60 + minute;
        const checkEndMinutes = checkMinutes + duracionReal;

        // Verificar si hay solapamiento
        // Hay solapamiento si el inicio de uno es menor que el fin del otro y viceversa
        const isOverlapping =
          checkMinutes < citaEndMinutes && checkEndMinutes > citaStartMinutes;
        if (isOverlapping) {
          console.log(
            `Horario ${timeString} solapado con cita de ${citaHora} (duración ${duracionCita} min)`,
          );
        }
        return isOverlapping;
      });

      return occupied;
    };

    // Calcular la hora mínima para el día actual (hora actual + 30 minutos de gracia)
    let minHour = 0;
    let minMinute = 0;
    const todayStr = getLocalDateString();
    const isToday = date === todayStr;

    console.log("=== DEBUG FECHA ===");
    console.log("date:", date);
    console.log("todayStr:", todayStr);
    console.log("isToday:", isToday);
    console.log("=== FIN DEBUG FECHA ===");

    // Para el día actual, calcular la hora mínima (hora actual + 30 minutos de gracia)
    if (isToday) {
      const now = new Date();
      // Ajustar a la zona horaria local
      now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + -180);

      // Sumar 30 minutos de gracia
      const minTime = now.getHours() * 60 + now.getMinutes() + 30;
      minHour = Math.floor(minTime / 60);
      minMinute = minTime % 60;

      // Redondear al siguiente bloque de 30 minutos (:00 o :30)
      if (minMinute > 0 && minMinute <= 30) {
        minMinute = 30;
      } else if (minMinute > 30) {
        minMinute = 0;
        minHour += 1;
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

      console.log(
        "Hora mínima para hoy (redondeada):",
        minHour,
        ":",
        minMinute,
      );
    }

    console.log("Citas obtenidas:", citasData?.length);
    console.log(
      "Citas para este barbero y fecha:",
      citasData?.filter(
        (c) =>
          c.id_barbero === barberId &&
          c.fecha === date,
      ).length,
    );

    // Generar horarios dentro del rango de la sucursal (mañana)
    let morningSlotsGenerated = 0;
    let morningSlotsAvailable = 0;
    for (let hour = horaInicio; hour < horaFinManana; hour++) {
      // Generar bloques de 30 minutos (:00 y :30) - siempre en bloques de 30 minutos
      for (let minute = 0; minute < 60; minute += 30) {
        morningSlotsGenerated++;
        // Verificar que el horario más la duración del servicio no exceda el horario de descanso
        const slotStartMinutes = hour * 60 + minute;
        const slotEndMinutes = slotStartMinutes + duracionReal;
        const finMananaMinutes = horaFinManana * 60;
        
        // Si el fin del servicio excede el inicio del descanso, no ofrecer este horario
        if (slotEndMinutes > finMananaMinutes) {
          console.log(`Horario mañana ${hour}:${minute} excede horario de descanso`);
          continue;
        }
        
        // Si es hoy, solo mostrar horas futuras (hora actual + 30 minutos de gracia, redondeada)
        if (isToday) {
          // Solo agregar horas futuras o iguales al tiempo mínimo
          if (hour > minHour || (hour === minHour && minute >= minMinute)) {
            // Verificar si este slot está ocupado considerando la duración real del servicio seleccionado
            if (!isTimeSlotOccupied(hour, minute)) {
              const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
              times.push(timeString);
              morningSlotsAvailable++;
              console.log(`Agregado horario mañana: ${timeString}`);
            } else {
              console.log(`Horario mañana ocupado: ${hour}:${minute}`);
            }
          } else {
            console.log(
              `Horario mañana pasado: ${hour}:${minute} (mínimo: ${minHour}:${minMinute})`,
            );
          }
        } else {
          // Para fechas futuras, mostrar todos los horarios que no estén ocupados
          if (!isTimeSlotOccupied(hour, minute)) {
            const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
            times.push(timeString);
            morningSlotsAvailable++;
            console.log(`Agregado horario mañana futuro: ${timeString}`);
          } else {
            console.log(`Horario mañana futuro ocupado: ${hour}:${minute}`);
          }
        }
      }
    }
    console.log(
      "Slots generados en la mañana:",
      morningSlotsGenerated,
      "disponibles:",
      morningSlotsAvailable,
    );

    // Generar horarios dentro del rango de la sucursal (tarde)
    // Verificar si hay un descanso real (más de 30 minutos de diferencia)
    const tieneDescanso = horaInicioTarde - horaFinManana > 0.5;
    console.log(
      "Tiene descanso:",
      tieneDescanso,
      "horaInicioTarde:",
      horaInicioTarde,
      "horaFinManana:",
      horaFinManana,
    );

    let afternoonSlotsGenerated = 0;
    let afternoonSlotsAvailable = 0;
    if (tieneDescanso) {
      for (let hour = horaInicioTarde; hour <= horaFin; hour++) {
        // Para la última hora, generar horarios hasta el límite de cierre menos la duración del servicio
        const maxMinutes = hour === horaFin ? 60 - duracionReal : 59;

        // Generar bloques de 30 minutos (:00 y :30) - siempre en bloques de 30 minutos
        for (
          let minute = 0;
          minute <= maxMinutes &&
          hour * 60 + minute <= horaFin * 60 - duracionReal;
          minute += 30
        ) {
          afternoonSlotsGenerated++;
          // Verificar que el horario más la duración del servicio no exceda el horario de cierre
          const slotStartMinutes = hour * 60 + minute;
          const slotEndMinutes = slotStartMinutes + duracionReal;
          const finDiaMinutes = horaFin * 60;
          
          // Si el fin del servicio excede el cierre, no ofrecer este horario
          if (slotEndMinutes > finDiaMinutes) {
            console.log(`Horario tarde ${hour}:${minute} excede horario de cierre`);
            continue;
          }
          
          // Si es hoy, solo mostrar horas futuras (hora actual + 30 minutos de gracia, redondeada)
          if (isToday) {
            // Solo agregar horas futuras o iguales al tiempo mínimo
            if (hour > minHour || (hour === minHour && minute >= minMinute)) {
              // Verificar si este slot está ocupado considerando la duración real del servicio seleccionado
              if (!isTimeSlotOccupied(hour, minute)) {
                const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                times.push(timeString);
                afternoonSlotsAvailable++;
                console.log(
                  `Agregado horario tarde con descanso: ${timeString}`,
                );
              } else {
                console.log(
                  `Horario tarde con descanso ocupado: ${hour}:${minute}`,
                );
              }
            } else {
              console.log(
                `Horario tarde con descanso pasado: ${hour}:${minute} (mínimo: ${minHour}:${minMinute})`,
              );
            }
          } else {
            // Para fechas futuras, mostrar todos los horarios que no estén ocupados
            if (!isTimeSlotOccupied(hour, minute)) {
              const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
              times.push(timeString);
              afternoonSlotsAvailable++;
              console.log(
                `Agregado horario tarde con descanso futuro: ${timeString}`,
              );
            } else {
              console.log(
                `Horario tarde con descanso futuro ocupado: ${hour}:${minute}`,
              );
            }
          }
        }
      }
    } else {
      // Si no hay descanso real, continuar generando horarios desde la mañana hasta la tarde
      for (let hour = horaFinManana; hour <= horaFin; hour++) {
        // Para la última hora, generar horarios hasta el límite de cierre menos la duración del servicio
        const maxMinutes = hour === horaFin ? 60 - duracionReal : 59;

        // Generar bloques de 30 minutos (:00 y :30) - siempre en bloques de 30 minutos
        for (
          let minute = 0;
          minute <= maxMinutes &&
          hour * 60 + minute <= horaFin * 60 - duracionReal;
          minute += 30
        ) {
          afternoonSlotsGenerated++;
          // Verificar que el horario más la duración del servicio no exceda el horario de cierre
          const slotStartMinutes = hour * 60 + minute;
          const slotEndMinutes = slotStartMinutes + duracionReal;
          const finDiaMinutes = horaFin * 60;
          
          // Si el fin del servicio excede el cierre, no ofrecer este horario
          if (slotEndMinutes > finDiaMinutes) {
            console.log(`Horario tarde ${hour}:${minute} excede horario de cierre`);
            continue;
          }
          
          // Si es hoy, solo mostrar horas futuras (hora actual + 30 minutos de gracia, redondeada)
          if (isToday) {
            // Solo agregar horas futuras o iguales al tiempo mínimo
            if (hour > minHour || (hour === minHour && minute >= minMinute)) {
              // Verificar si este slot está ocupado considerando la duración real del servicio seleccionado
              if (!isTimeSlotOccupied(hour, minute)) {
                const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                times.push(timeString);
                afternoonSlotsAvailable++;
                console.log(
                  `Agregado horario tarde sin descanso: ${timeString}`,
                );
              } else {
                console.log(
                  `Horario tarde sin descanso ocupado: ${hour}:${minute}`,
                );
              }
            } else {
              console.log(
                `Horario tarde sin descanso pasado: ${hour}:${minute} (mínimo: ${minHour}:${minMinute})`,
              );
            }
          } else {
            // Para fechas futuras, mostrar todos los horarios que no estén ocupados
            if (!isTimeSlotOccupied(hour, minute)) {
              const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
              times.push(timeString);
              afternoonSlotsAvailable++;
              console.log(
                `Agregado horario tarde sin descanso futuro: ${timeString}`,
              );
            } else {
              console.log(
                `Horario tarde sin descanso futuro ocupado: ${hour}:${minute}`,
              );
            }
          }
        }
      }
    }
    console.log(
      "Slots generados en la tarde:",
      afternoonSlotsGenerated,
      "disponibles:",
      afternoonSlotsAvailable,
    );

    // Si estamos editando una cita, asegurarse de que la hora de la cita existente esté disponible
    if (initial?.id_cita && time) {
      const horaExistente = time.slice(0, 5); // Formato HH:MM
      console.log("Asegurando hora existente para edición:", horaExistente);

      // Verificar si la hora ya está en la lista
      if (!times.includes(horaExistente)) {
        console.log("Agregando hora existente a la lista:", horaExistente);
        // Agregar la hora existente al principio de la lista
        times.unshift(horaExistente);
      }
    }

    // Eliminar el código que agregaba forzosamente el horario 20:30
    // El último horario ahora se calcula automáticamente según la hora de cierre de la sucursal

    console.log("Horarios generados finales:", times);
    console.log("=== FIN GENERATE AVAILABLE TIMES (REAL) ===");
    return times;
  };

  // Generar las horas disponibles
  const availableTimes = useMemo(() => {
    return generateAvailableTimes();
  }, [selectedSucursalId, date, serviceName, barberName, citasData, initial?.id_cita, time, serviciosData, horariosSucursal, isAdmin, barberoActual?.id_barbero, barberId]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateQuickClient = async () => {
    if (!quickClientData.nombre.trim()) {
      alert("Por favor ingrese el nombre del cliente");
      return;
    }

    if (!selectedSucursalId) {
      alert("No se ha seleccionado una sucursal");
      return;
    }

    try {
      // Crear el cliente con los datos proporcionados
      const newClientArray: Client[] = (await createClientMutation.mutateAsync({
        nombre: quickClientData.nombre,
        telefono: quickClientData.telefono || undefined,
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
      // Validar campos requeridos
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

      // Obtener el servicio seleccionado para obtener duración y precio
      const selectedService = serviciosData?.find((s: Service) => s.id_servicio === serviceId);
      const duration = selectedService?.duracion_minutos ? selectedService.duracion_minutos.toString() : null;
      const ticket = selectedService?.precio || null;

      // Construir el objeto completo con todos los campos requeridos
      const appointmentData: Partial<Appointment> = {
        // Campos básicos
        fecha: date,
        hora: time,
        cliente_nombre: clientName,
        servicio: serviceName,
        barbero: barberName,
        telefono: clientPhone || null,
        nota: note || null,
        // Campos adicionales con valores por defecto si no están presentes
        estado: initial?.estado || "pendiente",
        id_cliente: clientId || null,
        id_servicio: serviceId || null,
        id_barbero: barberId || null,
        id_sucursal: selectedSucursalId,
        id_barberia: idBarberia || undefined,
        ticket: ticket || undefined,
        nro_factura: initial?.nro_factura || undefined,
        duracion: duration || undefined, // Solo el número sin la "m"
        notificacion_barbero: initial?.notificacion_barbero || undefined,
        notificacion_cliente: initial?.notificacion_cliente || undefined,
        metodo_pago: initial?.metodo_pago || undefined,
        created_at: initial?.created_at || undefined,
        updated_at: initial?.updated_at || undefined,
      };

      await onSave(appointmentData);
      onOpenChange(false);
      
      // Resetear el formulario
      setClientId(null);
      setClientName("");
      setServiceId(null);
      setServiceName("");
      setBarberId(null);
      setBarberName("");
      setDate(getLocalDateString(new Date()));
      setTime("");
      setNote("");
      setClientPhone(null);
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

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content 
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto rounded-xl p-4 md:p-6 bg-qoder-dark-bg-form border border-qoder-dark-border shadow-2xl focus:outline-none"
        >
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
                        cliente.nombre.toLowerCase().includes(clientName.toLowerCase()) ||
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
                className="mt-2 text-sm text-qoder-dark-accent-primary hover:underline"
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
                      onClick={handleCreateQuickClient}
                      className="qoder-dark-button px-3 py-1 text-sm rounded"
                    >
                      Crear
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQuickClientForm(false)}
                      className="cancel-button px-3 py-1 text-sm rounded"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Servicio */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                Servicio
              </label>
              <select
                value={serviceId || ""}
                onChange={(e) => {
                  const selectedService = serviciosData?.find((s: Service) => s.id_servicio === e.target.value);
                  setServiceId(e.target.value || null);
                  setServiceName(selectedService?.nombre || "");
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
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="qoder-dark-input w-full px-3 py-2 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                  Hora
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="qoder-dark-select w-full px-3 py-2 rounded-lg"
                  disabled={!serviceId || !barberId}
                >
                  <option value="">Seleccione una hora</option>
                  {availableTimes.map((timeOption) => (
                    <option key={timeOption} value={timeOption}>
                      {timeOption}
                    </option>
                  ))}
                </select>
                {availableTimes.length === 0 && serviceId && barberId && (
                  <p className="text-xs text-qoder-dark-text-secondary mt-1">
                    No hay horarios disponibles para la fecha seleccionada
                  </p>
                )}
              </div>
            </div>
            
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}