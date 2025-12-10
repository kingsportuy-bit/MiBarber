import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (reemplaza con tus credenciales)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Falta configuración de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarEstructuraBarberos() {
  try {
    // Verificar estructura de la tabla mibarber_barberos
    const { data, error } = await supabase
      .from('mibarber_barberos')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error al consultar mibarber_barberos:', error);
      return;
    }

    console.log('✅ Estructura de mibarber_barberos:');
    if (data && data.length > 0) {
      console.log('Campos disponibles:', Object.keys(data[0]));
      console.log('Primer registro de ejemplo:', data[0]);
    } else {
      console.log('No se encontraron registros en mibarber_barberos');
    }
  } catch (err) {
    console.error('❌ Error general:', err);
  }
}

verificarEstructuraBarberos();