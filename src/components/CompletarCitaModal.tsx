"use client";

import React, { useState } from "react";
import { useCajaRecords } from "@/hooks/useCajaRecords";
import { getSupabaseClient } from "@/lib/supabaseClient";

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

  const handleCompletar = async () => {
    if (!metodoPago) {
      setError("Por favor, seleccione un método de pago");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Actualizar la cita a estado "completado"
      const { error: citaError } = await (supabase as any)
        .from("mibarber_citas")
        .update({ 
          estado: "completado",
          nro_factura: numeroFactura || null
        })
        .eq("id_cita", citaId);
      
      if (citaError) throw citaError;
      
      // Crear registro en caja
      const { error: cajaError } = await (supabase as any)
        .from("mibarber_caja")
        .insert({
          id_cita: citaId,
          id_cliente: "", // Se obtendrá de la cita
          monto: 0, // Se obtendrá del servicio
          numero_factura: numeroFactura || "",
          fecha: new Date().toISOString(),
          metodo_pago: metodoPago
        });
      
      if (cajaError) throw cajaError;
      
      onCompletado();
      onClose();
    } catch (err) {
      console.error("Error al completar cita:", err);
      setError("Error al completar la cita. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="qoder-dark-window w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">Completar Cita</h3>
        
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded p-2 mb-4 text-red-300">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-qoder-dark-text-secondary mb-1">
              Número de Factura (Opcional)
            </label>
            <input
              type="text"
              value={numeroFactura}
              onChange={(e) => setNumeroFactura(e.target.value)}
              className="w-full qoder-dark-input p-2"
              placeholder="Ingrese el número de factura"
            />
          </div>
          
          <div>
            <label className="block text-sm text-qoder-dark-text-secondary mb-1">
              Método de Pago *
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full qoder-dark-input p-2"
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
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="qoder-dark-button-secondary px-4 py-2"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleCompletar}
            className="qoder-dark-button px-4 py-2"
            disabled={isLoading}
          >
            {isLoading ? "Completando..." : "Completar Cita"}
          </button>
        </div>
      </div>
    </div>
  );
}