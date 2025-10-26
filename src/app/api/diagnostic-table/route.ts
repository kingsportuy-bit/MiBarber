import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

// Configuración de Supabase para el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
  try {
    console.log("=== DIAGNOSTIC: Obteniendo información de la tabla ===");
    
    // Crear cliente de Supabase para el servidor
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Obtener un registro de ejemplo para verificar la estructura
    const { data: sampleData, error: sampleError } = await supabase
      .from('mibarber_caja')
      .select('*')
      .limit(1);
    
    console.log("Datos de ejemplo:", sampleData, sampleError);
    
    // Probar insertar un registro de prueba
    const testData = {
      concepto: 'Test de diagnóstico',
      monto: 100.50,
      barbero_id: 1,
      metodo_pago: 'Efectivo',
      fecha: new Date().toISOString()
    };
    
    console.log("Intentando insertar datos de prueba:", testData);
    
    const { data: insertData, error: insertError } = await supabase
      .from('mibarber_caja')
      .insert([testData])
      .select();
    
    console.log("Resultado de inserción:", insertData, insertError);
    
    return NextResponse.json({ 
      sampleData: sampleData || [],
      sampleError: sampleError?.message || null,
      insertData: insertData || null,
      insertError: insertError?.message || null,
      testData
    });
  } catch (error: any) {
    console.error("❌ Error en diagnostic route:", error);
    return NextResponse.json(
      { 
        message: "Error interno del servidor", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}