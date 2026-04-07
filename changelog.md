# Changelog - JB-SQUAD
<br>

## [v4.4.0] - 2026-04-07
### Añadido
- **Optimización Táctica Mobile-First Elite**:
    - **Ocultación de Dorsales**: Implementada la eliminación visual del número del jugador en el campo para dispositivos móviles mediante Media Queries avanzadas, priorizando la claridad del avatar y el nombre por encima de datos secundarios.
    - **Refinamiento de Tipografía Táctica**: Ajuste del tamaño de fuente (`0.65rem`) y banners de nombres en móvil para garantizar cero solapamientos entre slots adyacentes, siguiendo el estilo visual de FC Mobile.
    - **Jerarquía de Posiciones**: Reducción de escala y reposicionamiento de las etiquetas de posición (`.slot-pos`) en móviles para una composición más equilibrada.

### Corregido
- **Error de Renderizado de Nombres**: Se ha activado la lógica de escalado inteligente de nombres en `app.js` que estaba calculada pero no aplicada al DOM. Ahora los nombres largos se escalan y ajustan su `letter-spacing` automáticamente para mantenerse dentro de los límites de la carta.
- **Inconsistencia de Bordes**: Suavizado del grosor de borde en slots tácticos para móviles para evitar un aspecto "tosco" en pantallas pequeñas.


## [v4.3.0] - 2026-04-06
### Añadido
- **Evolución del Manual del Agente (`agents.md`)**:
    - **Mobile-First Elite**: Expandida la regla con requisitos técnicos de usabilidad táctil (44px min), jerarquía inteligente y validación estricta de viewport.
    - **Arquitectura de Diseño Divergente**: Nueva directiva para crear layouts independientes en Escritorio/Móvil mediante Media Queries avanzadas, evitando el diseño "estirado".
    - **Despliegue Continuo (Git Push)**: Implementada la obligatoriedad de realizar un push al repositorio tras cada cambio para garantizar sincronización en tiempo real.

## [v4.0.0] - 2026-04-06 (ERA DE AUTOGESTIÓN)
### Añadido
- **Modelo de Gestión Descentralizada**: Transición completa a un sistema donde los jugadores crean sus propias fichas de forma independiente.
- **Vínculo Atómico con Supabase**: Integración de `user_id` en la tabla `players`, vinculando cada ficha al `auth.uid()` del usuario real.
- **Onboarding Inteligente**: Sistema de detección de ficha inexistente que redirige automáticamente al usuario a "MI FICHA" tras unirse a un club.
- **Gestión de Manager Restringida**: El Manager ahora actúa como supervisor, perdiendo la capacidad de crear fichas ajenas pero ganando el control de expulsión real.
- **Sistema de Expulsión (Terminar Contratos)**: Lógica para desvincular un usuario del club eliminando su membresía y su ficha de forma segura.
- **UUID de Base de Datos**: Migración de IDs temporales a UUIDs nativos de Postgres para garantizar la integridad referencial.

### Corregido
- **Bug de Permisos RLS**: Implementación de políticas de seguridad en Supabase para permitir que cada usuario gestione únicamente su perfil.
- **Sincronización de Stats**: Actualizado el motor de renderizado y cálculo para soportar la nueva estructura de datos anidada en Supabase.
- **Error de Referencia Nula (Añadir +)**: Corregido el fallo al intentar modificar el botón de fichaje para jugadores sin rol.


## [v3.4.0] - 2026-04-06
### Añadido
- **Sistema de Avatares "Elite"**: Galería de 8 siluetas personalizables para cada jugador siguiendo la estética dorada de la app.
- **Rediseño FUT-Style**: Nueva arquitectura de tarjeta táctica inspirada en los cromos Pro Clubs/FUT.
    - Dorsal posicionado en la esquina superior izquierda (estilo OVR).
    - Imagen del jugador central con máscara de desvanecimiento dinámica.
    - Banner de nombre inferior optimizado con sistema de escalado inteligente.
- **Coherencia Visual Global**: Integración de avatares en la tabla de plantilla, banquillo y modales de selección.

### Corregido
- **Bug de Duplicación**: Arreglado el error que clonaba jugadores al moverlos entre posiciones en el campo. Ahora el movimiento es atómico y limpia la posición anterior.
- **Centrado de Texto**: Ajustada la alineación del nombre en las tarjetas para que sea matemáticamente perfecta tras el escalado horizontal.

## [v3.3.0] - Gestión Táctica Avanzada y Diálogos Premium
- **Orden de Posiciones Personalizado**: Implementación de un criterio lógico de ordenación para la plantilla (`POR > DFC > LD > LI...`) sustituyendo el orden alfabético genérico.
- **Sistema jbConfirm (Asíncrono)**: Erradicación total de los modales nativos del navegador (`window.confirm`). Sustituidos por un sistema de cuadros de diálogo inmersivos basados en Promesas que respetan el diseño de la App.
- **Modal de Selección Central**: La asignación de jugadores ahora se realiza mediante un modal centralizado con efecto de desenfoque de fondo y filtrado inteligente de jugadores aptos.
- **Gestión de Banquillo Real**: Los jugadores asignados al campo desaparecen del banquillo lateral para evitar duplicidades visuales.
- **Interacción Drag-to-Bench**: Soporte para arrastrar jugadores desde el terreno de juego directamente al panel del banquillo para desasignarlos.
- **Acción "Vaciar Equipo"**: Botón global en el panel táctico para devolver a todos los titulares al banquillo de forma masiva con confirmación de seguridad.

## [v3.2.0] - Tácticas Estilo Videojuego
- **Rediseño UI/UX**: Se transformó la pantalla de detalles de la táctica para ofrecer un aspecto premium imitando el "feed" de los juegos de e-sports.
- **Roster en Formato "Cards"**: Los avatares circulares se han sustituido por tarjetas completas (Player Cards), las cuales muestran claramente nombre, dorsal y posiciones, simulando un sistema de cartas.
- **Distribución de Paneles**: En resoluciones de escritorio, el banquillo de jugadores ahora reside permanente y estructuradamente en el panel izquierdo y el campo toma protagonismo a la derecha.
- **Efectos Visuales Next-Gen**: Transiciones de sombreados, estética "Glow" en colores ámbar al resaltar o interactuar, y mejoras físicas al arrastrar elementos (Drag & Drop).
## [v3.1.0] - Drag & Drop Tactics
- **Split-View Dashboard**: La zona de tácticas ahora presenta tanto la pizarra como tu plantilla en el mismo plano.
- **Roster Panel Interactivo**: Los jugadores de la pantalla aparecen como avatares circulares al lado del campo en PC o en un panel accesible en móvil.
- **Motor Drag & Drop (Arrastrar y Soltar)**: Ahora puedes diseñar tu 11 titular arrastrando a los jugadores directamente a sus posiciones de forma intuitiva.
- **Filtro de Posiciones Experto**: Al hacer clic en un slot, el banquillo se ordena automáticamente identificando quién juega en esa posición de forma principal o secundaria, atenuando a los demás.

## [v3.0.0] - 2026-04-04

### Sistema de Múltiples Tácticas
- **Gestor de Tácticas Guardadas**: Transición de una matriz de estado simple a un sistema multi-táctica. Ahora se pueden guardar un número ilimitado de tácticas de forma independiente.
- **Vista 'Mis Tácticas'**: Nueva pantalla principal al entrar en la sección de tácticas, mostrando un listado de tarjetas premium para las formaciones guardadas.
- **Creación Personalizada**: Nueva pantalla intermedia que permite asignar nombres personalizados a las tácticas (ej. "Ofensiva Total", "Champions").
- **Eliminación de Tácticas**: Opción integrada en las tarjetas para borrar las formaciones que ya no se usan.

### Mejoras Técnicas & Refactorización
- **Bug Fix Global**: Reparación integral de las "cadenas flex" en CSS y JS que bloqueaban la visibilidad general al recargar o saltar entre el menú principal y la pizarra.
- **Estructura de Datos Segura**: Implementación de `getSafeStorage()` usando `JSON.parse` envuelto en `try/catch` para recuperar el estado anterior sin provocar pantallazos blancos al cambiar modelos de datos.


## [v2.2.0] - 2026-04-04

### Sistema de Tácticas ELITE
- **Pizarra Táctica Interactiva**: Implementación de un campo de fútbol (Pitch) diseñado íntegramente con CSS en la sección de Tácticas.
- **Selector de Formación Inicial**: Al entrar por primera vez, el usuario debe elegir entre **4-4-2, 4-2-3-1, 3-5-2 o 3-4-1-2**.
- **Motor de Posicionamiento Dinámico**: Las coordenadas de los slots de los jugadores se recalculan automáticamente según la formación activa.
- **Asignación de Jugadores**: Los slots permiten abrir un selector para asignar jugadores reales de la plantilla a posiciones específicas del campo.
- **Estética FUT Style**: Slots con diseño de carta dorada (Elite Amber) y efectos visuales de "slot vacío" mediante iconos de acción.

### Mejoras Técnicas & Refactorización
- **Bug Fix**: Corregido error en el listener de navegación que bloqueaba el cambio a la vista de "Tácticas" mediante un condicional redundante.
- **Persistencia Táctica**: Guardado automático de la formación y la disposición del campo en `localStorage`.
- **Navegación de Sub-vistas**: Lógica interna para alternar entre el selector de formación y la pizarra táctica.
- **Limpieza de UI**: Corrección de errores tipográficos en CSS y optimización de la legibilidad en dispositivos móviles.

### Detalles de Diseño
- **Pitch 3D**: Uso de gradientes lineales y líneas reglamentarias mediante pseudo-elementos CSS para un acabado profesional.
- **Responsive Slots**: Ajuste de escala dinámico para asegurar que los 11 jugadores sean visibles y clickeables en pantallas pequeñas.
