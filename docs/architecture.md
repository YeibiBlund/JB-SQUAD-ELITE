# JB-SQUAD ELITE: Manual de Arquitectura Técnica Exhaustiva

Este documento describe a fondo la estructura, flujos de datos, reglas de negocio y dependencias del proyecto JB-SQUAD ELITE. Es la fuente de verdad arquitectónica del sistema y debe ser consultado antes de realizar reestructuraciones profundas.

---

## 1. Visión General del Sistema
**JB-SQUAD ELITE** es una Single Page Application (SPA) orientada a la gestión integral de un club de E-sports (FIFA/FC). Combina herramientas de **Recursos Humanos** (plantillas, altas/bajas, roles), **Logística** (convocatorias y asistencia) y **Análisis Deportivo** (tácticas interactivas, registro de partidos en vivo y estadísticas matemáticas).

### Stack Tecnológico Principal
- **Frontend**: HTML5 Semántico, CSS3 Vanilla (con un riguroso sistema de variables CSS), JavaScript ES6+ Vanilla (Sin frameworks).
- **Backend / BaaS**: Supabase (PostgreSQL para datos relacionales, Auth para identidades, Storage para media).
- **Despliegue**: CI/CD (GitHub -> Netlify).

---

## 2. Mapa de Módulos (Directorio de Archivos)

El proyecto sigue una arquitectura modular en JavaScript, aunque fuertemente ligada al DOM global en `app.js`.

### 2.1. Núcleo UI y Estilos
- **`index.html`**: SPA Root. Contiene todos los "paneles" ocultos/visibles mediante CSS (`display: none` / `block`). Implementa la barra de navegación inferior (`bottom-nav`).
- **`style.css`**: Design System. Define tokens globales (colores, fuentes, espaciados). Contiene utilidades clave (`.card-elite`, `.btn-gold`, `.gradient-text`) y media queries orientadas a **Mobile-First**.

### 2.2. Lógica de Negocio (`/js/`)
- **`state.js`**: Define `window.state`. El "store" global en memoria.
- **`config.js`**: Diccionarios estáticos. Coordina formaciones (4-3-3, 4-2-3-1), cordenadas X/Y del campo virtual, avatares SVG predefinidos y posiciones de juego.
- **`auth.js`**: Capa de seguridad. Gestiona tokens JWT de Supabase, login, registro y redirecciones.
- **`data.js`**: **Capa DAO (Data Access Object).** Actúa como middleware entre la App y Supabase. Toda operación CRUD pasa por aquí. Contiene lógica pesada como `recalculateAllStats()`.
- **`utils.js`**: Helpers puros (`escapeHTML`, `generateId`) y UI Globals (`window.jbToast`, `window.jbConfirm`, `window.jbLoading`).
- **`app.js`**: **El Orquestador (Controller).** Archivo masivo (~4500 líneas) que maneja:
  - Inicialización (`init()`, `setupEventListeners()`).
  - Navegación (`switchView()`).
  - Renderizadores (`renderHomeDashboard`, `renderPitch`, `renderMembersList`).
  - Lógica de Match en Vivo (`startLiveMatch`, `finalizeMatch`).

---

## 3. Modelo de Datos Exhaustivo (Supabase Schema)

La base de datos PostgreSQL en Supabase está estructurada para permitir multi-tenancy (múltiples equipos), aunque el flujo actual asume un equipo primario por sesión.

### Tablas Core
1. **`teams`**
   - **Propósito**: Entidad principal del club.
   - **Campos Clave**: `id` (UUID), `name`, `manager_name`, `crest_url`, `socials` (JSONB con twitter/twitch).
2. **`profiles`**
   - **Propósito**: Extensión de `auth.users` de Supabase. Datos personales.
   - **Campos Clave**: `id` (FK a auth), `full_name`, `username`, `phone`.
3. **`memberships`**
   - **Propósito**: Tabla pivote que une Usuarios (Profiles) con Equipos. Define Autorización (RBAC).
   - **Campos Clave**: `team_id`, `user_id`, `role` (enum: `manager`, `capitan`, `jugador`).

### Tablas Operativas
4. **`players`**
   - **Propósito**: La "Ficha Deportiva". Representa a un jugador en el campo.
   - **Campos Clave**: `id`, `team_id`, `user_id` (Opcional, null si es IA/Bot), `name`, `position`, `stats` (JSONB complejo).
   - **Estructura Stats**: `{"official": {"matches": 0, "goals": 0, "assists": 0, "wins": 0}, "friendly": {...}}`.
5. **`tactics`**
   - **Propósito**: Configuraciones de pizarra.
   - **Campos Clave**: `id`, `team_id`, `name`, `formation` (ej. "4-3-3"), `assignments` (JSONB: mapea `slotId` -> `playerId`), `custom_positions` (JSONB: offsets X/Y editados).
6. **`sessions`**
   - **Propósito**: Jornadas de juego.
   - **Campos Clave**: `id`, `team_id`, `date` (YYYY-MM-DD), `status` (`open`, `closed`), `matches` (Array de JSONB complejo), `mvp_id`.
   - **Estructura Match**: `{rival, type, scoreHome, scoreAway, events, rivalCrest, matchCondition}` (v55.0).
7. **`availability_polls` & `availability_votes`**
   - **Propósito**: Sistema de Convocatorias.
   - **Campos**: `polls` tiene fecha y `final_alignment` (JSONB). `votes` almacena `player_id` y `vote` (yes/no/late).

### Tablas de Datos Globales (v55.0)
8. **`global_leagues` / `global_teams`**
   - **Propósito**: Hub centralizado de información para Pro Clubs.
   - **Concepto**: Base de datos curada de ligas (VPN, VPG) y equipos con escudos verificados.
   - **Acceso**: Lectura pública para todos los managers; escritura centralizada mediante scripts SQL controlados para mantener la estética premium.

---

## 4. Estado Global (`window.state`)

El motor reactivo (manual) de la app. Si mutas `state`, debes llamar explícitamente a un renderizador.

- **`state.user`**: Contiene `auth` (datos token) y `role` (extraído de memberships).
- **`state.team`**: Fila del club actual.
- **`state.players`**: Array vital. Todas las tablas y selects buscan el jugador aquí.
- **`state.savedTactics`**: Array de tácticas cacheadas.
- **`state.activeTacticId`**: Puntero a la táctica mostrada en el Canvas (`renderPitch`).
- **`state.sessions`**: Historial completo.
- **`state.activeSession`**: Objeto de la jornada que está `status: 'open'`.
- **`currentMatch`** (Variable local en `app.js`): Controla el partido en vivo antes de ser pusheado a `state.activeSession.matches`.

---

## 5. Flujos Lógicos Críticos

### 5.1. Sistema de Control de Acceso (RBAC)
Manejado principalmente por la función `window.applyRolePermissions()` en `app.js`.
- **Managers**: Acceso total. Pueden expulsar, cambiar roles, borrar sesiones, editar stats manuales y modificar la configuración del club.
- **Capitanes**: Rango intermedio. Pueden abrir/cerrar convocatorias, iniciar/cerrar jornadas y modificar tácticas. No pueden expulsar usuarios ni borrar historiales completos.
- **Jugadores**: Solo lectura. Pueden votar en convocatorias, ver stats y editar su propio perfil físico.

### 5.2. Flujo Estadístico (El Motor de Datos)
El flujo que transforma acciones en el campo en números en el Dashboard:
1. **Live Match (v55.0)**: 
   - Se selecciona Liga y Rival desde el **Hub Global**.
   - Se define la **Localía** (`matchCondition`), lo que ajusta visualmente el marcador e invierte los roles de Home/Away en el registro si el club es visitante.
   - Se anotan Goles asignando un `scorerId` y `assistantId`.
2. **Finalize Match**: 
   - Se lee `currentMatch.events` para sumar G y A al JSON de `player.stats`.
   - **Punto Crítico**: Se lee `state.savedTactics.find(t => t.id === state.activeTacticId)`. Los jugadores asignados a esta táctica en ese instante reciben `+1 PJ` y (si el club gana el partido) `+1 Win`.
3. **Persistencia**: Se hace un bucle `savePlayerCloud()` a los modificados y se actualiza la `session` en Supabase con los metadatos extendidos del partido (incluyendo el escudo del rival).
4. **Dashboard (`renderHomeDashboard`)**: Lee el array `state.players`, itera sobre sus `stats` y ordena los arrays para pintar los Rankings.

### 5.3. Generación de Gráficos (Canvas)
Para exportar alineaciones o fichas, la app no usa librerías externas pesadas.
- Crea un `<canvas>` dinámico.
- Dibuja el fondo (`emerald_pitch.png`).
- Itera sobre `tactic.assignments`, dibuja las coordenadas `X/Y` (re-escaladas desde porcentajes), inyecta los avatares/fotos mediante promesas de carga de imagen (`Image.onload`), y usa `canvas.toDataURL()` para generar un JPG descargable.

---

## 6. Convenciones de UI/UX y Sistema de Diseño

- **Fondo General**: `#0f0f11` a `#1a1a1a` (Negros puros y grises muy oscuros).
- **Acento (Primary)**: `#f0a500` (Dorado Élite / Ámbar).
- **Tarjetas (`.card-elite`)**: Fondos translúcidos (`rgba(255,255,255,0.02)`), bordes sutiles (`rgba(240, 165, 0, 0.1)`) y desenfoque (`backdrop-filter: blur(10px)`).
- **Interacciones**: Botones redondeados, sombras dinámicas al hacer hover, y transformaciones (`scale(1.02)`) para dar sensación de "App Nativa".
- **Responsive**: `index.html` es fluido. En PC, los contenedores (`.container`) tienen `max-width: 1400px` o `800px` dependiendo de la densidad de datos.

---

## 7. Áreas Identificadas de Mejora / Deuda Técnica (Refactoring)
1. **Acoplamiento en `app.js`**: El archivo concentra UI, lógica de negocio y listeners. Debería dividirse en controladores (ej. `MatchController.js`, `RosterController.js`).
2. **Flujo de Jornadas Desconectado**: La dependencia de `activeTacticId` en el momento de pitar el final de un partido causa pérdida de datos si la táctica no fue confirmada. (Ver `futureplans.md` para la propuesta de flujo "Túnel").
3. **Consumo de API / N+1**: Múltiples secciones iteran arrays haciendo peticiones asíncronas a Supabase dentro de bucles, en lugar de usar `JOINs` relacionales en la carga inicial.

---
*Última actualización: v55.0 - 26 Abril 2026*
