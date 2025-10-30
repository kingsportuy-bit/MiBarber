🔍 ANÁLISIS ARQUITECTÓNICO COMPLETO DEL PROYECTO

OBJETIVO:
Realizar auditoría técnica completa del codebase y generar documentación profesional.

═══════════════════════════════════════════════════════════════════

📊 ARCHIVO 1: docs/SYSTEM_MAP.md

Generar documentación completa con estas secciones:

## 1. RESUMEN EJECUTIVO
- Total de archivos TypeScript/JavaScript
- Total de páginas/rutas
- Total de componentes
- Total de hooks personalizados
- Total de líneas de código (aproximado)
- Stack tecnológico detectado (frameworks, librerías principales)

## 2. ARQUITECTURA DE CARPETAS
- Estructura completa del proyecto (árbol de directorios)
- Convenciones de organización detectadas
- Patrones de arquitectura identificados (features, pages, etc)

## 3. PÁGINAS Y RUTAS
Para CADA página encontrada documentar:

| Campo | Descripción |
|-------|-------------|
| Ruta | URL de la página |
| Archivo | Path completo del archivo |
| Propósito | Qué hace la página (inferir del código) |
| Componentes Hijos | Lista de componentes que renderiza |
| Hooks Usados | Lista de hooks y su propósito |
| Queries/Mutations | Si usa React Query: keys y métodos |
| Estado Local | Variables useState/useReducer |
| Context Usado | Contexts que consume |
| Props Recibidas | Si es componente: props que acepta |
| Permisos | Si tiene guards de autenticación/autorización |

## 4. COMPONENTES COMPLETOS
Para CADA componente encontrado:

| Campo | Datos |
|-------|-------|
| Nombre | Nombre del componente |
| Ubicación | Path completo |
| Tipo | Page/Component/Layout/Modal/Form/UI |
| Props | Lista con tipos TypeScript |
| Hooks Internos | Hooks que usa dentro |
| Estado Interno | Estados locales que maneja |
| Usado En | Lista de archivos que lo importan |
| Hijos Directos | Componentes que renderiza |
| Líneas de Código | Aproximado |

## 5. HOOKS PERSONALIZADOS
Para CADA hook encontrado:

| Campo | Datos |
|-------|-------|
| Nombre | Nombre del hook |
| Ubicación | Path completo |
| Propósito | Qué hace (inferir) |
| Parámetros | Argumentos que recibe |
| Retorna | Qué devuelve |
| React Query | Keys usadas (si aplica) |
| Dependencias | Otros hooks que usa |
| Usado En | Archivos que lo importan |
| Frecuencia Uso | Cantidad de usos |

## 6. SERVICIOS Y APIs
Identificar:
- Clientes HTTP (axios, fetch wrappers)
- SDKs externos (Supabase, Firebase, etc)
- Configuraciones de API
- Endpoints definidos
- Métodos de autenticación

## 7. CONTEXTOS Y ESTADO GLOBAL
- Context Providers encontrados
- Qué estado manejan
- Dónde se proveen
- Qué componentes los consumen
- Stores (Zustand, Redux, etc) si existen

## 8. UTILIDADES Y HELPERS
Listar funciones helper en /utils o /lib:
- Nombre de función
- Propósito
- Dónde se usa
- Frecuencia de uso

## 9. TIPOS Y INTERFACES
- Interfaces TypeScript principales
- Types compartidos
- Enums
- Dónde se definen
- Dónde se usan

## 10. FLUJOS DE DATOS PRINCIPALES
Diagramar (en texto) los flujos críticos:
- Flujo de autenticación
- Flujo de creación de entidades principales
- Flujo de actualización de datos
- Flujo de navegación entre páginas

## 11. DEPENDENCIAS REACT QUERY
Si se usa React Query, listar:
- Todas las query keys encontradas
- Mutations definidas
- Configuración de staleTime/cacheTime
- Invalidaciones de cache
- Optimistic updates

## 12. DIAGRAMAS
Crear en formato texto/mermaid:
- Árbol de componentes principal
- Flujo de navegación
- Relaciones entre hooks y componentes
- Dependencias entre módulos

═══════════════════════════════════════════════════════════════════

🗑️ ARCHIVO 2: docs/DEAD_CODE_ANALYSIS.md

Generar análisis exhaustivo:

## 1. RESUMEN EJECUTIVO
- Total de archivos sin uso
- Total de componentes sin uso
- Total de funciones sin uso
- KB potenciales a eliminar
- Impacto estimado en bundle size
- Impacto en tiempo de build

## 2. ARCHIVOS COMPLETAMENTE SIN USO
Tabla con:
| Archivo | Ubicación | Tamaño | Última Modificación | Tipo | Razón | Acción |
|---------|-----------|--------|---------------------|------|-------|--------|

Categorías de razones:
- Nunca importado
- Archivo de prueba olvidado
- Versión antigua (old_, backup_, etc)
- Archivo de desarrollo temporal

## 3. CÓDIGO DENTRO DE ARCHIVOS SIN USO
Listar por archivo:
- Componentes exportados pero no importados
- Funciones exportadas sin referencias
- Hooks exportados no usados
- Variables/constantes no utilizadas
- Interfaces/types no referenciadas

## 4. IMPORTS SIN USO
Top 20 archivos con más imports sin uso:
| Archivo | Imports Sin Uso | Ejemplos | Impacto |
|---------|-----------------|----------|---------|

## 5. CÓDIGO DUPLICADO
Identificar bloques repetidos:

| Código Duplicado | Archivos Afectados | Líneas | Recomendación |
|------------------|-------------------|--------|---------------|

Para cada duplicación:
- Mostrar snippet del código
- Listar todos los archivos donde aparece
- Sugerir solución (componente/función compartida)
- Prioridad de refactor (Alta/Media/Baja)

## 6. COMPONENTES REDUNDANTES
Componentes que hacen lo mismo:
- Listar grupos de componentes similares
- Comparar funcionalidad
- Sugerir consolidación

## 7. HOOKS REDUNDANTES
Hooks con lógica duplicada:
- Identificar hooks similares
- Comparar implementaciones
- Sugerir unificación

## 8. UTILIDADES NO USADAS
Funciones en /utils o /lib sin referencias:
- Nombre
- Archivo
- Última vez modificada
- Acción (eliminar/mover a deprecated)

## 9. TIPOS/INTERFACES SIN USO
Types e interfaces declaradas pero no usadas:
- Nombre
- Ubicación
- Si es exported
- Acción recomendada

## 10. COMENTARIOS Y TODO
Buscar y listar:
- Comentarios TODO
- Comentarios FIXME
- Comentarios HACK
- Comentarios con fechas antiguas
- Código comentado (bloques grandes)

## 11. CONSOLE.LOG Y DEBUGGING
Listar:
- console.log no eliminados
- debugger statements
- Comentarios de debugging
- Variables de debug

## 12. DEPENDENCIAS NPM SIN USO
Analizar package.json:
- Paquetes instalados pero no importados en código
- Paquetes duplicados (lodash vs lodash-es)
- Versiones antiguas de librerías
- Sugerir limpieza

## 13. ESTILOS SIN USO
Si usa CSS/SCSS:
- Clases definidas pero no usadas
- Archivos de estilos no importados
- Estilos inline redundantes

## 14. ASSETS SIN REFERENCIAS
- Imágenes no usadas en código
- Íconos no referenciados
- Fonts no utilizados

## 15. PATRONES ANTI-PATTERN DETECTADOS
Identificar malas prácticas:
- Uso de any en TypeScript
- Props drilling excesivo
- Re-renders innecesarios
- Keys incorrectas en listas
- UseEffect sin dependencies
- Memoria leaks potenciales

## 16. PLAN DE LIMPIEZA PRIORIZADO

### 🔴 PRIORIDAD CRÍTICA
- Lista de archivos seguros para eliminar
- Scripts de limpieza sugeridos

### 🟡 PRIORIDAD ALTA
- Refactors mayores
- Consolidaciones importantes

### 🟢 PRIORIDAD MEDIA
- Mejoras de código
- Optimizaciones menores

### ⚪ PRIORIDAD BAJA
- Nice-to-have
- Deuda técnica menor

## 17. MÉTRICAS Y KPIs
- Deuda técnica estimada (horas)
- Complejidad ciclomática promedio
- Ratio de código sin uso
- Coverage de tipos TypeScript
- Número de any's
- Número de eslint warnings/errors

═══════════════════════════════════════════════════════════════════

📋 INSTRUCCIONES DE ANÁLISIS

1. Escanear TODOS los archivos .ts, .tsx, .js, .jsx
2. Parsear imports y exports de cada archivo
3. Construir grafo de dependencias
4. Identificar nodos sin referencias entrantes (código muerto)
5. Detectar patrones de código repetido (algoritmo de similitud)
6. Analizar complejidad de cada función/componente
7. Verificar tipos TypeScript
8. Revisar configuraciones (tsconfig, eslint, etc)
9. Analizar package.json y node_modules

═══════════════════════════════════════════════════════════════════

✅ FORMATO DE SALIDA

- Markdown profesional
- Tablas bien formateadas
- Secciones con anchor links
- Ejemplos de código con syntax highlighting
- Métricas numéricas precisas
- Recomendaciones accionables
- Enlaces internos entre documentos

═══════════════════════════════════════════════════════════════════

Genera reportes completos y detallados.
No omitas secciones aunque estén vacías (indicar "No encontrado").