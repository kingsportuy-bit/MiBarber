import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

// Configuración de Supabase para el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST() {
  try {
    console.log("=== SETUP TABLE: Creando tabla si no existe ===");
    
    // Crear cliente de Supabase para el servidor
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Verificar si la tabla existe intentando acceder a ella
    const { data: tableData, error: tableError } = await supabase
      .from('mibarber_caja')
      .select('*')
      .limit(1);
    
    if (tableError && tableError.code !== '42P01') {
      console.log("La tabla existe pero hay un error de acceso:", tableError);
    }
    
    // Intentar crear la tabla con el esquema correcto
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS mibarber_caja (
        id_movimiento UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        fecha TIMESTAMPTZ DEFAULT NOW(),
        concepto TEXT NOT NULL,
        monto NUMERIC(10,2) NOT NULL,
        id_cita UUID,
        id_cliente TEXT,
        barbero_id SMALLINT,
        metodo_pago TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    console.log("Ejecutando query de creación de tabla...");
    
    // En Supabase, no podemos ejecutar DDL directamente desde el cliente
    // Necesitamos usar RPC o acceder directamente a la base de datos
    
    // Intentar insertar un registro de prueba para verificar la estructura
    const testData = {
      concepto: 'Registro de prueba',
      monto: 100.50,
      barbero_id: 1,
      metodo_pago: 'Efectivo'
    };
    
    console.log("Intentando insertar datos de prueba:", testData);
    
    const { data: insertData, error: insertError } = await supabase
      .from('mibarber_caja')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.error("❌ Error insertando datos de prueba:", insertError);
      return NextResponse.json(
        { 
          message: "Error insertando datos de prueba", 
          error: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      );
    }
    
    console.log("✅ Datos insertados correctamente:", insertData);
    
    // Eliminar el registro de prueba
    if (insertData && insertData[0]) {
      await supabase
        .from('mibarber_caja')
        .delete()
        .eq('id_movimiento', insertData[0].id_movimiento);
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Tabla verificada/creada correctamente",
      testData: insertData
    });
  } catch (error: any) {
    console.error("❌ Error en setup table route:", error);
    return NextResponse.json(
      { 
        message: "Error interno del servidor", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}