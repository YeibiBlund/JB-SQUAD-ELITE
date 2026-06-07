# Plan de Remodelación Arquitectónica: JB-SQUAD ELITE 🚀

Este documento detalla el plan de remodelación y refactorización a gran escala para **JB-SQUAD ELITE**. El objetivo es limpiar la arquitectura actual, eliminar el código espagueti y separar los archivos monolíticos en un sistema modular y escalable de alto rendimiento **sin romper ninguna funcionalidad existente y garantizando la total integridad del sistema de roles**.

---

## 📋 PANEL DE SEGUIMIENTO (ROADMAP CHECKLIST)

> [!IMPORTANT]
> **REGLA DE ORO ACTIVADA:** No se realizará ningún Git Push a producción hasta completar y verificar el 100% de la refactorización para evitar interrupciones de servicio.

*   [x] **Fase 0: Copia de Seguridad Local** *(Completado por el usuario)*
*   [x] **Fase 1: Limpieza de Archivos Huérfanos** *(Completado)*
*   [x] **Fase 2: Consolidación de Configuración Base & Utilidades** *(Completado)*
*   [x] **Fase 3: Modularización de CSS (Importación jerárquica ordenada)** *(Completado)*
*   [x] **Fase 4: Extracción de Módulos IIFE Funcionales** *(Completado)*
    *   [x] `navigation.js` (Estructura de roles RBAC central)
    *   [x] `calendario.js` (Los tres calendarios de UI)
    *   [x] `plantilla.js` (Jugadores, FUT Cards y ordenación)
    *   [x] `perfil.js` (Edición de fichas y fotos)
    *   [x] `dashboard.js` (Widgets de home y filtros)
    *   [x] `tacticas.js` (Pizarra de juego responsiva)
    *   [x] `jornadas.js` (Partidos, FAB y Getters/Setters)
    *   [x] `convocatorias.js` (Check-in y banner dinámico)
    *   [x] `equipo.js` (Ajustes de club y membresías)
    *   [x] `matchday.js` (Generador de carteles de difusión)
    *   [x] `rivales.js` (Agregación e historial H2H)
*   [x] **Fase 5: Conexión Final de scripts y limpieza en `index.html`** *(Completado)*
*   [ ] **Fase 6: Suite Completa de Verificación de Funcionalidades & Roles** *(Pendiente)*

---


## 1. Análisis del Estado Actual 🔍

Actualmente, el proyecto se encuentra en un estado funcional óptimo pero arquitectónicamente frágil:
- **`app.js` (429.7 KB, 8,651 líneas):** Un archivo monolítico gigante que contiene la lógica de todas las vistas. Todo el código vive dentro de un **único closure `DOMContentLoaded`** (línea 4 a 8650).
- **`index.html` (159.2 KB, 1,975 líneas):** Contiene la estructura de todas las vistas de la app, estilos CSS embebidos en múltiples bloques `<style>`, y estructuras repetitivas.
- **`style.css` (187.7 KB):** Archivo de estilo gigante sin modularizar.
- **Archivos Huérfanos/Temporales:** Existen múltiples archivos en la raíz del proyecto (`calibration_probe.html`, `session_recovery.tmp`, `restore.css`, `temp_styles.css`, scripts `.sql` descolocados) que ensucian el workspace.

---

## ⚠️ 2. HALLAZGOS CRÍTICOS Y AJUSTES DE DISEÑO ⚠️

La revisión profunda de la arquitectura revela riesgos estructurales y de flujos de datos. Estas soluciones deben aplicarse de forma estricta para garantizar una migración exitosa:

### 2.1 El Gran Closure y Gestión de Variables
Todo el código de `app.js` está envuelto en `DOMContentLoaded`. Al extraer los módulos a archivos independientes (`IIFEs`), las variables declaradas con `const`/`let` al inicio de `app.js` perderán visibilidad.
*   **Solución (Getter/Setter):** Las variables mutables críticas compartidas entre módulos se encapsularán mediante funciones de acceso en `window` para evitar colisiones y proteger el estado.

### 2.2 Validación Total del Control de Accesos por Rol (RBAC)
Se confirma la total preservación del sistema de permisos diferenciales (Jugador / Mánager / Master Admin):
*   **Membresía del Club (`state.user.role`):** Controla el acceso a nivel de equipo. Los roles de `manager` (acceso a todos los paneles, solicitudes y ajustes), `capitan` (acceso a votaciones y convocatorias) y `jugador` (rol de consulta y autogestión de ficha) son leídos de `window.state` de manera persistente.
*   **Administrador de la Plataforma (`state.user.profile.is_admin`):** Concede acceso exclusivo al panel de control global de ligas e invitaciones (`view-admin`).
*   **Orquestación en `navigation.js`:** La función `switchView()` y `applyRolePermissions()` serán trasladadas a `navigation.js`, manteniendo los selectores `[data-role-required]` y aplicando bloqueos lógicos duros en el cambio de vistas para evitar la navegación no autorizada.

### 2.3 Gotcha de DOM Dinámico vs Estático
*   **El Riesgo:** Intentar obtener referencias a elementos dinámicos (inyectados mediante `innerHTML` después de llamadas a Supabase) durante el inicializador `_init*Module()` resultará en valores `null` y fallos de ejecución.
*   **Solución:** Los inicializadores solo capturarán elementos estáticos de `index.html`. Para elementos creados en tiempo de ejecución, se usará **Delegación de Eventos** sobre sus contenedores padres estáticos (ej. `events-container`, `modal-player-list`).

### 2.4 Composición de UI limpia para el Dashboard
*   **El Riesgo:** La redefinición (monkey-patching) de `renderHomeDashboard` para inyectar el banner de convocatorias introduce fragilidad y dificulta la depuración.
*   **Solución:** `dashboard.js` llamará de forma explícita y segura a `window.renderAvailabilityBanner()` tras renderizar sus widgets principales, logrando una arquitectura más limpia y sin efectos secundarios.

### 2.5 Gotcha de Orden de CSS
*   **El Riesgo:** Las variables de tema y resets en CSS son sensibles al orden de carga.
*   **Solución:** Mantener `style.css` en la raíz de la aplicación como el único punto de entrada en `index.html`, encargándose de importar de manera ordenada y secuencial los sub-archivos modulares usando `@import`.

---

## 3. Nueva Propuesta de Arquitectura Modular 🏗️

### 3.1 Estructura de Carpetas

```
JB-SQUAD/
├── index.html                  # Punto de entrada optimizado (sin estilos inline)
├── style.css                   # Hoja de estilos principal (importa sub-archivos)
├── css/                        # Estilos modulares
│   ├── base.css                # Variables, fuentes, resets y root tokens (CARGAR PRIMERO)
│   ├── components/
│   │   ├── cards.css           # Cartas FUT y tarjetas
│   │   ├── modals.css          # Ventanas flotantes y overlays
│   │   └── toast.css           # Notificaciones premium
│   └── views/
│       ├── dashboard.css
│       ├── tactics.css
│       └── matchday.css
├── js/
│   ├── config.js               # Constantes y formaciones (Existente, AMPLIADO con neutralCrest)
│   ├── state.js                # Estado global y Supabase (Existente)
│   ├── utils.js                # Utilidades compartidas (Existente)
│   ├── auth.js                 # Login/registro (Existente)
│   ├── data.js                 # Queries Supabase (Existente)
│   ├── modules/                # Módulos extraídos de app.js
│   │   ├── navigation.js       # switchView, setupNavigation, applyRolePermissions (Enfoque RBAC)
│   │   ├── dashboard.js        # Dashboard home, rankings y filtros (Composición limpia de banners)
│   │   ├── plantilla.js        # Tabla de plantilla, ordenación, álbum de cartas
│   │   ├── perfil.js           # Perfil de jugador, formulario de ficha, preview
│   │   ├── tacticas.js         # Pizarra, drag-and-drop, roster panel, exportación (window.renderPitch)
│   │   ├── jornadas.js         # Partidos en vivo, goles, MVP, FAB interactivo (Getters/Setters)
│   │   ├── convocatorias.js    # Votaciones, alineación inteligente, WhatsApp, banner de disponibilidad
│   │   ├── equipo.js           # Miembros, solicitudes, ajustes, admin de ligas, asistencia
│   │   ├── calendario.js       # Los tres calendarios (asistencia, jornadas, convocatorias)
│   │   ├── matchday.js         # Creador de carteles HD
│   │   └── rivales.js          # Historial de rivales, H2H, tabla de enfrentamientos
│   └── app.js                  # Orquestador ligero (~200 líneas máx)
├── db/
│   └── migrations/             # Scripts SQL organizados
└── img/
```

### 3.2 Patrón de Módulo Estándar

Cada módulo seguirá esta plantilla encapsulada de diseño:

```javascript
// js/modules/jornadas.js
(function() {
    'use strict';

    // 1. VARIABLES PRIVADAS Y ESTADOS INTERNOS
    let currentMatch = null;
    let selectedGoalScorerId = null;
    let selectedAssistantId = null;
    let selectedGoalSide = 'home';
    let pendingScorerId = null;

    // 2. REFERENCIAS DOM ESTÁTICAS (Se inicializan en _init)
    let scoreHomeDisplay, scoreAwayDisplay, btnAddGoalHome;

    // 3. GETTERS Y SETTERS PÚBLICOS PARA SCOPES COMPARTIDOS
    window.getCurrentMatch = () => currentMatch;
    window.setCurrentMatch = (val) => { currentMatch = val; };

    // 4. FUNCIONES DEL MÓDULO
    function updateLiveMatchUI() { /* ... */ }
    window.startLiveMatch = function(rival, type, rivalCrest, matchCondition) { /* ... */ };

    // 5. INICIALIZADOR DE EVENTOS Y BINDINGS DE DOM
    window._initJornadasModule = function() {
        scoreHomeDisplay = document.getElementById('score-home');
        scoreAwayDisplay = document.getElementById('score-away');
        btnAddGoalHome = document.getElementById('btn-add-goal-home');
        
        // Delegación de eventos para elementos dinámicos
        const eventsContainer = document.getElementById('events-container');
        if (eventsContainer) {
            eventsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-remove-event')) {
                    const idx = e.target.dataset.index;
                    window.removeMatchEvent(idx);
                }
            });
        }
    };
})();
```

### 3.3 Manejo de Variables Compartidas Entre Módulos

| Variable/Función | Estrategia Definitiva |
|---|---|
| `state`, `supabase` | Ya son globales en `window`. Sin cambios. |
| `escapeHTML()`, `getPlayerNameById()`, `getPlayerTransform()`, `getPositionColorClass()` | Definidas en `js/utils.js` y expuestas en `window`. |
| `neutralCrest` | Movida a `js/config.js` expuesta globalmente. |
| `renderPitch()` | Definida en `tacticas.js`, expuesta como `window.renderPitch()`. |
| `switchView()`, `applyRolePermissions()` | Definida en `navigation.js`, expuesta como `window.*`. Enfoque de seguridad por roles. |
| `currentMatch` | Privada en `jornadas.js`. Acceso por `window.getCurrentMatch()` / `window.setCurrentMatch()`. |

---

## 4. Plan de Acción Paso a Paso 🛠Lineal

### Fase 0: Backup de Seguridad (OBLIGATORIO) 🔐
1. Crear una copia completa del proyecto en `JB-SQUAD-BACKUP-PRE-REFACTOR/`.
2. Verificar que la app funciona perfectamente ANTES de empezar.

### Fase 1: Limpieza del Workspace 🧹
1. Mover `database_delete_policy.sql` y `update_sessions_table.sql` a `db/migrations/`.
2. Mover archivos temporales y huérfanos (`calibration_probe.html`, `session_recovery.tmp`, `temp_styles.css`, `restore.css`, `matchday_poster_new.css`) a `docs/archive/`.

### Fase 2: Configuración Base y Utilidades 🔧
1. Mover `neutralCrest` a `js/config.js`.
2. Consolidar utilidades globales (`escapeHTML`, `getPlayerNameById`, `getPlayerTransform`, `getPositionColorClass`) asegurando que estén presentes en `js/utils.js` y no duplicadas en ningún otro script.

### Fase 3: Modularización Estética (CSS) 🎨
1. Extraer estilos de `index.html` a sus correspondientes archivos en `css/components/` y `css/views/`.
2. Reorganizar `style.css` usando `@import` de forma secuencial iniciando con `css/base.css`.

### Fase 4: Extracción de Módulos Funcionales (Uno a Uno) 🧩
**Regla de Oro:** Extraer un módulo, ejecutar la suite de verificación del rol correspondiente y, solo si no hay regresiones, proceder con el siguiente.

1.  **`navigation.js`**: Implementa `switchView`, `setupNavigation`, y el control duro de roles (`applyRolePermissions`).
2.  **`calendario.js`**: Implementa la lógica para los tres calendarios.
3.  **`plantilla.js`**: Extrae la tabla de jugadores y generación de cartas FUT.
4.  **`perfil.js`**: Gestión de perfiles, avatares, carga de fotos y validación de formularios.
5.  **`dashboard.js`**: rankings, filtros oficiales/amistosos y enlace directo a los banners de convocatorias.
6.  **`tacticas.js`**: Pizarra interactiva y sistema de exportaciones. Expone `window.renderPitch`.
7.  **`jornadas.js`**: Motor de partidos en vivo. Implementa Getters/Setters para `currentMatch`.
8.  **`convocatorias.js`**: Votaciones, alineación inteligente, compartir WA y banner dinámico.
9.  **`equipo.js`**: Pestañas de administración del club y asignación/edición de membresías y roles.
10. **`matchday.js`**: Generador de carteles promocionales.
11. **`rivales.js`**: H2H e historial comparativo.

### Fase 5: Reducción e Integración Final 📄
1. Limpiar todos los tags `<style>` antiguos de `index.html`.
2. Cargar en `index.html` los archivos en el orden jerárquico correcto, manteniendo a `app.js` como el orquestador final encargado de llamar secuencialmente a los inicializadores `window._init*Module()`.

---

## 5. Plan de Verificación de Roles y Seguridad (RBAC) 🔒

Para certificar que el sistema de roles no sufre regresiones, se debe validar:

| Rol Testeado | Flujo a Probar | Resultado Esperado |
|---|---|---|
| **Manager** | Solicitudes, ajustes de equipo, recalcular stats, editar rangos | Acceso total y visibilidad completa del menú "Mi Equipo". |
| **Capitán** | Panel de tácticas, iniciar jornada, programar convocatorias | Modificación táctica habilitada; menú "Mi Equipo" oculto. |
| **Jugador** | Autogestión de ficha, álbum de cartas, votaciones | Solo puede editar su propio perfil; no puede iniciar jornadas ni alterar tácticas de la pizarra. |
| **Master Admin** | Panel de administración global (`view-admin`) | Botón "Panel Master" visible en perfil; acceso a creación de ligas y códigos. |
| **Sin Club** | Dashboard e Inicio de sesión | Solo visibilidad en "Dashboard" y "Mi Perfil". El resto del menú está bloqueado y oculto hasta ser aceptado. |
