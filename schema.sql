create table public.mibarber_auditoria (
  id_registro uuid not null default gen_random_uuid (),
  procesado text null default 'no'::text,
  exec jsonb null,
  errores text null default 'no'::text,
  mensaje_cliente text null,
  respuesta_agente text null,
  buffer_session jsonb null,
  "SETINICIAL" jsonb null,
  "DATOSUTILES" jsonb null,
  "PREFILTRORAPIDO" jsonb null,
  "CTXPARSENORMALIZE" jsonb null,
  "CLSUNIFICADO" jsonb null,
  "PARSECLSUNIFICADO" jsonb null,
  "DEFAULTSAPPLYBARBERO" jsonb null,
  "DEFAULTSAPPLYSERVICIOCORTE" jsonb null,
  "203ESTADOTURNONUEVO" jsonb null,
  "OBTENERTURNOSYBLOQUEOSBARBEROS" jsonb null,
  "204CALCULARCALENDARIOYPRIMEROLIBRE" jsonb null,
  "205RECORTARFECHAOBJETIVO" jsonb null,
  "206ESTADISTICASSLOTS" jsonb null,
  "207FUSIONARSLOTSCONCURRENCIA" jsonb null,
  "RANKINGOPTIMOS" jsonb null,
  "COMBINARSLOTSPORFECHA" jsonb null,
  "AGENTEDECISOR" jsonb null,
  "ARMARPROMPT" jsonb null,
  "GENERADORRESPUESTA" jsonb null,
  "PROCESARDATOS" jsonb null,
  accion text null,
  outputs_completos jsonb null,
  id_cliente text null,
  buffer_session_id text null,
  "tokens_CLS" bigint null,
  "tokens_GEN" bigint null,
  "tokens_TOTAL" bigint null,
  estado_buffer_session text null default 'activa'::text,
  create_at timestamp with time zone null default '2026-03-05 14:09:37.067748+00'::timestamp with time zone,
  constraint mibarber_auditoria_pkey primary key (id_registro)
) TABLESPACE pg_default;


create table public.mibarber_barberias (
  id uuid not null default gen_random_uuid (),
  nombre_barberia text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  pais text null,
  ciudad text null,
  cod_pais text null,
  constraint mibarber_barberias_pkey primary key (id)
) TABLESPACE pg_default;

create trigger update_mibarber_barberias_updated_at BEFORE
update on mibarber_barberias for EACH row
execute FUNCTION update_updated_at_column ();


create table public.mibarber_barberos (
  id_barbero uuid not null default gen_random_uuid (),
  nombre text not null,
  telefono text null,
  email text null,
  especialidades text[] null,
  activo boolean null default true,
  id_barberia uuid not null,
  id_sucursal uuid not null,
  admin boolean null default false,
  nivel_permisos integer null default 2,
  username text null,
  password_hash text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  id_conv_barbero smallint null default '0'::smallint,
  grupo_notificaciones smallint null,
  constraint mibarber_barberos_pkey primary key (id_barbero),
  constraint mibarber_barberos_username_key unique (username),
  constraint mibarber_barberos_id_barberia_fkey foreign KEY (id_barberia) references mibarber_barberias (id) on delete CASCADE,
  constraint mibarber_barberos_id_sucursal_fkey foreign KEY (id_sucursal) references mibarber_sucursales (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_barberos_barberia on public.mibarber_barberos using btree (id_barberia) TABLESPACE pg_default;

create index IF not exists idx_barberos_sucursal on public.mibarber_barberos using btree (id_sucursal) TABLESPACE pg_default;

create index IF not exists idx_barberos_username on public.mibarber_barberos using btree (username) TABLESPACE pg_default;

create trigger update_mibarber_barberos_updated_at BEFORE
update on mibarber_barberos for EACH row
execute FUNCTION update_updated_at_column ();


create table public.mibarber_barberos_password_backup (
  id_barbero uuid null,
  username text null,
  password_hash text null,
  backup_date timestamp with time zone null
) TABLESPACE pg_default;



create table public.mibarber_bloqueos_barbero (
  id uuid not null default gen_random_uuid (),
  id_barberia uuid not null,
  id_sucursal uuid not null,
  id_barbero uuid not null,
  fecha date not null,
  hora_inicio time without time zone null,
  hora_fin time without time zone null,
  tipo public.bloqueo_barbero_tipo not null,
  motivo text null,
  creado_por uuid not null,
  creado_at timestamp with time zone not null default now(),
  activo boolean null default true,
  constraint mibarber_bloqueos_barbero_pkey primary key (id),
  constraint mibarber_bloqueos_barbero_id_barbero_fkey foreign KEY (id_barbero) references mibarber_barberos (id_barbero),
  constraint mibarber_bloqueos_barbero_id_barberia_fkey foreign KEY (id_barberia) references mibarber_barberias (id) on delete CASCADE,
  constraint mibarber_bloqueos_barbero_id_sucursal_fkey foreign KEY (id_sucursal) references mibarber_sucursales (id) on delete CASCADE,
  constraint chk_bloqueo_dia check (
    (
      (
        (tipo = 'bloqueo_dia'::bloqueo_barbero_tipo)
        and (hora_inicio is null)
        and (hora_fin is null)
      )
      or (
        (
          tipo = any (array['bloqueo_horas'::bloqueo_barbero_tipo])
        )
        and (hora_inicio is not null)
        and (hora_fin is not null)
        and (hora_inicio < hora_fin)
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_bloq_barbero_fecha on public.mibarber_bloqueos_barbero using btree (id_barbero, fecha) TABLESPACE pg_default;

create index IF not exists idx_bloq_sucursal_fecha on public.mibarber_bloqueos_barbero using btree (id_sucursal, fecha) TABLESPACE pg_default;

create index IF not exists idx_bloq_barberia_fecha on public.mibarber_bloqueos_barbero using btree (id_barberia, fecha) TABLESPACE pg_default;



create table public.mibarber_caja (
  id_registro uuid not null default gen_random_uuid (),
  id_barberia uuid not null,
  id_sucursal uuid not null,
  id_barbero uuid not null,
  id_cita uuid null,
  tipo text not null,
  fecha date not null,
  hora time without time zone not null default CURRENT_TIME,
  concepto text not null,
  monto numeric(10, 2) not null,
  metodo_pago text null,
  nro_factura text null,
  tipo_factura text null,
  propina numeric(10, 2) null default 0,
  notas text null,
  adjunto_url text null,
  activo boolean null default true,
  id_barbero_registro uuid not null,
  nombre_barbero_registro text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  deleted_at timestamp with time zone null,
  constraint mibarber_caja_pkey primary key (id_registro),
  constraint mibarber_caja_id_barbero_fkey foreign KEY (id_barbero) references mibarber_barberos (id_barbero) on delete set null,
  constraint mibarber_caja_id_cita_fkey foreign KEY (id_cita) references mibarber_citas (id_cita) on delete set null,
  constraint mibarber_caja_id_sucursal_fkey foreign KEY (id_sucursal) references mibarber_sucursales (id) on delete CASCADE,
  constraint mibarber_caja_id_barbero_registro_fkey foreign KEY (id_barbero_registro) references mibarber_barberos (id_barbero) on delete set null,
  constraint mibarber_caja_id_barberia_fkey foreign KEY (id_barberia) references mibarber_barberias (id) on delete CASCADE,
  constraint mibarber_caja_tipo_check check (
    (
      tipo = any (
        array[
          'ingreso'::text,
          'gasto_barbero'::text,
          'gasto_barberia'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_caja_barberia on public.mibarber_caja using btree (id_barberia) TABLESPACE pg_default;

create index IF not exists idx_caja_sucursal on public.mibarber_caja using btree (id_sucursal) TABLESPACE pg_default;

create index IF not exists idx_caja_barbero on public.mibarber_caja using btree (id_barbero) TABLESPACE pg_default;

create index IF not exists idx_caja_fecha on public.mibarber_caja using btree (fecha) TABLESPACE pg_default;

create index IF not exists idx_caja_tipo on public.mibarber_caja using btree (tipo) TABLESPACE pg_default;

create index IF not exists idx_caja_activo on public.mibarber_caja using btree (activo) TABLESPACE pg_default;

create index IF not exists idx_caja_barbero_registro on public.mibarber_caja using btree (id_barbero_registro) TABLESPACE pg_default;

create trigger update_mibarber_caja_updated_at BEFORE
update on mibarber_caja for EACH row
execute FUNCTION update_updated_at_column ();



create table public.mibarber_citas (
  id_cita uuid not null default gen_random_uuid (),
  fecha date not null,
  hora time without time zone not null,
  cliente_nombre text not null,
  servicio text not null,
  estado text not null default 'pendiente'::text,
  nota text null,
  id_cliente uuid null,
  duracion text null,
  notificacion_barbero text null default 'no'::text,
  notificacion_recordatorio text null default 'no'::text,
  ticket numeric(10, 2) not null,
  nro_factura text null,
  barbero text not null,
  id_barberia uuid null,
  id_sucursal uuid null,
  id_barbero uuid null,
  id_servicio uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  metodo_pago text null,
  telefono text null,
  id_conv smallint null,
  origen_fase text null,
  notificacion_confirmacion text not null default 'no'::text,
  estado_ciclo text null default 'pendiente'::text,
  constraint mibarber_citas_pkey primary key (id_cita),
  constraint mibarber_citas_id_sucursal_fkey foreign KEY (id_sucursal) references mibarber_sucursales (id) on delete CASCADE,
  constraint mibarber_citas_id_servicio_fkey foreign KEY (id_servicio) references mibarber_servicios (id_servicio) on delete set null,
  constraint mibarber_citas_id_barbero_fkey foreign KEY (id_barbero) references mibarber_barberos (id_barbero) on delete set null,
  constraint mibarber_citas_id_cliente_fkey foreign KEY (id_cliente) references mibarber_clientes (id_cliente) on delete set null,
  constraint mibarber_citas_id_barberia_fkey foreign KEY (id_barberia) references mibarber_barberias (id) on delete CASCADE,
  constraint chk_estado_cita check (
    (
      estado = any (
        array[
          'pendiente'::text,
          'modificado'::text,
          'cancelado'::text,
          'confirmada'::text,
          'completado'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- Migracion recomendada para entornos existentes (evita conflicto entre checks):
-- BEGIN;
-- UPDATE public.mibarber_citas SET estado = 'confirmada' WHERE estado = 'confirmado';
-- ALTER TABLE public.mibarber_citas DROP CONSTRAINT IF EXISTS mibarber_citas_estado_check;
-- ALTER TABLE public.mibarber_citas DROP CONSTRAINT IF EXISTS chk_estado_cita;
-- ALTER TABLE public.mibarber_citas
--   ADD CONSTRAINT chk_estado_cita
--   CHECK (
--     estado = ANY (
--       ARRAY[
--         'pendiente'::text,
--         'modificado'::text,
--         'cancelado'::text,
--         'confirmada'::text,
--         'completado'::text
--       ]
--     )
--   );
-- COMMIT;

create index IF not exists idx_citas_fecha on public.mibarber_citas using btree (fecha) TABLESPACE pg_default;

create index IF not exists idx_citas_barbero on public.mibarber_citas using btree (barbero) TABLESPACE pg_default;

create index IF not exists idx_citas_estado on public.mibarber_citas using btree (estado) TABLESPACE pg_default;

create index IF not exists idx_citas_barberia on public.mibarber_citas using btree (id_barberia) TABLESPACE pg_default;

create index IF not exists idx_citas_sucursal on public.mibarber_citas using btree (id_sucursal) TABLESPACE pg_default;

create index IF not exists idx_citas_cliente on public.mibarber_citas using btree (id_cliente) TABLESPACE pg_default;

create index IF not exists idx_citas_barbero_id on public.mibarber_citas using btree (id_barbero) TABLESPACE pg_default;

create index IF not exists idx_citas_servicio_id on public.mibarber_citas using btree (id_servicio) TABLESPACE pg_default;

create index IF not exists idx_citas_metodo_pago on public.mibarber_citas using btree (metodo_pago) TABLESPACE pg_default;

create unique INDEX IF not exists uq_citas_activa_fecha_hora_barbero on public.mibarber_citas using btree (fecha, hora, id_barbero) TABLESPACE pg_default
where
  (estado <> 'cancelado'::text);

create index IF not exists idx_citas_pendientes_manana on public.mibarber_citas using btree (fecha, estado, notificacion_confirmacion) TABLESPACE pg_default
where
  (estado = 'pendiente'::text);

create index IF not exists idx_citas_confirmadas_hoy on public.mibarber_citas using btree (fecha, hora, estado, notificacion_recordatorio) TABLESPACE pg_default
where
  (estado = 'confirmada'::text);

create index IF not exists idx_citas_completar on public.mibarber_citas using btree (fecha, hora, estado) TABLESPACE pg_default
where
  (estado = 'confirmada'::text);

create trigger update_mibarber_citas_updated_at BEFORE
update on mibarber_citas for EACH row
execute FUNCTION update_updated_at_column ();

create trigger webhook_notificar_barbero
after INSERT
or
update on mibarber_citas for EACH row when (
  new.notificacion_barbero = 'no'::text
  and (
    new.estado = any (
      array[
        'pendiente'::text,
        'modificado'::text,
        'cancelado'::text
      ]
    )
  )
)
execute FUNCTION notificar_barbero_simple ();

create trigger trigger_auto_registrar_ingreso
after
update on mibarber_citas for EACH row
execute FUNCTION auto_registrar_ingreso_caja ();

create trigger trg_actualizar_slot_estadistica
after INSERT
or
update OF estado on mibarber_citas for EACH row
execute FUNCTION actualizar_slot_estadistica ();

create trigger notificar_cita_hoy_insert
after INSERT on mibarber_citas for EACH row when (new.fecha = fecha_hoy_uruguay ())
execute FUNCTION supabase_functions.http_request (
  'https://webhookn8ncodexa.codexa.uy/webhook/notificaciones-hoy',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '5000'
);

create trigger notificar_cita_hoy_update
after
update OF fecha,
hora,
estado on mibarber_citas for EACH row when (
  new.fecha = fecha_hoy_uruguay ()
  and (
    old.fecha is distinct from new.fecha
    or old.hora is distinct from new.hora
    or old.estado is distinct from new.estado
    and new.estado = 'cancelado'::text
  )
)
execute FUNCTION supabase_functions.http_request (
  'https://webhookn8ncodexa.codexa.uy/webhook/notificaciones-hoy',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '5000'
);

create trigger trigger_confirmacion_al_crear BEFORE INSERT on mibarber_citas for EACH row
execute FUNCTION set_notificacion_confirmacion ();

create trigger trigger_recordatorio_al_crear BEFORE INSERT on mibarber_citas for EACH row
execute FUNCTION set_notificacion_recordatorio ();



create table public.mibarber_clientes (
  id_cliente uuid not null default gen_random_uuid (),
  fecha_creacion timestamp with time zone not null default now(),
  nombre text null,
  nivel_cliente integer null default 0,
  notas text null,
  ultima_interaccion timestamp with time zone null,
  id_conversacion integer null,
  puntaje integer null default 0,
  telefono text not null,
  email text null,
  direccion text null,
  fecha_nacimiento date null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  id_barberia uuid not null,
  id_sucursal uuid not null,
  chat_humano smallint null default '0'::smallint,
  foto_perfil text null default ''::text,
  mensaje_inicial text null default '1'::text,
  estado_turno jsonb null,
  buffer_session text null,
  buffer_session_id uuid null default gen_random_uuid (),
  session_ctx jsonb null default '{}'::jsonb,
  ultima_notificacion_recurrencia timestamp with time zone null,
  notificado_recurrencia boolean not null default false,
  fase text not null default '1'::text,
  fase_anterior text null,
  fase_updated_at timestamp with time zone not null default now(),
  ultima_fase text null,
  ultima_visita date null,
  total_visitas integer not null default 0,
  servicio_habitual text null,
  barbero_habitual uuid null,
  booking_data jsonb not null default '{}'::jsonb,
  stats jsonb not null default '{"reactivaciones": 0, "turnos_cancelados": 0, "turnos_completados": 0, "turnos_reagendados": 0}'::jsonb,
  contexto_turno_id uuid null,
  constraint mibarber_clientes_pkey primary key (id_cliente),
  constraint mibarber_clientes_id_barberia_fkey foreign KEY (id_barberia) references mibarber_barberias (id) on delete CASCADE,
  constraint mibarber_clientes_id_sucursal_fkey foreign KEY (id_sucursal) references mibarber_sucursales (id) on delete CASCADE,
  constraint chk_fase check (
    (
      fase = any (
        array[
          '1'::text,
          '2'::text,
          '3'::text,
          '4'::text,
          'R'::text,
          '5'::text,
          '6'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_clientes_barberia on public.mibarber_clientes using btree (id_barberia) TABLESPACE pg_default;

create index IF not exists idx_clientes_sucursal on public.mibarber_clientes using btree (id_sucursal) TABLESPACE pg_default;

create index IF not exists idx_clientes_nombre on public.mibarber_clientes using btree (nombre) TABLESPACE pg_default;

create index IF not exists idx_clientes_fase on public.mibarber_clientes using btree (fase) TABLESPACE pg_default;

create index IF not exists idx_clientes_conv_id on public.mibarber_clientes using btree (id_conversacion) TABLESPACE pg_default
where
  (id_conversacion is not null);

create index IF not exists idx_clientes_fase_updated on public.mibarber_clientes using btree (fase_updated_at) TABLESPACE pg_default
where
  (fase <> all (array['1'::text, '6'::text]));

create trigger update_mibarber_clientes_updated_at BEFORE
update on mibarber_clientes for EACH row
execute FUNCTION update_updated_at_column ();



create table public.mibarber_descansos_extra (
  id uuid not null default gen_random_uuid (),
  id_barberia uuid not null,
  id_sucursal uuid not null,
  id_barbero uuid not null,
  hora_inicio time without time zone not null,
  hora_fin time without time zone not null,
  dias_semana text not null,
  motivo text null,
  creado_por uuid not null,
  creado_at timestamp with time zone not null default now(),
  activo boolean null default true,
  constraint mibarber_descansos_extra_pkey primary key (id),
  constraint fk_descanso_barbero foreign KEY (id_barbero) references mibarber_barberos (id_barbero) on delete CASCADE,
  constraint fk_descanso_barberia foreign KEY (id_barberia) references mibarber_barberias (id) on delete CASCADE,
  constraint fk_descanso_sucursal foreign KEY (id_sucursal) references mibarber_sucursales (id) on delete CASCADE,
  constraint fk_descanso_creado_por foreign KEY (creado_por) references mibarber_barberos (id_barbero) on delete CASCADE,
  constraint chk_dias_semana_formato check ((dias_semana is not null)),
  constraint chk_horas_validas check ((hora_inicio < hora_fin))
) TABLESPACE pg_default;

create index IF not exists idx_descansos_extra_barberia on public.mibarber_descansos_extra using btree (id_barberia) TABLESPACE pg_default;

create index IF not exists idx_descansos_extra_sucursal on public.mibarber_descansos_extra using btree (id_sucursal) TABLESPACE pg_default;

create index IF not exists idx_descansos_extra_barbero on public.mibarber_descansos_extra using btree (id_barbero) TABLESPACE pg_default;

create index IF not exists idx_descansos_extra_creado_at on public.mibarber_descansos_extra using btree (creado_at desc) TABLESPACE pg_default;



create table public.mibarber_historial (
  id integer not null default nextval('mibarber_historial_id_seq'::regclass),
  session_id character varying(255) not null,
  message jsonb not null,
  timestamptz timestamp with time zone null default now(),
  procesado smallint null default '1'::smallint,
  id_sucursal uuid null,
  constraint sportex_historial_leads_duplicate_pkey primary key (id),
  constraint mibarber_historial_id_sucursal_fkey1 foreign KEY (id_sucursal) references mibarber_sucursales (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists sportex_historial_leads_duplicate_id_sucursal_idx on public.mibarber_historial using btree (id_sucursal) TABLESPACE pg_default;



create table public.mibarber_historial_barberos (
  id serial not null,
  session_id character varying(255) not null,
  message jsonb not null,
  constraint mibarber_historial_barberos_pkey primary key (id)
) TABLESPACE pg_default;




create table public.mibarber_horarios_sucursales (
  id_horario uuid not null default gen_random_uuid (),
  id_sucursal uuid not null,
  id_dia integer not null,
  hora_apertura time without time zone not null,
  hora_cierre time without time zone not null,
  hora_inicio_almuerzo time without time zone null,
  hora_fin_almuerzo time without time zone null,
  activo boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  nombre_dia text GENERATED ALWAYS as (
    case id_dia
      when 0 then 'Domingo'::text
      when 1 then 'Lunes'::text
      when 2 then 'Martes'::text
      when 3 then 'Miércoles'::text
      when 4 then 'Jueves'::text
      when 5 then 'Viernes'::text
      when 6 then 'Sábado'::text
      else 'Desconocido'::text
    end
  ) STORED null,
  constraint mibarber_horarios_sucursales_pkey primary key (id_horario),
  constraint mibarber_horarios_sucursales_id_sucursal_id_dia_key unique (id_sucursal, id_dia),
  constraint mibarber_horarios_sucursales_id_sucursal_fkey foreign KEY (id_sucursal) references mibarber_sucursales (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_horarios_sucursales_sucursal on public.mibarber_horarios_sucursales using btree (id_sucursal) TABLESPACE pg_default;

create index IF not exists idx_horarios_sucursales_dia on public.mibarber_horarios_sucursales using btree (id_dia) TABLESPACE pg_default;

create index IF not exists idx_horarios_sucursales_activo on public.mibarber_horarios_sucursales using btree (activo) TABLESPACE pg_default;

create trigger update_mibarber_horarios_sucursales_updated_at BEFORE
update on mibarber_horarios_sucursales for EACH row
execute FUNCTION update_updated_at_column ();



create table public.mibarber_lista_espera (
  id_espera uuid not null default gen_random_uuid (),
  id_cliente uuid null,
  telefono text not null,
  cliente_nombre text not null,
  id_barberia uuid not null,
  id_sucursal uuid not null,
  id_barbero uuid null,
  servicio text not null,
  id_servicio uuid null,
  duracion text null,
  fecha_preferida date null,
  hora_preferida time without time zone null,
  flexibilidad text not null default 'flexible'::text,
  estado text not null default 'activo'::text,
  id_conv smallint null,
  id_conversacion text null,
  notificado_en timestamp with time zone null,
  id_cita_generada uuid null,
  vence_en timestamp with time zone not null default (now() + '30 days'::interval),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint mibarber_lista_espera_pkey primary key (id_espera),
  constraint mibarber_lista_espera_id_sucursal_fkey foreign KEY (id_sucursal) references mibarber_sucursales (id) on delete CASCADE,
  constraint mibarber_lista_espera_id_cita_generada_fkey foreign KEY (id_cita_generada) references mibarber_citas (id_cita) on delete set null,
  constraint mibarber_lista_espera_id_barberia_fkey foreign KEY (id_barberia) references mibarber_barberias (id) on delete CASCADE,
  constraint mibarber_lista_espera_id_cliente_fkey foreign KEY (id_cliente) references mibarber_clientes (id_cliente) on delete set null,
  constraint mibarber_lista_espera_id_barbero_fkey foreign KEY (id_barbero) references mibarber_barberos (id_barbero) on delete set null,
  constraint mibarber_lista_espera_id_servicio_fkey foreign KEY (id_servicio) references mibarber_servicios (id_servicio) on delete set null,
  constraint mibarber_lista_espera_flexibilidad_check check (
    (
      flexibilidad = any (
        array[
          'fecha_fija'::text,
          'hora_fija'::text,
          'flexible'::text
        ]
      )
    )
  ),
  constraint mibarber_lista_espera_estado_check check (
    (
      estado = any (
        array[
          'activo'::text,
          'notificado'::text,
          'convertido'::text,
          'cancelado'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_lista_espera_sucursal_estado on public.mibarber_lista_espera using btree (id_sucursal, estado) TABLESPACE pg_default;

create index IF not exists idx_lista_espera_cliente on public.mibarber_lista_espera using btree (id_cliente) TABLESPACE pg_default;

create index IF not exists idx_lista_espera_telefono on public.mibarber_lista_espera using btree (telefono) TABLESPACE pg_default;

create index IF not exists idx_lista_espera_barbero on public.mibarber_lista_espera using btree (id_barbero, estado) TABLESPACE pg_default;

create index IF not exists idx_lista_espera_fecha_preferida on public.mibarber_lista_espera using btree (fecha_preferida, estado) TABLESPACE pg_default;

create index IF not exists idx_lista_espera_vence_en on public.mibarber_lista_espera using btree (vence_en, estado) TABLESPACE pg_default;

create trigger update_mibarber_lista_espera_updated_at BEFORE
update on mibarber_lista_espera for EACH row
execute FUNCTION update_updated_at_column ();



create table public.mibarber_mensajes_temporales (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  conversationid text null,
  mensaje text null,
  procesado smallint null default '0'::smallint,
  constraint mibarber_mensajes_temporales_pkey primary key (id)
) TABLESPACE pg_default;



create table public.mibarber_mensajes_temporales_barberos (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  telefono text null,
  mensaje text null,
  procesado smallint null default '0'::smallint,
  constraint mibarber_mensajes_temporales_barberos_pkey primary key (id)
) TABLESPACE pg_default;



create table public.mibarber_metas (
  id_meta uuid not null default gen_random_uuid (),
  id_barbero uuid not null,
  id_barberia uuid not null,
  mes integer not null,
  anio integer not null,
  monto_objetivo numeric(10, 2) not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint mibarber_metas_pkey primary key (id_meta),
  constraint mibarber_metas_unique_barbero_mes unique (id_barbero, mes, anio),
  constraint mibarber_metas_barbero_fkey foreign KEY (id_barbero) references mibarber_barberos (id_barbero) on delete CASCADE,
  constraint mibarber_metas_barberia_fkey foreign KEY (id_barberia) references mibarber_barberias (id) on delete CASCADE,
  constraint mibarber_metas_anio_check check ((anio >= 2024)),
  constraint mibarber_metas_monto_objetivo_check check ((monto_objetivo > (0)::numeric)),
  constraint mibarber_metas_mes_check check (
    (
      (mes >= 1)
      and (mes <= 12)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_metas_barbero on public.mibarber_metas using btree (id_barbero) TABLESPACE pg_default;

create index IF not exists idx_metas_mes_anio on public.mibarber_metas using btree (mes, anio) TABLESPACE pg_default;

create trigger update_mibarber_metas_updated_at BEFORE
update on mibarber_metas for EACH row
execute FUNCTION update_updated_at_column ();


create table public.mibarber_nodos (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  nombre_nodo text null,
  codigo text null,
  activo boolean null default true,
  constraint mibarber_nodos_pkey primary key (id)
) TABLESPACE pg_default;



create table public.mibarber_servicios (
  id_servicio uuid not null default gen_random_uuid (),
  nombre text not null,
  descripcion text null,
  duracion_minutos integer not null default 30,
  precio numeric(10, 2) not null,
  activo boolean null default true,
  id_barberia uuid not null,
  id_sucursal uuid not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint mibarber_servicios_pkey primary key (id_servicio),
  constraint mibarber_servicios_id_barberia_fkey foreign KEY (id_barberia) references mibarber_barberias (id) on delete CASCADE,
  constraint mibarber_servicios_id_sucursal_fkey foreign KEY (id_sucursal) references mibarber_sucursales (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_servicios_sucursal on public.mibarber_servicios using btree (id_sucursal) TABLESPACE pg_default;

create index IF not exists idx_servicios_barberia on public.mibarber_servicios using btree (id_barberia) TABLESPACE pg_default;

create trigger update_mibarber_servicios_updated_at BEFORE
update on mibarber_servicios for EACH row
execute FUNCTION update_updated_at_column ();



create table public.mibarber_slot_estadisticas (
  id_estadistica uuid not null default gen_random_uuid (),
  id_barberia uuid not null,
  id_sucursal uuid not null,
  id_barbero uuid null,
  dia_semana smallint not null,
  hora time without time zone not null,
  total_turnos integer not null default 0,
  total_cancelaciones integer not null default 0,
  semanas_activas integer not null default 1,
  promedio_ocupacion numeric(8, 4) not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint mibarber_slot_estadisticas_pkey primary key (id_estadistica),
  constraint uq_slot_estadistica unique (
    id_barberia,
    id_sucursal,
    id_barbero,
    dia_semana,
    hora
  ),
  constraint mibarber_slot_estadisticas_id_barbero_fkey foreign KEY (id_barbero) references mibarber_barberos (id_barbero) on delete CASCADE,
  constraint mibarber_slot_estadisticas_id_barberia_fkey foreign KEY (id_barberia) references mibarber_barberias (id) on delete CASCADE,
  constraint mibarber_slot_estadisticas_id_sucursal_fkey foreign KEY (id_sucursal) references mibarber_sucursales (id) on delete CASCADE,
  constraint mibarber_slot_estadisticas_dia_semana_check check (
    (
      (dia_semana >= 0)
      and (dia_semana <= 6)
    )
  ),
  constraint mibarber_slot_estadisticas_promedio_check check ((promedio_ocupacion >= (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_slot_est_promedio on public.mibarber_slot_estadisticas using btree (id_sucursal, dia_semana, promedio_ocupacion) TABLESPACE pg_default;

create index IF not exists idx_slot_est_sucursal_barbero_dia on public.mibarber_slot_estadisticas using btree (id_sucursal, id_barbero, dia_semana) TABLESPACE pg_default;

create index IF not exists idx_slot_est_barberia_dia on public.mibarber_slot_estadisticas using btree (id_barberia, dia_semana) TABLESPACE pg_default;



create table public.mibarber_sucursales (
  id uuid not null default gen_random_uuid (),
  id_barberia uuid null,
  numero_sucursal integer not null,
  nombre_sucursal text null,
  direccion text null,
  telefono text null,
  info text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  inbox smallint null,
  grupo_not_desactivar smallint null,
  wpp_activo text null default 'Desconectado'::text,
  qr text null,
  "AVISO_BARBERO_ADMIN" text null,
  personalidad text null,
  id_system text null,
  conf_incial text null default '0'::text,
  tokens_diarios bigint null,
  tokens_historico bigint null,
  activa boolean null default false,
  config jsonb not null default '{}'::jsonb,
  constraint mibarber_sucursales_pkey primary key (id),
  constraint mibarber_sucursales_id_barberia_numero_sucursal_key unique (id_barberia, numero_sucursal),
  constraint mibarber_sucursales_id_barberia_fkey foreign KEY (id_barberia) references mibarber_barberias (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_sucursales_barberia on public.mibarber_sucursales using btree (id_barberia) TABLESPACE pg_default;

create trigger update_mibarber_sucursales_updated_at BEFORE
update on mibarber_sucursales for EACH row
execute FUNCTION update_updated_at_column ();





[
  {
    "table_schema": "public",
    "table_name": "mibarber_barberias",
    "trigger_name": "update_mibarber_barberias_updated_at",
    "trigger_ddl": "CREATE TRIGGER update_mibarber_barberias_updated_at BEFORE UPDATE ON mibarber_barberias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
    "trigger_function": "update_updated_at_column"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_barberos",
    "trigger_name": "update_mibarber_barberos_updated_at",
    "trigger_ddl": "CREATE TRIGGER update_mibarber_barberos_updated_at BEFORE UPDATE ON mibarber_barberos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
    "trigger_function": "update_updated_at_column"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_caja",
    "trigger_name": "update_mibarber_caja_updated_at",
    "trigger_ddl": "CREATE TRIGGER update_mibarber_caja_updated_at BEFORE UPDATE ON mibarber_caja FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
    "trigger_function": "update_updated_at_column"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_citas",
    "trigger_name": "notificar_cita_hoy_insert",
    "trigger_ddl": "CREATE TRIGGER notificar_cita_hoy_insert AFTER INSERT ON mibarber_citas FOR EACH ROW WHEN (new.fecha = fecha_hoy_uruguay()) EXECUTE FUNCTION supabase_functions.http_request('https://webhookn8ncodexa.codexa.uy/webhook/notificaciones-hoy', 'POST', '{\"Content-Type\":\"application/json\"}', '{}', '5000')",
    "trigger_function": "http_request"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_citas",
    "trigger_name": "notificar_cita_hoy_update",
    "trigger_ddl": "CREATE TRIGGER notificar_cita_hoy_update AFTER UPDATE OF fecha, hora, estado ON mibarber_citas FOR EACH ROW WHEN (new.fecha = fecha_hoy_uruguay() AND (old.fecha IS DISTINCT FROM new.fecha OR old.hora IS DISTINCT FROM new.hora OR old.estado IS DISTINCT FROM new.estado AND new.estado = 'cancelado'::text)) EXECUTE FUNCTION supabase_functions.http_request('https://webhookn8ncodexa.codexa.uy/webhook/notificaciones-hoy', 'POST', '{\"Content-Type\":\"application/json\"}', '{}', '5000')",
    "trigger_function": "http_request"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_citas",
    "trigger_name": "trg_actualizar_slot_estadistica",
    "trigger_ddl": "CREATE TRIGGER trg_actualizar_slot_estadistica AFTER INSERT OR UPDATE OF estado ON mibarber_citas FOR EACH ROW EXECUTE FUNCTION actualizar_slot_estadistica()",
    "trigger_function": "actualizar_slot_estadistica"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_citas",
    "trigger_name": "trigger_auto_registrar_ingreso",
    "trigger_ddl": "CREATE TRIGGER trigger_auto_registrar_ingreso AFTER UPDATE ON mibarber_citas FOR EACH ROW EXECUTE FUNCTION auto_registrar_ingreso_caja()",
    "trigger_function": "auto_registrar_ingreso_caja"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_citas",
    "trigger_name": "trigger_confirmacion_al_crear",
    "trigger_ddl": "CREATE TRIGGER trigger_confirmacion_al_crear BEFORE INSERT ON mibarber_citas FOR EACH ROW EXECUTE FUNCTION set_notificacion_confirmacion()",
    "trigger_function": "set_notificacion_confirmacion"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_citas",
    "trigger_name": "trigger_recordatorio_al_crear",
    "trigger_ddl": "CREATE TRIGGER trigger_recordatorio_al_crear BEFORE INSERT ON mibarber_citas FOR EACH ROW EXECUTE FUNCTION set_notificacion_recordatorio()",
    "trigger_function": "set_notificacion_recordatorio"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_citas",
    "trigger_name": "update_mibarber_citas_updated_at",
    "trigger_ddl": "CREATE TRIGGER update_mibarber_citas_updated_at BEFORE UPDATE ON mibarber_citas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
    "trigger_function": "update_updated_at_column"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_citas",
    "trigger_name": "webhook_notificar_barbero",
    "trigger_ddl": "CREATE TRIGGER webhook_notificar_barbero AFTER INSERT OR UPDATE ON mibarber_citas FOR EACH ROW WHEN (new.notificacion_barbero = 'no'::text AND (new.estado = ANY (ARRAY['pendiente'::text, 'modificado'::text, 'cancelado'::text]))) EXECUTE FUNCTION notificar_barbero_simple()",
    "trigger_function": "notificar_barbero_simple"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_clientes",
    "trigger_name": "update_mibarber_clientes_updated_at",
    "trigger_ddl": "CREATE TRIGGER update_mibarber_clientes_updated_at BEFORE UPDATE ON mibarber_clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
    "trigger_function": "update_updated_at_column"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_horarios_sucursales",
    "trigger_name": "update_mibarber_horarios_sucursales_updated_at",
    "trigger_ddl": "CREATE TRIGGER update_mibarber_horarios_sucursales_updated_at BEFORE UPDATE ON mibarber_horarios_sucursales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
    "trigger_function": "update_updated_at_column"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_lista_espera",
    "trigger_name": "update_mibarber_lista_espera_updated_at",
    "trigger_ddl": "CREATE TRIGGER update_mibarber_lista_espera_updated_at BEFORE UPDATE ON mibarber_lista_espera FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
    "trigger_function": "update_updated_at_column"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_metas",
    "trigger_name": "update_mibarber_metas_updated_at",
    "trigger_ddl": "CREATE TRIGGER update_mibarber_metas_updated_at BEFORE UPDATE ON mibarber_metas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
    "trigger_function": "update_updated_at_column"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_servicios",
    "trigger_name": "update_mibarber_servicios_updated_at",
    "trigger_ddl": "CREATE TRIGGER update_mibarber_servicios_updated_at BEFORE UPDATE ON mibarber_servicios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
    "trigger_function": "update_updated_at_column"
  },
  {
    "table_schema": "public",
    "table_name": "mibarber_sucursales",
    "trigger_name": "update_mibarber_sucursales_updated_at",
    "trigger_ddl": "CREATE TRIGGER update_mibarber_sucursales_updated_at BEFORE UPDATE ON mibarber_sucursales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
    "trigger_function": "update_updated_at_column"
  }
]


[
  {
    "schema_name": "public",
    "function_name": "actualizar_slot_estadistica",
    "args": "",
    "function_ddl": "CREATE OR REPLACE FUNCTION public.actualizar_slot_estadistica()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$\nDECLARE\n  v_dia_semana SMALLINT;\nBEGIN\n\n  -- ── INSERT: turno nuevo confirmado/pendiente ──────────────\n  IF TG_OP = 'INSERT' AND NEW.estado IN ('pendiente', 'modificado') THEN\n\n    v_dia_semana := EXTRACT(DOW FROM NEW.fecha)::SMALLINT;\n\n    -- Registro por barbero específico\n    INSERT INTO public.mibarber_slot_estadisticas\n      (id_barberia, id_sucursal, id_barbero, dia_semana, hora, total_turnos, semanas_activas, promedio_ocupacion)\n    VALUES\n      (NEW.id_barberia, NEW.id_sucursal, NEW.id_barbero, v_dia_semana, NEW.hora, 1, 1, 1.0)\n    ON CONFLICT ON CONSTRAINT uq_slot_estadistica\n    DO UPDATE SET\n      total_turnos       = mibarber_slot_estadisticas.total_turnos + 1,\n      promedio_ocupacion = ROUND(\n                             (mibarber_slot_estadisticas.total_turnos + 1)::NUMERIC\n                             / GREATEST(mibarber_slot_estadisticas.semanas_activas, 1),\n                             4\n                           ),\n      updated_at         = NOW();\n\n    -- Registro agregado de la sucursal (id_barbero = NULL)\n    INSERT INTO public.mibarber_slot_estadisticas\n      (id_barberia, id_sucursal, id_barbero, dia_semana, hora, total_turnos, semanas_activas, promedio_ocupacion)\n    VALUES\n      (NEW.id_barberia, NEW.id_sucursal, NULL, v_dia_semana, NEW.hora, 1, 1, 1.0)\n    ON CONFLICT ON CONSTRAINT uq_slot_estadistica\n    DO UPDATE SET\n      total_turnos       = mibarber_slot_estadisticas.total_turnos + 1,\n      promedio_ocupacion = ROUND(\n                             (mibarber_slot_estadisticas.total_turnos + 1)::NUMERIC\n                             / GREATEST(mibarber_slot_estadisticas.semanas_activas, 1),\n                             4\n                           ),\n      updated_at         = NOW();\n\n  END IF;\n\n  -- ── UPDATE → cancelado: descontar del total ───────────────\n  IF TG_OP = 'UPDATE'\n     AND NEW.estado = 'cancelado'\n     AND OLD.estado <> 'cancelado' THEN\n\n    v_dia_semana := EXTRACT(DOW FROM NEW.fecha)::SMALLINT;\n\n    -- Registro por barbero específico\n    UPDATE public.mibarber_slot_estadisticas SET\n      total_cancelaciones = total_cancelaciones + 1,\n      total_turnos        = GREATEST(total_turnos - 1, 0),\n      promedio_ocupacion  = ROUND(\n                              GREATEST(total_turnos - 1, 0)::NUMERIC\n                              / GREATEST(semanas_activas, 1),\n                              4\n                            ),\n      updated_at          = NOW()\n    WHERE id_barberia  = NEW.id_barberia\n      AND id_sucursal  = NEW.id_sucursal\n      AND id_barbero   = NEW.id_barbero\n      AND dia_semana   = v_dia_semana\n      AND hora         = NEW.hora;\n\n    -- Registro agregado de la sucursal\n    UPDATE public.mibarber_slot_estadisticas SET\n      total_cancelaciones = total_cancelaciones + 1,\n      total_turnos        = GREATEST(total_turnos - 1, 0),\n      promedio_ocupacion  = ROUND(\n                              GREATEST(total_turnos - 1, 0)::NUMERIC\n                              / GREATEST(semanas_activas, 1),\n                              4\n                            ),\n      updated_at          = NOW()\n    WHERE id_barberia  = NEW.id_barberia\n      AND id_sucursal  = NEW.id_sucursal\n      AND id_barbero   IS NULL\n      AND dia_semana   = v_dia_semana\n      AND hora         = NEW.hora;\n\n  END IF;\n\n  RETURN NEW;\nEND;\n$function$\n"
  },
  {
    "schema_name": "public",
    "function_name": "auto_registrar_ingreso_caja",
    "args": "",
    "function_ddl": "CREATE OR REPLACE FUNCTION public.auto_registrar_ingreso_caja()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\nBEGIN\n  -- Solo si la cita pasa a \"completado\" y tiene ticket\n  IF NEW.estado = 'completado' \n     AND (OLD.estado IS NULL OR OLD.estado != 'completado')\n     AND NEW.ticket IS NOT NULL \n     AND NEW.ticket > 0 \n  THEN\n    INSERT INTO mibarber_caja (\n      id_barberia,\n      id_sucursal,\n      id_barbero,\n      id_cita,\n      tipo,\n      fecha,\n      hora,\n      concepto,\n      monto,\n      metodo_pago,\n      nro_factura,\n      propina,\n      id_barbero_registro,\n      nombre_barbero_registro\n    ) VALUES (\n      NEW.id_barberia,\n      NEW.id_sucursal,\n      NEW.id_barbero,\n      NEW.id_cita,\n      'ingreso',\n      NEW.fecha,\n      NEW.hora,\n      CONCAT('Cita: ', NEW.servicio, ' - ', NEW.cliente_nombre),\n      NEW.ticket,\n      NEW.metodo_pago,\n      NEW.nro_factura,\n      0, -- propina inicial en 0\n      NEW.id_barbero,\n      NEW.barbero\n    );\n  END IF;\n  \n  RETURN NEW;\nEND;\n$function$\n"
  },
  {
    "schema_name": "public",
    "function_name": "notificar_barbero_simple",
    "args": "",
    "function_ddl": "CREATE OR REPLACE FUNCTION public.notificar_barbero_simple()\n RETURNS trigger\n LANGUAGE plpgsql\n SECURITY DEFINER\nAS $function$\r\nBEGIN\r\n  PERFORM net.http_post(\r\n    url := 'https://webhookn8ncodexa.codexa.uy/webhook/notificaciones',\r\n    headers := '{\"Content-Type\": \"application/json\"}'::jsonb,\r\n    body := jsonb_build_object('record', row_to_json(NEW))\r\n  );\r\n  \r\n  RETURN NEW;\r\nEND;\r\n$function$\n"
  },
  {
    "schema_name": "public",
    "function_name": "set_id_sucursal_from_cliente",
    "args": "",
    "function_ddl": "CREATE OR REPLACE FUNCTION public.set_id_sucursal_from_cliente()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\nBEGIN\n  -- Buscar el id_sucursal del cliente correspondiente al session_id\n  SELECT id_sucursal INTO NEW.id_sucursal\n  FROM mibarber_clientes\n  WHERE id_conversacion::text = NEW.session_id;\n  \n  -- Si no se encuentra el cliente, se mantiene el valor NULL\n  RETURN NEW;\nEND;\n$function$\n"
  },
  {
    "schema_name": "public",
    "function_name": "set_notificacion_confirmacion",
    "args": "",
    "function_ddl": "CREATE OR REPLACE FUNCTION public.set_notificacion_confirmacion()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\nDECLARE\n  turno_datetime TIMESTAMP;\n  horas_hasta_turno NUMERIC;\nBEGIN\n  turno_datetime := (NEW.fecha::TEXT || ' ' || NEW.hora::TEXT)::TIMESTAMP;\n  horas_hasta_turno := EXTRACT(EPOCH FROM (turno_datetime - NOW())) / 3600;\n\n  IF horas_hasta_turno > 36 THEN\n    NEW.notificacion_confirmacion := 'no';\n  ELSE\n    NEW.notificacion_confirmacion := 'si';\n  END IF;\n\n  RETURN NEW;\nEND;\n$function$\n"
  },
  {
    "schema_name": "public",
    "function_name": "set_notificacion_recordatorio",
    "args": "",
    "function_ddl": "CREATE OR REPLACE FUNCTION public.set_notificacion_recordatorio()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\nDECLARE\n  turno_datetime TIMESTAMP;\n  horas_hasta_turno NUMERIC;\nBEGIN\n  turno_datetime := (NEW.fecha::TEXT || ' ' || NEW.hora::TEXT)::TIMESTAMP;\n  horas_hasta_turno := EXTRACT(EPOCH FROM (turno_datetime - NOW())) / 3600;\n\n  IF horas_hasta_turno <= 12 THEN\n    NEW.notificacion_recordatorio := 'si';\n  ELSE\n    NEW.notificacion_recordatorio := 'no';\n  END IF;\n\n  RETURN NEW;\nEND;\n$function$\n"
  },
  {
    "schema_name": "public",
    "function_name": "update_actualizado_en",
    "args": "",
    "function_ddl": "CREATE OR REPLACE FUNCTION public.update_actualizado_en()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\nBEGIN\n    NEW.actualizado_en = NOW();\n    RETURN NEW;\nEND;\n$function$\n"
  },
  {
    "schema_name": "public",
    "function_name": "update_updated_at_column",
    "args": "",
    "function_ddl": "CREATE OR REPLACE FUNCTION public.update_updated_at_column()\n RETURNS trigger\n LANGUAGE plpgsql\nAS $function$\nBEGIN\n    NEW.updated_at = now();\n    RETURN NEW;\nEND;\n$function$\n"
  }
]



















