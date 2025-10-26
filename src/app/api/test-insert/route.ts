import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

// Configuración de Supabase para el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: Request) {
  try {
    console.log("=== TEST INSERT: Probando inserción de registro de caja ===");
    
    // Verificar que las variables de entorno estén configuradas
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("❌ Variables de entorno no configuradas");
      return NextResponse.json(
        { 
          message: "Error de configuración del servidor", 
          error: "Variables de entorno no configuradas"
        },
        { status: 500 }
      );
    }
    
    // Obtener datos del cuerpo de la solicitud
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
    
    // Preparar datos para inserción
    const insertData: any = {
      concepto: body.concepto || 'Test de diagnóstico',
      monto: Number(body.monto) || 0,
      metodo_pago: body.metodo_pago || 'Efectivo',
      fecha: body.fecha || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Agregar campos opcionales
    if (body.id_cita) insertData.id_cita = body.id_cita;
    if (body.id_cliente) insertData.id_cliente = body.id_cliente;
    if (body.barbero_id) insertData.barbero_id = Number(body.barbero_id);
    
    console.log("Datos preparados para inserción:", insertData);
    
    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Intentar insertar registro
    console.log("Intentando insertar registro...");
    const { data, error } = await supabase
      .from("mibarber_caja")
      .insert([insertData])
      .select();
    
    if (error) {
      console.error("❌ Error en inserción:", error);
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
    
    return NextResponse.json({ 
      success: true, 
      data: data?.[0] || insertData,
      message: "Registro insertado correctamente"
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