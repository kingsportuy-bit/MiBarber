import React, { useState, useEffect } from 'react';
import { 
  LegacyV2Modal, 
  LegacyV2Form, 
  LegacyV2FormSection, 
  LegacyV2FormGroup, 
  LegacyV2Label, 
  LegacyV2Input, 
  LegacyV2Button,
  LegacyV2ModalFooter
} from './LegacyV2Modal';
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

export function LegacyBarberoModal({ 
  open, 
  onOpenChange, 
  initial, 
  onSave, 
  isAdminUser = false, 
  isBarberoPrincipal = false, 
  isSucursalPrincipal = false, 
  sucursalUuid, 
  idBarberia 
}: Props) {
  const isEdit = Boolean(initial?.id_barbero);
  const { useServiciosPorSucursal } = useBarberiaInfo();
  const { data: servicios, isLoading: serviciosLoading, isError: serviciosError } = useServiciosPorSucursal(sucursalUuid);
  
  const [formData, setFormData] = useState({
    nombre: initial?.nombre || "",
    telefono: initial?.telefono || "",
    email: initial?.email || "",
    especialidades: initial?.especialidades || [] as string[],
    isAdminRole: initial?.admin || false, // Usar admin en lugar de nivel_permisos
    activo: initial?.activo ?? true,
    username: initial?.username || "", // Nuevo campo
    password: "", // Nuevo campo para contraseña
    confirmPassword: "" // Nuevo campo para confirmar contraseña
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      setFormData({
        nombre: initial?.nombre || "",
        telefono: initial?.telefono || "",
        email: initial?.email || "",
        especialidades: initial?.especialidades || [],
        isAdminRole: initial?.admin || false, // Usar admin en lugar de nivel_permisos
        activo: initial?.activo ?? true,
        username: initial?.username || "",
        password: "",
        confirmPassword: ""
      });
      setErrors({});
    }
  }, [open, initial]);

  // Validar el formulario
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }
    
    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }
    
    // Validar nombre de usuario
    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es obligatorio";
    }
    
    // Validar contraseña solo para nuevos barberos
    if (!isEdit) {
      if (!formData.password.trim()) {
        newErrors.password = "La contraseña es obligatoria";
      } else if (formData.password.length < 6) {
        newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEspecialidadChange = (servicioId: string) => {
    setFormData(prev => {
      const newEspecialidades = [...prev.especialidades];
      const index = newEspecialidades.indexOf(servicioId);
      
      if (index >= 0) {
        // Si ya está seleccionado, lo removemos
        newEspecialidades.splice(index, 1);
      } else {
        // Si no está seleccionado, lo agregamos
        newEspecialidades.push(servicioId);
      }
      
      return {
        ...prev,
        especialidades: newEspecialidades
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      const barberData: any = {
        nombre: formData.nombre,
        telefono: formData.telefono,
        email: formData.email,
        especialidades: formData.especialidades,
        admin: formData.isAdminRole, // Usar admin en lugar de nivel_permisos
        // Mantener el nivel_permisos existente o establecer 2 por defecto para barberos normales
        nivel_permisos: initial?.nivel_permisos || 2,
        activo: formData.activo,
        username: formData.username || undefined,
        id_sucursal: sucursalUuid || undefined, // Incluir id_sucursal en los datos
        id_barberia: idBarberia || undefined // Incluir id_barberia en los datos
      };
      
      // Incluir la contraseña si es un nuevo barbero o si se está cambiando para un barbero existente
      if (!isEdit && formData.password) {
        barberData.password_hash = formData.password; // En producción esto debería ser hasheado
      } else if (isEdit && formData.password) {
        // Para barberos existentes, incluir la nueva contraseña si se proporciona
        barberData.password_hash = formData.password; // En producción esto debería ser hasheado
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

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <LegacyV2Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar barbero" : "Nuevo barbero"}
    >
      <LegacyV2Form onSubmit={handleSubmit}>
        <LegacyV2FormSection>
          <div className="v2-form-grid">
            <LegacyV2FormGroup className="col-span-2">
              <LegacyV2Label>Nombre *</LegacyV2Label>
              <LegacyV2Input 
                value={formData.nombre} 
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))} 
                placeholder="Nombre completo"
                className={errors.nombre ? "border-red-500" : ""}
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </LegacyV2FormGroup>
            
            <LegacyV2FormGroup className="col-span-2">
              <LegacyV2Label>Teléfono *</LegacyV2Label>
              <LegacyV2Input 
                value={formData.telefono} 
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))} 
                placeholder="Ej: +59891234567"
                className={errors.telefono ? "border-red-500" : ""}
              />
              {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
            </LegacyV2FormGroup>
            
            <LegacyV2FormGroup className="col-span-2">
              <LegacyV2Label>Email *</LegacyV2Label>
              <LegacyV2Input 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} 
                placeholder="Ej: barbero@ejemplo.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </LegacyV2FormGroup>
            
            <LegacyV2FormGroup className="col-span-2">
              <LegacyV2Label>Especialidades</LegacyV2Label>
              <div className="border border-[var(--border-primary)] rounded-lg p-3 max-h-40 overflow-y-auto">
                {serviciosLoading ? (
                  <p className="text-[var(--text-secondary)]">Cargando servicios...</p>
                ) : serviciosError ? (
                  <p className="text-red-500">Error al cargar servicios</p>
                ) : servicios && servicios.length > 0 ? (
                  <div className="space-y-2">
                    {servicios.map((servicio) => (
                      <label key={servicio.id_servicio} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.especialidades.includes(servicio.id_servicio)}
                          onChange={() => handleEspecialidadChange(servicio.id_servicio)}
                          className="v2-checkbox"
                        />
                        <span className="text-[var(--text-primary)]">{servicio.nombre}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)]">No hay servicios disponibles</p>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">Seleccione los servicios que este barbero puede realizar</p>
            </LegacyV2FormGroup>
            
            {/* Solo mostrar opción de administrador si el usuario actual es administrador 
                y no es el barbero principal (protegido) */}
            {isAdminUser && !isBarberoPrincipal && (
              <LegacyV2FormGroup className="col-span-2">
                <LegacyV2Label>Rol</LegacyV2Label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      checked={formData.isAdminRole} 
                      onChange={() => setFormData(prev => ({ ...prev, isAdminRole: true }))} 
                      className="v2-radio"
                    />
                    <span className="text-[var(--text-primary)]">Administrador</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      checked={!formData.isAdminRole} 
                      onChange={() => setFormData(prev => ({ ...prev, isAdminRole: false }))} 
                      className="v2-radio"
                    />
                    <span className="text-[var(--text-primary)]">Barbero Normal</span>
                  </label>
                </div>
              </LegacyV2FormGroup>
            )}
            
            {/* Mostrar indicador de permisos para barberos principales (protegidos) */}
            {isBarberoPrincipal && (
              <LegacyV2FormGroup className="col-span-2">
                <LegacyV2Label>Rol</LegacyV2Label>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-[var(--text-primary)]">
                    {formData.isAdminRole ? "Administrador" : "Barbero Normal"}
                  </span>
                  <span className="text-xs text-gray-400">
                    (protegido)
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    (No se puede cambiar el rol)
                  </span>
                </div>
              </LegacyV2FormGroup>
            )}
            
            {/* Campo de nombre de usuario para todos los barberos */}
            <LegacyV2FormGroup className="col-span-2">
              <LegacyV2Label>Nombre de Usuario *</LegacyV2Label>
              <LegacyV2Input 
                value={formData.username} 
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))} 
                placeholder="Nombre de usuario para iniciar sesión"
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </LegacyV2FormGroup>
            
            {/* Campos de contraseña - para nuevos barberos o para edición */}
            {!isEdit ? (
              <>
                <LegacyV2FormGroup className="col-span-2">
                  <LegacyV2Label>Contraseña *</LegacyV2Label>
                  <div className="relative">
                    <LegacyV2Input 
                      type="password"
                      value={formData.password} 
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} 
                      placeholder="Contraseña"
                      className={errors.password ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </LegacyV2FormGroup>
                
                <LegacyV2FormGroup className="col-span-2">
                  <LegacyV2Label>Confirmar Contraseña *</LegacyV2Label>
                  <div className="relative">
                    <LegacyV2Input 
                      type="password"
                      value={formData.confirmPassword} 
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))} 
                      placeholder="Confirmar contraseña"
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </LegacyV2FormGroup>
              </>
            ) : (
              // Para barberos existentes, mostrar campo de cambio de contraseña opcional
              <LegacyV2FormGroup className="col-span-2">
                <LegacyV2Label>Nueva Contraseña (opcional)</LegacyV2Label>
                <div className="relative">
                  <LegacyV2Input 
                    type="password"
                    value={formData.password} 
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} 
                    placeholder="Dejar en blanco para no cambiar"
                  />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">Solo complete si desea cambiar la contraseña</p>
              </LegacyV2FormGroup>
            )}
            
            <LegacyV2FormGroup className="col-span-2">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.activo} 
                  onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))} 
                  className="v2-checkbox"
                />
                <span className="text-[var(--text-primary)]">Activo</span>
              </label>
            </LegacyV2FormGroup>
          </div>
        </LegacyV2FormSection>
        
        <LegacyV2ModalFooter>
          <LegacyV2Button 
            type="button" 
            variant="secondary" 
            onClick={handleClose}
          >
            Cancelar
          </LegacyV2Button>
          <LegacyV2Button type="submit" variant="primary">
            {isEdit ? "Actualizar" : "Crear barbero"}
          </LegacyV2Button>
        </LegacyV2ModalFooter>
      </LegacyV2Form>
    </LegacyV2Modal>
  );
}