# Estadísticas en Barberox

## Descripción

Se ha implementado una nueva página de estadísticas con vistas diferenciadas para administradores y barberos individuales, permitiendo el seguimiento detallado del rendimiento y métricas clave del negocio.

## Características Principales

### Vista para Barbero Individual

#### Métricas de Rendimiento Personal
- **Ingresos generados**: Total facturado en período seleccionado con gráfico de línea temporal
- **Cantidad de turnos completados**: Número de servicios realizados vs. turnos agendados
- **Ticket promedio**: Ingreso promedio por cliente atendido
- **Tasa de utilización**: Porcentaje de horas disponibles vs. horas ocupadas

#### Métricas de Servicios y Clientes
- **Servicios más solicitados**: Ranking con gráfico de barras horizontal
- **Horarios pico**: Mapa de calor mostrando días y horas de mayor demanda
- **Tasa de retención de clientes**: Porcentaje de clientes que vuelven

### Vista para Administrador/Dueño

#### Métricas de Performance Financiero Global
- **Ingresos totales por sucursal**: Comparación entre sucursales
- **Ingresos por barbero**: Ranking de barberos más productivos
- **Ingresos por tipo de servicio**: Servicios que generan más facturación
- **Tendencia de ingresos**: Gráfico de línea temporal comparando períodos

#### Métricas de Ocupación y Eficiencia Operativa
- **Tasa de ocupación por sucursal**: Porcentaje de turnos disponibles vs. ocupados
- **Tasa de cancelación**: Porcentaje de turnos cancelados o no presentados
- **Turnos por día/hora**: Identificar horarios de mayor y menor demanda

#### Métricas de Performance de Barberos y Sucursales
- **Productividad por barbero**: Ingresos generados por hora trabajada
- **Comparativa entre sucursales**: Tabla con métricas clave lado a lado
- **Servicios más rentables**: Relación precio/duración
- **Distribución de clientes por barbero**: Verificar sobrecarga/subcarga

#### Métricas de Análisis de Clientes
- **Frecuencia de visitas**: Cuántas veces en promedio un cliente agenda
- **Valor de vida del cliente (CLV)**: Estimación de ingresos totales por cliente

## Tipos de Gráficos Implementados

1. **Gráficos de Línea**: Para tendencias temporales de ingresos
2. **Gráficos de Barras**: Para comparar barberos, servicios populares, sucursales
3. **Gráficos de Torta/Dona**: Para distribución porcentual
4. **Mapas de Calor**: Para visualizar horarios de mayor demanda
5. **Tablas Comparativas**: Para métricas múltiples lado a lado
6. **Indicadores KPI**: Números grandes destacados para métricas clave
7. **Gráficos de Embudo**: Para visualizar tasa de conversión

## Funcionalidades Adicionales

- **Filtros por Período**: Comparar por día, semana, mes, trimestre, año
- **Exportación de Reportes**: Generar PDFs o Excel con las estadísticas
- **Comparación de Períodos**: Mostrar porcentaje de crecimiento o decrecimiento

## Estructura Técnica

### Componentes Principales
- `AdminStatsView.tsx`: Vista para administradores
- `BarberoStatsView.tsx`: Vista para barberos individuales
- `useEstadisticas.ts`: Hook para obtener datos estadísticos
- `GraficaBarras.tsx`: Componente de gráfica de barras
- `GraficaLineas.tsx`: Componente de gráfica de líneas
- `GraficaTorta.tsx`: Componente de gráfica de torta
- `HeatmapHorarios.tsx`: Componente de mapa de calor para horarios
- `GraficaFunnel.tsx`: Componente de gráfica de embudo
- `CompararPeriodos.tsx`: Componente para comparar períodos
- `ExportarEstadisticas.tsx`: Componente para exportar datos

### Rutas
- `/estadisticas`: Página principal de estadísticas

### Navegación
- **Administradores**: "Estadísticas" en el menú de navegación
- **Barberos**: "Mis Estadísticas" en el menú de navegación

## Tecnologías Utilizadas

- React con Next.js
- TypeScript
- Tailwind CSS para estilos
- React Query para manejo de datos
- Componentes personalizados para visualización

## Personalización

La interfaz utiliza los estilos personalizados de Barberox:
- `qoder-dark-card`: Tarjetas de contenido
- `qoder-dark-input`: Campos de entrada
- `qoder-dark-button-primary`: Botones principales
- `qoder-dark-button-secondary`: Botones secundarios
- `qoder-dark-accent-*`: Colores de acento

## Consideraciones de Implementación

1. Los datos se obtienen de las tablas `mibarber_citas` y `mibarber_caja`
2. Las estadísticas se calculan en tiempo real según los filtros seleccionados
3. Se implementa carga diferida (lazy loading) para mejorar el rendimiento
4. Se manejan errores de carga y estados de carga
5. La exportación de datos funciona en formatos CSV y JSON