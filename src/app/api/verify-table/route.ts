import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

// Configuración de Supabase para el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
  try {
    console.log("=== VERIFY TABLE: Verificando tabla mibarber_caja ===");
    
    // Crear cliente de Supabase para el servidor
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Intentar acceder a la tabla de varias maneras
    console.log("1. Intentando acceso directo a la tabla...");
    
    const { data: directData, error: directError } = await supabase
      .from('mibarber_caja')
      .select('*')
      .limit(1);
    
    console.log("Resultado acceso directo:", directData, directError);
    
    // Intentar acceder a columnas específicas
    console.log("2. Intentando acceso a columnas específicas...");
    
    const { data: columnData, error: columnError } = await supabase
      .from('mibarber_caja')
      .select('id_movimiento, concepto, monto, barbero_id, metodo_pago')
      .limit(1);
    
    console.log("Resultado acceso columnas:", columnData, columnError);
    
    // Intentar contar registros
    console.log("3. Intentando contar registros...");
    
    const { count, error: countError } = await supabase
      .from('mibarber_caja')
      .select('*', { count: 'exact', head: true });
    
    console.log("Resultado conteo:", count, countError);
    
    // Verificar si podemos insertar un registro básico
    console.log("4. Intentando insertar registro básico...");
    
    const basicRecord = {
      concepto: 'Verificación de tabla',
      monto: 0.01,
      barbero_id: 1,
      metodo_pago: 'Verificación'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('mibarber_caja')
      .insert([basicRecord])
      .select();
    
    console.log("Resultado inserción:", insertData, insertError);
    
    // Si la inserción fue exitosa, eliminar el registro de prueba
    if (insertData && insertData[0] && insertData[0].id_movimiento) {
      await supabase
        .from('mibarber_caja')
        .delete()
        .eq('id_movimiento', insertData[0].id_movimiento);
    }
    
    return NextResponse.json({ 
      directData,
      directError: directError?.message || null,
      columnData,
      columnError: columnError?.message || null,
      count,
      countError: countError?.message || null,
      insertData,
      insertError: insertError?.message || null,
      message: "Verificación completada"
    });
  } catch (error: any) {
    console.error("❌ Error en verify table route:", error);
    return NextResponse.json(
      { 
        message: "Error interno del servidor", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}