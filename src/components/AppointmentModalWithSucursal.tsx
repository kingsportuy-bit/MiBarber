"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect, useMemo } from "react";
import type { Appointment, Client } from "@/types/db";
import { useBarberosList } from "@/hooks/useBarberosList";
import { useServiciosListPorSucursal } from "@/hooks/useServiciosListPorSucursal";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import { useCitas } from "@/hooks/useCitas";
import { useClientes } from "@/hooks/useClientes";
import { getLocalDateString, convertJsDayToDbDay } from "@/utils/dateUtils";
import { SimpleCalendar } from "@/components/SimpleCalendar"; // Importar el componente de calendario

import { CustomDatePicker } from "@/components/CustomDatePicker"; // Agregar esta importación

// Función para redondear al siguiente bloque de 30 minutos
function roundToNext30Minutes(date: Date): Date {
  const minutes = date.getMinutes();
  // Si son las 19:07, sumamos 30 minutos = 19:37, el próximo bloque es 20:00
  // Si son las 16:15, sumamos 30 minutos = 16:45, el próximo bloque es 17:00
  const totalMinutes = minutes + 30;
  const nextHour = Math.floor(totalMinutes / 60);
  const nextMinuteBlock = totalMinutes % 60 <= 30 ? 30 : 0;
  const hoursToAdd = nextMinuteBlock === 0 && totalMinutes % 60 > 30 ? 1 : 0;

  date.setMinutes(nextMinuteBlock);
  date.setHours(date.getHours() + nextHour + hoursToAdd);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Appointment>;
  onSave: (values: Appointment) => Promise<void>;
  sucursalId?: string;
};

export function AppointmentModalWithSucursal({
  open,
  onOpenChange,
  initial,
  onSave,
  sucursalId: propSucursalId,
}: Props) {
  console.log("=== RENDERIZANDO AppointmentModalWithSucursal ===");
  console.log("open:", open);
  console.log("initial:", initial);
  console.log("propSucursalId:", propSucursalId);
  console.log("=== FIN RENDERIZANDO AppointmentModalWithSucursal ===");

  const [values, setValues] = useState<Partial<Appointment>>({});
  const [selectedSucursalId, setSelectedSucursalId] = useState<
    string | undefined
  >(propSucursalId);
  const [isInitialSelectionDone, setIsInitialSelectionDone] = useState(false); // Bandera para controlar la preseleccion inicial
  const [showCalendar, setShowCalendar] = useState(false); // Estado para controlar la visibilidad del calendario
  const { idBarberia, isAdmin, barbero: barberoActual } = useBarberoAuth();

  console.log("=== AUTH INFO ===");
  console.log("idBarberia:", idBarberia);
  console.log("isAdmin:", isAdmin);
  console.log("barberoActual:", barberoActual);
  console.log("=== FIN AUTH INFO ===");

  // Preseleccionar la sucursal cuando se carguen las sucursales
  // Solo preseleccionar si no se ha hecho la selección inicial y no hay una sucursal proporcionada
  const { sucursales: allSucursales, isLoading: isLoadingSucursales } =
    useSucursales(idBarberia || undefined);
    
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

  const { data: serviciosData, isLoading: isLoadingServicios } =
    useServiciosListPorSucursal(selectedSucursalId);
  const { data: allBarberos, isLoading: isLoadingBarberos } = useBarberosList(
    idBarberia,
    selectedSucursalId,
  );

  console.log("=== SERVICIOS Y BARBEROS ===");
  console.log("selectedSucursalId:", selectedSucursalId);
  console.log("serviciosData:", serviciosData);
  console.log("isLoadingServicios:", isLoadingServicios);
  console.log("allBarberos:", allBarberos);
  console.log("isLoadingBarberos:", isLoadingBarberos);
  console.log("=== FIN SERVICIOS Y BARBEROS ===");

  // Obtener horarios de la sucursal seleccionada
  const { horarios: horariosSucursal } =
    useHorariosSucursales(selectedSucursalId);
    
  // Obtener clientes para la sucursal seleccionada
  const {
    data: clientesData,
    isLoading: isLoadingClientes,
    createMutation,
  } = useClientes(undefined, "ultimo_agregado", selectedSucursalId);

  // Filtrar barberos según el servicio seleccionado
  const barberos = useMemo(() => {
    if (!allBarberos || !values.servicio || !serviciosData)
      return allBarberos || [];

    // Encontrar el servicio seleccionado
    const servicioSeleccionado = serviciosData.find(
      (s) => s.nombre === values.servicio,
    );
    if (!servicioSeleccionado) return allBarberos;

    // Si el servicio tiene barberos específicos asignados, filtrar por ellos
    // De lo contrario, mostrar todos los barberos
    if (servicioSeleccionado.id_servicio) {
      // Verificar si hay barberos con esta especialidad
      const barberosConEspecialidad = allBarberos.filter((barbero) =>
        barbero.especialidades?.includes(servicioSeleccionado.id_servicio),
      );

      // Si hay barberos con la especialidad, mostrar solo ellos
      // Si no hay barberos con la especialidad, mostrar todos los barberos
      return barberosConEspecialidad.length > 0
        ? barberosConEspecialidad
        : allBarberos;
    }

    return allBarberos;
  }, [allBarberos, values.servicio, serviciosData]);

  const servicios = serviciosData || [];
  const sucursales = allSucursales || [];
  const sucursalSeleccionada = sucursales.find(
    (s) => s.id === selectedSucursalId,
  );

  // Encontrar el ID del servicio seleccionado
  const selectedServicio = useMemo(() => {
    if (!values.servicio || !serviciosData) return null;
    return serviciosData.find((s) => s.nombre === values.servicio);
  }, [values.servicio, serviciosData]);

  // Encontrar el ID del barbero seleccionado
  const selectedBarbero = useMemo(() => {
    if (!values.barbero || !allBarberos) return null;
    // Para barberos no administradores, usar el barbero actual si no hay uno seleccionado
    if (!isAdmin && barberoActual?.id_barbero) {
      // Verificar si el barbero actual está en la lista de barberos
      const barberoEnLista = allBarberos.find(
        (b) => b.id_barbero === barberoActual.id_barbero,
      );
      if (barberoEnLista) {
        return barberoEnLista;
      }
    }

    // Para administradores o cuando no hay barbero actual, buscar por ID o nombre
    return allBarberos.find(
      (b) => b.id_barbero === values.barbero || b.nombre === values.barbero,
    );
  }, [values.barbero, allBarberos, isAdmin, barberoActual?.id_barbero]);

  console.log("=== DEBUG BARBERO ===");
  console.log("values.barbero:", values.barbero);
  console.log("allBarberos:", allBarberos?.length);
  console.log("selectedBarbero:", selectedBarbero);
  console.log("barberoActual:", barberoActual);
  console.log("isAdmin:", isAdmin);
  console.log("=== FIN DEBUG BARBERO ===");

  const isEdit = Boolean(initial?.id_cita);

  // Obtener la fecha de hoy para usar como mínimo en el selector de fecha usando la utilidad unificada
  const today = getLocalDateString();

  // Obtener citas para la sucursal y fecha seleccionadas
  // Para barberos no administradores, usar el ID del barbero actual
  const idBarberoParaCitas =
    !isAdmin && barberoActual?.id_barbero
      ? barberoActual.id_barbero
      : selectedBarbero?.id_barbero;

  const { data: citasData, isLoading: isLoadingCitas } = useCitas(
    selectedSucursalId,
    values.fecha,
    idBarberoParaCitas,
  );

  console.log("=== DEBUG CITAS ===");
  console.log("selectedSucursalId:", selectedSucursalId);
  console.log("values.fecha:", values.fecha);
  console.log("idBarberoParaCitas:", idBarberoParaCitas);
  console.log("selectedBarbero?.id_barbero:", selectedBarbero?.id_barbero);
  console.log("citasData:", citasData);
  console.log("isLoadingCitas:", isLoadingCitas);
  console.log("=== FIN DEBUG CITAS ===");

  function update<K extends keyof Appointment>(k: K, v: Appointment[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  // Efecto para cargar los datos iniciales
  useEffect(() => {
    console.log("=== EFECTO MODAL OPEN ===");
    console.log("open:", open);
    console.log("initial:", initial);
    console.log("isEdit:", isEdit);
    console.log("isAdmin:", isAdmin);
    console.log("barberoActual:", barberoActual);
    console.log("propSucursalId:", propSucursalId);
    console.log("selectedSucursalId:", selectedSucursalId);

    if (open) {
      console.log(
        "Inicializando valores, initial:",
        initial,
        "isEdit:",
        isEdit,
      );
      if (initial) {
        // Para nuevo turno o edición, usar los valores iniciales proporcionados
        const formattedInitial = {
          ...initial,
          hora: initial.hora ? initial.hora.slice(0, 5) : "",
          // Para barberos no administradores, verificar si el valor es un ID o nombre
          barbero: initial.barbero ? initial.barbero : "",
          // Eliminamos id_barbero ya que no existe en la tabla mibarber_citas
        };
        console.log("Estableciendo valores iniciales:", formattedInitial);
        setValues(formattedInitial);

        // Establecer la sucursal si se proporciona en initial
        if (
          initial.id_sucursal &&
          (!selectedSucursalId || selectedSucursalId !== initial.id_sucursal)
        ) {
          setSelectedSucursalId(initial.id_sucursal);
        }
      } else if (!isEdit) {
        // Establecer valores por defecto para nuevo turno (solo si no hay initial)
        const defaultFecha = getLocalDateString(); // Usar la utilidad unificada
        console.log("Estableciendo fecha por defecto:", defaultFecha);

        // Para barberos no administradores, establecer automáticamente el nombre del barbero
        const defaultBarbero =
          !isAdmin && barberoActual?.id_barbero
            ? allBarberos?.find(
                (b) => b.id_barbero === barberoActual.id_barbero,
              )?.nombre ||
              barberoActual.nombre ||
              ""
            : "";

        setValues({
          fecha: defaultFecha,
          barbero: defaultBarbero,
          // Inicializar hora vacía para nuevos turnos
          hora: "",
          // In Inicializar servicio vacío para nuevos turnos
          servicio: "",
          // Eliminamos id_barbero ya que no existe en la tabla mibarber_citas
        });

        console.log("Valores por defecto establecidos:", {
          fecha: defaultFecha,
          barbero: defaultBarbero,
        });
      }
    } else {
      console.log("Resetear valores y sucursal");
      // Resetear los valores cuando el modal se cierra
      setValues({});
      // Resetear la sucursal seleccionada si no es administrador
      if (!isAdmin) {
        setSelectedSucursalId(propSucursalId);
      }
    }
    console.log("=== FIN EFECTO MODAL OPEN ===");
  }, [
    open,
    initial,
    isEdit,
    isAdmin,
    barberoActual?.id_barbero,
    propSucursalId,
    selectedSucursalId,
  ]);

  // Añadir un efecto para depurar los valores
  useEffect(() => {
    console.log("=== VALORES ACTUALIZADOS ===");
    console.log("values:", values);
    console.log("fecha formateada:", values.fecha);
    console.log("fecha hoy:", getLocalDateString());
    console.log("es hoy:", values.fecha === getLocalDateString());
    console.log("=== FIN VALORES ACTUALIZADOS ===");
  }, [values]);

  // Añadir un efecto para actualizar la duración cuando cambia el servicio
  useEffect(() => {
    if (values.servicio && serviciosData) {
      const servicioSeleccionado = serviciosData.find(
        (s) => s.nombre === values.servicio
      );
      
      if (servicioSeleccionado) {
        // Actualizar la duración en los valores con solo el número como string
        setValues(prev => ({
          ...prev,
          duracion: servicioSeleccionado.duracion_minutos.toString()
        }));
      } else {
        // Si no se encuentra el servicio, limpiar la duración
        setValues(prev => ({
          ...prev,
          duracion: ""
        }));
      }
    } else if (!values.servicio) {
      // Si no hay servicio seleccionado, limpiar la duración
      setValues(prev => ({
        ...prev,
        duracion: ""
      }));
    }
  }, [values.servicio, serviciosData, setValues, allBarberos, barberoActual]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== INICIO HANDLE SUBMIT ===");
    console.log("Valores actuales:", values);
    console.log("ID de sucursal seleccionada:", selectedSucursalId);
    console.log("ID de barbería:", idBarberia);
    console.log("Es administrador:", isAdmin);
    console.log("Barbero actual:", barberoActual);

    // Validar campos requeridos
    // Para barberos no administradores, el barbero ya está establecido automáticamente
    const tieneBarbero =
      values.barbero || (!isAdmin && barberoActual?.id_barbero);

    if (
      !values.fecha ||
      !values.hora ||
      !values.cliente_nombre ||
      !values.servicio ||
      !tieneBarbero ||
      !selectedSucursalId
    ) {
      const errorMsg = "Por favor complete todos los campos requeridos";
      console.error("Error de validación:", errorMsg);
      console.error("Campos faltantes:", {
        fecha: values.fecha,
        hora: values.hora,
        cliente_nombre: values.cliente_nombre,
        servicio: values.servicio,
        barbero: values.barbero,
        id_sucursal: selectedSucursalId,
        tieneBarbero,
      });
      alert(errorMsg);
      return;
    }

    try {
      // Construir el objeto completo con todos los campos requeridos
      const valuesWithSucursal: any = {
        // Campos básicos
        fecha: values.fecha,
        hora: values.hora,
        cliente_nombre: values.cliente_nombre,
        servicio: values.servicio,
        // Para barberos no administradores, usar el nombre del barbero actual si no hay uno seleccionado
        // Si ya tenemos un valor de barbero (ID), mantenerlo como está
        barbero:
          values.barbero ||
          (!isAdmin && barberoActual?.id_barbero
            ? allBarberos?.find(
                (b) => b.id_barbero === barberoActual.id_barbero,
              )?.nombre ||
              barberoActual.nombre ||
              ""
            : ""),
        // Campos adicionales con valores por defecto si no están presentes
        estado: values.estado || "pendiente",
        nota: values.nota || null,
        id_cliente: values.id_cliente || null,
        ticket: selectedServicio?.precio || values.ticket || null,
        nro_factura: values.nro_factura || null,
        duracion: values.duracion || null,
        // Campos de identificación
        id_sucursal: selectedSucursalId,
        id_barberia: idBarberia || undefined,
        // Agregar IDs del barbero y servicio si están disponibles
        id_barbero:
          selectedBarbero?.id_barbero ||
          (!isAdmin && barberoActual?.id_barbero
            ? barberoActual.id_barbero
            : null),
        id_servicio: selectedServicio?.id_servicio || null,
      };

      // Eliminar campos undefined
      Object.keys(valuesWithSucursal).forEach((key) => {
        if (valuesWithSucursal[key] === undefined) {
          delete valuesWithSucursal[key];
        }
      });

      console.log("Valores con sucursal:", valuesWithSucursal);

      // Validación final de campos requeridos
      // Para barberos no administradores, el barbero ya está establecido automáticamente
      const tieneBarberoFinal =
        valuesWithSucursal.barbero || (!isAdmin && barberoActual?.id_barbero);
      const requiredFields = [
        "fecha",
        "hora",
        "cliente_nombre",
        "servicio",
        "barbero",
        "id_sucursal",
      ];
      const missingFields = requiredFields.filter((field) => {
        // Para el campo barbero, verificar si se cumple la condición especial
        if (field === "barbero") {
          return !tieneBarberoFinal;
        }
        return !valuesWithSucursal[field as keyof typeof valuesWithSucursal];
      });

      if (missingFields.length > 0) {
        const errorMsg = `Faltan campos requeridos: ${missingFields.join(", ")}`;
        console.error("Error de validación:", errorMsg);
        throw new Error(errorMsg);
      }

      console.log("Llamando a onSave con:", valuesWithSucursal);
      await onSave(valuesWithSucursal);
      console.log("Turno guardado exitosamente");
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar el turno:", error);
      console.error("Tipo de error:", typeof error);
      console.error("Error detallado:", JSON.stringify(error, null, 2));

      // Mostrar un mensaje más específico del error
      if (error instanceof Error) {
        alert(`Error al guardar el turno: ${error.message}`);
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        alert(`Error al guardar el turno: ${(error as any).message}`);
      } else {
        alert("Error al guardar el turno. Por favor intente nuevamente.");
      }
    } finally {
      console.log("=== FIN HANDLE SUBMIT ===");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Generar horas disponibles basadas en la sucursal, barbero y citas existentes
  const generateAvailableTimes = () => {
    console.log("=== INICIO GENERATE AVAILABLE TIMES (REAL) ===");
    console.log("selectedSucursalId:", selectedSucursalId);
    console.log("servicios length:", servicios?.length);
    console.log("values.fecha:", values.fecha);
    console.log("values.servicio:", values.servicio);
    console.log("values.barbero:", values.barbero);
    console.log("isAdmin:", isAdmin);
    console.log("barberoActual:", barberoActual);
    console.log("barberoActual?.id_barbero:", barberoActual?.id_barbero);
    console.log("isEdit:", isEdit);
    console.log("values.hora (de la cita existente):", values.hora);

    // Verificar que tengamos todos los datos necesarios
    // Para barberos no administradores, el barbero ya está establecido automáticamente
    const tieneBarbero =
      values.barbero || (!isAdmin && barberoActual?.id_barbero);
    console.log("tieneBarbero:", tieneBarbero);

    // Requerir sucursal y fecha como mínimo
    if (!selectedSucursalId || !values.fecha) {
      console.log("=== FALTAN DATOS MÍNIMOS PARA GENERAR HORARIOS ===");
      console.log("Datos mínimos:", {
        selectedSucursalId,
        fecha: values.fecha,
      });
      console.log("=== FIN FALTAN DATOS MÍNIMOS ===");
      return [];
    }

    // Si tenemos servicios pero no hay ninguno, devolver array vacío
    if (servicios && servicios.length === 0) {
      console.log("No hay servicios disponibles");
      return [];
    }

    // Si no hay barbero seleccionado, devolver array vacío
    if (!tieneBarbero) {
      console.log("No hay barbero seleccionado");
      return [];
    }

    // Obtener el servicio seleccionado para obtener su duración
    const servicioSeleccionado = servicios?.find(
      (s) => s.nombre === values.servicio,
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
      const [year, month, day] = values.fecha.split("-").map(Number);
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
            : selectedBarbero?.id_barbero;
        if (cita.id_barbero !== idBarberoActual) {
          return false;
        }

        // Solo considerar citas de la misma fecha
        if (cita.fecha !== values.fecha) {
          return false;
        }

        // Si estamos editando una cita, ignorar la propia cita que estamos editando
        if (isEdit && cita.id_cita === initial?.id_cita) {
          console.log(`Ignorando cita propia durante edición: ${cita.id_cita}`);
          return false;
        }

        // Obtener la hora de la cita
        const citaHora = cita.hora?.slice(0, 5);
        if (!citaHora) return false;

        // Encontrar el servicio de la cita para obtener su duración
        const servicioCita = servicios?.find((s) => s.nombre === cita.servicio);
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
    const isToday = values.fecha === todayStr;

    console.log("=== DEBUG FECHA ===");
    console.log("values.fecha:", values.fecha);
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
          c.id_barbero === selectedBarbero?.id_barbero &&
          c.fecha === values.fecha,
      ).length,
    );

    // Generar horarios dentro del rango de la sucursal (mañana)
    let morningSlotsGenerated = 0;
    let morningSlotsAvailable = 0;
    for (let hour = horaInicio; hour < horaFinManana; hour++) {
      // Generar bloques de 30 minutos (:00 y :30) - siempre en bloques de 30 minutos
      for (let minute = 0; minute < 60; minute += 30) {
        morningSlotsGenerated++;
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
    if (isEdit && values.hora) {
      const horaExistente = values.hora.slice(0, 5); // Formato HH:MM
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
  }, [generateAvailableTimes]);

  console.log("=== DEBUG MODAL STATE ===");
  console.log("selectedSucursalId:", selectedSucursalId);
  console.log("values.fecha:", values.fecha);
  console.log("values.barbero:", values.barbero);
  console.log("values.servicio:", values.servicio);
  console.log("isAdmin:", isAdmin);
  console.log("barberoActual:", barberoActual);
  console.log("barberoActual?.id_barbero:", barberoActual?.id_barbero);
  console.log("availableTimes:", availableTimes);
  console.log("availableTimes length:", availableTimes.length);
  console.log(
    "Should disable hour field:",
    !selectedSucursalId ||
      !values.fecha ||
      (!isAdmin && !barberoActual?.id_barbero && !values.barbero) ||
      (isAdmin && !values.barbero),
  );
  console.log("=== END DEBUG ===");

  // Añadir efecto para verificar cuando cambian las dependencias importantes
  useEffect(() => {
    console.log("=== DEPENDENCIAS CAMBIADAS ===");
    console.log("selectedSucursalId:", selectedSucursalId);
    console.log("values.fecha:", values.fecha);
    console.log("values.barbero:", values.barbero);
    console.log("values.servicio:", values.servicio);
    console.log("isAdmin:", isAdmin);
    console.log("barberoActual:", barberoActual);
    console.log("=== FIN DEPENDENCIAS CAMBIADAS ===");
  }, [
    selectedSucursalId,
    values.fecha,
    values.barbero,
    values.servicio,
    isAdmin,
    barberoActual,
    barberoActual?.id_barbero
  ]);

  // Función para verificar si hay turnos disponibles para una fecha específica
  const hasAvailableTimesForDate = (date: string) => {
    console.log("Verificando disponibilidad para fecha:", date);
    // Verificar que tengamos todos los datos necesarios
    if (!selectedSucursalId || !servicios || servicios.length === 0) {
      console.log("No hay datos suficientes para verificar disponibilidad");
      return false;
    }

    // Obtener la duración del servicio más corto
    const duracionServicioMasCorto = Math.min(
      ...servicios.map((s) => s.duracion_minutos).filter((d) => d > 0),
    );

    if (!duracionServicioMasCorto || duracionServicioMasCorto <= 0) {
      console.log("No se pudo obtener la duración del servicio más corto");
      return false;
    }

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

      console.log("Día de la semana para disponibilidad:", dayOfWeek);
      console.log("ID del día para la base de datos:", diaId);

      const horarioDelDia = horariosSucursal.find(
        (h) => h.id_dia === diaId && h.activo,
      );

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
          let [horaCierre, minutoCierre] = horarioDelDia.hora_cierre
            .split(":")
            .map(Number);
          // Ajustar la hora de cierre para que el último turno sea 30 minutos antes
          if (minutoCierre >= 30) {
            minutoCierre -= 30;
          } else {
            horaCierre -= 1;
            minutoCierre += 30;
          }
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

    console.log("Horario para disponibilidad:", {
      horaInicio,
      horaFin,
      horaInicioTarde,
      horaFinManana,
      diasAbierto,
    });
    return diasAbierto;
  };

  // Función para verificar si una fecha está en el pasado
  const isDateInPast = (dateString: string) => {
    try {
      console.log("Verificando fecha:", dateString);
      const today = getLocalDateString();
      console.log("Hoy (desde getTodayDate):", today);

      // Comparar directamente las cadenas de fecha en formato YYYY-MM-DD
      const isPast = dateString < today;
      const isToday = dateString === today;

      console.log("Fecha es pasada:", isPast);
      console.log("Fecha es hoy:", isToday);

      // Permitir seleccionar el día de hoy
      if (isToday) {
        console.log("Permitiendo fecha de hoy");
        return false;
      }

      const result = isPast;
      console.log("Resultado final:", result);
      return result;
    } catch (error) {
      console.error("Error al parsear fecha:", error);
      return true; // Bloquear selección si hay error
    }
  };

  // Función para verificar si una fecha está disponible según los horarios de la sucursal
  const isDateAvailable = (dateString: string) => {
    // Si no hay sucursal seleccionada, permitir todas las fechas
    if (
      !selectedSucursalId ||
      !horariosSucursal ||
      horariosSucursal.length === 0
    ) {
      return true;
    }

    try {
      // Crear fecha
      const [year, month, day] = dateString.split("-").map(Number);
      const date = new Date(year, month - 1, day); // Mes es 0-indexado en Date
      // Ajustar manualmente a UTC-3 (Uruguay) para mantener consistencia con dateUtils
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + -180);

      // Obtener el día de la semana (0 = Domingo, 1 = Lunes, etc.)
      const dayOfWeek = date.getDay();

      // Ahora JavaScript y la base de datos usan el mismo esquema:
      // 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
      const diaId = dayOfWeek;

      // Verificar si hay un horario activo para este día
      const horarioActivo = horariosSucursal.find(
        (h) => h.id_dia === diaId && h.activo,
      );

      console.log(
        `Verificando disponibilidad para ${dateString} (día ${dayOfWeek}, ID ${diaId}):`,
        horarioActivo,
      );

      return !!horarioActivo;
    } catch (error) {
      console.error("Error al verificar disponibilidad de fecha:", error);
      return true; // Permitir selección si hay error
    }
  };

  // Función para obtener los días deshabilitados
  const getDisabledDates = () => {
    if (!selectedSucursalId || !horariosSucursal || horariosSucursal.length === 0) {
      return [];
    }

    // Obtener los días activos
    const activeDays = horariosSucursal
      .filter(horario => horario.activo)
      .map(horario => horario.id_dia);

    // Crear un array con todos los días de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
    const allDays = [0, 1, 2, 3, 4, 5, 6];
    
    // Encontrar los días inactivos
    const inactiveDays = allDays.filter(day => !activeDays.includes(day));
    
    return inactiveDays;
  };

  // Estado para el término de búsqueda de clientes
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para mostrar/ocultar el formulario de cliente rápido
  const [showQuickClientForm, setShowQuickClientForm] = useState(false);
  // Estado para los datos del cliente rápido
  const [quickClientData, setQuickClientData] = useState({
    nombre: "",
    telefono: "",
  });

  // Filtrar clientes según el término de búsqueda
  const filteredClientes = useMemo(() => {
    if (!clientesData || clientesData.length === 0) return [];

    if (!searchTerm) return clientesData;

    const term = searchTerm.toLowerCase();
    return clientesData.filter(
      (cliente: Client) =>
        cliente.nombre.toLowerCase().includes(term) ||
        (cliente.telefono && cliente.telefono.toLowerCase().includes(term)),
    );
  }, [clientesData, searchTerm]);

  // Función para crear un cliente rápido
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
      const newClientArray: Client[] = (await createMutation.mutateAsync({
        nombre: quickClientData.nombre,
        telefono: quickClientData.telefono || undefined,
        id_barberia: idBarberia,
        id_sucursal: selectedSucursalId,
      })) as Client[];

      // Tomar el primer cliente del array
      const newClient = newClientArray[0];

      // Actualizar los valores del turno con el nuevo cliente
      update("id_cliente", newClient.id_cliente);
      update("cliente_nombre", newClient.nombre);

      // Limpiar el formulario y ocultarlo
      setQuickClientData({ nombre: "", telefono: "" });
      setShowQuickClientForm(false);
      setSearchTerm(""); // Limpiar el término de búsqueda

      console.log("Cliente creado exitosamente:", newClient);
    } catch (error) {
      console.error("Error al crear cliente rápido:", error);
      alert("Error al crear el cliente. Por favor intente nuevamente.");
    }
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
              {isEdit ? "Editar Turno" : "Nuevo Turno"}
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contenido del formulario - responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selector de sucursal - solo para administradores */}
              {isAdmin && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                    Sucursal
                  </label>
                  <select
                    value={selectedSucursalId || ""}
                    onChange={(e) => setSelectedSucursalId(e.target.value || undefined)}
                    className="qoder-dark-select w-full px-3 py-2 rounded-lg"
                  >
                    <option value="">Seleccione una sucursal</option>
                    {sucursales.map((sucursal) => (
                      <option key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Cliente */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  value={values.cliente_nombre || ""}
                  onChange={(e) => {
                    update("cliente_nombre", e.target.value);
                    setSearchTerm(e.target.value);
                  }}
                  className="qoder-dark-input w-full px-3 py-2 rounded-lg"
                  required
                  list="clientes-list"
                />
                {clientesData && clientesData.length > 0 && searchTerm && (
                  <datalist id="clientes-list">
                    {filteredClientes.map((cliente: Client) => (
                      <option key={cliente.id_cliente} value={cliente.nombre}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </datalist>
                )}
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                  Servicio
                </label>
                <select
                  value={values.servicio || ""}
                  onChange={(e) => update("servicio", e.target.value)}
                  className="qoder-dark-select w-full px-3 py-2 rounded-lg"
                  required
                >
                  <option value="">Seleccione un servicio</option>
                  {servicios.map((servicio) => (
                    <option key={servicio.nombre} value={servicio.nombre}>
                      {servicio.nombre} - ${servicio.precio} ({servicio.duracion_minutos} min)
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Barbero */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                  Barbero
                </label>
                {/* Para barberos no administradores, mostrar el nombre del barbero actual como campo de solo lectura */}
                {!isAdmin && barberoActual?.id_barbero ? (
                  <div className="qoder-dark-input w-full px-3 py-2 rounded-lg bg-qoder-dark-bg-secondary flex items-center">
                    <span>{barberoActual.nombre}</span>
                    <input
                      type="hidden"
                      value={barberoActual.nombre}
                      onChange={(e) => update("barbero", e.target.value)}
                    />
                  </div>
                ) : (
                  <select
                    value={values.barbero || ""}
                    onChange={(e) => update("barbero", e.target.value)}
                    className="qoder-dark-select w-full px-3 py-2 rounded-lg"
                    required
                  >
                    <option value="">Seleccione un barbero</option>
                    {barberos?.map((barberoItem: any) => (
                      <option key={barberoItem.id_barbero} value={barberoItem.nombre}>
                        {barberoItem.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {/* Fecha y Hora en la misma fila */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={values.fecha || ""}
                    onChange={(e) => update("fecha", e.target.value)}
                    min={today}
                    className="qoder-dark-input w-full px-3 py-2 rounded-lg"
                    required
                  />
                </div>
                
                {/* Hora */}
                <div>
                  <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                    Hora
                  </label>
                  <select
                    value={values.hora || ""}
                    onChange={(e) => update("hora", e.target.value)}
                    className="qoder-dark-select w-full px-3 py-2 rounded-lg"
                    required
                    disabled={
                      !selectedSucursalId ||
                      !values.fecha ||
                      (!isAdmin && !barberoActual?.id_barbero && !values.barbero) ||
                      (isAdmin && !values.barbero)
                    }
                  >
                    <option value="">Seleccione una hora</option>
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {availableTimes.length === 0 && (
                    <p className="text-xs text-qoder-dark-text-secondary mt-1">
                      No hay horarios disponibles para la fecha seleccionada
                    </p>
                  )}
                </div>
              </div>
              
              {/* Nota */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                  Nota
                </label>
                <textarea
                  value={values.nota || ""}
                  onChange={(e) => update("nota", e.target.value)}
                  className="qoder-dark-input w-full px-3 py-2 rounded-lg"
                  rows={3}
                />
              </div>
            </div>
            
            {/* Botones de acción - responsive */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="cancel-button flex-1"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="action-button flex-1"
              >
                {isEdit ? "Actualizar" : "Crear"} Turno
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
