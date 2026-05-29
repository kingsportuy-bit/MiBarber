# Funcionalidades del Sistema MiBarber

Este documento detalla todas las funcionalidades del ecosistema MiBarber, diseñado para la gestión integral de barberías y peluquerías.

## 1. Gestión de Agenda y Citas
El corazón del sistema, permitiendo un control total sobre el flujo de clientes.

- **Calendario Dinámico:** Vista mensual, semanal y diaria de todas las citas.
- **Gestión de Citas (Lifecycle):**
    - Creación de nuevas citas con selección de cliente, barbero, servicio, fecha y hora.
    - Edición y reprogramación (Drag & Drop en Kanban y Calendario).
    - Cancelación de citas con actualización inmediata de disponibilidad.
    - Confirmación de citas (Cambio de estado a "Confirmado").
    - Finalización de citas (Registro de salida y cierre de servicio).
- **Cálculo de Disponibilidad:** Algoritmo que sugiere horarios libres basados en la jornada laboral del barbero y citas existentes.
- **Bloqueos de Horario:** Funcionalidad para inhabilitar rangos horarios específicos (recesos, capacitaciones, imprevistos).
- **Agenda Móvil Optimizada:** Interfaz simplificada tipo lista y tarjetas para uso rápido desde smartphones.
- **Tablero Kanban:** Visualización de citas por estados (Pendiente, Confirmado, Completado) para un seguimiento visual del flujo diario.

## 2. Gestión de Clientes
Base de datos centralizada para fidelizar y conocer a los usuarios.

- **Directorio de Clientes:** Listado completo con búsqueda inteligente.
- **Fichas de Cliente:** Historial detallado de servicios anteriores, preferencias y datos de contacto.
- **Registro Rápido:** Creación de nuevos perfiles de clientes durante el proceso de agendamiento.
- **Seguimiento de Actividad:** Identificación de clientes frecuentes y tendencias de consumo.

## 3. Panel de Control y Estadísticas (Business Intelligence)
Herramientas analíticas para la toma de decisiones basadas en datos.

- **Resumen Ejecutivo (KPIs):** Visualización de métricas clave como ingresos totales, cantidad de citas y ticket promedio.
- **Gráficas de Rendimiento:**
    - Tendencias de negocio (Ingresos por periodo).
    - Comparativa entre sucursales o periodos de tiempo.
    - Servicios más populares (Gráfica de torta/barras).
- **Ranking de Barberos:** Análisis de productividad por profesional (cantidad de servicios, ingresos generados).
- **Embudos de Conversión (Funnel):** Visualización del proceso desde el agendamiento hasta la finalización.
- **Mapas de Calor (Heatmaps):** Identificación de los días y horarios con mayor demanda.
- **Exportación de Reportes:** Generación de informes estadísticos detallados.

## 4. Comunicación e Integración con WhatsApp
Integración nativa para mejorar la comunicación con el cliente.

- **Chat en Tiempo Real:** Interfaz de chat integrada para hablar con clientes directamente desde el sistema.
- **Notificaciones Automáticas:**
    - Recordatorios de citas.
    - Confirmaciones de agendamiento.
    - Mensajes de agradecimiento o seguimiento.
- **Filtrado por Sucursal:** Los chats se organizan según la sucursal correspondiente para evitar confusiones.

## 5. Gestión de Finanzas (Módulo de Caja)
Control estricto del flujo de efectivo y contabilidad diaria.

- **Registro de Movimientos:** Entrada y salida de dinero (ingresos por servicios, gastos operativos).
- **Cierre de Caja Diario:** Conciliación de ingresos al final de la jornada.
- **Historial de Transacciones:** Auditoría completa de todos los movimientos financieros.
- **Dashboard Financiero:** Resumen de rentabilidad y flujo de caja en tiempo real.

## 6. Configuración de Barbería y Personal
Administración de la infraestructura y el equipo humano.

- **Gestión de Sucursales:** Configuración de múltiples sedes, horarios de atención y datos de contacto.
- **Gestión de Barberos:**
    - Perfiles individuales con foto y descripción.
    - Definición de horarios laborales personalizados.
    - Asignación de niveles de permiso (Administrador vs. Barbero).
- **Catálogo de Servicios:** Definición de servicios ofrecidos, precios y duración estimada de cada uno.

## 7. Onboarding y Configuración Inicial
Proceso guiado para nuevos usuarios del sistema.

- **Configuración Inicial:** Asistente paso a paso para dar de alta la barbería, sucursales, servicios y barberos por primera vez.
- **Personalización de Perfil:** Ajustes estéticos y de información comercial.

## 8. Experiencia de Usuario y Tecnología
Características transversales que mejoran la interacción.

- **Diseño Responsive:** Adaptabilidad total a computadoras, tablets y teléfonos móviles.
- **Gestos Táctiles (Mobile First):** Soporte para deslizamiento (swipe), menús contextuales y "pull-to-refresh".
- **Modo Offline/Reconexión:** Indicadores de estado de conexión y manejo de caché para evitar pérdida de datos.
- **Seguridad:** Protección de rutas y datos sensible mediante autenticación robusta y roles de usuario.
- **Diagnóstico del Sistema:** Paneles de auditoría internos para verificar el estado de la base de datos y la sesión del usuario.
