# JB-SQUAD ELITE: Manual de Arquitectura Técnica

Este documento describe la estructura, flujos y reglas técnicas del proyecto JB-SQUAD ELITE. Debe ser consultado y actualizado por el agente tras cada cambio significativo.

---

## 1. Visión General
**JB-SQUAD ELITE** es una plataforma táctica y de gestión para clubes de E-sports (FIFA/FC), diseñada bajo una estética premium, oscura y moderna. Su objetivo es centralizar la gestión de la plantilla, las tácticas de juego y el seguimiento de jornadas competitivas.

---

## 2. Stack Tecnológico
- **Frontend**: HTML5, Vanilla CSS3 (Custom Properties), Vanilla JavaScript (ES6+).
- **Backend**: Supabase (PostgreSQL, Auth, Storage).
- **Despliegue**: Netlify (CI/CD vía GitHub).
- **Gráficos**: HTML5 Canvas (para exportación de alineaciones).

---

## 3. Estructura de Archivos (Mapa de Módulos)

### 3.1. Núcleo (Directorio Raíz)
- **`index.html`**: Punto de entrada único (SPA). Contiene la estructura de todas las "vistas" (`#view-dashboard`, `#view-tacticas`, etc.).
- **`style.css`**: Sistema de diseño centralizado. Define la paleta "Elite Obsidian & Electric Amber" y media queries (Mobile-First Elite).
- **`app.js`**: Controlador principal de la interfaz y lógica de negocio. Actualmente en proceso de modularización.

### 3.2. Módulos de Soporte (`/js`)
- **`js/state.js`**: Definición del objeto `window.state`. Es la única fuente de verdad para los datos en tiempo de ejecución.
- **`js/config.js`**: Constantes estáticas (Formaciones, Avatares, Posiciones, Paleta de colores).
- **`js/data.js`**: Orquestador de sincronización. Contiene todas las llamadas a Supabase (`loadTeamData`, `savePlayerCloud`, etc.).
- **`js/auth.js`**: Gestor de sesiones. Controla el login, registro y la redirección inicial post-autenticación.

---

## 4. Estado Global (`window.state`)
El objeto `state` es el cerebro de la aplicación. Estructura principal:
- `user`: Datos del usuario autenticado y su rol (`manager`, `capitan`, `jugador`).
- `team`: Información del club actual.
- `players`: Array de objetos jugador vinculados al equipo.
- `savedTactics`: Lista de tácticas guardadas.
- `activeTacticId`: ID de la táctica seleccionada actualmente.
- `sessions`: Historial de jornadas/partidos cerrados.
- `activeSession`: Datos de la jornada que se está jugando actualmente.

---

## 5. Ciclo de Vida y Sincronización
1. **Arranque**: `auth.js` verifica la sesión -> `loadTeamData()` en `data.js`.
2. **Carga**: Se descargan jugadores, tácticas y sesiones de Supabase.
3. **Setup UI**: Tras la carga, `loadTeamData` invoca las funciones de "Setup" en `app.js` (`setupEventListeners`, `setupNavigation`, etc.).
4. **Persistencia**: Cualquier cambio en la UI que requiera guardado invoca una función `Cloud` en `data.js`, la cual actualiza Supabase y, opcionalmente, refresca la UI.

---

## 6. Reglas de Diseño (UX/UI)
- **Aesthetics**: Oscuro, contrastes con Oro (`#f0a500`), cristales (glassmorphism).
- **Mobile-First Elite**: Prioridad absoluta a la experiencia móvil, pero con un layout "Ultra-Wide" para escritorio (sin límites de 1200px).
- **Cero Scroll Horizontal**: El contenido fluye verticalmente; las tácticas ocupan el 100% del viewport disponible.
- **Sin Modales Nativos**: Uso exclusivo de la UI propia (`jbToast`, `jbConfirm`, `jbLoading`).

---

## 7. Esquema de Base de Datos (Supabase)
- **`teams`**: `id, name, manager_name, crest_url`.
- **`memberships`**: Vincula usuarios con equipos y roles (`team_id, user_id, role`).
- **`players`**: Fichas de jugadores (`team_id, name, position, photo_url, stats`).
- **`tactics`**: Configuraciones de campo (`team_id, name, formation, assignments, custom_positions`).
- **`sessions`**: Registro de jornadas (`team_id, date, status, matches, mvp_id`).

---

*Última actualización: v36.0.0 - 2026-04-13*
