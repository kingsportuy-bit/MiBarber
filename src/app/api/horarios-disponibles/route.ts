// app/api/horarios-disponibles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { HorarioSucursal } from "@/types/db";
import type { DescansoExtra, Bloqueo as BloqueosBarbero } from "@/types/bloqueos";
import type { Appointment as Cita } from "@/types/db";

// Funciones auxiliares
function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function minutosAHora(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${String(horas).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function obtenerDiaDelaSemana(fecha: string): number {
  // La fecha viene en formato YYYY-MM-DD
  // Necesitamos asegurarnos de que se interprete correctamente en la zona horaria local
  // En lugar de new Date(fecha), usamos una forma que preserve el día
  
  // Parsear la fecha manualmente
  const [year, month, day] = fecha.split('-').map(Number);
  // Crear una fecha en la zona horaria local (ajustando a mediodía para evitar problemas de DST)
  const date = new Date(year, month - 1, day, 12, 0, 0);
  
  // 0=Domingo, 1=Lunes... 6=Sábado
  return date.getDay();
}

function convertirDescansoADiaJS(indiceDia: number): number {
  // índice: 0=Lunes, 1=Martes... 6=Domingo
  // Convertir a día JS: 0=Domingo, 1=Lunes... 6=Sábado
  return indiceDia === 6 ? 0 : indiceDia + 1;
}

function generarIntervalosTiempos(horaInicio: string, horaFin: string): string[] {
  const minInicio = horaAMinutos(horaInicio);
  const minFin = horaAMinutos(horaFin);
  const intervalos: string[] = [];

  for (let i = minInicio; i < minFin; i += 15) {
    intervalos.push(minutosAHora(i));
  }

  return intervalos;
}

// Función para generar slots consecutivos basados en la duración del servicio
function generarSlotsConsecutivos(
  citas: Cita[],
  horaApertura: string,
  horaCierre: string,
  duracionServicio: number,
  horaInicioAlmuerzo: string | null,
  horaFinAlmuerzo: string | null
): string[] {
  console.log("=== DEBUG generarSlotsConsecutivos ===");
  console.log("Citas recibidas:", citas);

  const citasOrdenadas = [...(citas || [])].sort(
    (a, b) => horaAMinutos(a.hora) - horaAMinutos(b.hora)
  );

  const slots: string[] = [];
  const minApertura = horaAMinutos(horaApertura);
  const minCierre = horaAMinutos(horaCierre);
  const minInicioAlmuerzo = horaInicioAlmuerzo ? horaAMinutos(horaInicioAlmuerzo) : null;
  const minFinAlmuerzo = horaFinAlmuerzo ? horaAMinutos(horaFinAlmuerzo) : null;

  console.log("Minutos apertura:", minApertura);
  console.log("Minutos cierre:", minCierre);
  console.log("Minutos inicio almuerzo:", minInicioAlmuerzo);
  console.log("Minutos fin almuerzo:", minFinAlmuerzo);

  let tiempoActual = minApertura;
  let contador = 0;

  while (tiempoActual + duracionServicio <= minCierre && contador < 200) {
    const slotInicio = tiempoActual;
    const slotFin = tiempoActual + duracionServicio;

    // 1) Almuerzo
    let enAlmuerzo = false;
    if (minInicioAlmuerzo !== null && minFinAlmuerzo !== null) {
      enAlmuerzo = slotInicio < minFinAlmuerzo && slotFin > minInicioAlmuerzo;
    }

    // 2) Solapamiento con citas
    let solapaConCita = false;
    if (!enAlmuerzo) {
      for (const cita of citasOrdenadas) {
        const inicioCita = horaAMinutos(cita.hora);
        const finCita =
          inicioCita + parseInt(cita.duracion || "30", 10);

        // Hay solapamiento si intervalos [slotInicio, slotFin) y [inicioCita, finCita) se pisan
        if (slotInicio < finCita && slotFin > inicioCita) {
          solapaConCita = true;
          break;
        }
      }
    }

    console.log(
      `Evaluando slot ${minutosAHora(slotInicio)}: almuerzo=${enAlmuerzo}, solapaConCita=${solapaConCita}`
    );

    if (!enAlmuerzo && !solapaConCita) {
      const horaSlot = minutosAHora(slotInicio);
      slots.push(horaSlot);
      console.log(`Slot generado: ${horaSlot} (${slotInicio} minutos)`);
    }

    tiempoActual += duracionServicio;
    contador++;
  }

  console.log("Slots generados:", slots);
  console.log("=== FIN DEBUG generarSlotsConsecutivos ===");
  return slots;
}

export async function GET(request: NextRequest) {
  try {
    // Crear cliente Supabase en runtime
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    
    const { searchParams } = new URL(request.url);
    const idSucursal = searchParams.get("idSucursal");
    const idBarbero = searchParams.get("idBarbero");
    const fecha = searchParams.get("fecha");
    const idCitaEditando = searchParams.get("idCitaEditando");
    const duracionServicioStr = searchParams.get("duracionServicio");

    // Convertir duración del servicio a número (por defecto 30 minutos)
    const duracionServicio = duracionServicioStr ? parseInt(duracionServicioStr, 10) : 30;

    if (!idSucursal || !idBarbero || !fecha) {
      return NextResponse.json(
        { error: "Parámetros requeridos faltantes" },
        { status: 400 }
      );
    }

    // Verificar que la fecha sea igual o posterior al día actual
    const fechaActual = new Date();
    // Parsear la fecha manualmente para evitar problemas de zona horaria
    const [year, month, day] = fecha.split("-").map(Number);
    const fechaSolicitud = new Date(year, month - 1, day, 12, 0, 0);
    
    // Ajustar la fecha de hoy a la misma zona horaria
    const hoyAjustado = new Date(fechaActual);
    hoyAjustado.setMinutes(hoyAjustado.getMinutes() + hoyAjustado.getTimezoneOffset() + (-180));
    hoyAjustado.setHours(0, 0, 0, 0);
    
    // Comparar solo las fechas (sin horas)
    const fechaSolicitudSinHora = new Date(fechaSolicitud);
    fechaSolicitudSinHora.setHours(0, 0, 0, 0);
    
    if (fechaSolicitudSinHora < hoyAjustado) {
      // Si la fecha es anterior a hoy, no mostrar horarios disponibles
      return NextResponse.json([]);
    }

    const diaSemana = obtenerDiaDelaSemana(fecha);
    console.log("Día de la semana calculado:", diaSemana);

    // 1️⃣ Obtener horario de la sucursal para el día
    const { data: horarioSucursal, error: errorHorario } = await supabase
      .from("mibarber_horarios_sucursales")
      .select("*")
      .eq("id_sucursal", idSucursal)
      .eq("id_dia", diaSemana)
      .single();

    // Si no existe horario o está inactivo, no hay horarios disponibles
    if (errorHorario || !horarioSucursal || !horarioSucursal.activo) {
      console.log("❌ Sucursal cerrada o sin horario configurado");
      return NextResponse.json([]);
    }

    console.log("✅ Horario sucursal:", horarioSucursal);

    // 2️⃣ Obtener bloqueo de día completo (si existe)
    const { data: bloqueodia, error: errorBloqueoDia } = await supabase
      .from("mibarber_bloqueos_barbero")
      .select("*")
      .eq("id_barbero", idBarbero)
      .eq("fecha", fecha)
      .eq("tipo", "bloqueo_dia")
      .eq("activo", true) // Solo considerar bloqueos activos
      .single();

    if (!errorBloqueoDia && bloqueodia) {
      console.log("🚫 Día bloqueado completamente");
      return NextResponse.json([]);
    }

    // 3️⃣ Obtener citas ya agendadas (excluyendo la que se está editando)
    let queryDisponibles = supabase
      .from("mibarber_citas")
      .select("*")
      .eq("id_barbero", idBarbero)
      .eq("fecha", fecha)
      // Solo considerar citas pendientes y confirmadas
      .in("estado", ["pendiente", "confirmado"]);

    // Si estamos editando, excluir esa cita
    if (idCitaEditando) {
      queryDisponibles = queryDisponibles.neq("id_cita", idCitaEditando);
    }

    const { data: citas, error: errorCitas } = await queryDisponibles;

    console.log("=== DEBUG Citas obtenidas ===");
    console.log("Query ejecutado:", {
      id_barbero: idBarbero,
      fecha: fecha,
      id_cita_editando: idCitaEditando
    });
    console.log("Citas obtenidas:", citas);
    console.log("Error en consulta:", errorCitas);
    console.log("=== FIN DEBUG Citas ===");

    // 4️⃣ Generar slots consecutivos basados en la nueva lógica
    let horariosDisponibles = generarSlotsConsecutivos(
      citas || [],
      horarioSucursal.hora_apertura,
      horarioSucursal.hora_cierre,
      duracionServicio,
      horarioSucursal.hora_inicio_almuerzo,
      horarioSucursal.hora_fin_almuerzo
    );

    console.log("=== DEBUG Horarios disponibles después de generar slots ===");
    console.log("Horarios disponibles:", horariosDisponibles);
    console.log("=== FIN DEBUG Horarios disponibles ===");

    // 5️⃣ Obtener descansos extra recurrentes
    const { data: descansosExtra, error: errorDescansos } = await supabase
      .from("mibarber_descansos_extra")
      .select("*")
      .eq("id_barbero", idBarbero)
      .eq("activo", true); // Solo considerar descansos activos

    let horariosDescanso: string[] = [];
    if (!errorDescansos && descansosExtra && descansosExtra.length > 0) {
      descansosExtra.forEach((descanso) => {
        try {
          const diasSemana = JSON.parse(descanso.dias_semana);
          // diasSemana[0] es Lunes, necesitamos convertir de día JS
          // diaSemana JS: 0=Domingo, 1=Lunes, 2=Martes... 6=Sábado
          // Convertir a índice del array: 0=Lunes, 1=Martes... 5=Sábado, 6=Domingo
          const indiceDiaEnDescanso = diaSemana === 0 ? 6 : diaSemana - 1;

          if (diasSemana[indiceDiaEnDescanso]) {
            // Este día tiene descanso, agregar rango de horas
            const minInicio = horaAMinutos(descanso.hora_inicio);
            const minFin = horaAMinutos(descanso.hora_fin);

            for (let i = minInicio; i < minFin; i += 15) {
              horariosDescanso.push(minutosAHora(i));
            }
          }
        } catch (e) {
          console.error("Error parseando descanso extra:", e);
        }
      });

      horariosDisponibles = horariosDisponibles.filter(
        (h) => !horariosDescanso.includes(h)
      );

      console.log("😴 Después filtrar descansos extra:", horariosDisponibles);
    }

    // 6️⃣ Obtener bloqueos de horas puntuales
    const { data: bloqueoHoras, error: errorBloqueoHoras } = await supabase
      .from("mibarber_bloqueos_barbero")
      .select("*")
      .eq("id_barbero", idBarbero)
      .eq("fecha", fecha)
      .eq("tipo", "bloqueo_horas")
      .eq("activo", true); // Solo considerar bloqueos activos

    if (!errorBloqueoHoras && bloqueoHoras && bloqueoHoras.length > 0) {
      bloqueoHoras.forEach((bloqueo) => {
        if (bloqueo.hora_inicio && bloqueo.hora_fin) {
          const minInicio = horaAMinutos(bloqueo.hora_inicio);
          const minFin = horaAMinutos(bloqueo.hora_fin);

          horariosDisponibles = horariosDisponibles.filter((hora) => {
            const minHora = horaAMinutos(hora);
            return minHora < minInicio || minHora >= minFin;
          });
        }
      });

      console.log("🚫 Después filtrar bloqueos de horas:", horariosDisponibles);
    }

    // 7️⃣ Filtrar horarios pasados si es el día actual
    const hoy = new Date();

    // Parsear la fecha de consulta
    const [yearFecha, monthFecha, dayFecha] = fecha.split("-").map(Number);
    const fechaConsulta = new Date(yearFecha, monthFecha - 1, dayFecha);

    // Crear una fecha para hoy sin hora
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    // Comparar si es el mismo día
    if (fechaConsulta.getTime() === hoySinHora.getTime()) {
      // Para el día actual, solo filtrar horarios que ya han pasado
      // (hora actual menos 15 minutos de gracia para permitir agendar con un poco de anticipación)
      const horaActual = hoy.getHours() * 60 + hoy.getMinutes();
      const minutosGracia = 15;
      
      horariosDisponibles = horariosDisponibles.filter((hora) => {
        const [h, m] = hora.split(":").map(Number);
        const minHora = h * 60 + m;
        
        // Mostrar horarios futuros o muy recientes (con gracia de 15 minutos)
        return minHora >= horaActual - minutosGracia;
      });

      console.log("⏳ Después filtrar horarios pasados:", horariosDisponibles);
    }

    console.log("✅ Horarios disponibles finales:", horariosDisponibles);

    return NextResponse.json(horariosDisponibles);
  } catch (error) {
    console.error("Error al calcular horarios disponibles:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}