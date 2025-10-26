import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

// Configuración de Supabase para el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: Request) {
  try {
    console.log("=== API ROUTE: Insertando registro de caja ===");
    
    // Verificar que las variables de entorno estén configuradas
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("❌ Variables de entorno no configuradas");
      return NextResponse.json(
        { 
          message: "Error de configuración del servidor", 
          error: "Variables de entorno no configuradas",
          supabaseUrl: supabaseUrl ? "Configurada" : "No configurada",
          supabaseAnonKey: supabaseAnonKey ? "Configurada" : "No configurada"
        },
        { status: 500 }
      );
    }
    
    let body;
    try {
      body = await request.json();
      console.log("Datos recibidos:", body);
    } catch (parseError: any) {
      console.error("❌ Error parseando JSON:", parseError);
      return NextResponse.json(
        { 
          message: "Error parseando datos de entrada", 
          error: parseError.message || "Error desconocido al parsear JSON"
        },
        { status: 400 }
      );
    }
    
    // Validar datos requeridos
    if (!body.concepto) {
      return NextResponse.json(
        { message: "El concepto es requerido" },
        { status: 400 }
      );
    }
    
    if (body.monto === undefined || body.monto === null) {
      return NextResponse.json(
        { message: "El monto es requerido" },
        { status: 400 }
      );
    }
    
    const montoNum = Number(body.monto);
    if (isNaN(montoNum)) {
      return NextResponse.json(
        { message: "El monto debe ser un número válido" },
        { status: 400 }
      );
    }
    
    if (!body.metodo_pago) {
      return NextResponse.json(
        { message: "El método de pago es requerido" },
        { status: 400 }
      );
    }
    
    // Validar barbero_id si está presente
    if (body.barbero_id !== undefined && body.barbero_id !== null) {
      const barberoIdNum = Number(body.barbero_id);
      if (isNaN(barberoIdNum)) {
        return NextResponse.json(
          { message: "El barbero_id debe ser un número válido" },
          { status: 400 }
        );
      }
    }
    
    // Preparar datos para inserción con todas las columnas requeridas
    // NOTA: Ajustamos la estructura según la tabla real
    const insertData: any = {
      concepto: String(body.concepto),
      monto: montoNum,
      metodo_pago: String(body.metodo_pago),
      fecha: body.fecha || new Date().toISOString(), // Asegurar que siempre haya una fecha
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Agregar campos opcionales si están presentes
    if (body.id_cita !== undefined && body.id_cita !== null) {
      insertData.id_cita = body.id_cita;
    }
    
    if (body.id_cliente !== undefined && body.id_cliente !== null) {
      insertData.id_cliente = body.id_cliente;
    }
    
    // Manejar el campo de barbero (puede ser barbero_id o barbero)
    if (body.barbero_id !== undefined && body.barbero_id !== null) {
      // Verificar si la tabla tiene barbero_id (número) o barbero (texto)
      insertData.barbero_id = Number(body.barbero_id);
    } else if (body.barbero !== undefined && body.barbero !== null) {
      insertData.barbero = String(body.barbero);
    }
    
    console.log("Datos preparados para inserción:", insertData);
    
    // Obtener cliente de Supabase para el servidor
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Verificar que el cliente de Supabase se haya creado correctamente
    if (!supabase) {
      console.error("❌ No se pudo crear el cliente de Supabase");
      return NextResponse.json(
        { 
          message: "Error de conexión a la base de datos", 
          error: "No se pudo crear el cliente de Supabase"
        },
        { status: 500 }
      );
    }
    
    // Intentar insertar registro con manejo de errores mejorado
    console.log("Intentando insertar registro...");
    
    const { data, error } = await supabase
      .from("mibarber_caja")
      .insert([insertData])
      .select();
    
    // Registrar el resultado completo de la operación
    console.log("Resultado de la inserción:", { data, error });
    
    if (error) {
      console.error("❌ Error en inserción:", error);
      
      // Manejar específicamente el error de caché de esquema
      if (error.code === 'PGRST204') {
        console.log("Detectado error de caché de esquema. Intentando solución alternativa...");
        
        // Intentar con una estructura de datos más simple
        const simplifiedData: any = {
          concepto: insertData.concepto,
          monto: insertData.monto,
          metodo_pago: insertData.metodo_pago,
          fecha: insertData.fecha
        };
        
        // Agregar campos condicionalmente
        if (insertData.id_cita) simplifiedData.id_cita = insertData.id_cita;
        if (insertData.id_cliente) simplifiedData.id_cliente = insertData.id_cliente;
        if (insertData.barbero_id) simplifiedData.barbero_id = insertData.barbero_id;
        if (insertData.barbero) simplifiedData.barbero = insertData.barbero;
        
        console.log("Intentando inserción con datos simplificados:", simplifiedData);
        
        const { data: simplifiedDataResult, error: simplifiedError } = await supabase
          .from("mibarber_caja")
          .insert([simplifiedData])
          .select();
        
        console.log("Resultado de inserción simplificada:", { simplifiedDataResult, simplifiedError });
        
        if (simplifiedError) {
          console.error("❌ Error en inserción simplificada:", simplifiedError);
          return NextResponse.json(
            { 
              message: "Error persistente al insertar registro", 
              error: simplifiedError.message,
              code: simplifiedError.code,
              details: "Posible problema de caché de esquema en PostgREST",
              originalError: error.message
            },
            { status: 500 }
          );
        }
        
        console.log("✅ Registro insertado exitosamente con datos simplificados:", simplifiedDataResult);
        
        return NextResponse.json({ 
          success: true, 
          data: simplifiedDataResult?.[0] || simplifiedData 
        });
      }
      
      return NextResponse.json(
        { 
          message: "Error al insertar registro", 
          error: error.message,
          code: error.code,
          details: error.details
        },
        { status: 500 }
      );
    }
    
    console.log("✅ Registro insertado exitosamente:", data);
    
    // Si se creó exitosamente y hay un id_cita, actualizar registrado_caja a "2"
    if (data?.[0]?.id_cita) {
      try {
        const { error: updateError } = await supabase
          .from("mibarber_citas")
          .update({ registrado_caja: "2" })
          .eq("id_cita", data[0].id_cita);
        
        if (updateError) {
          console.error("❌ Error actualizando registrado_caja:", updateError);
        } else {
          console.log("✅ Actualizado registrado_caja a 2 para cita:", data[0].id_cita);
        }
      } catch (updateError) {
        console.error("❌ Error actualizando registrado_caja:", updateError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: data?.[0] || insertData 
    });
  } catch (error: any) {
    console.error("❌ Error en API route:", error);
    return NextResponse.json(
      { 
        message: "Error interno del servidor", 
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}