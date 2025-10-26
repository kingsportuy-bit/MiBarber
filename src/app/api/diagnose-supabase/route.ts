import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

// Configuración de Supabase para el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
  try {
    console.log("=== DIAGNOSE SUPABASE: Verificando conexión ===");
    
    // Verificar variables de entorno
    console.log("Variables de entorno:", {
      supabaseUrl: supabaseUrl ? "Configurada" : "No configurada",
      supabaseAnonKey: supabaseAnonKey ? "Configurada" : "No configurada"
    });
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { 
          success: false,
          message: "Variables de entorno no configuradas",
          supabaseUrl: supabaseUrl ? "Configurada" : "No configurada",
          supabaseAnonKey: supabaseAnonKey ? "Configurada" : "No configurada"
        },
        { status: 500 }
      );
    }
    
    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Cliente de Supabase creado:", !!supabase);
    
    // Verificar conexión intentando acceder a la tabla
    console.log("Intentando acceder a la tabla mibarber_caja...");
    const { data, error } = await supabase
      .from('mibarber_caja')
      .select('*')
      .limit(1);
    
    console.log("Resultado de acceso a tabla:", { data, error });
    
    if (error) {
      console.error("❌ Error accediendo a la tabla:", error);
      return NextResponse.json(
        { 
          success: false,
          message: "Error accediendo a la tabla",
          error: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }
    
    // Intentar insertar un registro de prueba
    console.log("Intentando insertar registro de prueba...");
    const testRecord = {
      concepto: 'Test diagnóstico',
      monto: 1.00,
      metodo_pago: 'Efectivo'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('mibarber_caja')
      .insert([testRecord])
      .select();
    
    console.log("Resultado de inserción:", { insertData, insertError });
    
    // Eliminar el registro de prueba si se insertó correctamente
    if (insertData && insertData[0]?.id_movimiento) {
      console.log("Eliminando registro de prueba...");
      await supabase
        .from('mibarber_caja')
        .delete()
        .eq('id_movimiento', insertData[0].id_movimiento);
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Conexión a Supabase verificada correctamente",
      tableAccess: { data, error },
      insertTest: { insertData, insertError }
    });
  } catch (error: any) {
    console.error("❌ Error en diagnóstico:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Error interno del servidor", 
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}