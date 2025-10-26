"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

// Función para generar UUIDs reales
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [formData, setFormData] = useState({
    nombreBarberia: "",
    nombreAdministrador: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    if (!formData.nombreBarberia || !formData.nombreAdministrador || 
        !formData.email || !formData.password) {
      setError("Por favor complete todos los campos requeridos");
      return;
    }
    
    setLoading(true);
    
    try {
      // Verificar conexión a Supabase
      console.log("Verificando conexión a Supabase...");
      
      // Probar una consulta simple para verificar la conexión
      const { data: connectionTest, error: connectionError } = await (supabase as any)
        .from("mibarber_barberias")
        .select("id")
        .limit(1);
      
      console.log("Resultado de prueba de conexión:", { connectionTest, connectionError });
      
      if (connectionError) {
        console.error("Error de conexión:", connectionError);
        throw new Error(`Error de conexión a Supabase: ${JSON.stringify(connectionError, null, 2)}`);
      }
      
      // Crear un ID único para la barbería
      const idBarberia = generateUUID();
      const idSucursal = generateUUID();
      
      console.log("Creando barbería con ID:", idBarberia);
      console.log("Datos de la barbería:", {
        id: idBarberia,
        nombre_barberia: formData.nombreBarberia
      });
      
      // 1. Crear la barbería en mibarber_barberias
      const { data: barberiaData, error: barberiaError } = await (supabase as any)
        .from("mibarber_barberias")
        .insert([{
          id: idBarberia,
          nombre_barberia: formData.nombreBarberia
        }])
        .select()
        .single();
      
      console.log("Respuesta de creación de barbería:", { 
        data: barberiaData, 
        error: barberiaError,
        typeofError: typeof barberiaError,
        errorKeys: barberiaError ? Object.keys(barberiaError) : null
      });
      
      if (barberiaError) {
        const errorDetails = {
          message: barberiaError.message,
          code: barberiaError.code,
          details: barberiaError.details,
          hint: barberiaError.hint,
          raw: barberiaError
        };
        console.error("Detalles del error de barbería:", errorDetails);
        throw new Error(`Error creando barbería: ${JSON.stringify(errorDetails, null, 2)}`);
      }
      
      console.log("Barbería creada exitosamente:", barberiaData);
      
      // 2. Crear la sucursal en mibarber_sucursales
      console.log("Creando sucursal con ID:", idSucursal);
      console.log("Datos de la sucursal:", {
        id: idSucursal,
        id_barberia: idBarberia,
        numero_sucursal: 1,
        nombre_sucursal: "Sucursal Principal",
        direccion: "",
        telefono: formData.telefono,
        celular: formData.telefono
      });
      
      const { data: sucursalData, error: sucursalError } = await (supabase as any)
        .from("mibarber_sucursales")
        .insert([{
          id: idSucursal,
          id_barberia: idBarberia,
          numero_sucursal: 1,
          nombre_sucursal: "Sucursal Principal",
          direccion: "",
          telefono: formData.telefono,
          celular: formData.telefono
        }])
        .select()
        .single();
      
      console.log("Respuesta de creación de sucursal:", { 
        data: sucursalData, 
        error: sucursalError,
        typeofError: typeof sucursalError,
        errorKeys: sucursalError ? Object.keys(sucursalError) : null
      });
      
      if (sucursalError) {
        // Si falla la creación de la sucursal, eliminar la barbería creada
        await (supabase as any)
          .from("mibarber_barberias")
          .delete()
          .eq("id", idBarberia);
        
        const errorDetails = {
          message: sucursalError.message,
          code: sucursalError.code,
          details: sucursalError.details,
          hint: sucursalError.hint,
          raw: sucursalError
        };
        console.error("Detalles del error de sucursal:", errorDetails);
        throw new Error(`Error creando sucursal: ${JSON.stringify(errorDetails, null, 2)}`);
      }
      
      console.log("Sucursal creada exitosamente:", sucursalData);
      
      // 3. Crear el administrador asociado a la barbería
      console.log("Creando administrador");
      
      // Generar nombre de usuario automáticamente basado en nombre y apellido
      const nameParts = formData.nombreAdministrador.trim().split(/\s+/);
      let firstName = "";
      let lastName = "";
      
      if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts[nameParts.length - 1]; // Último nombre como apellido
      } else if (nameParts.length === 1) {
        firstName = nameParts[0];
        lastName = "admin";
      } else {
        firstName = "admin";
        lastName = "principal";
      }
      
      // Convertir a minúsculas y eliminar caracteres especiales
      const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Generar nombre de usuario
      let username = `${cleanFirstName}.${cleanLastName}`;
      if (username.length > 20) {
        username = username.substring(0, 20);
      }
      
      console.log("Datos del administrador:", {
        nombre: formData.nombreAdministrador,
        email: formData.email,
        telefono: formData.telefono,
        password_hash: formData.password,
        admin: true,
        nivel_permisos: 1,
        activo: true,
        id_barberia: idBarberia,
        id_sucursal: idSucursal,
        especialidades: ["administrador"],
        username: username
      });
      
      const { data: adminData, error: adminError } = await (supabase as any)
        .from("mibarber_barberos")
        .insert([{
          id_barbero: generateUUID(),
          nombre: formData.nombreAdministrador,
          email: formData.email,
          telefono: formData.telefono,
          password_hash: formData.password, // En producción esto debería ser hasheado
          admin: true,
          nivel_permisos: 1,
          activo: true,
          id_barberia: idBarberia,
          id_sucursal: idSucursal,
          especialidades: ["administrador"],
          username: username
        }])
        .select()
        .single();
      
      console.log("Respuesta de creación de administrador:", { 
        data: adminData, 
        error: adminError,
        typeofError: typeof adminError,
        errorKeys: adminError ? Object.keys(adminError) : null
      });
      
      if (adminError) {
        // Si falla la creación del administrador, eliminar la sucursal y la barbería creadas
        await (supabase as any)
          .from("mibarber_sucursales")
          .delete()
          .eq("id", idSucursal);
        
        await (supabase as any)
          .from("mibarber_barberias")
          .delete()
          .eq("id", idBarberia);
        
        const errorDetails = {
          message: adminError.message,
          code: adminError.code,
          details: adminError.details,
          hint: adminError.hint,
          raw: adminError
        };
        console.error("Detalles del error de administrador:", errorDetails);
        throw new Error(`Error creando administrador: ${JSON.stringify(errorDetails, null, 2)}`);
      }
      
      console.log("Administrador creado exitosamente:", adminData);
      
      // Guardar credenciales para mostrar al usuario
      setCreatedCredentials({
        username: username,
        password: formData.password
      });
      
      setSuccess(true);
    } catch (err: any) {
      console.error("Error completo:", err);
      const message = err.message || "Error desconocido al crear la configuración inicial";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-qoder-dark-bg-primary p-4">
        <div className="qoder-dark-card max-w-md w-full p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-qoder-dark-text-primary mb-4">
              ¡Configuración Completada!
            </h2>
            <p className="text-qoder-dark-text-secondary mb-6">
              Su sistema ha sido configurado exitosamente. Por favor, guarde estas credenciales de acceso:
            </p>
            
            <div className="bg-qoder-dark-bg-secondary p-6 rounded-lg mb-6 text-left">
              <div className="mb-4">
                <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-1">
                  Nombre de Usuario
                </label>
                <div className="qoder-dark-input p-3 rounded-lg">
                  {createdCredentials.username}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-1">
                  Contraseña
                </label>
                <div className="qoder-dark-input p-3 rounded-lg">
                  {createdCredentials.password}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => router.push("/login")}
              className="qoder-dark-button-primary px-6 py-3 rounded-lg font-medium w-full"
            >
              Ir al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-qoder-dark-bg-primary p-4">
      <div className="qoder-dark-card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-qoder-dark-text-primary mb-2">
            Configuración Inicial
          </h1>
          <p className="text-qoder-dark-text-secondary">
            Configure su sistema MiBarber
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
              Nombre de la Barbería
            </label>
            <input
              type="text"
              name="nombreBarberia"
              value={formData.nombreBarberia}
              onChange={handleChange}
              className="qoder-dark-input w-full p-3 rounded-lg"
              placeholder="Ingrese el nombre de su barbería"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
              Nombre del Administrador
            </label>
            <input
              type="text"
              name="nombreAdministrador"
              value={formData.nombreAdministrador}
              onChange={handleChange}
              className="qoder-dark-input w-full p-3 rounded-lg"
              placeholder="Ingrese su nombre completo"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="qoder-dark-input w-full p-3 rounded-lg"
              placeholder="Ingrese su email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="qoder-dark-input w-full p-3 rounded-lg"
              placeholder="Ingrese su número de teléfono"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="qoder-dark-input w-full p-3 rounded-lg"
              placeholder="Ingrese una contraseña segura"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="qoder-dark-input w-full p-3 rounded-lg"
              placeholder="Confirme la contraseña"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-400 text-sm py-2">
              {error}
            </div>
          )}
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="qoder-dark-button-primary px-6 py-3 rounded-lg font-medium w-full"
              disabled={loading}
            >
              {loading ? "Configurando..." : "Completar Configuración"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}