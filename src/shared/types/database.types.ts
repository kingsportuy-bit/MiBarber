// Tipos generados automáticamente desde Supabase
// Este archivo fue generado usando: npx supabase gen types typescript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      mibarber_barberias: {
        Row: {
          id: string
          nombre_barberia: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre_barberia: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre_barberia?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mibarber_barberos: {
        Row: {
          id_barbero: string
          nombre: string
          telefono: string | null
          email: string | null
          especialidades: string[] | null
          activo: boolean
          id_barberia: string | null
          id_sucursal: string | null
          admin: boolean
          nivel_permisos: number
          username: string | null
          password_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id_barbero?: string
          nombre: string
          telefono?: string | null
          email?: string | null
          especialidades?: string[] | null
          activo?: boolean
          id_barberia?: string | null
          id_sucursal?: string | null
          admin?: boolean
          nivel_permisos?: number
          username?: string | null
          password_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_barbero?: string
          nombre?: string
          telefono?: string | null
          email?: string | null
          especialidades?: string[] | null
          activo?: boolean
          id_barberia?: string | null
          id_sucursal?: string | null
          admin?: boolean
          nivel_permisos?: number
          username?: string | null
          password_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mibarber_barberos_id_barberia_fkey"
            columns: ["id_barberia"]
            isOneToOne: false
            referencedRelation: "mibarber_barberias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mibarber_barberos_id_sucursal_fkey"
            columns: ["id_sucursal"]
            isOneToOne: false
            referencedRelation: "mibarber_sucursales"
            referencedColumns: ["id"]
          }
        ]
      }
      mibarber_barberos_password_backup: {
        Row: {
          id: number
          id_barbero: string
          password_hash: string
          created_at: string
        }
        Insert: {
          id?: number
          id_barbero: string
          password_hash: string
          created_at?: string
        }
        Update: {
          id?: number
          id_barbero?: string
          password_hash?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mibarber_barberos_password_backup_id_barbero_fkey"
            columns: ["id_barbero"]
            isOneToOne: false
            referencedRelation: "mibarber_barberos"
            referencedColumns: ["id_barbero"]
          }
        ]
      }
      mibarber_caja: {
        Row: {
          id_movimiento: string
          fecha: string
          tipo: string
          concepto: string
          monto: number
          id_cita: string | null
          id_cliente: string | null
          barbero: string | null
          metodo_pago: string
          observaciones: string | null
          id_barberia: string | null
          id_sucursal: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id_movimiento?: string
          fecha?: string
          tipo: string
          concepto: string
          monto: number
          id_cita?: string | null
          id_cliente?: string | null
          barbero?: string | null
          metodo_pago?: string
          observaciones?: string | null
          id_barberia?: string | null
          id_sucursal?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_movimiento?: string
          fecha?: string
          tipo?: string
          concepto?: string
          monto?: number
          id_cita?: string | null
          id_cliente?: string | null
          barbero?: string | null
          metodo_pago?: string
          observaciones?: string | null
          id_barberia?: string | null
          id_sucursal?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mibarber_caja_id_barberia_fkey"
            columns: ["id_barberia"]
            isOneToOne: false
            referencedRelation: "mibarber_barberias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mibarber_caja_id_cita_fkey"
            columns: ["id_cita"]
            isOneToOne: false
            referencedRelation: "mibarber_citas"
            referencedColumns: ["id_cita"]
          },
          {
            foreignKeyName: "mibarber_caja_id_cliente_fkey"
            columns: ["id_cliente"]
            isOneToOne: false
            referencedRelation: "mibarber_clientes"
            referencedColumns: ["id_cliente"]
          },
          {
            foreignKeyName: "mibarber_caja_id_sucursal_fkey"
            columns: ["id_sucursal"]
            isOneToOne: false
            referencedRelation: "mibarber_sucursales"
            referencedColumns: ["id"]
          }
        ]
      }
      mibarber_citas: {
        Row: {
          id_cita: string
          fecha: string
          hora: string
          cliente_nombre: string
          servicio: string
          estado: string
          nota: string | null
          creado: string
          id_cliente: string | null
          duracion: string
          notificacion_barbero: string | null
          notificacion_cliente: string | null
          ticket: number | null
          nro_factura: string | null
          barbero: string
          metodo_pago: string | null
          id_barberia: string | null
          id_sucursal: string | null
          id_barbero: string | null
          id_servicio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id_cita?: string
          fecha: string
          hora: string
          cliente_nombre: string
          servicio: string
          estado?: string
          nota?: string | null
          creado?: string
          id_cliente?: string | null
          duracion?: string
          notificacion_barbero?: string | null
          notificacion_cliente?: string | null
          ticket?: number | null
          nro_factura?: string | null
          barbero: string
          metodo_pago?: string | null
          id_barberia?: string | null
          id_sucursal?: string | null
          id_barbero?: string | null
          id_servicio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_cita?: string
          fecha?: string
          hora?: string
          cliente_nombre?: string
          servicio?: string
          estado?: string
          nota?: string | null
          creado?: string
          id_cliente?: string | null
          duracion?: string
          notificacion_barbero?: string | null
          notificacion_cliente?: string | null
          ticket?: number | null
          nro_factura?: string | null
          barbero?: string
          metodo_pago?: string | null
          id_barberia?: string | null
          id_sucursal?: string | null
          id_barbero?: string | null
          id_servicio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mibarber_citas_id_barberia_fkey"
            columns: ["id_barberia"]
            isOneToOne: false
            referencedRelation: "mibarber_barberias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mibarber_citas_id_barbero_fkey"
            columns: ["id_barbero"]
            isOneToOne: false
            referencedRelation: "mibarber_barberos"
            referencedColumns: ["id_barbero"]
          },
          {
            foreignKeyName: "mibarber_citas_id_cliente_fkey"
            columns: ["id_cliente"]
            isOneToOne: false
            referencedRelation: "mibarber_clientes"
            referencedColumns: ["id_cliente"]
          },
          {
            foreignKeyName: "mibarber_citas_id_servicio_fkey"
            columns: ["id_servicio"]
            isOneToOne: false
            referencedRelation: "mibarber_servicios"
            referencedColumns: ["id_servicio"]
          },
          {
            foreignKeyName: "mibarber_citas_id_sucursal_fkey"
            columns: ["id_sucursal"]
            isOneToOne: false
            referencedRelation: "mibarber_sucursales"
            referencedColumns: ["id"]
          }
        ]
      }
      mibarber_clientes: {
        Row: {
          id_cliente: string
          fecha_creacion: string
          nombre: string
          nivel_cliente: number | null
          notas: string | null
          ultima_interaccion: string | null
          id_conversacion: number | null
          puntaje: number | null
          telefono: string | null
          email: string | null
          direccion: string | null
          fecha_nacimiento: string | null
          id_barberia: string | null
          id_sucursal: string | null
          chat_humano: number | null
          foto_perfil: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id_cliente?: string
          fecha_creacion?: string
          nombre: string
          nivel_cliente?: number | null
          notas?: string | null
          ultima_interaccion?: string | null
          id_conversacion?: number | null
          puntaje?: number | null
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          fecha_nacimiento?: string | null
          id_barberia?: string | null
          id_sucursal?: string | null
          chat_humano?: number | null
          foto_perfil?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_cliente?: string
          fecha_creacion?: string
          nombre?: string
          nivel_cliente?: number | null
          notas?: string | null
          ultima_interaccion?: string | null
          id_conversacion?: number | null
          puntaje?: number | null
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          fecha_nacimiento?: string | null
          id_barberia?: string | null
          id_sucursal?: string | null
          chat_humano?: number | null
          foto_perfil?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mibarber_clientes_id_barberia_fkey"
            columns: ["id_barberia"]
            isOneToOne: false
            referencedRelation: "mibarber_barberias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mibarber_clientes_id_sucursal_fkey"
            columns: ["id_sucursal"]
            isOneToOne: false
            referencedRelation: "mibarber_sucursales"
            referencedColumns: ["id"]
          }
        ]
      }
      mibarber_dias_semana: {
        Row: {
          id_dia: number
          nombre_dia: string
          nombre_corto: string | null
        }
        Insert: {
          id_dia: number
          nombre_dia: string
          nombre_corto?: string | null
        }
        Update: {
          id_dia?: number
          nombre_dia?: string
          nombre_corto?: string | null
        }
        Relationships: []
      }
      mibarber_historial: {
        Row: {
          id: number
          session_id: string
          message: Json | null
          timestamptz: string
        }
        Insert: {
          id?: number
          session_id: string
          message?: Json | null
          timestamptz?: string
        }
        Update: {
          id?: number
          session_id?: string
          message?: Json | null
          timestamptz?: string
        }
        Relationships: []
      }
      mibarber_horarios_sucursales: {
        Row: {
          id_horario: string
          id_sucursal: string
          id_dia: number
          nombre_dia: string | null
          nombre_corto: string | null
          hora_apertura: string
          hora_cierre: string
          hora_inicio_almuerzo: string | null
          hora_fin_almuerzo: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id_horario?: string
          id_sucursal: string
          id_dia: number
          nombre_dia?: string | null
          nombre_corto?: string | null
          hora_apertura: string
          hora_cierre: string
          hora_inicio_almuerzo?: string | null
          hora_fin_almuerzo?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_horario?: string
          id_sucursal?: string
          id_dia?: number
          nombre_dia?: string | null
          nombre_corto?: string | null
          hora_apertura?: string
          hora_cierre?: string
          hora_inicio_almuerzo?: string | null
          hora_fin_almuerzo?: string | null
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mibarber_horarios_sucursales_id_sucursal_fkey"
            columns: ["id_sucursal"]
            isOneToOne: false
            referencedRelation: "mibarber_sucursales"
            referencedColumns: ["id"]
          }
        ]
      }
      mibarber_mensajes_temporales: {
        Row: {
          id_mensaje_t: number
          created_at: string
          id_cliente: string | null
          mensaje: string
          procesado: number
          tipo_mensaje: string
          origen: string
          updated_at: string
        }
        Insert: {
          id_mensaje_t?: number
          created_at?: string
          id_cliente?: string | null
          mensaje: string
          procesado?: number
          tipo_mensaje?: string
          origen?: string
          updated_at?: string
        }
        Update: {
          id_mensaje_t?: number
          created_at?: string
          id_cliente?: string | null
          mensaje?: string
          procesado?: number
          tipo_mensaje?: string
          origen?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mibarber_mensajes_temporales_id_cliente_fkey"
            columns: ["id_cliente"]
            isOneToOne: false
            referencedRelation: "mibarber_clientes"
            referencedColumns: ["id_cliente"]
          }
        ]
      }
      mibarber_servicios: {
        Row: {
          id_servicio: string
          nombre: string
          descripcion: string | null
          duracion_minutos: number
          precio: number
          activo: boolean
          id_barberia: string | null
          id_sucursal: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id_servicio?: string
          nombre: string
          descripcion?: string | null
          duracion_minutos?: number
          precio: number
          activo?: boolean
          id_barberia?: string | null
          id_sucursal?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_servicio?: string
          nombre?: string
          descripcion?: string | null
          duracion_minutos?: number
          precio?: number
          activo?: boolean
          id_barberia?: string | null
          id_sucursal?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mibarber_servicios_id_barberia_fkey"
            columns: ["id_barberia"]
            isOneToOne: false
            referencedRelation: "mibarber_barberias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mibarber_servicios_id_sucursal_fkey"
            columns: ["id_sucursal"]
            isOneToOne: false
            referencedRelation: "mibarber_sucursales"
            referencedColumns: ["id"]
          }
        ]
      }
      mibarber_sucursales: {
        Row: {
          id: string
          id_barberia: string
          numero_sucursal: number
          nombre_sucursal: string | null
          direccion: string | null
          telefono: string | null
          info: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          id_barberia: string
          numero_sucursal: number
          nombre_sucursal?: string | null
          direccion?: string | null
          telefono?: string | null
          info?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          id_barberia?: string
          numero_sucursal?: number
          nombre_sucursal?: string | null
          direccion?: string | null
          telefono?: string | null
          info?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mibarber_sucursales_id_barberia_fkey"
            columns: ["id_barberia"]
            isOneToOne: false
            referencedRelation: "mibarber_barberias"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never