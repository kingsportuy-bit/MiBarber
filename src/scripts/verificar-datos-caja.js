const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (usando credenciales locales)
const supabaseUrl = 'http://localhost:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0._7l1lovT1XijXtfVT2hrehUwSATfKL4XNJFbhgmaINM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarDatosCaja() {
  try {
    console.log('🔍 Verificando datos en la tabla mibarber_caja...');
    
    // Obtener algunos registros de la tabla mibarber_caja
    const { data, error } = await supabase
      .from('mibarber_caja')
      .select('*')
      .limit(10)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener datos:', error);
      return;
    }

    console.log('✅ Conexión exitosa. Mostrando últimos 10 registros:');
    
    if (data.length === 0) {
      console.log('ℹ️  No hay registros en la tabla mibarber_caja');
      return;
    }

    data.forEach((registro, index) => {
      console.log(`\n--- Registro ${index + 1} ---`);
      console.log(`  ID Registro: ${registro.idRegistro}`);
      console.log(`  ID Barbero: ${registro.id_barbero}`);
      console.log(`  Nombre Barbero Registro: "${registro.nombre_barbero_registro}"`);
      console.log(`  Concepto: ${registro.concepto}`);
      console.log(`  Tipo: ${registro.tipo}`);
      console.log(`  Monto: ${registro.monto}`);
      console.log(`  Fecha: ${registro.fecha}`);
    });

    // Verificar si hay registros con nombre_barbero_registro vacío
    const registrosSinNombre = data.filter(registro => !registro.nombre_barbero_registro || registro.nombre_barbero_registro.trim() === '');
    console.log(`\n📊 Registros sin nombre_barbero_registro: ${registrosSinNombre.length} de ${data.length}`);
    
    if (registrosSinNombre.length > 0) {
      console.log('📋 Registros con nombre_barbero_registro vacío:');
      registrosSinNombre.forEach((registro, index) => {
        console.log(`  ${index + 1}. ID: ${registro.idRegistro}, Concepto: ${registro.concepto}`);
      });
    } else {
      console.log('✅ Todos los registros tienen nombre_barbero_registro');
    }

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar la función
verificarDatosCaja();