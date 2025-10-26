import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

// Configuración de Supabase para el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST() {
  try {
    console.log("=== CREATE NEW TABLE: Creando nueva tabla de caja ===");
    
    // Crear cliente de Supabase para el servidor
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Crear una nueva tabla con un nombre diferente para evitar problemas de caché
    const newTableName = 'mibarber_caja_new';
    
    // Insertar un registro de prueba en la nueva tabla
    const testData = {
      concepto: 'Registro de prueba - nueva tabla',
      monto: 100.50,
      barbero_id: 1,
      metodo_pago: 'Efectivo'
    };
    
    console.log("Intentando insertar datos de prueba en nueva tabla:", testData);
    
    const { data: insertData, error: insertError } = await supabase
      .from(newTableName)
      .insert([testData])
      .select();
    
    if (insertError) {
      console.error("❌ Error insertando datos de prueba en nueva tabla:", insertError);
      
      // Si la tabla no existe, intentar crearla
      if (insertError.code === '42P01') {
        console.log("La tabla no existe, intentando crearla...");
        
        // En Supabase, no podemos crear tablas directamente desde el cliente
        // Pero podemos intentar crear una entrada en una tabla de migraciones
        // o simplemente informar al usuario que necesita crear la tabla
        
        return NextResponse.json(
          { 
            message: "La tabla no existe. Por favor, cree la tabla en el dashboard de Supabase.", 
            error: insertError.message,
            code: insertError.code,
            tableName: newTableName
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          message: "Error insertando datos de prueba", 
          error: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      );
    }
    
    console.log("✅ Datos insertados correctamente en nueva tabla:", insertData);
    
    // Eliminar el registro de prueba
    if (insertData && insertData[0]) {
      await supabase
        .from(newTableName)
        .delete()
        .eq('id_movimiento', insertData[0].id_movimiento);
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Nueva tabla verificada correctamente",
      tableName: newTableName,
      testData: insertData
    });
  } catch (error: any) {
    console.error("❌ Error en create new table route:", error);
    return NextResponse.json(
      { 
        message: "Error interno del servidor", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}