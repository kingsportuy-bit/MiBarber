import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { useBarberiaInfo } from "@/hooks/useBarberiaInfo";
import type { Barbero } from "@/types/db";
import { Checkbox } from "@/components/ui/app-checkbox";
import { Radio } from "@/components/ui/app-radio";

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

  if (!open) return null;

  return (
    <div className="v2-overlay" onClick={handleClose}>
      <div className="v2-modal max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="v2-modal-header border-b border-[#1a1a1a] pb-4 mb-4">
          <h2 className="text-xl font-bold font-[family-name:var(--font-rasputin)] text-[#F5F0EB] tracking-wide">
            {isEdit ? "Editar barbero" : "Nuevo barbero"}
          </h2>
          <button onClick={handleClose} type="button" className="text-[#8a8a8a] hover:text-[#C5A059] transition-colors text-2xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="v2-modal-body">
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Nombre <span className="text-[#C5A059]">*</span></label>
              <input
                type="text"
                className={`app-input ${errors.nombre ? "border-red-500" : ""}`}
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre completo"
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Teléfono <span className="text-[#C5A059]">*</span></label>
              <input
                type="text"
                className={`app-input ${errors.telefono ? "border-red-500" : ""}`}
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="Ej: +59891234567"
              />
              {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Email <span className="text-[#C5A059]">*</span></label>
              <input
                type="email"
                className={`app-input ${errors.email ? "border-red-500" : ""}`}
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Ej: barbero@ejemplo.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Especialidades</label>
              <div className="border border-[#1a1a1a] bg-[#0a0a0a] rounded-lg p-3 max-h-40 overflow-y-auto custom-scrollbar">
                {serviciosLoading ? (
                  <p className="text-[#8a8a8a] text-sm">Cargando servicios...</p>
                ) : serviciosError ? (
                  <p className="text-red-500 text-sm">Error al cargar servicios</p>
                ) : servicios && servicios.length > 0 ? (
                  <div className="space-y-3 pl-1 py-1">
                    {servicios.map((servicio) => (
                      <Checkbox
                        key={servicio.id_servicio}
                        checked={formData.especialidades.includes(servicio.id_servicio)}
                        onChange={() => handleEspecialidadChange(servicio.id_servicio)}
                        label={servicio.nombre}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-[#8a8a8a] text-sm">No hay servicios disponibles</p>
                )}
              </div>
              <p className="text-[11px] text-[#555] mt-1">Seleccione los servicios que este barbero puede realizar</p>
            </div>

            {/* Solo mostrar opción de administrador si el usuario actual es administrador 
                y no es el barbero principal (protegido) */}
            {isAdminUser && !isBarberoPrincipal && (
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Rol</label>
                <div className="flex items-center gap-6 mt-1">
                  <Radio
                    checked={formData.isAdminRole}
                    onChange={() => setFormData(prev => ({ ...prev, isAdminRole: true }))}
                    label="Administrador"
                  />
                  <Radio
                    checked={!formData.isAdminRole}
                    onChange={() => setFormData(prev => ({ ...prev, isAdminRole: false }))}
                    label="Barbero Normal"
                  />
                </div>
              </div>
            )}

            {/* Mostrar indicador de permisos para barberos principales (protegidos) */}
            {isBarberoPrincipal && (
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Rol</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[14px] text-white font-[family-name:var(--font-body)]">
                    {formData.isAdminRole ? "Administrador" : "Barbero Normal"}
                  </span>
                  <span className="text-xs text-[#C5A059]">
                    (protegido)
                  </span>
                  <span className="text-[11px] text-[#555]">
                    (No se puede cambiar el rol)
                  </span>
                </div>
              </div>
            )}

            {/* Campo de nombre de usuario para todos los barberos */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Nombre de Usuario <span className="text-[#C5A059]">*</span></label>
              <input
                type="text"
                className={`app-input ${errors.username ? "border-red-500" : ""}`}
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Nombre de usuario para iniciar sesión"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            {/* Campos de contraseña - para nuevos barberos o para edición */}
            {!isEdit ? (
              <>
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Contraseña <span className="text-[#C5A059]">*</span></label>
                  <input
                    type="password"
                    className={`app-input ${errors.password ? "border-red-500" : ""}`}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Contraseña"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Confirmar Contraseña <span className="text-[#C5A059]">*</span></label>
                  <input
                    type="password"
                    className={`app-input ${errors.confirmPassword ? "border-red-500" : ""}`}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirmar contraseña"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </>
            ) : (
              // Para barberos existentes, mostrar campo de cambio de contraseña opcional
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Nueva Contraseña (opcional)</label>
                <input
                  type="password"
                  className="app-input"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Dejar en blanco para no cambiar"
                />
                <p className="text-[11px] text-[#555] mt-1">Solo complete si desea cambiar la contraseña</p>
              </div>
            )}

            <div className="flex flex-col gap-1.5 w-full pt-2">
              <Checkbox
                checked={formData.activo}
                onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                label="Activo"
              />
            </div>
          </div>

          <div className="v2-modal-footer flex gap-3 justify-end items-center mt-6 pt-4 border-t border-[#1a1a1a]">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-[14px] font-medium text-[#8a8a8a] hover:text-[#C5A059] transition-colors">
              Cancelar
            </button>
            <button type="submit" className="app-btn-primary">
              {isEdit ? "Actualizar" : "Crear barbero"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}