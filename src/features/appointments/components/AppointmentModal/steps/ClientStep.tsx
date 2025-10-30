"use client";

import { useState, useMemo } from "react";
import type { Appointment } from "@/types/db";
import type { Client } from "@/types/db";
import { useClientes } from "@/hooks/useClientes";

interface ClientStepProps {
  formData: Partial<Appointment>;
  updateFormData: (updates: Partial<Appointment>) => void;
  nextStep: () => void;
  sucursalId?: string;
}

/**
 * Paso 1 del wizard: Selección de cliente
 */
export function ClientStep({ 
  formData, 
  updateFormData, 
  nextStep,
  sucursalId
}: ClientStepProps) {
  const [searchTerm, setSearchTerm] = useState(formData.cliente_nombre || "");
  const [showQuickClientForm, setShowQuickClientForm] = useState(false);
  const [quickClientData, setQuickClientData] = useState({
    nombre: "",
    telefono: "",
  });

  const { data: clientesData, isLoading: isLoadingClientes, createMutation } = useClientes(
    undefined, 
    "ultimo_agregado", 
    sucursalId
  );

  // Filtrar clientes según el término de búsqueda
  const filteredClientes = useMemo(() => {
    if (!clientesData || clientesData.length === 0) return [];

    if (!searchTerm) return clientesData;

    const term = searchTerm.toLowerCase();
    return clientesData.filter(
      (cliente: Client) =>
        (cliente.nombre && cliente.nombre.toLowerCase().includes(term)) ||
        (cliente.telefono && cliente.telefono.toLowerCase().includes(term)),
    );
  }, [clientesData, searchTerm]);

  const handleClientSelect = (cliente: Client) => {
    updateFormData({
      id_cliente: cliente.id_cliente,
      cliente_nombre: cliente.nombre,
      telefono: cliente.telefono || null, // Agregar el teléfono del cliente
    });
    setSearchTerm(cliente.nombre || "");
  };

  const handleCreateQuickClient = async () => {
    if (!quickClientData.nombre.trim()) {
      alert("Por favor ingrese el nombre del cliente");
      return;
    }

    if (!sucursalId) {
      alert("No se ha seleccionado una sucursal");
      return;
    }

    try {
      // Crear el cliente con los datos proporcionados
      const newClientArray: Client[] = (await createMutation.mutateAsync({
        nombre: quickClientData.nombre,
        telefono: quickClientData.telefono || undefined,
        id_sucursal: sucursalId,
      })) as Client[];

      // Tomar el primer cliente del array
      const newClient = newClientArray[0];

      // Actualizar los valores del turno con el nuevo cliente
      updateFormData({
        id_cliente: newClient.id_cliente,
        cliente_nombre: newClient.nombre,
        telefono: newClient.telefono || null, // Agregar el teléfono del cliente
      });

      // Limpiar el formulario y ocultarlo
      setQuickClientData({ nombre: "", telefono: "" });
      setShowQuickClientForm(false);
      setSearchTerm(newClient.nombre || "");

    } catch (error) {
      console.error("Error al crear cliente rápido:", error);
      alert("Error al crear el cliente. Por favor intente nuevamente.");
    }
  };

  const handleNext = () => {
    if (!formData.cliente_nombre) {
      alert("Por favor seleccione un cliente");
      return;
    }
    nextStep();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-qoder-dark-text-primary mb-2">
          Seleccionar Cliente
        </h3>
        
        {/* Campo de búsqueda de cliente */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
            Cliente
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Actualizar formData solo si el usuario está escribiendo
              if (!formData.id_cliente) {
                updateFormData({ cliente_nombre: e.target.value });
              }
            }}
            className="qoder-dark-input w-full px-3 py-2 rounded-lg"
            placeholder="Buscar cliente..."
            list="clientes-list"
          />
          
          {/* Lista de clientes filtrados */}
          {clientesData && clientesData.length > 0 && searchTerm && (
            <div className="mt-1 max-h-40 overflow-y-auto border border-qoder-dark-border rounded-lg bg-qoder-dark-bg-primary">
              {filteredClientes.map((cliente: Client) => (
                <div
                  key={cliente.id_cliente}
                  className="px-3 py-2 hover:bg-qoder-dark-bg-hover cursor-pointer text-qoder-dark-text-primary"
                  onClick={() => handleClientSelect(cliente)}
                >
                  {cliente.nombre}
                  {cliente.telefono && (
                    <span className="text-qoder-dark-text-secondary text-sm ml-2">
                      ({cliente.telefono})
                    </span>
                  )}
                </div>
              ))}
              {filteredClientes.length === 0 && (
                <div className="px-3 py-2 text-qoder-dark-text-secondary">
                  No se encontraron clientes
                </div>
              )}
            </div>
          )}
          
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
      </div>
      
      {/* Botón para avanzar al siguiente paso */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="action-button px-4 py-2 rounded-lg"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}