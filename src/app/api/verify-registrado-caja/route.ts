import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configurar el cliente de Supabase con valores por defecto para evitar errores en build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Verificar la estructura de la tabla
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'mibarber_citas')
      .order('ordinal_position');
    
    if (columnsError) {
      return NextResponse.json({ error: 'Error obteniendo estructura de tabla', details: columnsError }, { status: 500 });
    }
    
    // Verificar si existe la columna registrado_caja
    const registradoCajaColumn = columns?.find(col => col.column_name === 'registrado_caja');
    
    // Obtener estadísticas de la columna
    const { data: allCitas, error: statsError } = await supabase
      .from('mibarber_citas')
      .select('registrado_caja');
    
    if (statsError) {
      return NextResponse.json({ error: 'Error obteniendo estadísticas', details: statsError }, { status: 500 });
    }
    
    // Agrupar manualmente los resultados
    const grouped: Record<string, number> = {};
    allCitas.forEach((item: any) => {
      const key = item.registrado_caja || 'null';
      grouped[key] = (grouped[key] || 0) + 1;
    });
    
    // Obtener citas completadas con registrado_caja = "1"
    const { data: pendingCitas, error: pendingError } = await supabase
      .from('mibarber_citas')
      .select('id_cita, fecha, hora, cliente_nombre, servicio, barbero, estado, registrado_caja')
      .eq('estado', 'completado')
      .eq('registrado_caja', '1')
      .limit(10);
    
    if (pendingError) {
      return NextResponse.json({ error: 'Error obteniendo citas pendientes', details: pendingError }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      columnExists: !!registradoCajaColumn,
      columnInfo: registradoCajaColumn,
      stats: grouped || {},
      pendingCitasCount: pendingCitas?.length || 0,
      samplePendingCitas: pendingCitas || []
    });
  } catch (error) {
    console.error('Error en verificación de registrado_caja:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: (error as Error).message }, { status: 500 });
  }
}