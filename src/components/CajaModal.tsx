"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useCitas } from "@/hooks/useCitas";
import { usePrecioServicio } from "@/hooks/usePrecioServicio";
import { useBarberos } from "@/hooks/useBarberos";
import { useCajaRecords } from "@/hooks/useCajaRecords";
import { useCitasPendientesCaja } from "@/hooks/useCitasPendientesCaja";
import type { CajaRecord } from "@/types/db";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<CajaRecord>;
  onSave: (values: any) => Promise<void>;
};

export function CajaModal({ open, onOpenChange, initial, onSave }: Props) {
  console.log("=== CajaModal RENDER ===");
  console.log("Props recibidos:", { open, initial });
  
  const isEdit = Boolean(initial?.id_movimiento);
  const [concepto, setConcepto] = useState(initial?.concepto || "");
  const [monto, setMonto] = useState(initial?.monto?.toString() || "");
  const [id_cita, setId_cita] = useState(initial?.id_cita || "");
  const [id_cliente, setId_cliente] = useState(initial?.id_cliente || "");
  const [barbero_id, setBarbero_id] = useState(initial?.barbero || "");
  const [metodo_pago, setMetodo_pago] = useState(initial?.metodo_pago || "");
  
  // Mostrar los valores del estado
  console.log("Estado del formulario:", {
    concepto,
    monto,
    id_cita,
    id_cliente,
    barbero_id,
    metodo_pago
  });
  
  // Estados para las citas pendientes
  const [selectedCita, setSelectedCita] = useState<any>(null);
  const { data: citasPendientes, isLoading: isLoadingCitas } = useCitasPendientesCaja(); // Cambiamos a usar citas pendientes
  
  // Obtener registros de caja para filtrar citas ya registradas
  const { records: cajaRecords, isLoading: isLoadingCaja } = useCajaRecords({});
  
  // Calcular las citas pendientes de manera eficiente
  const pendingCajaAppointments = useMemo(() => {
    if (!citasPendientes) return [];
    return citasPendientes;
  }, [citasPendientes]);
  
  // Obtener lista de barberos
  const { data: barberos, isLoading: isLoadingBarberos } = useBarberos();
  
  // Obtener el precio del servicio seleccionado
  const { data: precioServicio } = usePrecioServicio(selectedCita?.servicio || "");
  
  // Mostrar información de depuración
  useEffect(() => {
    if (selectedCita) {
      console.log("Cita seleccionada:", selectedCita);
    }
  }, [selectedCita]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    console.log("=== useEffect: Resetear formulario ===");
    if (open) {
      setConcepto(initial?.concepto || "");
      setMonto(initial?.monto?.toString() || "");
      setId_cita(initial?.id_cita || "");
      setId_cliente(initial?.id_cliente || "");
      setBarbero_id(initial?.barbero || "");
      setMetodo_pago(initial?.metodo_pago || "");
      setErrors({});
      
      // Si es edición, buscar la cita asociada
      if (initial?.id_cita && citasPendientes) {
        const cita = citasPendientes.find((c: any) => c.id_cita === initial.id_cita);
        if (cita) {
          setSelectedCita(cita);
        }
      } else {
        setSelectedCita(null);
      }
    }
  }, [open, initial, citasPendientes]);

  // Cargar datos automáticamente cuando se selecciona una cita
  useEffect(() => {
    console.log("=== useEffect: Cargar datos de cita ===");
    if (selectedCita) {
      setId_cita(selectedCita.id_cita);
      setId_cliente(selectedCita.id_cliente || "");
      
      // Establecer el concepto basado en el servicio
      if (selectedCita.servicio) {
        setConcepto(`Servicio de ${selectedCita.servicio}`);
      }
      
      // Establecer el monto basado en el precio del servicio
      if (precioServicio !== undefined) {
        setMonto(precioServicio.toString());
      }
      
      // Establecer el barbero automáticamente si está disponible en la cita
      if (selectedCita.barbero) {
        // Buscar el ID del barbero por nombre
        const barbero = barberos?.find((b: any) => b.nombre === selectedCita.barbero);
        if (barbero) {
          setBarbero_id(barbero.id_barbero);
        } else if (selectedCita.barbero_nombre) {
          // Si tenemos el nombre del barbero, buscar por nombre
          const barberoByName = barberos?.find((b: any) => b.nombre === selectedCita.barbero_nombre);
          if (barberoByName) {
            setBarbero_id(barberoByName.id_barbero);
          }
        }
      }
    } else if (!isEdit) {
      // Limpiar campos si no hay cita seleccionada y no es edición
      setConcepto("");
      setMonto("");
      setId_cita("");
      setId_cliente("");
      setBarbero_id("");
    }
  }, [selectedCita, precioServicio, barberos, isEdit]);

  // Validar el formulario
  const validate = () => {
    console.log("=== Validando formulario ===");
    const newErrors: Record<string, string> = {};
    
    // Validar concepto
    if (!concepto) {
      newErrors.concepto = "El concepto es obligatorio";
    }
    
    // Validar monto
    const montoNum = parseFloat(monto);
    if (!monto) {
      newErrors.monto = "El monto es obligatorio";
    } else if (isNaN(montoNum) || montoNum <= 0) {
      newErrors.monto = "El monto debe ser un número mayor a 0";
    }
    
    // Validar UUID de cita si se proporciona
    if (id_cita) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id_cita)) {
        newErrors.id_cita = "El ID de turno debe ser un UUID válido";
      }
    }
    
    // Validar formato de teléfono si se proporciona
    if (id_cliente) {
      const phoneRegex = /^\+598\d{8,9}$/;
      if (!phoneRegex.test(id_cliente)) {
        newErrors.id_cliente = "El ID de cliente debe tener formato internacional (+598...)";
      }
    }
    
    // Validar método de pago
    if (!metodo_pago) {
      newErrors.metodo_pago = "El método de pago es obligatorio";
    }
    
    // Validar barbero
    if (!barbero_id) {
      newErrors.barbero_id = "El barbero es obligatorio";
    }
    
    console.log("Errores de validación:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("=== handleSubmit INICIADO ===");
    
    if (!validate()) {
      console.log("❌ Validación fallida");
      toast.error("Por favor, corrija los errores en el formulario");
      return;
    }
    
    // Preparar los datos a enviar
    const dataToSend: any = {
      concepto,
      monto: parseFloat(monto),
      metodo_pago
    };
    
    // Agregar campos opcionales si están presentes
    if (id_cita) dataToSend.id_cita = id_cita;
    if (id_cliente) dataToSend.id_cliente = id_cliente;
    
    // Manejar el campo de barbero
    if (barbero_id) {
      dataToSend.barbero = barbero_id;
    }
    
    console.log("Datos a enviar:", dataToSend);
    
    try {
      console.log("Llamando a onSave...");
      await onSave(dataToSend);
      console.log("✅ onSave completado exitosamente");
      toast.success(isEdit ? "Registro actualizado" : "Registro creado");
      onOpenChange(false);
    } catch (error: any) {
      console.error("❌ Error en handleSubmit:", error);
      console.error("Mensaje de error:", error.message);
      console.error("Stack trace:", error.stack);
      
      // Mostrar mensaje de error más específico
      let errorMessage = "Error al guardar el registro";
      if (error.message) {
        errorMessage += ": " + error.message;
      }
      
      // Si el error es por respuesta no válida, mostrar un mensaje más claro
      if (error.message && error.message.includes("JSON")) {
        errorMessage = "Error de conexión con el servidor. Por favor, intente nuevamente.";
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 z-50 qoder-dark-modal-overlay" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="qoder-dark-card">
            <div className="qoder-dark-window-header">
              <Dialog.Title className="text-lg font-semibold text-qoder-dark-text-primary">
                {isEdit ? "Editar registro" : "Nuevo registro"}
              </Dialog.Title>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4">
              {!isEdit && (
                <div className="col-span-2">
                  <label className="text-xs text-qoder-dark-text-secondary">Seleccionar Turno Completado</label>
                  <select
                    className="w-full qoder-dark-input p-3 rounded-lg"
                    value={selectedCita?.id_cita || ""}
                    onChange={(e) => {
                      const cita = pendingCajaAppointments.find((c: any) => c.id_cita === e.target.value);
                      setSelectedCita(cita || null);
                    }}
                    disabled={isLoadingCitas || isLoadingCaja}
                  >
                    <option value="">Seleccione un turno completado</option>
                    {pendingCajaAppointments.map((cita: any) => (
                      <option key={cita.id_cita} value={cita.id_cita}>
                        {cita.fecha} {cita.hora?.slice(0, 5)} - {cita.cliente_nombre} - {cita.servicio}
                      </option>
                    ))}
                  </select>
                  {(isLoadingCitas || isLoadingCaja) && <p className="text-qoder-dark-text-secondary text-xs mt-1">Cargando turnos...</p>}
                </div>
              )}
              
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Concepto</label>
                <input 
                  className={`w-full qoder-dark-input p-3 rounded-lg ${errors.concepto ? "border-red-500" : ""}`} 
                  value={concepto} 
                  onChange={(e) => setConcepto(e.target.value)} 
                  placeholder="Ej: Servicio de corte de cabello"
                />
                {errors.concepto && <p className="text-red-500 text-xs mt-1">{errors.concepto}</p>}
              </div>
              
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Monto</label>
                <input 
                  type="number"
                  step="0.01"
                  className={`w-full qoder-dark-input p-3 rounded-lg ${errors.monto ? "border-red-500" : ""}`} 
                  value={monto} 
                  onChange={(e) => setMonto(e.target.value)} 
                  placeholder="Ej: 1500.50"
                />
                {errors.monto && <p className="text-red-500 text-xs mt-1">{errors.monto}</p>}
                {selectedCita?.servicio && precioServicio !== undefined && (
                  <p className="text-qoder-dark-text-secondary text-xs mt-1">
                    Precio sugerido para {selectedCita.servicio}: ${precioServicio.toFixed(2)}
                  </p>
                )}
              </div>
              
              <div className="col-span-2 hidden">
                <label className="text-xs text-qoder-dark-text-secondary">ID Turno (UUID)</label>
                <input 
                  className={`w-full qoder-dark-input p-3 rounded-lg ${errors.id_cita ? "border-red-500" : ""}`} 
                  value={id_cita} 
                  onChange={(e) => setId_cita(e.target.value)} 
                  placeholder="Ej: 01a60475-7f9a-2d2a-a3dc-4dc13a538888"
                  readOnly={!!selectedCita && !isEdit}
                />
                {errors.id_cita && <p className="text-red-500 text-xs mt-1">{errors.id_cita}</p>}
              </div>
              
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">ID Cliente (Teléfono)</label>
                <input 
                  className={`w-full qoder-dark-input p-3 rounded-lg ${errors.id_cliente ? "border-red-500" : ""}`} 
                  value={id_cliente} 
                  onChange={(e) => setId_cliente(e.target.value)} 
                  placeholder="Ej: +59891608727"
                  readOnly={!!selectedCita && !isEdit}
                />
                {errors.id_cliente && <p className="text-red-500 text-xs mt-1">{errors.id_cliente}</p>}
              </div>
              
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Barbero</label>
                {isEdit ? (
                  <select
                    className={`w-full qoder-dark-input p-3 rounded-lg ${errors.barbero_id ? "border-red-500" : ""}`}
                    value={barbero_id}
                    onChange={(e) => setBarbero_id(e.target.value)}
                    disabled={isLoadingBarberos}
                  >
                    <option value="">Seleccione un barbero</option>
                    {barberos?.map((barbero: any) => (
                      <option key={barbero.id_barbero} value={barbero.id_barbero}>
                        {barbero.nombre}
                      </option>
                    ))}
                  </select>
                ) : selectedCita?.barbero_nombre ? (
                  <div className="w-full qoder-dark-input p-3 rounded-lg">
                    {selectedCita.barbero_nombre}
                  </div>
                ) : selectedCita?.barbero ? (
                  <div className="w-full qoder-dark-input p-3 rounded-lg">
                    {selectedCita.barbero}
                  </div>
                ) : (
                  <div className="w-full qoder-dark-input p-3 rounded-lg text-qoder-dark-text-secondary">
                    Sin barbero asignado
                  </div>
                )}
                {errors.barbero_id && isEdit && <p className="text-red-500 text-xs mt-1">{errors.barbero_id}</p>}
                {selectedCita?.barbero_nombre && !barbero_id && !isEdit && (
                  <p className="text-qoder-dark-text-secondary text-xs mt-1">
                    Barbero asignado al turno: {selectedCita.barbero_nombre}
                  </p>
                )}
              </div>
              
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Método de Pago</label>
                <select
                  className={`w-full qoder-dark-input p-3 rounded-lg ${errors.metodo_pago ? "border-red-500" : ""}`}
                  value={metodo_pago}
                  onChange={(e) => setMetodo_pago(e.target.value)}
                >
                  <option value="">Seleccione método de pago</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Otro">Otro</option>
                </select>
                {errors.metodo_pago && <p className="text-red-500 text-xs mt-1">{errors.metodo_pago}</p>}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 p-4 pt-0">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="cancel-button"
              >
                <span>Cancelar</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="action-button"
              >
                <span>{isEdit ? "Actualizar" : "Crear registro"}</span>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}