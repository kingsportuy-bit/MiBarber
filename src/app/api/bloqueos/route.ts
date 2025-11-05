import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Validar sesión desde cookie custom
async function validateSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('barber_auth_session');
    
    if (!sessionCookie) {
      console.log('❌ Cookie no encontrada');
      return null;
    }

    const sessionData = JSON.parse(sessionCookie.value);
    
    // La estructura de tu sesión es: { user: { id_barberia, id, admin, ... }, expiresAt }
    // Transformar a la estructura que el resto del código espera
    const session = {
      idBarberia: sessionData.user?.id_barberia,
      idBarbero: sessionData.user?.id,
      userId: sessionData.user?.id,
      isAdmin: sessionData.user?.admin || false,
      email: sessionData.user?.email,
      name: sessionData.user?.name,
    };

    console.log('✅ Sesión válida:', { idBarberia: session.idBarberia, isAdmin: session.isAdmin });
    return session;
  } catch (error) {
    console.error('❌ Error parseando cookie:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  console.log('\n🔍 ===== GET /api/bloqueos =====');
  
  try {
    // Crear cliente Supabase en runtime
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Validar sesión
    const session = await validateSession();
    
    if (!session?.idBarberia) {
      console.log('🚫 Sesión inválida o sin idBarberia');
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Leer parámetros
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const idSucursal = searchParams.get('idSucursal');
    const idBarbero = searchParams.get('idBarbero');

    console.log('📋 Params:', { table, idSucursal, idBarbero });

    if (!table) {
      return NextResponse.json(
        { error: 'Campo "table" es requerido (debe ser "bloqueos" o "descansos_extra")' },
        { status: 400 }
      );
    }

    // ========== LISTAR BLOQUEOS ==========
    if (table === 'bloqueos') {
      console.log('🔄 Listando bloqueos...');

      let query = supabaseAdmin
        .from('mibarber_bloqueos_barbero')
        .select('*')
        .eq('id_barberia', session.idBarberia);

      // Filtrar por sucursal si se proporciona
      if (idSucursal) {
        query = query.eq('id_sucursal', idSucursal);
      }

      // Filtrar por barbero si se proporciona
      if (idBarbero) {
        query = query.eq('id_barbero', idBarbero);
      }

      const { data, error } = await query.order('creado_at', { ascending: false });

      if (error) {
        console.error('❌ Error de Supabase:', error);
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 500 }
        );
      }

      console.log('✅ Bloqueos encontrados:', data?.length || 0);
      return NextResponse.json(data || []);
    }

    // ========== LISTAR DESCANSOS EXTRA ==========
    if (table === 'descansos_extra') {
      console.log('🔄 Listando descansos extra...');

      let query = supabaseAdmin
        .from('mibarber_descansos_extra')
        .select('*')
        .eq('id_barberia', session.idBarberia);

      // Filtrar por sucursal si se proporciona
      if (idSucursal) {
        query = query.eq('id_sucursal', idSucursal);
      }

      // Filtrar por barbero si se proporciona
      if (idBarbero) {
        query = query.eq('id_barbero', idBarbero);
      }

      const { data, error } = await query.order('creado_at', { ascending: false });

      if (error) {
        console.error('❌ Error de Supabase:', error);
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 500 }
        );
      }

      console.log('✅ Descansos extra encontrados:', data?.length || 0);
      return NextResponse.json(data || []);
    }

    // Tipo de operación inválido
    return NextResponse.json(
      { error: 'Tipo de operación inválido (table debe ser "bloqueos" o "descansos_extra")' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('💥 Error general en GET /api/bloqueos:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('\n🚀 ===== POST /api/bloqueos =====');
  
  try {
    // Crear cliente Supabase en runtime
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Validar sesión
    const session = await validateSession();
    
    if (!session?.idBarberia) {
      console.log('🚫 Sesión inválida o sin idBarberia');
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Leer body
    const body = await request.json();
    console.log('📦 Body recibido:', JSON.stringify(body, null, 2));
    
    const { 
      table, 
      tipo, 
      id_sucursal, 
      id_barbero, 
      hora_inicio, 
      hora_fin, 
      dias_semana, 
      motivo, 
      fecha 
    } = body;

    console.log('📋 Campos:', {
      table,
      tipo,
      id_sucursal: !!id_sucursal,
      id_barbero: !!id_barbero,
      hora_inicio,
      hora_fin,
      fecha,
      dias_semana: Array.isArray(dias_semana) ? `array[${dias_semana.length}]` : typeof dias_semana
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Campo "table" es requerido (debe ser "bloqueos" o "descansos_extra")' },
        { status: 400 }
      );
    }

    // ========== DESCANSOS EXTRA (recurrentes) ==========
  // app/api/bloqueos/route.ts - sección descansos_extra
if (table === 'descansos_extra') {
  console.log('🔄 Procesando descanso extra...');

  // Validar campos - SIN tipo
  if (!id_sucursal || !id_barbero || !hora_inicio || !hora_fin || !dias_semana) {
    console.error('❌ Campos faltantes:', {
      id_sucursal: !!id_sucursal,
      id_barbero: !!id_barbero,
      hora_inicio: !!hora_inicio,
      hora_fin: !!hora_fin,
      dias_semana: !!dias_semana,
      // NO validar tipo aquí
    });
    return NextResponse.json(
      { error: 'Campos requeridos faltantes para descanso extra' },
      { status: 400 }
    );
  }

  // Convertir dias_semana a array si viene como string
  let diasArray;
  if (Array.isArray(dias_semana)) {
    console.log('✅ dias_semana ya es array');
    diasArray = dias_semana;
  } else if (typeof dias_semana === 'string') {
    console.log('⚠️ dias_semana es string, parseando...');
    try {
      diasArray = JSON.parse(dias_semana);
      console.log('✅ Parseado correctamente');
    } catch (e) {
      console.error('❌ Error parseando dias_semana:', e);
      return NextResponse.json(
        { error: 'dias_semana debe ser un array JSON válido' },
        { status: 400 }
      );
    }
  } else {
    console.error('❌ dias_semana tiene tipo inválido:', typeof dias_semana);
    return NextResponse.json(
      { error: 'dias_semana debe ser un array' },
      { status: 400 }
    );
  }

  // Construir payload SIN tipo
  const payload = {
    id_barberia: session.idBarberia,
    id_sucursal,
    id_barbero,
    motivo: motivo || null,
    hora_inicio,
    hora_fin,
    dias_semana: diasArray,
    creado_por: session.idBarbero,
  };

  console.log('💾 Payload a insertar:', JSON.stringify(payload, null, 2));

  const { data, error } = await supabaseAdmin
    .from('mibarber_descansos_extra')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('❌ Error de Supabase:', error);
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 500 }
    );
  }

  console.log('✅ Descanso extra creado con ID:', data.id);
  return NextResponse.json(data);
}


    // ========== BLOQUEOS (específicos de fecha) ==========
    if (table === 'bloqueos') {
      console.log('🔄 Procesando bloqueo...');

      // Validar campos requeridos
      if (!id_sucursal || !id_barbero || !fecha || !tipo) {
        console.error('❌ Campos faltantes para bloqueo:', {
          id_sucursal: !!id_sucursal,
          id_barbero: !!id_barbero,
          fecha: !!fecha,
          tipo: !!tipo,
        });
        return NextResponse.json(
          { error: 'Campos requeridos faltantes para bloqueo' },
          { status: 400 }
        );
      }

      // Construir payload
      const payload = {
        id_barberia: session.idBarberia,
        id_sucursal,
        id_barbero,
        fecha,
        tipo,
        motivo: motivo || null,
        // Para bloqueo_dia, hora_inicio y hora_fin deben ser null
        hora_inicio: tipo === 'bloqueo_dia' ? null : hora_inicio,
        hora_fin: tipo === 'bloqueo_dia' ? null : hora_fin,
        creado_por: session.idBarbero,
      };

      console.log('💾 Payload a insertar:', JSON.stringify(payload, null, 2));

      // Insertar
      const { data, error } = await supabaseAdmin
        .from('mibarber_bloqueos_barbero')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('❌ Error de Supabase:', error);
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 500 }
        );
      }

      console.log('✅ Bloqueo creado con ID:', data.id);
      return NextResponse.json(data);
    }

    // Tipo de operación inválido
    return NextResponse.json(
      { error: 'Tipo de operación inválido (table debe ser "bloqueos" o "descansos_extra")' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('💥 Error general en POST /api/bloqueos:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  console.log('\n🗑️ ===== DELETE /api/bloqueos =====');
  
  try {
    // Crear cliente Supabase en runtime
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Validar sesión
    const session = await validateSession();
    
    if (!session?.idBarberia) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Leer parámetros
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const table = searchParams.get('table');

    console.log('📋 Params:', { id, table });

    if (!id || !table) {
      return NextResponse.json(
        { error: 'ID y tabla requeridos' },
        { status: 400 }
      );
    }

    // Determinar nombre de tabla
    const tableName = table === 'descansos_extra'
      ? 'mibarber_descansos_extra'
      : 'mibarber_bloqueos_barbero';

    // Verificar que el registro pertenece a la barbería del usuario
    const { data: record } = await supabaseAdmin
      .from(tableName)
      .select('id_barberia')
      .eq('id', id)
      .single();

    if (!record || record.id_barberia !== session.idBarberia) {
      console.error('❌ Registro no encontrado o no pertenece a la barbería');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Eliminar
    const { error } = await supabaseAdmin
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error al eliminar:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Registro eliminado:', id);
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('💥 Error en DELETE /api/bloqueos:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}