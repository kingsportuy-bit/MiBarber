"use client";

import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useBarberiaInfo } from "@/hooks/useBarberiaInfo";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useServiciosBarbero } from "@/hooks/useServiciosBarbero";
import { useActualizarBarbero } from "@/hooks/useActualizarBarbero";
import { LegacyEditarBarberoModal } from "@/components/LegacyEditarBarberoModal";
import type { Sucursal } from "@/types/db";
import { SucursalBarberosSection } from "@/components/SucursalBarberosSection";
import { SucursalServiciosSection } from "@/components/SucursalServiciosSection";
import { SucursalHorariosSection } from "@/components/SucursalHorariosSection";
import { LegacyEditarSucursalModal } from "@/components/LegacyEditarSucursalModal";
import { EditarHorariosSucursalModal } from "@/components/EditarHorariosSucursalModal";
import { LegacyEditarInfoAdicionalModal } from "@/components/LegacyEditarInfoAdicionalModal";

/* ── Inline styles (Barberox12 pattern) ────────────── */
const S = {
  page: { paddingTop: 24, paddingBottom: 24, paddingLeft: 20, paddingRight: 20, width: "100%", margin: "0 auto" } as React.CSSProperties,
  heading: { fontSize: "1.5rem", margin: 0, letterSpacing: "0.04em" } as React.CSSProperties,
  subtitle: { color: "#8A8A8A", fontSize: "0.875rem", margin: "4px 0 0", fontFamily: "var(--font-body)" } as React.CSSProperties,
  card: { background: "#0a0a0a", border: "1px solid #1a1a1a", padding: "20px", marginBottom: 16 } as React.CSSProperties,
  sectionTitle: { fontSize: "1rem", fontWeight: 600, margin: "0 0 16px", letterSpacing: "0.04em" } as React.CSSProperties,
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a1a1a" } as React.CSSProperties,
  rowLabel: { fontSize: "0.8125rem", color: "#8A8A8A", fontFamily: "var(--font-body)" } as React.CSSProperties,
  rowValue: { fontSize: "0.875rem", color: "#fff", fontFamily: "var(--font-body)" } as React.CSSProperties,
  btn: { background: "rgba(197,160,89,0.15)", color: "#C5A059", border: "1px solid rgba(197,160,89,0.3)", padding: "10px 16px", cursor: "pointer", fontSize: "0.8125rem", fontFamily: "var(--font-rasputin), serif", textTransform: "uppercase" as const, letterSpacing: "0.04em", transition: "all 0.2s" } as React.CSSProperties,
  btnSmall: { background: "rgba(255,255,255,0.05)", color: "#ccc", border: "1px solid #1a1a1a", padding: "8px 12px", cursor: "pointer", fontSize: "0.75rem", fontFamily: "var(--font-rasputin), serif", textTransform: "uppercase" as const, letterSpacing: "0.04em", transition: "all 0.2s" } as React.CSSProperties,
  sucTab: (active: boolean) => ({ padding: "10px 20px", background: active ? "rgba(197,160,89,0.1)" : "transparent", border: "none", borderBottom: active ? "2px solid #C5A059" : "2px solid transparent", color: active ? "#C5A059" : "#8A8A8A", cursor: "pointer", fontSize: "0.8125rem", fontFamily: "var(--font-rasputin), serif", textTransform: "uppercase" as const, letterSpacing: "0.04em", whiteSpace: "nowrap" as const, transition: "all 0.2s" }) as React.CSSProperties,
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={S.row}>
      <span style={S.rowLabel}>{label}</span>
      <span style={S.rowValue}>{value}</span>
    </div>
  );
}

export default function MiBarberiaPage() {
  usePageTitle("Barberox | Mi Barbería");
  return <MiBarberiaContent />;
}

function MiBarberiaContent() {
  const { isAdmin, idBarberia, barbero } = useBarberoAuth();
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<any>(null);
  const {
    barberiaInfoQuery, sucursalesQuery, serviciosQuery,
    updateBarberiaInfoMutation, createSucursalMutation,
    createServiceMutation, updateServiceMutation, deleteServiceMutation,
  } = useBarberiaInfo();
  const { data: serviciosBarberoData = [] } = useServiciosBarbero(barbero?.id_barbero || null);
  const { actualizarBarbero, isLoading: isUpdating } = useActualizarBarbero();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sucursalToEdit, setSucursalToEdit] = useState<any>(null);
  const [isInfoAdicionalModalOpen, setIsInfoAdicionalModalOpen] = useState(false);
  const [sucursalParaInfoAdicional, setSucursalParaInfoAdicional] = useState<any>(null);

  const sucursales = (sucursalesQuery.data || []).filter((s: any) => s.id_barberia === idBarberia);
  const servicios = serviciosQuery.data || [];

  useEffect(() => {
    if (sucursales.length > 0 && !sucursalSeleccionada) {
      const principal = sucursales.find((s: any) => s.numero_sucursal === 1);
      setSucursalSeleccionada(principal || sucursales[0]);
    }
  }, [sucursales, sucursalSeleccionada]);

  const handleAddSucursal = () => { setSucursalToEdit(null); setIsModalOpen(true); };
  const handleEditSucursal = (s: any) => { setSucursalToEdit(s); setIsModalOpen(true); };
  const handleEditInfoAdicional = (s: any) => { setSucursalParaInfoAdicional(s); setIsInfoAdicionalModalOpen(true); };

  const handleSaveSucursal = async (values: Partial<Sucursal>) => {
    try {
      if (values.id) {
        await updateBarberiaInfoMutation.mutateAsync({
          id: values.id, numero_sucursal: values.numero_sucursal,
          nombre_sucursal: values.nombre_sucursal, telefono: values.telefono,
          direccion: values.direccion, info: values.info, updated_at: new Date().toISOString(),
        });
      } else if (sucursalToEdit?.id) {
        await updateBarberiaInfoMutation.mutateAsync({
          id: sucursalToEdit.id, numero_sucursal: sucursalToEdit.numero_sucursal,
          nombre_sucursal: values.nombre_sucursal, telefono: values.telefono,
          direccion: values.direccion, info: values.info, updated_at: new Date().toISOString(),
        });
      } else {
        if (!idBarberia) throw new Error("ID de barbería no disponible");
        const newSucursal = await createSucursalMutation.mutateAsync({
          nombre_sucursal: values.nombre_sucursal || null,
          telefono: values.telefono || null,
          direccion: values.direccion || null,
          info: values.info || null,
          id_barberia: idBarberia,
        } as any);
        if (newSucursal?.id) setSucursalToEdit(newSucursal);
      }
      setIsModalOpen(false);
      setIsInfoAdicionalModalOpen(false);
      setSucursalToEdit(null);
      setSucursalParaInfoAdicional(null);
    } catch (error: any) {
      console.error("Error al guardar la sucursal:", error);
      alert(`Error al guardar: ${error?.message || "Error desconocido"}`);
    }
  };

  // Access denied
  if (!isAdmin) {
    return (
      <div style={{ ...S.page, textAlign: "center", paddingTop: 80 }}>
        <h2 style={S.heading}>Acceso Restringido</h2>
        <p style={S.subtitle}>Esta sección es solo para administradores.</p>
      </div>
    );
  }

  if (!idBarberia) {
    return (
      <div style={{ ...S.page, textAlign: "center", paddingTop: 80 }}>
        <h2 style={S.heading}>Sin Barbería</h2>
        <p style={S.subtitle}>No tienes acceso a esta sección.</p>
      </div>
    );
  }

  const sel = sucursalSeleccionada;

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={S.heading}>Mi Barbería</h1>
          <p style={S.subtitle}>Gestión de sucursales, barberos y servicios</p>
        </div>
        <button style={S.btn} onClick={handleAddSucursal}>+ Sucursal</button>
      </div>

      {/* Sucursal tabs */}
      {sucursales.length > 0 && (
        <div style={{ display: "flex", borderBottom: "1px solid #1a1a1a", marginBottom: 24, overflow: "auto" }}>
          {[...sucursales]
            .sort((a: any, b: any) => {
              if (a.numero_sucursal === 1) return -1;
              if (b.numero_sucursal === 1) return 1;
              return a.numero_sucursal - b.numero_sucursal;
            })
            .map((suc: any) => (
              <button
                key={suc.id}
                onClick={() => setSucursalSeleccionada(suc)}
                style={S.sucTab(sel?.id === suc.id)}
              >
                {suc.nombre_sucursal || `Sucursal ${suc.numero_sucursal}`}
                {suc.numero_sucursal === 1 && (
                  <span style={{ marginLeft: 8, fontSize: "0.625rem", color: "#C5A059", opacity: 0.7 }}>PRINCIPAL</span>
                )}
              </button>
            ))}
        </div>
      )}

      {/* Sucursal Content */}
      {sel && (
        <>
          {/* Info card */}
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={S.sectionTitle}>{sel.nombre_sucursal || "Sin nombre"}</h3>
              <button style={S.btnSmall} onClick={() => handleEditSucursal(sel)}>Editar sucursal</button>
            </div>
            <InfoRow label="Teléfono" value={sel.telefono || "No especificado"} />
            <InfoRow label="Dirección" value={sel.direccion || "No especificada"} />
          </div>

          {/* Horarios */}
          <div style={S.card}>
            <SucursalHorariosSection
              idSucursal={sel.id}
              nombreSucursal={sel.nombre_sucursal || `Sucursal ${sel.numero_sucursal}`}
            />
          </div>

          {/* Barberos */}
          <div style={S.card}>
            <SucursalBarberosSection
              sucursalId={sel.numero_sucursal}
              sucursalUuid={sel.id}
              sucursalNombre={sel.nombre_sucursal || undefined}
              isAdmin={isAdmin || false}
            />
          </div>

          {/* Servicios */}
          <div style={S.card}>
            <SucursalServiciosSection
              sucursalId={sel.id}
              idBarberia={idBarberia}
              servicios={servicios}
              isLoading={serviciosQuery.isLoading}
              onCreateService={createServiceMutation.mutateAsync}
              onUpdateService={(id: string, service: any) => updateServiceMutation.mutateAsync({ id, service })}
              onDeleteService={deleteServiceMutation.mutateAsync}
            />
          </div>

          {/* Info adicional */}
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={S.sectionTitle}>Información Adicional</h3>
              <button style={S.btnSmall} onClick={() => handleEditInfoAdicional(sel)}>Editar</button>
            </div>
            <p style={{ color: "#8A8A8A", fontSize: "0.875rem", fontFamily: "var(--font-body)", whiteSpace: "pre-line", margin: 0 }}>
              {sel.info || "No se ha proporcionado información adicional."}
            </p>
          </div>
        </>
      )}

      {/* Modals (preserved from original) */}
      <LegacyEditarSucursalModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initial={sucursalToEdit || undefined}
        onSave={handleSaveSucursal}
      />
      <LegacyEditarInfoAdicionalModal
        open={isInfoAdicionalModalOpen}
        onOpenChange={(open: boolean) => {
          setIsInfoAdicionalModalOpen(open);
          if (!open) setSucursalParaInfoAdicional(null);
        }}
        initial={sucursalParaInfoAdicional}
        onSave={handleSaveSucursal}
      />

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          [style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
