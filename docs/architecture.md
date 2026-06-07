# JB-SQUAD ELITE: Manual de Arquitectura Técnica y Flujos Operativos

Este documento constituye la **Fuente de Verdad** técnica del proyecto. Describe la infraestructura, la lógica de negocio profunda y la arquitectura modular (refactorizada a gran escala en la versión 66.0+) que permite que JB-SQUAD funcione como una plataforma de élite para la gestión de Clubes Pro.

---

## 1. Resumen Ejecutivo & Visión Tecnológica

JB-SQUAD es una **SPA (Single Page Application)** construida bajo el paradigma de "Plataforma como Servicio" (PaaS) utilizando **Supabase** como backend relacional y de autenticación.

Para garantizar una carga instantánea, animaciones a 60fps y un control total sobre el DOM sin la sobrecarga de dependencias de terceros, el proyecto **no utiliza frameworks pesados** (como React o Vue). Está construido íntegramente en **JavaScript ES6+ Vanilla**, HTML5 semántico y CSS3 moderno.

### Pilares del Sistema:
1.  **Estado Único Global (`window.state`)**: Actúa como la única fuente de la verdad en el frontend. Cada módulo lee y muta este estado centralizado.
2.  **Sincronización Reactiva**: Las mutaciones en la interfaz se persisten de forma asíncrona en Supabase y disparan renderizados selectivos de componentes de la UI.
3.  **Arquitectura Modular IIFE (Introducida en v66.0)**: El código JavaScript está rigurosamente fragmentado por áreas de negocio en múltiples archivos independientes.
4.  **Diseño Mobile-First Premium (Glassmorphism & Bento Grids)**: Interfaces construidas pensando primero en el smartphone, con un sistema CSS segmentado y diseñado para generar una experiencia estética "Elite".

---

## 2. Arquitectura Frontend: Secuencia de Arranque y Módulos JS

El sistema fue refactorizado para abandonar un enfoque monolítico (`app.js`) y pasar a un ecosistema distribuido. El flujo de inicialización (Boot Sequence) en `index.html` es estricto y garantiza que las dependencias se carguen en orden.

### 2.1 Boot Sequence (Orden de Carga en `index.html`)

1.  **Bibliotecas Externas**: Supabase (Backend API) y html2canvas (Motor de gráficos).
2.  **Cimientos del Sistema**:
    - `js/config.js`: Constantes globales, formaciones tácticas permitidas, URL de escudos por defecto (`neutralCrest`).
    - `js/state.js`: Declaración del objeto `window.state` y estructuras de datos base.
    - `js/utils.js`: Funciones transversales (`escapeHTML`, `getPlayerNameById`, lógica de avatares).
3.  **Núcleo de Datos**:
    - `js/auth.js`: Lógica de autenticación, recuperación de sesión y ruteo inicial.
    - `js/data.js`: Lógica de interacción con Supabase (Fetch y Update de tablas).
4.  **Lógica Global del DOM**:
    - `core_logic.js`: Captura referencias estáticas del DOM y prepara contenedores globales.
5.  **Módulos de Dominio (Business Logic)**:
    (Ver sección 2.2 para el detalle de cada archivo. Se cargan individualmente y exponen su API a `window`).
6.  **Ignición Final**:
    - Al final del ciclo de carga, el módulo de autenticación dispara la resolución de la sesión que desencadena el primer renderizado de la UI a través del módulo de navegación.

### 2.2 Ecosistema de Módulos Funcionales (Patrón IIFE)

Cada sección de la aplicación es un *Immediately Invoked Function Expression* (IIFE). Este patrón protege el scope global de variables temporales, pero expone funciones críticas (getters/setters y renderers) mediante `window.*` para lograr intercomunicación.

*   `js/modules/navigation.js`: Orquestador de vistas (`switchView`). Controla el enrutamiento y aplica de forma estricta los permisos de rol en el DOM (RBAC).
*   `js/modules/dashboard.js`: Inyección y filtrado de widgets del Dashboard principal y métricas rápidas.
*   `js/modules/plantilla.js`: Renderizado de la tabla de plantilla, motor de ordenación algorítmica y visor de tarjetas FUT.
*   `js/modules/tacticas.js`: El motor gráfico del terreno de juego (`renderPitch`), sistema *Drag and Drop* y gestión del banquillo (Roster Panel).
*   `js/modules/jornadas.js`: Panel de control de partidos en directo (Scorebug, eventos, MVP) y lógica de encapsulación de resultados (Getters/Setters de `currentMatch`).
*   `js/modules/convocatorias.js`: Motor interactivo de votación, algoritmo de despliegue inteligente del banquillo y banner global de disponibilidad.
*   `js/modules/equipo.js`: Consola de administración general, validación de invitaciones y gestión de roles de miembros.
*   `js/modules/calendario.js`: Orquestación temporal y cronológica para las vistas que requieren historial fechado.
*   `js/modules/matchday.js`: Lógica de generación de carteles de partido para exportación a redes sociales.
*   `js/modules/rivales.js`: Hub analítico. Procesa en memoria (sin consultas extra) el historial de H2H global y renderiza la tabla analítica.
*   `js/modules/perfil.js`: Hub personal del usuario y portal de ignición (ejecuta el `init()` maestro tras el parseo del DOM).
*   `js/modules/master.js`: Consola oculta global para usuarios con flag `is_admin`.

---

## 3. Arquitectura de Diseño (CSS Framework Propietario)

Al igual que JavaScript, el CSS se ha refactorizado en un framework propietario fragmentado (17 archivos) orquestado por `style.css` usando directivas `@import`. La regla de oro es el **Mobile-First** con expansiones controladas para Desktop.

### 3.1 Estructura del Árbol CSS
1.  **`css/base.css`**: Reseteo del navegador, declaraciones en `:root` (colores de branding corporativo `#f0a500`, sombras, radios) y tipografías (Inter, Outfit).
2.  **`css/components/*.css`**: Módulos agnósticos y reutilizables.
    - `modals.css`: Sistemas de overlays, z-index altos y popups.
    - `cards.css`: Todo lo relativo a tarjetas visuales (FUT Cards con soporte de giros 3D y hologramas).
    - `buttons.css`: Botoneras de élite, gradientes e interacciones táctiles (hover/active).
    - `forms.css`: Inputs, selectores, radio buttons personalizados.
    - `feedback.css`: Spinners de carga (Loading Ring) y Toasts de notificación.
3.  **`css/views/*.css`**: Archivos de alcance específico. El CSS aquí definido aplica de manera exclusiva al contenedor `#view-nombre`. (Ej: `tacticas.css` controla el Layout Split, `dashboard.css` controla el Bento Grid).
4.  **`css/layout/*.css`**: (Se carga al final para garantizar autoridad en Layouts estructurales).
    - `navigation.css`: La Sidebar / Bottom Bar responsiva.
    - `grid.css`: Reglas maestras para la mutación del entorno de una columna (Móvil) a rejillas avanzadas (Desktop).

---

## 4. Control de Accesos y Seguridad (RBAC)

JB-SQUAD implementa Control de Acceso Basado en Roles de manera bidireccional (Backend en Supabase mediante RLS, Frontend mediante `navigation.js`).

### Jerarquía de Permisos
1.  **Jugador**: Capa base. Puede ver toda la información pública del club (Clasificación, Tácticas, Miembros), emitir votos de disponibilidad y editar **únicamente su propia ficha técnica**. No puede arrancar partidos ni mutar alineaciones.
2.  **Capitán**: Nivel táctico. Adquiere los permisos para **modificar la pizarra táctica**, invocar el generador de convocatorias y dar el inicio oficial a los partidos (Live Match).
3.  **Manager**: Acceso absoluto al club. Gestiona membresías, roles, expulsa jugadores, recalcula estadísticas globales del equipo y aprueba nuevas solicitudes de acceso.
4.  **Master Admin** (Flag `is_admin` en tabla `profiles`): Rol supranacional. Accede al "Panel Master", desde donde puede crear Ligas globales, añadir Equipos a la base de datos centralizada de escudos oficiales, generar códigos de invitación cerrados y visualizar logs de conexión de toda la plataforma.

**Prevención en el DOM:** `applyRolePermissions()` es llamado obligatoriamente cada vez que un usuario cambia de vista. Busca el atributo `data-role-required` en los elementos y los oculta vía `style.display = 'none'` si la membresía de `window.state` no alcanza el nivel exigido.

---

## 5. El Motor Deportivo & Flujos Críticos

La plataforma simula el ciclo de vida real de un club de eSports mediante varios subsistemas entrelazados.

### 5.1 Flujo Operativo: Día de Partido
1.  **Convocatoria (`convocatorias.js`)**: El Capitán/Manager abre una encuesta. Los jugadores votan. (Se incluye el sistema *Always Available* que autovota a los jugadores comprometidos).
2.  **Pizarra y Táctica (`tacticas.js`)**: El sistema lee los votos afirmativos y pobla el Banquillo (Roster Panel). Los managers arrastran (*drag&drop*) jugadores al campo para configurar la alineación.
3.  **El Live Match (`jornadas.js`)**: El partido arranca. Se inicializa una "caja de arena" (`currentMatch`) en memoria.
4.  **Eventos G/A**: Durante el partido, los goles y asistencias se ligan a jugadores concretos en arrays temporales de eventos.
5.  **Cierre de Jornada**: Al pitar el final, el partido (resultado, rival, condición local/visitante, alineación fotográfica y matriz de eventos) se comprime en JSON y se inyecta en el array `matches` de la tabla `sessions`. Posteriormente, un bucle procesa los eventos G/A e impacta directamente las variables físicas individuales en la tabla `players`.

### 5.2 Manejo de Localía y Normalización de Marcadores
El sistema distingue permanentemente entre el club del usuario y el rival externo:
- En Base de Datos: `scoreHome` **siempre** corresponde a los goles a favor del club JB-SQUAD. `scoreAway` **siempre** corresponde al rival.
- En UI: Si la condición del partido fue `visitor`, el motor de renderizado (`jornadas.js` y `rivales.js`) invierte visualmente los nombres y escudos en el Scorebug para emular la transmisión televisiva correcta, preservando la integridad pura en backend.

### 5.3 Agregación en Memoria (Túnel H2H)
El módulo `rivales.js` escanea el array crudo de todos los partidos jugados en la sesión histórica y, en milisegundos, los agrupa por `rival.toUpperCase()`, calculando Victorias, Empates, Derrotas y % de rentabilidad en el cliente. Esto elimina la necesidad de procedimientos almacenados (RPC) costosos en el servidor.

---

## 6. Modelo de Datos y Persistencia (Supabase)

La base de datos PostgreSQL está desnormalizada de forma inteligente para favorecer la lectura instantánea desde el cliente y empaquetar grandes grafos de datos (como el historial de un mes) en un solo Request HTTP.

### Entidades Principales:
*   **`profiles`**: Identidad Auth, avatar, Alias, id de cuenta vinculada.
*   **`teams`**: Identidad del club, ajustes de redes sociales (X, Twitch), escudo (SVG o Upload), ID de acceso privado.
*   **`memberships`**: El puente vincular (Relación N:N). Conecta Profile con Team y establece el `role`.
*   **`players`**: El perfil de juego físico. Contiene el dorsal, posición principal, secundarias, un JSON `stats` (que divide el rendimiento entre `official` y `friendly`), y el array serializado de apariciones.
*   **`sessions`**: Agrupación temporal (ej: "Mayo 2026"). Contiene un array gigante JSONB `matches` que alberga todo el historial, alineaciones fotográficas e incidencias de un mes completo.
*   **Hub Global (`global_leagues`, `global_teams`)**: Almacén estático y de solo lectura de logotipos (VPG, VPN, FCP) administrado por el Master Admin para nutrir a la aplicación de assets premium estandarizados.

---
*Fin del Documento Técnico.*
