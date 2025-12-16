"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useClientes, type SortOption } from "@/hooks/useClientes";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { GlobalFilters } from "@/components/shared/GlobalFilters";
import type { Client } from "@/types/db";
import { LegacyClientModal } from "./LegacyClientModal";
import { LegacyClientDetailModal } from "./LegacyClientDetailModal";
import { LegacyDeleteConfirmModal } from "./LegacyDeleteConfirmModal";
import { toast } from "sonner";

export function ClientsTable() {
  const { idBarberia, isAdmin } = useBarberoAuth();
  const { 
    filters, 
    sucursales, 
    barberos 
  } = useGlobalFilters();

  // Función para convertir puntaje a estrellas con borde dorado y sin relleno
  const getStarsFromScore = (puntaje: number) => {
    // Para puntaje 0 y 1, mostrar 1 estrella
    // Para puntajes mayores, mostrar la cantidad correspondiente
    const starCount =
      puntaje <= 1 ? 1 : Math.min(5, Math.max(0, Math.floor(puntaje)));

    // Añadir solo estrellas vacías con borde dorado según el puntaje
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push(
        <span key={`star-${i}`} className="text-amber-400 text-lg">
          ☆
        </span>,
      );
    }

    return <span className="tracking-wide">{stars}</span>;
  };

  // Función para formatear fecha de última interacción
  const formatLastInteraction = (dateString: string | null) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      // Última semana: mostrar día y hora
      const dayNames = [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
      ];
      const dayName = dayNames[date.getDay()];
      const time = date.toLocaleTimeString("es-UY", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${dayName} ${time}`;
    } else {
      // Más de una semana: mostrar fecha completa
      return date.toLocaleDateString("es-UY");
    }
  };

  const [q, setQ] = useState("");
  // Establecer el orden predeterminado como "último agregado"
  const [sortBy, setSortBy] = useState<SortOption>("ultimo_agregado");
  
  // Agregar efecto para verificar cambios en el estado de búsqueda
  useEffect(() => {
    console.log("🔍 Estado de búsqueda actualizado:", q);
  }, [q]);
  
  const { data, isLoading, createMutation, updateMutation, deleteMutation } =
    useClientes(q, sortBy, filters.sucursalId || undefined); // Usar q para la búsqueda y sucursalId del filtro global

  // Usar todos los clientes filtrados por sucursal
  const filteredClients = data || [];
  
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;
  
  // Calcular índices para la paginación
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  
  // Calcular número total de páginas
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  const [open, setOpen] = useState(false);
  
  // Debugging - log when open state changes
  useEffect(() => {
    console.log('ClientModal open state changed:', open);
  }, [open]);
  const [editing, setEditing] = useState<Partial<Client> | undefined>();

  // Estado para el popup de confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    client: Client | null;
  }>({ open: false, client: null });
  
  // Debugging - log when deleteConfirm state changes
  useEffect(() => {
    console.log('DeleteConfirm state changed:', deleteConfirm);
  }, [deleteConfirm]);

  // Estado para el modal de detalles del cliente
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    client: Client | null;
  }>({ open: false, client: null });
  
  // Debugging - log when detailModal state changes
  useEffect(() => {
    console.log('DetailModal state changed:', detailModal);
  }, [detailModal]);

  const onSave = async (values: Partial<Client>) => {
    try {
      console.log("Guardando cliente:", values);

      if (editing?.id_cliente) {
        // Permitir editar todos los campos disponibles
        const updateData = {
          id_cliente: values.id_cliente!,
          nombre: values.nombre,
          telefono: values.telefono,
          notas: values.notas,
          email: (values as any).email,
          fecha_nacimiento: (values as any).fecha_nacimiento,
          direccion: (values as any).direccion,
        };
        console.log("Actualizando cliente:", updateData);
        await updateMutation.mutateAsync(updateData);
        toast.success("Cliente actualizado");
      } else {
        // Para nuevos clientes, validar que el nombre esté presente
        if (!values.nombre) {
          toast.error("Nombre es obligatorio");
          return;
        }

        // Para nuevos clientes, crear con teléfono y nombre
        // La base de datos generará automáticamente el UUID para id_cliente
        const newClientData = {
          nombre: values.nombre,
          telefono: values.telefono || null,
          notas: values.notas || null,
          email: (values as any).email || null,
          fecha_nacimiento: (values as any).fecha_nacimiento || null,
          direccion: (values as any).direccion || null,
          // Agregar el ID de barbería y sucursal del usuario actual
          id_barberia: idBarberia || undefined,
          id_sucursal: filters.sucursalId || undefined,
        };

        console.log("Creando nuevo cliente:", newClientData);
        const result = await createMutation.mutateAsync(newClientData);
        console.log("Cliente creado exitosamente:", result);
        toast.success("Cliente creado");
      }
      setOpen(false);
      setEditing(undefined);
    } catch (e: unknown) {
      console.error("Error al guardar cliente:", e);
      const message = e instanceof Error ? e.message : "No se pudo guardar";
      toast.error(message);
    }
  };

  const confirmDelete = useCallback((client: Client) => {
    setDeleteConfirm({ open: true, client });
  }, []);

  const onDelete = async () => {
    if (!deleteConfirm.client?.id_cliente) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirm.client.id_cliente);
      toast.success(`Cliente ${deleteConfirm.client.nombre} eliminado`);
      setDeleteConfirm({ open: false, client: null });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "No se pudo eliminar";
      toast.error(message);
    }
  };

  // Función para manejar el cambio de ordenamiento
  const handleSort = (field: SortOption) => {
    setSortBy(field);
  };

  // Funciones para determinar el ordenamiento de cada columna
  const toggleNameSort = () => {
    setSortBy(
      sortBy === "ultimo_agregado" ? "primero_agregado" : "ultimo_agregado",
    );
  };

  const toggleScoreSort = () => {
    setSortBy(sortBy === "mayor_puntaje" ? "menor_puntaje" : "mayor_puntaje");
  };

  const toggleInteractionSort = () => {
    setSortBy(
      sortBy === "ultima_interaccion"
        ? "ultimo_agregado"
        : "ultima_interaccion",
    );
  };

  // Función para mostrar el modal de detalles del cliente
  const showClientDetails = useCallback((client: Client) => {
    console.log('Opening client details modal for client:', client);
    setDetailModal({ open: true, client });
  }, []);

  return (
    <>
      {/* Implementación directa sin TableLayout */}
      <div className="space-y-4 h-full flex flex-col">
        {/* Barra superior con filtro a la izquierda y buscador/botón a la derecha */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Filtro de sucursales a la izquierda */}
          <div className="flex-1 min-w-[200px] max-w-xs">
            <GlobalFilters showDateFilters={false} showBarberoFilter={false} />
          </div>
          
          {/* Buscador y botón Nuevo a la derecha */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className={`qoder-dark-input py-2 px-4 text-sm md:py-3 md:px-5 md:text-base w-full sm:w-64 ${q ? 'pr-10' : 'pr-4'}`}
              />
              {q && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    onClick={() => setQ('')}
                    className="boton-simple"
                    style={{ 
                      background: 'transparent',
                      border: 'none',
                      padding: '0.25rem',
                      cursor: 'pointer',
                      transition: 'none',
                      height: '1.5rem',
                      width: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => {
                console.log('Opening new client modal');
                setEditing(undefined);
                setOpen(true);
              }}
              className="qoder-dark-button-primary px-3 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition text-sm md:px-4 md:py-2 md:text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Nuevo</span>
            </button>
          </div>
        </div>

        {/* Contenedor de la tabla con altura responsiva */}
        <div className="bg-qoder-dark-bg-secondary flex-grow flex flex-col h-full overflow-hidden rounded-xl">
          <div className="h-full flex flex-col">
            <div className="overflow-auto flex-grow h-full">
              {/* Tabla responsive con diseño de cards en móviles */}
              <table className="hidden md:table min-w-full text-sm rounded-xl overflow-hidden shadow-lg">
                <thead className="bg-qoder-dark-bg-tertiary">
                  <tr>
                    <th className="px-3 py-2 text-left text-qoder-dark-text-primary font-semibold rounded-tl-xl text-sm md:px-4 md:py-3">
                      Celular
                    </th>
                    <th
                      className="px-3 py-2 text-left text-qoder-dark-text-primary font-semibold cursor-pointer hover:bg-qoder-dark-bg-hover text-sm md:px-4 md:py-3"
                      onClick={toggleNameSort}
                    >
                      <div className="flex items-center gap-1">
                        Nombre
                        <span className="text-xs">
                          {sortBy === "ultimo_agregado" && <span>↓</span>}
                          {sortBy === "primero_agregado" && <span>↑</span>}
                          {sortBy !== "ultimo_agregado" &&
                            sortBy !== "primero_agregado" && (
                              <span className="opacity-50">↕</span>
                            )}
                        </span>
                      </div>
                    </th>
                    <th
                      className="px-3 py-2 text-left text-qoder-dark-text-primary font-semibold cursor-pointer hover:bg-qoder-dark-bg-hover text-sm md:px-4 md:py-3"
                      onClick={toggleScoreSort}
                    >
                      <div className="flex items-center gap-1">
                        Puntaje
                        <span className="text-xs">
                          {sortBy === "mayor_puntaje" && <span>↓</span>}
                          {sortBy === "menor_puntaje" && <span>↑</span>}
                          {sortBy !== "mayor_puntaje" &&
                            sortBy !== "menor_puntaje" && (
                              <span className="opacity-50">↕</span>
                            )}
                        </span>
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-qoder-dark-text-primary font-semibold text-sm md:px-4 md:py-3">
                      Notas
                    </th>
                    <th
                      className="px-3 py-2 text-left text-qoder-dark-text-primary font-semibold cursor-pointer hover:bg-qoder-dark-bg-hover text-sm md:px-4 md:py-3"
                      onClick={toggleInteractionSort}
                    >
                      <div className="flex items-center gap-1">
                        Última interacción
                        <span className="text-xs">
                          {sortBy === "ultima_interaccion" && <span>↓</span>}
                          {sortBy !== "ultima_interaccion" && (
                            <span className="opacity-50">↕</span>
                          )}
                        </span>
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-qoder-dark-text-primary font-semibold rounded-tr-xl text-sm md:px-4 md:py-3">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td
                        className="px-3 py-2 text-qoder-dark-text-primary text-sm md:px-4 md:py-3"
                        colSpan={6}
                      >
                        Cargando…
                      </td>
                    </tr>
                  )}
                  {currentClients.map((c, index) => (
                    <tr
                      key={c.id_cliente}
                      className={`border-t border-qoder-dark-border-primary hover:bg-qoder-dark-bg-hover transition-all duration-150`}
                    >
                      <td className="px-3 py-2 max-w-xs bg-qoder-dark-bg-secondary md:px-4 md:py-3">
                        <div
                          className="truncate text-xs opacity-80 text-qoder-dark-text-primary md:text-sm"
                          title={c.telefono || ""}
                        >
                          {c.telefono || "-"}
                        </div>
                      </td>
                      <td className="px-3 py-2 max-w-xs bg-qoder-dark-bg-secondary md:px-4 md:py-3">
                        <div
                          className="truncate text-xs opacity-80 text-qoder-dark-text-primary md:text-sm"
                          title={c.nombre || ""}
                        >
                          {c.nombre || "-"}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-qoder-dark-text-secondary bg-qoder-dark-bg-secondary md:px-4 md:py-3 md:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {getStarsFromScore(c.puntaje ?? 0)}
                          </span>
                          <span className="text-xs text-qoder-dark-text-secondary">
                            ({c.puntaje ?? 0})
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 max-w-xs bg-qoder-dark-bg-secondary md:px-4 md:py-3">
                        <div
                          className="truncate text-xs opacity-80 text-qoder-dark-text-primary md:text-sm"
                          title={c.notas || ""}
                        >
                          {c.notas || "-"}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-qoder-dark-text-secondary bg-qoder-dark-bg-secondary md:px-4 md:py-3 md:text-sm">
                        {formatLastInteraction(c.ultima_interaccion)}
                      </td>
                      <td className={`px-3 py-2 bg-qoder-dark-bg-secondary md:px-4 md:py-3 ${index === 0 ? 'rounded-tr-xl' : ''} ${index === currentClients.length - 1 ? 'rounded-br-xl' : ''}`}>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => showClientDetails(c)}
                            className="text-white hover:text-gray-300 bg-transparent !bg-none border-none p-1"
                            title="Ver ficha del cliente"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              console.log('Opening edit modal for client:', c);
                              setEditing(c);
                              setOpen(true);
                            }}
                            className="text-blue-500 hover:text-blue-300 bg-transparent !bg-none border-none p-1"
                            title="Editar cliente"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              console.log('Opening delete confirmation for client:', c);
                              confirmDelete(c);
                            }}
                            className="text-red-500 hover:text-red-300 bg-transparent !bg-none border-none p-1"
                            title="Eliminar cliente"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && (filteredClients?.length ?? 0) === 0 && (
                    <tr>
                      <td
                        className="px-3 py-4 text-center opacity-60 text-qoder-dark-text-primary rounded-b-xl text-sm md:px-4 md:py-6 md:text-base"
                        colSpan={6}
                      >
                        Sin resultados
                      </td>
                    </tr>
                  )}
                  
                  {/* Fila de paginación para desktop */}
                  <tr>
                    <td colSpan={6} className="px-4 py-3 bg-qoder-dark-bg-secondary rounded-b-xl">
                      {totalPages > 1 && (
                        <div className="flex flex-col items-center space-y-2">
                          <div className="flex justify-center items-center space-x-1">
                            <span
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              className="text-qoder-dark-text-muted text-sm cursor-pointer hover:text-qoder-dark-text-primary px-2"
                            >
                              Anterior
                            </span>
                            
                            {/* Números de página */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              
                              return (
                                <span
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`text-sm cursor-pointer px-2 ${currentPage === pageNum 
                                    ? 'text-qoder-dark-accent-primary font-medium' 
                                    : 'text-qoder-dark-text-muted hover:text-qoder-dark-text-primary'}`}
                                >
                                  {pageNum}
                                </span>
                              );
                            })}
                            
                            <span
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              className="text-qoder-dark-text-muted text-sm cursor-pointer hover:text-qoder-dark-text-primary px-2"
                            >
                              Siguiente
                            </span>
                          </div>
                          
                          <div className="text-qoder-dark-text-primary text-xs">
                            Página {currentPage} de {totalPages} (Total: {filteredClients.length} clientes)
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              
              {/* Vista de tabla para móviles */}
              <div className="md:hidden">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-qoder-dark-border-primary bg-qoder-dark-bg-tertiary text-center">
                        <th className="py-2 px-2 text-qoder-dark-text-primary font-semibold text-sm">Nombre</th>
                        <th className="py-2 px-2 text-qoder-dark-text-primary font-semibold text-sm">Puntaje</th>
                        <th className="py-2 px-2 text-qoder-dark-text-primary font-semibold text-sm">Teléfono</th>
                        <th className="py-2 px-2 text-qoder-dark-text-primary font-semibold text-sm">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentClients.map((c) => (
                        <tr 
                          key={c.id_cliente} 
                          className="border-b border-qoder-dark-border-primary hover:bg-qoder-dark-bg-hover text-center"
                        >
                          <td className="py-2 px-2 text-qoder-dark-text-primary text-sm truncate max-w-[100px]">
                            {c.nombre || "-"}
                          </td>
                          <td className="py-2 px-2 text-qoder-dark-text-secondary text-sm">
                            <div className="flex items-center justify-center">
                              {getStarsFromScore(c.puntaje ?? 0)}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-qoder-dark-text-secondary text-sm truncate max-w-[80px]">
                            {c.telefono || "-"}
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex space-x-1 justify-center">
                              <button
                                onClick={() => {
                                  setEditing(c);
                                  setOpen(true);
                                }}
                                className="text-blue-500 hover:text-blue-300 bg-transparent !bg-none border-none p-1"
                                title="Editar cliente"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => confirmDelete(c)}
                                className="text-red-500 hover:text-red-300 bg-transparent !bg-none border-none p-1"
                                title="Eliminar cliente"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {!isLoading && (filteredClients?.length ?? 0) === 0 && (
                  <div className="text-center py-6 text-qoder-dark-text-secondary">
                    Sin resultados
                  </div>
                )}
                
                {/* Paginación para mobile - Alineada a la derecha */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 bg-qoder-dark-bg-secondary border-t border-qoder-dark-border-primary">
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex justify-end items-center space-x-1">
                        <span
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className="text-qoder-dark-text-muted text-sm cursor-pointer hover:text-qoder-dark-text-primary px-2"
                        >
                          Anterior
                        </span>
                        
                        {/* Números de página */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <span
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`text-sm cursor-pointer px-2 ${currentPage === pageNum 
                                ? 'text-qoder-dark-accent-primary font-medium' 
                                : 'text-qoder-dark-text-muted hover:text-qoder-dark-text-primary'}`}
                            >
                              {pageNum}
                            </span>
                          );
                        })}
                        
                        <span
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className="text-qoder-dark-text-muted text-sm cursor-pointer hover:text-qoder-dark-text-primary px-2"
                        >
                          Siguiente
                        </span>
                      </div>
                      
                      <div className="text-qoder-dark-text-primary text-xs">
                        Página {currentPage} de {totalPages} (Total: {filteredClients.length} clientes)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>



      <LegacyClientModal
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSave={onSave}
        editOnly={Boolean(editing?.id_cliente)} // Indica si es solo edición
      />

      {/* Modal de detalles del cliente */}
      {detailModal.open && detailModal.client && (
        <LegacyClientDetailModal
          open={detailModal.open}
          onOpenChange={(open) => setDetailModal({ ...detailModal, open })}
          client={detailModal.client}
        />
      )}

      {/* Popup de confirmación para eliminar */}
      {deleteConfirm.open && deleteConfirm.client && (
        <LegacyDeleteConfirmModal
          open={deleteConfirm.open}
          onOpenChange={(isOpen: boolean) => setDeleteConfirm({ ...deleteConfirm, open: isOpen })}
          client={deleteConfirm.client}
          onConfirm={onDelete}
        />
      )}
    </>
  );
}