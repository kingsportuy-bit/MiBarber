"use client";

import { useEffect, useState } from "react";

/**
 * Hook personalizado para manejar el estado de formularios de edición
 * Carga automáticamente los datos iniciales cuando se abre el formulario
 * y proporciona una función para actualizar los valores
 * 
 * @param initial - Datos iniciales para el formulario
 * @param open - Estado de apertura del formulario
 * @param isNew - Indica si es un nuevo registro (opcional)
 * @returns Objeto con valores y función para actualizarlos
 */
export function useFormData<T>(initial: Partial<T> | undefined, open: boolean, isNew?: boolean) {
  const [values, setValues] = useState<Partial<T>>({});

  useEffect(() => {
    if (open) {
      if (initial && !isNew) {
        // Cargar datos reales para edición
        setValues({ ...initial });
      } else {
        // Establecer valores por defecto para nuevos registros
        setValues(initial || {});
      }
    }
  }, [initial, open, isNew]);

  const update = <K extends keyof T>(key: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  // Resetear los valores cuando el formulario se cierra
  useEffect(() => {
    if (!open) {
      setValues({});
    }
  }, [open]);

  return { values, update, setValues };
}