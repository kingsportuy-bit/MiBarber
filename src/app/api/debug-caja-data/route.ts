import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

// Configuración de Supabase para el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
  try {
    console.log("=== DEBUG CAJA DATA: Obteniendo datos de caja ===");
    
    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Obtener registros de caja
    const { data, error } = await supabase
      .from('mibarber_caja')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error("❌ Error obteniendo datos:", error);
      return NextResponse.json(
        { 
          message: "Error obteniendo datos", 
          error: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }
    
    console.log("Datos obtenidos:", data);
    
    // Analizar los datos para encontrar posibles problemas
    const analysis = {
      totalRecords: data.length,
      nullBarberoIds: data.filter((record: any) => record.barbero_id === null).length,
      undefinedBarberoIds: data.filter((record: any) => record.barbero_id === undefined).length,
      emptyBarberoIds: data.filter((record: any) => record.barbero_id === "").length,
      sampleRecords: data.slice(0, 3)
    };
    
    console.log("Análisis de datos:", analysis);
    
    return NextResponse.json({ 
      success: true,
      data: data,
      analysis: analysis
    });
  } catch (error: any) {
    console.error("❌ Error en diagnóstico:", error);
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