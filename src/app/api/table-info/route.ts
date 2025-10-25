import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

// Configuración de Supabase para el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
  try {
    console.log("=== TABLE INFO: Obteniendo información de la tabla ===");
    
    // Crear cliente de Supabase para el servidor
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Obtener información de las columnas de la tabla
    const { data, error } = await supabase
      .from('mibarber_caja')
      .select('*')
      .limit(0); // Solo obtener la estructura, no los datos
    
    if (error) {
      console.error("❌ Error obteniendo estructura de tabla:", error);
      return NextResponse.json(
        { 
          message: "Error obteniendo estructura de tabla", 
          error: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }
    
    // Obtener un registro de ejemplo si existe
    const { data: sampleData, error: sampleError } = await supabase
      .from('mibarber_caja')
      .select('*')
      .limit(1);
    
    console.log("✅ Estructura de tabla obtenida:", data);
    console.log("Datos de ejemplo:", sampleData, sampleError);
    
    return NextResponse.json({ 
      structure: data,
      sampleData: sampleData || [],
      sampleError: sampleError?.message || null
    });
  } catch (error: any) {
    console.error("❌ Error en table info route:", error);
    return NextResponse.json(
      { 
        message: "Error interno del servidor", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}