import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

// Configuración de Supabase para el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET() {
  try {
    console.log("=== DIAGNOSE TABLE: Diagnóstico detallado de tabla mibarber_caja ===");
    
    // Crear cliente de Supabase para el servidor
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 1. Verificar si la tabla existe y obtener un registro de ejemplo
    console.log("1. Verificando existencia de tabla y obteniendo registro de ejemplo...");
    
    const { data: tableData, error: tableError } = await supabase
      .from('mibarber_caja')
      .select('*')
      .limit(1);
    
    console.log("Datos de ejemplo:", tableData, tableError);
    
    // 2. Intentar acceder a columnas específicas para verificar su existencia
    console.log("2. Verificando columnas específicas...");
    
    // Intentar seleccionar todas las columnas que podrían existir
    const possibleColumns = [
      'id_movimiento', 'fecha', 'concepto', 'monto', 'id_cita', 
      'id_cliente', 'barbero_id', 'barbero', 'metodo_pago', 
      'observaciones', 'created_at', 'updated_at'
    ];
    
    let availableColumns: string[] = [];
    let columnErrors: any[] = [];
    
    for (const column of possibleColumns) {
      try {
        const { data, error } = await supabase
          .from('mibarber_caja')
          .select(column)
          .limit(1);
        
        if (!error) {
          availableColumns.push(column);
        } else {
          columnErrors.push({ column, error: error.message });
        }
      } catch (err) {
        columnErrors.push({ column, error: err });
      }
    }
    
    console.log("Columnas disponibles:", availableColumns);
    console.log("Errores de columnas:", columnErrors);
    
    // 3. Intentar una inserción simple para verificar permisos y estructura
    console.log("3. Verificando permisos con inserción simple...");
    
    const testRecord = {
      concepto: 'Test diagnóstico',
      monto: 100.50,
      metodo_pago: 'Efectivo'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('mibarber_caja')
      .insert([testRecord])
      .select();
    
    console.log("Resultado de inserción de prueba:", insertData, insertError);
    
    // 4. Si la inserción fue exitosa, eliminar el registro de prueba
    if (insertData && insertData[0]?.id_movimiento) {
      console.log("4. Eliminando registro de prueba...");
      
      const { error: deleteError } = await supabase
        .from('mibarber_caja')
        .delete()
        .eq('id_movimiento', insertData[0].id_movimiento);
      
      console.log("Resultado de eliminación:", deleteError);
    }
    
    return NextResponse.json({ 
      success: true,
      tableData: tableData || [],
      tableError: tableError?.message || null,
      availableColumns: availableColumns,
      columnErrors: columnErrors,
      insertData: insertData || null,
      insertError: insertError?.message || null
    });
  } catch (error: any) {
    console.error("❌ Error en diagnóstico:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Error interno del servidor", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}