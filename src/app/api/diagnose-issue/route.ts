import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

// Configuración de Supabase para el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
  try {
    console.log("=== DIAGNOSE ISSUE: Diagnóstico completo ===");
    
    // Crear cliente de Supabase para el servidor
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 1. Verificar si la tabla existe y obtener su estructura
    console.log("1. Verificando existencia de tabla...");
    
    const { data: tableData, error: tableError } = await supabase
      .from('mibarber_caja')
      .select('*')
      .limit(1);
    
    console.log("Resultado verificación tabla:", tableData, tableError);
    
    // 2. Intentar acceder a columnas específicas
    console.log("2. Verificando columnas específicas...");
    
    const { data: columnData, error: columnError } = await supabase
      .from('mibarber_caja')
      .select('id_movimiento, concepto, monto')
      .limit(1);
    
    console.log("Resultado verificación columnas:", columnData, columnError);
    
    // 3. Verificar permisos intentando insertar un registro mínimo
    console.log("3. Verificando permisos de inserción...");
    
    const testRecord = {
      concepto: 'Test diagnóstico',
      monto: 1.00
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('mibarber_caja')
      .insert([testRecord])
      .select();
    
    console.log("Resultado inserción test:", insertData, insertError);
    
    // 4. Si la inserción fue exitosa, eliminar el registro de prueba
    if (insertData && insertData[0] && insertData[0].id_movimiento) {
      console.log("Eliminando registro de prueba...");
      await supabase
        .from('mibarber_caja')
        .delete()
        .eq('id_movimiento', insertData[0].id_movimiento);
    }
    
    // 5. Verificar si podemos acceder a la columna barbero_id de forma específica
    console.log("4. Verificando acceso a columna barbero_id...");
    
    const { data: barberData, error: barberError } = await supabase
      .from('mibarber_caja')
      .select('barbero_id')
      .limit(1);
    
    console.log("Resultado acceso barbero_id:", barberData, barberError);
    
    return NextResponse.json({ 
      tableCheck: {
        data: tableData,
        error: tableError?.message || null,
        code: tableError?.code || null
      },
      columnCheck: {
        data: columnData,
        error: columnError?.message || null,
        code: columnError?.code || null
      },
      insertCheck: {
        data: insertData,
        error: insertError?.message || null,
        code: insertError?.code || null
      },
      barberCheck: {
        data: barberData,
        error: barberError?.message || null,
        code: barberError?.code || null
      },
      message: "Diagnóstico completado"
    });
  } catch (error: any) {
    console.error("❌ Error en diagnose issue route:", error);
    return NextResponse.json(
      { 
        message: "Error interno del servidor", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}