"use client";

import { useMutation } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";

export function useCrearBarberia() {
  const supabase = getSupabaseClient();

  const crearBarberia = useMutation({
    mutationFn: async ({ 
      nombreAdministrador,
      username,
      password,
      email
    }: {
      nombreAdministrador: string;
      username: string;
      password: string;
      email: string;
    }) => {
      // Crear una nueva barbería
      const { data: barberiaData, error: barberiaError } = await (supabase as any)
        .from("mibarber_barberias")
        .insert([{
          nombre_barberia: "Nueva Barbería"
        }])
        .select()
        .single();

      if (barberiaError) {
        throw new Error(`Error creando barbería: ${barberiaError.message}`);
      }

      // Crear la sucursal principal para la nueva barbería
      const { data: sucursalData, error: sucursalError } = await (supabase as any)
        .from("mibarber_sucursales")
        .insert([{
          id_barberia: barberiaData.id,
          numero_sucursal: 1, // Sucursal principal
          nombre_sucursal: "Sucursal Principal",
          direccion: "",
          telefono: "",
          celular: "",
          horario: ""
        }])
        .select()
        .single();

      if (sucursalError) {
        throw new Error(`Error creando sucursal principal: ${sucursalError.message}`);
      }

      // Crear el administrador asociado a la nueva barbería
      const { data: adminData, error: adminError } = await (supabase as any)
        .from("mibarber_barberos")
        .insert([{
          nombre: nombreAdministrador,
          email: email,
          username: username,
          password_hash: password, // En una implementación real, esto debería ser hasheado
          nivel_permisos: 1, // 1 = administrador
          id_barberia: barberiaData.id,
          id_sucursal: sucursalData.id
        }])
        .select()
        .single();

      if (adminError) {
        throw new Error(`Error creando administrador: ${adminError.message}`);
      }

      return { barberia: barberiaData, sucursal: sucursalData, admin: adminData };
    }
  });

  return { crearBarberia };
}