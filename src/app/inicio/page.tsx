"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useState, useEffect } from "react";
import { useDashboardCompleto } from "@/hooks/useDashboardCompleto";
import Link from "next/link";
import type { Appointment } from "@/types/db";

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
    case "confirmado": return "#C5A059";
    case "cancelado": return "#ef4444";
    default: return "#8A8A8A";
  }
}

function getEstadoLabel(estado: string) {
  switch (estado) {
    case "completado": return "Completado";
    case "pendiente": return "Pendiente";
    case "confirmado": return "Confirmado";
    case "cancelado": return "Cancelado";
    default: return estado;
  }
}

export default function DashboardPage() {
  usePageTitle("Barberox | Dashboard");
  const { citasHoy, ingresosHoy, proximasCitas, citasSemana, citasMes,
    ingresosMes,
    ingresoEstimadoMes,
    isLoading
  } = useDashboardCompleto();

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
  const pendientes = citasHoy.filter((c: Appointment) => c.estado === "pendiente" || c.estado === "confirmado").length;
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
  const pendientesMes = (citasMes || []).filter((c: Appointment) => c.estado === "pendiente" || c.estado === "confirmado").length;

  // Next appointment
  const siguienteTurno = citasHoy
    .filter((c: Appointment) => (c.estado === "pendiente" || c.estado === "confirmado") && c.hora >= currentTime)
    .sort((a: Appointment, b: Appointment) => a.hora.localeCompare(b.hora))[0];

  // Determine which turns to display: today's pending, or tomorrow's if none left
  const turnosPendientesHoy = citasHoy
    .filter((c: Appointment) => (c.estado === "pendiente" || c.estado === "confirmado") && c.hora >= currentTime)
    .sort((a: Appointment, b: Appointment) => a.hora.localeCompare(b.hora));

  const showTomorrow = turnosPendientesHoy.length === 0;

  // Get tomorrow's date string
  const tomorrow = now ? new Date(now) : new Date();
  if (now) tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const turnosMañana = (proximasCitas || [])
    .filter((c: Appointment) => {
      const citaFecha = c.fecha?.split('T')[0];
      return citaFecha === tomorrowStr && (c.estado === "pendiente" || c.estado === "confirmado");
    })
    .sort((a: Appointment, b: Appointment) => a.hora.localeCompare(b.hora));

  const turnosToShow = showTomorrow ? turnosMañana : turnosPendientesHoy;
  const turnosLabel = showTomorrow ? "Turnos de mañana" : "Turnos pendientes";

  // Sorted today appointments
  const citasOrdenadas = [...citasHoy].sort((a: Appointment, b: Appointment) => a.hora.localeCompare(b.hora));

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
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
        gap: 24
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <h1 style={{ fontSize: "1.1rem", margin: 0, letterSpacing: "0.1em", fontWeight: 700 }}>
            DASHBOARD
          </h1>
          <p style={{ color: "#666", fontSize: "0.75rem", margin: 0, fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
            {now ? now.toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "long" }) : ""}
          </p>
        </div>

        {/* Acciones Rápidas (Sutiles y Alineadas) */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button
            onClick={() => {
              const event = new CustomEvent('openNewAppointmentModal');
              window.dispatchEvent(event);
              window.location.href = '/turnos';
            }}
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
            Nuevo turno
          </button>

          <Link
            href="/bloqueos"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "transparent", border: "none", color: "#666",
              fontSize: "0.7rem", fontWeight: 500, cursor: "pointer",
              fontFamily: "var(--font-body)", textTransform: "uppercase",
              letterSpacing: "0.05em", transition: "color 0.2s",
              textDecoration: "none", whiteSpace: "nowrap"
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "#8A8A8A"}
            onMouseOut={(e) => e.currentTarget.style.color = "#666"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            Bloqueo
          </Link>

          <Link
            href="/caja"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "transparent", border: "none", color: "#666",
              fontSize: "0.7rem", fontWeight: 500, cursor: "pointer",
              fontFamily: "var(--font-body)", textTransform: "uppercase",
              letterSpacing: "0.05em", transition: "color 0.2s",
              textDecoration: "none", whiteSpace: "nowrap"
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "#8A8A8A"}
            onMouseOut={(e) => e.currentTarget.style.color = "#666"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            Caja
          </Link>
        </div>
      </div>

      {/* Layout principal */}
      <div>
        {/* Next Appointment — Hero Card */}
        {siguienteTurno ? (
          <div style={{
            background: "#0a0a0a",
            border: "1px solid #1a1a1a",
            padding: "24px",
            marginBottom: 24,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <p style={{ color: "#8A8A8A", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, fontFamily: "var(--font-body)" }}>
                    Siguiente turno
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
                          return `en ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
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
          <div style={{
            background: "#0a0a0a",
            border: "1px solid #1a1a1a",
            padding: "24px",
            marginBottom: 24,
            textAlign: "center",
          }}>
            <p style={{ color: "#8A8A8A", fontSize: "0.875rem", margin: 0, fontFamily: "var(--font-body)" }}>
              No hay más turnos pendientes hoy
            </p>
          </div>
        )}

        {/* KPI Grid — 5 cards alineadas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}>
          {/* Ingresos hoy */}
          <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", padding: "20px" }}>
            <p style={{ color: "#8A8A8A", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px", fontFamily: "var(--font-body)" }}>
              Ingresos hoy
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0, color: "#10b981", fontFamily: "var(--font-body)" }}>
              {formatMoney(ingresoHoy)}
            </p>
          </div>

          {/* Ingresos del mes */}
          <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", padding: "20px" }}>
            <p style={{ color: "#8A8A8A", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px", fontFamily: "var(--font-body)" }}>
              Ingresos / Mes
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0, color: "#10b981", fontFamily: "var(--font-body)" }}>
              {formatMoney(ingresoMes)}
            </p>
          </div>

          {/* Ingresos estimados del mes */}
          <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", padding: "20px" }}>
            <p style={{ color: "#8A8A8A", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px", fontFamily: "var(--font-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title="Ingresos Estimados / Mes">
              Estimados / Mes
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0, color: "#0ea5e9", fontFamily: "var(--font-body)" }}>
              {formatMoney(ingresoEstimadoMes)}
            </p>
          </div>

          {/* Completados del mes */}
          <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", padding: "20px" }}>
            <p style={{ color: "#8A8A8A", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px", fontFamily: "var(--font-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title="Completados / Mes">
              Completados / Mes
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0, color: "#F5F0EB", fontFamily: "var(--font-body)" }}>
              {completadosMes}
            </p>
          </div>

          {/* Pendientes del mes */}
          <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", padding: "20px" }}>
            <p style={{ color: "#8A8A8A", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px", fontFamily: "var(--font-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title="Pendiente / Mes">
              Pendiente / Mes
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: 600, margin: 0, color: "#C5A059", fontFamily: "var(--font-body)" }}>
              {pendientesMes}
            </p>
          </div>
        </div>

        {/* Turnos pendientes / mañana */}
        <div style={{
          background: "#0a0a0a",
          border: "1px solid #1a1a1a",
          padding: "20px",
          maxHeight: 420,
          overflowY: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: "1rem", margin: 0, letterSpacing: "0.04em" }}>
              {turnosLabel}
            </h3>
            <Link href="/turnos" style={{ color: "#C5A059", fontSize: "0.8125rem", fontFamily: "var(--font-body)" }}>
              Ver todos →
            </Link>
          </div>

          {turnosToShow.length === 0 ? (
            <p style={{ color: "#8A8A8A", fontSize: "0.875rem", textAlign: "center", padding: "20px 0", fontFamily: "var(--font-body)" }}>
              {showTomorrow ? "Sin turnos para mañana" : "Sin turnos pendientes"}
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
    </div>
  );
}