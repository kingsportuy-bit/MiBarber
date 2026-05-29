"use client";

import React, { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { getPanelActionRepository } from "@/lib/adapters/factory";

interface CompletarCitaModalProps {
  citaId: string;
  onClose: () => void;
  onCompletado: () => void;
}

export function CompletarCitaModal({ citaId, onClose, onCompletado }: CompletarCitaModalProps) {
  const [numeroFactura, setNumeroFactura] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const supabase = getSupabaseClient();

  // Validación mejorada del número de factura
  const validateNumeroFactura = (value: string): boolean => {
    // Permitir vacío (opcional)
    if (!value) return true;
    
    // Validar formato: solo números y guiones
    const facturaRegex = /^[0-9\-]+$/;
    return facturaRegex.test(value);
  };

  // Validación mejorada del método de pago
  const validateMetodoPago = (value: string): boolean => {
    const metodosValidos = ["", "Efectivo", "Tarjeta de Débito", "Tarjeta de Crédito", "Transferencia", "Otro"];
    return metodosValidos.includes(value);
  };

  const handleCompletar = async () => {
    // Validaciones mejoradas
    if (!metodoPago) {
      setError("Por favor, seleccione un método de pago");
      return;
    }
    
    if (!validateMetodoPago(metodoPago)) {
      setError("Método de pago no válido");
      return;
    }
    
    if (numeroFactura && !validateNumeroFactura(numeroFactura)) {
      setError("El número de factura solo puede contener números y guiones");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Deuda técnica de obtención de cita (leer es seguro temporalmente)
      const { data: citaData, error: citaError } = await (supabase as any)
        .from("mibarber_citas")
        .select("id_cliente, id_servicio, id_barbero, id_sucursal, id_barberia")
        .eq("id_cita", citaId)
        .single();
      
      if (citaError || !citaData) {
        throw new Error("No se pudo obtener la cita para completar.");
      }

      // Enviar la acción de completar a través del repositorio unificado
      const repo = getPanelActionRepository();
      await repo.panelAction({
        id_cita: citaId,
        id_sucursal: citaData.id_sucursal,
        id_barbero: citaData.id_barbero,
        accion: 'completar',
        origen: 'panel_barbero',
        datos_extra: {
          metodo_pago: metodoPago,
          nro_factura: numeroFactura || null
        }
      });
      
      onCompletado();
      onClose();
    } catch (err: any) {
      console.error("Error al completar cita:", err);
      // Extraemos el mensaje de error del stub si está presente
      setError(err.message || "Error al completar la cita. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="v2-overlay">
      <div className="v2-modal" style={{ maxWidth: '400px' }}>
        <div className="v2-modal-header">
          <h3 className="v2-modal-title">Completar Cita</h3>
        </div>
        
        {error && (
          <div className="v2-modal-body">
            <div className="bg-red-900/30 border border-red-700 rounded p-2 mb-4 text-red-300">
              {error}
            </div>
          </div>
        )}
        
        <div className="v2-modal-body">
          <div className="space-y-4">
            <div>
              <label className="v2-label">
                Número de Factura (Opcional)
              </label>
              <input
                type="text"
                value={numeroFactura}
                onChange={(e) => setNumeroFactura(e.target.value)}
                className="v2-input"
                placeholder="Ingrese el número de factura"
              />
              {numeroFactura && !validateNumeroFactura(numeroFactura) && (
                <p className="text-red-400 text-xs mt-1">Solo números y guiones permitidos</p>
              )}
            </div>
            
            <div>
              <label className="v2-label">
                Método de Pago *
              </label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className={`v2-select ${!metodoPago && error ? 'border-red-500' : ''}`}
              >
                <option value="">Seleccione un método de pago</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="v2-modal-footer">
          <button
            onClick={onClose}
            className="v2-btn v2-btn-secondary"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleCompletar}
            className="v2-btn v2-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Completando..." : "Completar Cita"}
          </button>
        </div>
      </div>
    </div>
  );
}
