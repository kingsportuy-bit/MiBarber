"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useBarberiaInfo } from "@/hooks/useBarberiaInfo";
import type { Barbero } from "@/types/db";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<Barbero>;
  onSave: (values: Omit<Barbero, "id_barbero" | "fecha_creacion">) => Promise<void>;
  isAdminUser?: boolean; // Para saber si el usuario actual es administrador
  isBarberoPrincipal?: boolean; // Para saber si es el barbero principal
  isSucursalPrincipal?: boolean; // Para saber si es la sucursal principal
  sucursalUuid?: string; // Para filtrar servicios por sucursal
  idBarberia?: string; // Para incluir el ID de la barbería al crear barberos
};

export function BarberoModal({ open, onOpenChange, initial, onSave, isAdminUser = false, isBarberoPrincipal = false, isSucursalPrincipal = false, sucursalUuid, idBarberia }: Props) {
  const isEdit = Boolean(initial?.id_barbero);
  const { useServiciosPorSucursal } = useBarberiaInfo();
  const { data: servicios, isLoading: serviciosLoading, isError: serviciosError } = useServiciosPorSucursal(sucursalUuid);
  
  console.log("BarberoModal - sucursalUuid recibido:", sucursalUuid);
  console.log("BarberoModal - servicios cargados:", servicios);
  console.log("BarberoModal - isLoading:", serviciosLoading);
  console.log("BarberoModal - isError:", serviciosError);
  
  const [nombre, setNombre] = useState(initial?.nombre || "");
  const [telefono, setTelefono] = useState(initial?.telefono || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [especialidades, setEspecialidades] = useState<string[]>(initial?.especialidades || []);
  const [isAdminRole, setIsAdminRole] = useState(initial?.admin || false); // Usar admin en lugar de nivel_permisos
  const [activo, setActivo] = useState(initial?.activo ?? true);
  const [username, setUsername] = useState(initial?.username || ""); // Nuevo campo
  const [password, setPassword] = useState(""); // Nuevo campo para contraseña
  const [confirmPassword, setConfirmPassword] = useState(""); // Nuevo campo para confirmar contraseña
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      setNombre(initial?.nombre || "");
      setTelefono(initial?.telefono || "");
      setEmail(initial?.email || "");
      setEspecialidades(initial?.especialidades || []);
      setIsAdminRole(initial?.admin || false); // Usar admin en lugar de nivel_permisos
      setActivo(initial?.activo ?? true);
      setUsername(initial?.username || "");
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  }, [open, initial]);

  // Validar el formulario
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }
    
    if (!telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
    }
    
    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "El email no es válido";
    }
    
    // Validar nombre de usuario
    if (!username.trim()) {
      newErrors.username = "El nombre de usuario es obligatorio";
    }
    
    // Validar contraseña solo para nuevos barberos
    if (!isEdit) {
      if (!password.trim()) {
        newErrors.password = "La contraseña es obligatoria";
      } else if (password.length < 6) {
        newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      }
      
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEspecialidadChange = (servicioId: string) => {
    setEspecialidades(prev => {
      const newEspecialidades = [...prev];
      const index = newEspecialidades.indexOf(servicioId);
      
      if (index >= 0) {
        // Si ya está seleccionado, lo removemos
        newEspecialidades.splice(index, 1);
      } else {
        // Si no está seleccionado, lo agregamos
        newEspecialidades.push(servicioId);
      }
      
      return newEspecialidades;
    });
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    
    try {
      const barberData: any = {
        nombre,
        telefono,
        email,
        especialidades,
        admin: isAdminRole, // Usar admin en lugar de nivel_permisos
        // Mantener el nivel_permisos existente o establecer 2 por defecto para barberos normales
        nivel_permisos: initial?.nivel_permisos || 2,
        activo,
        username: username || undefined,
        id_sucursal: sucursalUuid || undefined, // Incluir id_sucursal en los datos
        id_barberia: idBarberia || undefined // Incluir id_barberia en los datos
      };
      
      // Incluir la contraseña si es un nuevo barbero o si se está cambiando para un barbero existente
      if (!isEdit && password) {
        barberData.password_hash = password; // En producción esto debería ser hasheado
      } else if (isEdit && password) {
        // Para barberos existentes, incluir la nueva contraseña si se proporciona
        barberData.password_hash = password; // En producción esto debería ser hasheado
      }
      
      console.log("BarberoModal: Guardando datos del barbero:", barberData);
      
      await onSave(barberData);
      toast.success(isEdit ? "Barbero actualizado" : "Barbero creado");
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar el barbero");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[95vw] max-w-md md:max-w-lg -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="qoder-dark-card max-h-[90vh] overflow-y-auto">
            <div className="qoder-dark-window-header">
              <Dialog.Title className="text-lg font-semibold text-qoder-dark-text-primary">
                {isEdit ? "Editar barbero" : "Nuevo barbero"}
              </Dialog.Title>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Nombre</label>
                <input 
                  className={`w-full qoder-dark-input p-3 rounded-lg ${errors.nombre ? "border-red-500" : ""}`} 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                  placeholder="Nombre completo"
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
              
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Teléfono</label>
                <input 
                  className={`w-full qoder-dark-input p-3 rounded-lg ${errors.telefono ? "border-red-500" : ""}`} 
                  value={telefono} 
                  onChange={(e) => setTelefono(e.target.value)} 
                  placeholder="Ej: +59891234567"
                />
                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
              </div>
              
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Email</label>
                <input 
                  type="email"
                  className={`w-full qoder-dark-input p-3 rounded-lg ${errors.email ? "border-red-500" : ""}`} 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Ej: barbero@ejemplo.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Especialidades</label>
                <div className="border border-qoder-dark-border-primary rounded-lg p-3 max-h-40 overflow-y-auto">
                  {serviciosLoading ? (
                    <p className="text-qoder-dark-text-secondary">Cargando servicios...</p>
                  ) : serviciosError ? (
                    <p className="text-red-500">Error al cargar servicios</p>
                  ) : servicios && servicios.length > 0 ? (
                    <div className="space-y-2">
                      {servicios.map((servicio) => (
                        <label key={servicio.id_servicio} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={especialidades.includes(servicio.id_servicio)}
                            onChange={() => handleEspecialidadChange(servicio.id_servicio)}
                            className="rounded"
                          />
                          <span className="text-qoder-dark-text-primary">{servicio.nombre}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-qoder-dark-text-secondary">No hay servicios disponibles</p>
                  )}
                </div>
                <p className="text-xs text-qoder-dark-text-muted mt-1">Seleccione los servicios que este barbero puede realizar</p>
              </div>
              
              {/* Solo mostrar opción de administrador si el usuario actual es administrador 
                  y no es el barbero principal (protegido) */}
              {isAdminUser && !isBarberoPrincipal && (
                <div className="col-span-2">
                  <label className="text-xs text-qoder-dark-text-secondary">Rol</label>
                  <div className="flex items-center gap-4 mt-1">
                    <label className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        checked={isAdminRole} 
                        onChange={() => setIsAdminRole(true)} 
                        className="rounded"
                      />
                      <span className="text-qoder-dark-text-primary">Administrador</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        checked={!isAdminRole} 
                        onChange={() => setIsAdminRole(false)} 
                        className="rounded"
                      />
                      <span className="text-qoder-dark-text-primary">Barbero Normal</span>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Mostrar indicador de permisos para barberos principales (protegidos) */}
              {isBarberoPrincipal && (
                <div className="col-span-2">
                  <label className="text-xs text-qoder-dark-text-secondary">Rol</label>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-qoder-dark-text-primary">
                      {isAdminRole ? "Administrador" : "Barbero Normal"}
                    </span>
                    <span className="text-xs text-gray-400">
                      (protegido)
                    </span>
                    <span className="text-xs text-qoder-dark-text-secondary">
                      (No se puede cambiar el rol)
                    </span>
                  </div>
                </div>
              )}
              
              {/* Campo de nombre de usuario para todos los barberos */}
              <div className="col-span-2">
                <label className="text-xs text-qoder-dark-text-secondary">Nombre de Usuario</label>
                <input 
                  className={`w-full qoder-dark-input p-3 rounded-lg ${errors.username ? "border-red-500" : ""}`} 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="Nombre de usuario para iniciar sesión"
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>
              
              {/* Campos de contraseña - para nuevos barberos o para edición */}
              {!isEdit ? (
                <>
                  <div className="col-span-2">
                    <label className="text-xs text-qoder-dark-text-secondary">Contraseña</label>
                    <div className="relative">
                      <input 
                        type="password"
                        className={`w-full qoder-dark-input p-3 rounded-lg ${errors.password ? "border-red-500" : ""}`} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Contraseña"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          if (input) {
                            input.type = input.type === 'password' ? 'text' : 'password';
                          }
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-qoder-dark-text-secondary bg-transparent !bg-none border-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  
                  <div className="col-span-2">
                    <label className="text-xs text-qoder-dark-text-secondary">Confirmar Contraseña</label>
                    <div className="relative">
                      <input 
                        type="password"
                        className={`w-full qoder-dark-input p-3 rounded-lg ${errors.confirmPassword ? "border-red-500" : ""}`} 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="Confirmar contraseña"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          if (input) {
                            input.type = input.type === 'password' ? 'text' : 'password';
                          }
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-qoder-dark-text-secondary bg-transparent !bg-none border-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                </>
              ) : (
                // Para barberos existentes, mostrar campo de cambio de contraseña opcional
                <>
                  <div className="col-span-2">
                    <label className="text-xs text-qoder-dark-text-secondary">Nueva Contraseña (opcional)</label>
                    <div className="relative">
                      <input 
                        type="password"
                        className="w-full qoder-dark-input p-3 rounded-lg" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Dejar en blanco para no cambiar"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          if (input) {
                            input.type = input.type === 'password' ? 'text' : 'password';
                          }
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-qoder-dark-text-secondary bg-transparent !bg-none border-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-qoder-dark-text-muted mt-1">Solo complete si desea cambiar la contraseña</p>
                  </div>
                </>
              )}
              
              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={activo} 
                    onChange={(e) => setActivo(e.target.checked)} 
                    className="rounded"
                  />
                  <span className="text-qoder-dark-text-primary">Activo</span>
                </label>
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
                <span>{isEdit ? "Actualizar" : "Crear barbero"}</span>
              </button>
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}