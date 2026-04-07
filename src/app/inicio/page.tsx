"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useState, useEffect } from "react";
import { useDashboardCompleto } from "@/hooks/useDashboardCompleto";
import type { Appointment } from "@/types/db";
import { EnhancedFinalAppointmentModal } from "@/components/EnhancedFinalAppointmentModal";
import { BloqueoModalForm } from "@/features/perfil/components/BloqueoModalForm";
import { ModalMovimiento } from "@/components/caja/v2/ModalMovimiento";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAgregarMovimiento, useBarberos } from "@/hooks/useCaja";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { getLocalDateTime, getLocalDateString } from "@/shared/utils/dateUtils";

function formatHora(hora: string) {
  if (!hora) return "--:--";
  return hora.slice(0, 5);
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU", maximumFractionDigits: 0 }).format(n);
}

function getEstadoColor(estado: string) {
  switch (estado) {
    case "completado": return "#10b981";
    case "pendiente": return "#C5A059";
    case "confirmada": return "#3b82f6";
    case "cancelado": return "#ef4444";
    default: return "#8A8A8A";
  }
}

function getEstadoLabel(estado: string) {
  switch (estado) {
    case "completado": return "Completado";
    case "pendiente": return "Pendiente";
    case "confirmada": return "Confirmada";
    case "cancelado": return "Cancelado";
    default: return estado;
  }
}

export default function DashboardPage() {
  usePageTitle("Barberox | Dashboard");
  const { citasHoy, ingresosHoy, proximasCitas, citasSemana, citasMes,
    ingresosMes,
    ingresoEstimadoMes,
    ingresoMesPasadoAlDia,
    completadosMesPasadoAlDia,
    isLoading,
    refetch,
  } = useDashboardCompleto();

  const { idBarberia, barbero, isAdmin } = useAuth();
  const { data: barberos = [] } = useBarberos();
  const agregarMovimientoCaja = useAgregarMovimiento();

  // Modal states
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isBloqueoModalOpen, setIsBloqueoModalOpen] = useState(false);
  const [isCajaModalOpen, setIsCajaModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Partial<Appointment> | null>(null);

  // Derive KPIs
  const [now, setNow] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Initialize now on client mount and set interval to update every minute
    const updateNow = () => setNow(new Date());
    updateNow();
    const interval = setInterval(updateNow, 60000);
    return () => clearInterval(interval);
  }, []);
  const currentTime = now ? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}` : "";

  const completados = citasHoy.filter((c: Appointment) => c.estado === "completado").length;
  const pendientes = citasHoy.filter((c: Appointment) => c.estado === "pendiente" || c.estado === "confirmada").length;
  const totalHoy = citasHoy.length;

  // Revenue today
  const ingresoHoy = ingresosHoy.reduce((sum: number, r: any) => {
    const monto = Number(r.monto || r.ticket || 0);
    return sum + (r.tipo === "egreso" ? -monto : monto);
  }, 0);

  // Monthly revenue
  const ingresoMes = (ingresosMes || []).reduce((sum: number, r: any) => {
    const monto = Number(r.monto || r.ticket || 0);
    return sum + (r.tipo === "egreso" ? -monto : monto);
  }, 0);

  // Monthly completed & pending
  const completadosMes = (citasMes || []).filter((c: Appointment) => c.estado === "completado").length;
  const pendientesMes = (citasMes || []).filter((c: Appointment) => c.estado === "pendiente" || c.estado === "confirmada").length;

  // Comparisons vs last month (same period)
  const ingresoMesActualAlDia = (ingresosMes || []).reduce((sum: number, r: any) => {
    const monto = Number(r.monto || r.ticket || 0);
    return sum + (r.tipo === "egreso" ? -monto : monto);
  }, 0);

  const diffIngresos = ingresoMesPasadoAlDia > 0
    ? ((ingresoMesActualAlDia - ingresoMesPasadoAlDia) / ingresoMesPasadoAlDia) * 100
    : ingresoMesActualAlDia > 0 ? 100 : 0;

  const diffCompletados = completadosMesPasadoAlDia > 0
    ? ((completadosMes - completadosMesPasadoAlDia) / completadosMesPasadoAlDia) * 100
    : completadosMes > 0 ? 100 : 0;

  // Next appointment
  const siguienteTurno = citasHoy
    .filter((c: Appointment) => (c.estado === "pendiente" || c.estado === "confirmada") && c.hora >= currentTime)
    .sort((a: Appointment, b: Appointment) => a.hora.localeCompare(b.hora))[0];

  // Determine which turns to display: today's pending, or tomorrow's if none left
  const turnosPendientesHoy = citasHoy
    .filter((c: Appointment) => (c.estado === "pendiente" || c.estado === "confirmada") && c.hora >= currentTime)
    .sort((a: Appointment, b: Appointment) => a.hora.localeCompare(b.hora));

  const showTomorrow = turnosPendientesHoy.length === 0;

  // Get tomorrow's date string
  const tomorrow = now ? new Date(now) : new Date();
  if (now) tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const turnosMañana = (proximasCitas || [])
    .filter((c: Appointment) => {
      const citaFecha = c.fecha?.split('T')[0];
      return citaFecha === tomorrowStr && (c.estado === "pendiente" || c.estado === "confirmada");
    })
    .sort((a: Appointment, b: Appointment) => a.hora.localeCompare(b.hora));

  const turnosToShow = showTomorrow ? turnosMañana : turnosPendientesHoy;
  const turnosLabel = showTomorrow ? "Agenda de mañana" : "Agenda pendiente";

  // Sorted today appointments
  const citasOrdenadas = [...citasHoy].sort((a: Appointment, b: Appointment) => a.hora.localeCompare(b.hora));

  const handleOpenAppointmentModal = () => {
    const currentDate = getLocalDateTime();
    setSelectedAppointment({
      fecha: getLocalDateString(currentDate),
      hora: "",
      servicio: "",
      barbero: ""
    });
    setIsAppointmentModalOpen(true);
  };

  const handleSubmitBloqueo = async (bloqueoData: any) => {
    if (!idBarberia || !barbero) return;

    try {
      const { error } = await supabase
        .from('mibarber_bloqueos_barbero')
        .insert({
          id_barbero: barbero.id_barbero,
          id_barberia: idBarberia,
          id_sucursal: barbero.id_sucursal,
          fecha: bloqueoData.fecha,
          hora_inicio: bloqueoData.hora_inicio || null,
          hora_fin: bloqueoData.hora_fin || null,
          tipo: bloqueoData.tipo,
          motivo: bloqueoData.motivo || null,
          activo: true,
          creado_por: barbero.id_barbero
        });

      if (error) throw error;
      alert("Bloqueo creado con éxito");
      setIsBloqueoModalOpen(false);
    } catch (err) {
      console.error("Error creating bloqueo:", err);
      alert("Error al crear el bloqueo");
    }
  };

  const handleSubmitCaja = async (datos: any) => {
    try {
      await agregarMovimientoCaja.mutateAsync(datos);
      alert("Movimiento agregado a caja");
      setIsCajaModalOpen(false);
      refetch();
    } catch (err) {
      console.error("Error adding caja movement:", err);
      alert("Error al agregar movimiento");
    }
  };

  if (!isMounted || isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="animate-spin" style={{
            width: 32, height: 32, borderRadius: "50%",
            border: "2px solid transparent", borderTopColor: "#C5A059",
            margin: "0 auto 12px",
          }} />
          <p style={{ color: "#8A8A8A", fontSize: "0.875rem" }}>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 20px 24px", width: "100%", margin: "0 auto" }}>

      {/* Header */}
      <div className="dashboard-header" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
        gap: 24
      }}>
        <div className="header-title-group" style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <h1 style={{ fontSize: "1.1rem", margin: 0, letterSpacing: "0.1em", fontWeight: 700 }}>
            DASHBOARD
          </h1>
          <p className="header-date" style={{ color: "#666", fontSize: "0.75rem", margin: 0, fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
            {now ? now.toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" }) : ""}
          </p>
        </div>

        {/* Acciones Rápidas (Sutiles y Alineadas) */}
        <div className="quick-actions" style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button
            onClick={handleOpenAppointmentModal}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "transparent", border: "none", color: "#C5A059",
              fontSize: "0.7rem", fontWeight: 600, cursor: "pointer",
              fontFamily: "var(--font-body)", textTransform: "uppercase",
              letterSpacing: "0.05em", transition: "opacity 0.2s",
              padding: 0, whiteSpace: "nowrap"
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.7"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Nueva cita
          </button>

          <button
            onClick={() => setIsBloqueoModalOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "transparent", border: "none", color: "#666",
              fontSize: "0.7rem", fontWeight: 500, cursor: "pointer",
              fontFamily: "var(--font-body)", textTransform: "uppercase",
              letterSpacing: "0.05em", transition: "color 0.2s",
              padding: 0, whiteSpace: "nowrap"
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "#8A8A8A"}
            onMouseOut={(e) => e.currentTarget.style.color = "#666"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            Bloqueo
          </button>
        </div>
      </div>

      {/* Layout principal */}
      <div>
        {/* Next Appointment — Hero Card */}
        {siguienteTurno ? (
          <div className="app-card" style={{ marginBottom: 24, padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <p style={{ color: "#8A8A8A", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, fontFamily: "var(--font-body)" }}>
                    Siguiente cita
                  </p>
                  {siguienteTurno.hora && (
                    <span style={{
                      color: "#C5A059",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      background: "rgba(197, 160, 89, 0.1)",
                      padding: "2px 6px",
                      borderRadius: "4px"
                    }}>
                      {(() => {
                        if (!now) return "--:--";
                        const [hStr, mStr] = siguienteTurno.hora.split(':');
                        const h = parseInt(hStr, 10);
                        const m = parseInt(mStr, 10);

                        const turnoTime = new Date(now.getTime());
                        turnoTime.setHours(h, m, 0, 0);

                        const diffMs = turnoTime.getTime() - now.getTime();
                        if (diffMs > 0) {
                          const diffMins = Math.floor(diffMs / 60000);
                          const hh = Math.floor(diffMins / 60);
                          const mm = diffMins % 60;
                          return `en ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')} hs.`;
                        }
                        return "Ahora";
                      })()}
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: "2rem", margin: 0, color: "#F5F0EB", letterSpacing: "0.04em" }}>
                  {formatHora(siguienteTurno.hora)}
                </h2>
                <p style={{ color: "#F5F0EB", fontSize: "1rem", margin: "8px 0 4px", fontFamily: "var(--font-body)" }}>
                  {siguienteTurno.cliente_nombre}
                </p>
                <p style={{ color: "#8A8A8A", fontSize: "0.875rem", margin: 0, fontFamily: "var(--font-body)" }}>
                  {siguienteTurno.servicio} · {siguienteTurno.duracion} minutos
                </p>
              </div>
              <div style={{
                background: "rgba(197,160,89,0.1)",
                border: "1px solid rgba(197,160,89,0.2)",
                padding: "8px 16px",
                fontSize: "0.8125rem",
                color: "#C5A059",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
              }}>
                {getEstadoLabel(siguienteTurno.estado)}
              </div>
            </div>
          </div>
        ) : (
          <div className="app-card" style={{
            marginBottom: 24,
            padding: "24px",
            textAlign: "center",
          }}>
            <p style={{ color: "#8A8A8A", fontSize: "0.875rem", margin: 0, fontFamily: "var(--font-body)" }}>
              No hay más citas pendientes hoy
            </p>
          </div>
        )}

        {/* KPI Grid — 5 cards alineadas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px"
        }}>
          {/* Ingresos hoy */}
          <div className="app-card" style={{ padding: "20px" }}>
            <p style={{ color: "#8A8A8A", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px", fontFamily: "var(--font-body)" }}>
              Ingresos hoy
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0, color: "#10b981", fontFamily: "var(--font-body)" }}>
              {formatMoney(ingresoHoy)}
            </p>
          </div>

          {/* Ingresos del mes */}
          <div className="app-card" style={{ padding: "20px" }}>
            <p style={{ color: "#8A8A8A", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px", fontFamily: "var(--font-body)" }}>
              Ingresos / Mes
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0, color: "#10b981", fontFamily: "var(--font-body)" }}>
              {formatMoney(ingresoMes)}
            </p>
          </div>

          {/* Ingresos estimados del mes */}
          <div className="app-card" style={{ padding: "20px" }}>
            <p style={{ color: "#8A8A8A", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px", fontFamily: "var(--font-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title="Ingresos Estimados / Mes">
              Estimados / Mes
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0, color: "#0ea5e9", fontFamily: "var(--font-body)" }}>
              {formatMoney(ingresoEstimadoMes)}
            </p>
          </div>

          {/* Completados del mes */}
          <div className="app-card" style={{ padding: "20px" }}>
            <p style={{ color: "#8A8A8A", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px", fontFamily: "var(--font-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title="Turnos Completados / Mes">
              Turnos Completados / Mes
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0, color: "#F5F0EB", fontFamily: "var(--font-body)" }}>
              {completadosMes}
            </p>
          </div>

          {/* Pendientes del mes */}
          <div className="app-card" style={{ padding: "20px" }}>
            <p style={{ color: "#8A8A8A", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px", fontFamily: "var(--font-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title="Turnos Pendientes / Mes">
              Turnos Pendientes / Mes
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0, color: "#C5A059", fontFamily: "var(--font-body)" }}>
              {pendientesMes}
            </p>
          </div>

          {/* Comparación Ingresos vs mes anterior */}
          <div className="app-card" style={{ padding: "20px" }}>
            <p style={{ color: "#8A8A8A", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px", fontFamily: "var(--font-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title="Ingresos vs Mes Anterior">
              Ingresos vs Mes Anterior
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <p style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0, color: "#F5F0EB", fontFamily: "var(--font-body)" }}>
                {formatMoney(ingresoMesActualAlDia)}
              </p>
              <span style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: diffIngresos >= 0 ? "#10b981" : "#ef4444",
                fontFamily: "var(--font-body)",
              }}>
                {diffIngresos >= 0 ? "▲" : "▼"} {Math.abs(diffIngresos).toFixed(0)}%
              </span>
            </div>
            <p style={{ color: "#666", fontSize: "0.7rem", margin: "4px 0 0", fontFamily: "var(--font-body)" }}>
              Mes pasado al día {new Date().getDate()}: {formatMoney(ingresoMesPasadoAlDia)}
            </p>
          </div>

          {/* Comparación Turnos completados vs mes anterior */}
          <div className="app-card" style={{ padding: "20px" }}>
            <p style={{ color: "#8A8A8A", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px", fontFamily: "var(--font-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title="Turnos vs Mes Anterior">
              Turnos vs Mes Anterior
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <p style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0, color: "#F5F0EB", fontFamily: "var(--font-body)" }}>
                {completadosMes}
              </p>
              <span style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: diffCompletados >= 0 ? "#10b981" : "#ef4444",
                fontFamily: "var(--font-body)",
              }}>
                {diffCompletados >= 0 ? "▲" : "▼"} {Math.abs(diffCompletados).toFixed(0)}%
              </span>
            </div>
            <p style={{ color: "#666", fontSize: "0.7rem", margin: "4px 0 0", fontFamily: "var(--font-body)" }}>
              Mes pasado al día {new Date().getDate()}: {completadosMesPasadoAlDia} turnos
            </p>
          </div>
        </div>

        {/* Turnos pendientes / mañana */}
        <div className="app-card" style={{
          padding: "20px",
          maxHeight: 420,
          overflowY: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: "1rem", margin: 0, letterSpacing: "0.04em" }}>
              {turnosLabel}
            </h3>
            <Link href="/agenda" style={{ color: "#C5A059", fontSize: "0.8125rem", fontFamily: "var(--font-body)" }}>
              Ver todos →
            </Link>
          </div>

          {turnosToShow.length === 0 ? (
            <p style={{ color: "#8A8A8A", fontSize: "0.875rem", textAlign: "center", padding: "20px 0", fontFamily: "var(--font-body)" }}>
              {showTomorrow ? "Sin citas para mañana" : "Sin citas pendientes"}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {turnosToShow.map((cita: Appointment) => (
                <div key={cita.id_cita} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #111",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#F5F0EB",
                      fontFamily: "var(--font-body)",
                      minWidth: 45,
                    }}>
                      {formatHora(cita.hora)}
                    </span>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.875rem", color: "#F5F0EB", fontFamily: "var(--font-body)" }}>
                        {cita.cliente_nombre}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#8A8A8A", fontFamily: "var(--font-body)" }}>
                        {cita.servicio}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: getEstadoColor(cita.estado),
                    flexShrink: 0,
                  }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Modal Components */}
      <EnhancedFinalAppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={(open) => {
          setIsAppointmentModalOpen(open);
          if (!open) refetch();
        }}
        initial={selectedAppointment || undefined}
      />

      <BloqueoModalForm
        isOpen={isBloqueoModalOpen}
        initialData={null}
        onClose={() => setIsBloqueoModalOpen(false)}
        onSubmit={handleSubmitBloqueo}
      />
      <style>{`
        @media (max-width: 600px) {
          .dashboard-header {
            flex-wrap: wrap !important;
            justify-content: space-between !important;
            gap: 12px 0px !important;
          }
          .header-title-group {
            display: contents !important;
          }
          .dashboard-header h1 {
            order: 1 !important;
            flex-grow: 1 !important;
          }
          .quick-actions {
            order: 2 !important;
          }
          .header-date {
            order: 3 !important;
            width: 100% !important;
            margin-top: 4px !important;
            white-space: normal !important;
          }
        }
      `}</style>
    </div>
  );
}