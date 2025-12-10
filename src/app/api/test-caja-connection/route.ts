import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

// Configuración de Supabase para el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
  try {
    console.log("=== TEST CAJA CONNECTION ===");
    
    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Probar una consulta simple a la tabla
    const { data, error } = await supabase
      .from('mibarber_caja')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error("❌ Error en consulta:", error);
      return NextResponse.json(
        { 
          success: false,
          message: "Error en consulta", 
          error: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }
    
    console.log("✅ Consulta exitosa. Estructura de tabla:");
    console.log(JSON.stringify(data, null, 2));
    
    // Obtener información de columnas
    const { data: columns, error: columnsError } = await supabase
      .from('mibarber_caja')
      .select('*')
      .limit(0);
    
    if (columnsError) {
      console.error("❌ Error obteniendo columnas:", columnsError);
    } else {
      console.log("✅ Columnas disponibles:", Object.keys(columns[0] || {}));
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Conexión exitosa",
      data: data,
      columns: data.length > 0 ? Object.keys(data[0]) : []
    });
  } catch (error: any) {
    console.error("❌ Error general:", error);
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