# Changelog - JB-SQUAD
<br>

## [v34.0.0] - 2026-04-12
### Añadido (Historial Táctico y Convocatorias v3)
- **Persistencia Táctica en Nube**: Trackeo activo del `currentPollId` al pasar del modo "Convocatoria" al modo "Alineación". Al exportar o guardar una táctica (`exportTacticAsImage`), la app genera un snapshot de la formación y la guarda permanentemente como JSONB (`final_alignment`) en esa jornada específica dentro de la tabla `availability_polls`.
- **Motor de Historial Interactivo**: Integración del evento de click `jbViewPollDetail` sobre las jornadas archivadas en la pestaña "Convocatorias".
- **Mini-Pizarra de Archivo**: Se implementa un renderizador autónomo que dibuja formaciones históricas (`report-mini-pitch`) utilizando los datos nativos de la base de datos sin afectar a la táctica actualmente activa en el sistema.
- **Flujo Ininterrumpido**: Con esta actualización, el manager puede "Cerrar Convocatoria -> Alinear de cero -> Guardar" y disponer de un reporte táctico y de asistencias consultable de por vida.

## [v32.0.8] - 2026-04-12
### Mejorado (Navigation & UX)
- **Nueva Iconografía**: Actualizado el icono de **VOTAR** en la navegación para distinguirlo visualmente de la sección de Plantilla.
- **Optimización Mobile NavBar**: Eliminado el botón de "Salir" del navbar inferior en dispositivos móviles para reducir el ruido visual y evitar clics accidentales.
- **Reubicación de Logout**: El botón de "Cerrar Sesión" ahora reside al final de la sección **Mi Perfil**, con un diseño táctil rojo premium y aviso de versión de la app.

## [v32.0.5] - 2026-04-12
### Añadido (Voter UI Enhancement)
- **Visualización Detallada de Votos**: Sustitución de la rejilla de avatares por una lista detallada que incluye **Nombre del Jugador** y **Posición en el campo**.
- **Badges de Posición**: Integración de los colores de posición oficiales de la app (POR, DFC, MCD, etc.) en la lista de resultados.
- **Micro-interacciones**: Efectos de hover y transición lateral en las filas de jugadores para una navegación más fluida.
- **Limpieza de Layout Elite**: Eliminados estilos inline residuales y unificada la cabecera de convocatorias con el estándar de Perfiles.

## [v32.0.0] - 2026-04-12
### Añadido (Divergent Desktop Design)
- **Layout Split-View para Convocatorias**: Rediseño completo de la sección de votación para PC. Ahora utiliza un sistema de dos paneles (L-Control / R-Resultados) que aprovecha todo el ancho de la pantalla (1100px), eliminando el aspecto de tarjeta móvil estirada.
- **Historial Quad-Grid**: El historial de convocatorias pasadas en escritorio ahora se visualiza en una cuadrícula de dos columnas en lugar de una lista simple vertical.
- **Sticky Side-Control**: El panel de votación se mantiene fijo (sticky) mientras se navega por la lista de resultados laterales en escritorio.

## [v31.9.0] - 2026-04-12
### Añadido (Sistema de Disponibilidad / Convocatorias)
- **Módulo de Votación Nativa**: Se ha implementado un sistema completo de "¿Quién juega esta noche?" accesible desde la barra de navegación. Sustituye las encuestas de WhatsApp por una integración nativa en la app.
- **Acceso Directo (Bottom Nav)**: Nuevo icono dedicado ("VOTAR") entre Jornadas y Tácticas para facilitar la participación rápida de los jugadores.
- **Flujo de Manager/Capitán**: Los roles de mando ahora pueden crear convocatorias rápidas definiendo Título y Hora directamente desde el panel.
- **Sincronización con WhatsApp**: Botón de compartición automática que formatea un mensaje profesional con enlace directo (`?poll=UUID`) para pegar en el grupo del club.
- **Votación Triple con Retraso**: Los jugadores pueden votar "Sí", "No" o "Llego Tarde". Al marcar "Tarde", se despliega un selector premium de minutos (+15m, +30m, +45m, +1h) para mayor precisión táctica.
- **Visualización en Tiempo Real**: Panel de resultados con avatares de los jugadores agrupados por estado, permitiendo al manager saber en segundos con quién cuenta para la noche.
- **Notificaciones Dinámicas (Smart Banner)**: Si existe una convocatoria activa y el usuario aún no ha votado, aparece un banner flotante recordatorio en la parte superior de la app y un punto rojo en el menú de navegación.
- **Deep Linking Inteligente**: Al abrir un enlace de convocatoria, la app redirige automáticamente a la pantalla de votación tras validar la sesión, eliminando clics innecesarios.
- **Hotfix de Permisos**: Refactorizado el sistema `applyRolePermissions` para ser insensible a mayúsculas y soportar múltiples roles (ej: `manager,capitan`) en un mismo elemento. Esto resuelve el problema de visibilidad para managers cuyo rango estaba capitalizado en la base de datos.
- **Corrección de Scope**: Movidas las constantes de la interfaz de convocatorias al inicio del script para asegurar que estén disponibles en todo el ciclo de vida de la aplicación.

## [v31.8.4] - 2026-04-12
### Ajustado (Optimización Mobile Viewport)
- **Barra de Scroll Premium**: Se ha forzado globalmente la ocultación visual de la barra de scroll amarilla (`::-webkit-scrollbar`) en dispositivos móviles, ya que afeaba la experiencia táctil cruzando el campo táctico. Se mantiene el desplazamiento fluido nativo sin rastro visual.
- **Centrado de Extremos (MI/MD)**: Se han modificado las coordenadas nativas en formaciones anchas (3-5-2, 3-4-1-2, 3-1-4-2). Los extremos y medios por banda se han acercado un `4%` más hacia el centro del campo.
- **Escalado Inteligente del Terreno (Zoom Out)**: Se ha dejado de forzar el campo táctico a un 100% estricto del ancho (`calc(100% + 30px)`); ahora se renderiza a un `94%` absoluto y se autocentra (`margin: 0 auto`). Esto permite ganar unos píxeles de "respiro" en cada lateral, haciendo que el campo entero y los jugadores se vean ligeramente más pequeños y no choquen visualmente contra los biseles del teléfono, permitiendo posiciones en banda más cómodas incluso si la gente edita su propio dibujo.
- **Contraste de Badge de Posición**: Solucionado un bug en el modo móvil donde el texto de la posición de la carta (ej. "POR", "MCD") era de color negro puro sobre un fondo negro profundo, haciéndolo ilegible. Ahora el texto se renderiza en oro/ámbar eléctrico (`var(--primary)`) devolviendo la alta visibilidad a los roles tácticos.
- **Badge de Posición Reubicado**: En móvil, el badge de posición (ej. "DC", "MCD", "POR") ya no se superpone en la esquina superior derecha tapando la imagen del jugador. Ahora aparece centrado debajo de cada carta como una pequeña etiqueta con borde dorado, liberando la visualización completa del avatar.
- **Campo Táctico Más Alto**: Se ha cambiado el `aspect-ratio` del campo de `1/1.35` a `1/1.45`, generando más espacio vertical especialmente en la zona baja del campo para que la carta del portero no quede cortada por el borde inferior.
- **Botones Tácticos Compactos**: Los botones "Dibujo", "Exportar" y "Guardar" del modo móvil ahora son horizontales e inline en vez de apilados verticalmente. Se ha reducido padding, gap y eliminado el `min-height`, ocupando aproximadamente la mitad de alto que antes.

## [v31.8.3] - 2026-04-12
### Corregido (Persistencia Botones Tácticos)
- **Ocultación global en Desktop**: Se ha arreglado un bug donde los botones de "DIBUJO" y "EXPORTAR" de la cabecera en escritorio se quedaban visibles ("clavados") al navegar hacia otras secciones de la aplicación (Inicio, Jornadas, Plantilla, etc.). Ya se limpian correctamente al cambiar de vista.
- **Limpieza de estado visual**: Ahora al salir de la vista táctica se reinicia correctamente el estado visual en el DOM (removiendo flags de estado como la clase \`editing-tactic\` y limpiando los botones temporales) para asegurar una experiencia limpia al regresar.

## [v31.8.2] - 2026-04-12
### Ajustado (Layout Navbar Desktop)
- **Alineación Vertical de Menú**: En la versión de escritorio, el grupo de botones de la barra de navegación lateral ya no se centra en el medio. Se han alineado a la parte superior (`flex-start`) aprovechando el alto completo de la pantalla, mientras que el botón de cerrar sesión (`SALIR`) ha sido empujado de manera aislada hasta la base final de la barra para evitar pulsaciones accidentales y equilibrar el diseño visual.

## [v31.8.1] - 2026-04-12
### Corregido (Alineación de Modales)
- **Centrado de Diálogos Restaurado**: Solucionado un error sintáctico en `style.css` donde las propiedades Flexbox responsables de centrar los modales (`.modal-overlay`) se habían cortado y desplazado accidentalmente a otro identificador, provocando que todos los menús de diálogo aparecieran fijados en la esquina superior izquierda. Ahora todos los modales vuelven a emerger centrados armónicamente en el viewport.

## [v31.8.0] - 2026-04-12
### Añadido: Integración de Escudo en Cabecera Global
- **Branding Dinámico**: Inserción del escudo del club en el `#global-header`, visible en todas las secciones de la aplicación para reforzar la identidad del equipo.
- **Escala Optimizada**: Aumentado el tamaño del escudo a 60px (escritorio) y 44px (móvil) para un impacto visual superior.
- **Ajuste Estético (Circular)**: Refinado el contenedor del logo a un formato circular (`border-radius: 50%`) siguiendo los estándares de diseño de apps de élite.
- **Renderizado Adaptable**: La cabecera ahora detecta automáticamente si el club tiene un escudo definido; de lo contrario, muestra un placeholder arquitectónico (🛡️) manteniendo la estética premium.
- **Sincronización en Tiempo Real**: Al actualizar el escudo desde el panel de gestión ("Mi Equipo"), la cabecera superior se refresca instantáneamente sin recargas.
- **Optimización Mobile-First**: Estructura de cabecera reorganizada para evitar solapamientos en dispositivos móviles, escalando el logo proporcionalmente.

## [v31.0.0] - 2026-04-12
### Nuevo Módulo: Panel de Control "Mi Equipo"
- **Gestión Administrativa**: Nueva sección exclusiva para Managers accesible desde el Navbar.
- **Identidad del Club**: Implementación de subida de escudos personalizados para el equipo.
- **Administración de Rangos**: Sistema de gestión de roles (Manager, Capitán, Jugador) con persistencia directa en Supabase.
- **Dashboard de Estadísticas**: Resumen en tiempo real del desempeño global del equipo (Goles totales, asistencias y partidos).
- **Control de Acceso**: El botón de gestión ahora utiliza el atributo `data-role-required="manager"`, restringiendo la administración solo a usuarios autorizados.

## [v30.0.0] - 2026-04-12
### Mejoras en Gestión Táctica
- **Borrado Permanente en Cloud**: Se ha corregido el bug que permitía que las tácticas eliminadas reaparecieran al recargar. Ahora se ejecuta un comando `DELETE` físico en Supabase.
- **Sistema de Táctica Activa**: Implementación de un selector de táctica principal.
  - **Badge "ACTIVA"**: Indicador visual claro para la táctica en uso por el equipo.
  - **Botón "ACTIVAR"**: Permite a los Managers cambiar la táctica activa del club con un solo clic, sincronizando automáticamente el estado en la nube para todos los miembros.
  - **Exclusividad**: El sistema asegura que solo una táctica puede estar marcada como activa por equipo por motivos de consistencia de datos.

## [v29.1.0] - 2026-04-12
### Corregido (Gestión de Perfiles)
- **Modo Edición Amnésico**: Se ha corregido un bug crítico donde el modo edición siempre mostraba la foto del Manager al intentar editar a otro jugador.
- **Estado `editingPlayer`**: Introducción de un estado de rastreo dedicado para desacoplar la ficha en edición del usuario activo.
- **Persistencia Dinámica**: El motor de guardado ahora detecta automáticamente si se está editando una ficha ajena (vía Manager) y aplica los cambios (incluyendo nuevas fotos y ajustes de escala) al registro correcto sin afectar el perfil del administrador.
- **Seguridad de Datos**: Limpieza automática de estados temporales de imagen al cambiar entre perfiles para evitar "leaks" visuales.

## [v29.0.0] - 2026-04-12
### Mejoras en Experiencia de Usuario (UX)
- **Migración de Perfiles a Pantalla Completa**: Se ha eliminado el modal pop-up que se mostraba al pulsar sobre un jugador en la plantilla. Ahora, el sistema redirige dinámicamente a una vista inmersiva de pantalla completa (basada en el diseño de "Mi Perfil Elite").
- **Unificación de Componentes**: Eliminación de código redundante y modales obsoletos (`profile-modal`) para optimizar el rendimiento y la consistencia visual.
- **Control de Seguridad (RBAC)**: Implementación de permisos granulares en el perfil de jugador. El botón "EDITAR FICHA" ahora es inteligente: solo se muestra si el usuario logueado es **Manager** o si es el **dueño** de la propia ficha. Los jugadores estándar no pueden editar perfiles de compañeros.
- **Títulos de Vista Dinámicos**: El encabezado de perfil ahora se adapta automáticamente mostrando el nombre del jugador consultado.

## [v28.2.0] - 2026-04-12
### Solucionado (Estética y Diseño Táctico Final)
- **Corrección de Dorsales Inexistentes**: Sustitución de variable de base de datos errónea (`player.number` por `player.dorsal`) que causaba la desaparición del número en la exportación.
- **Liberación de Badges Recortados**: Se ha retirado el candado estricto `overflow: hidden` del contenedor principal de la carta. Dado que el render de foto (con el nativo Canvas) ya tiene definidos sus recortes matemáticos propios, retirar esto permite que el badge "MC" asome naturalmente fuera de la carta sin cortarse por la mitad inferior.
- **Formación Desahogada (Widened Pitch)**: El contenedor invisible táctil que agrupa las coordenadas ha pasado de un ancho restrictivo (`800px`) a uno panorámico (`960px`). Esto permite que los extremos se peguen más a la línea de banda y que los centrales y mediocentros tengan más huecos transpirables entre ellos dentro del export de 1080px.

## [v28.0.0] - 2026-04-12
### Solucionado (HTML5 Native Canvas Engine & Bounds Hotfix)
- **Bypass de Bug en Motor de Captura**: Se ha reescrito por completo el pipeline de renderizado de las fotos para la exportación. En lugar de confiar en que `html2canvas` interprete correctamente el CSS (`object-fit`, `transform`, etc.) -el cual tiene bugs letales confirmados que causaban el efecto miniatura-, ahora usamos el estándar nativo de dibujo de HTML5 (`CanvasRenderingContext2D`).
- **Píxeles Horneados (Baked Pixels)**: El nuevo motor descarga la imagen, aplica las matemáticas de escala y desplazamiento del usuario en la memoria de la tarjeta gráfica y dibuja un lienzo "plano" de exactamente 150x205px. `html2canvas` ahora solo tiene que hacer "copiar y pegar" de esta textura final, garantizando precisión absoluta.
- **Hotfix de Contenedor Fantasma**: Identificado un tercer bug estructural en `html2canvas`. La regla CSS `width: 100%` en contenedores anidados con `position: absolute` colapsaba el ancho a 0 (causante real del recorte). Revertido a píxeles duros (`150x205px`) también en el contenedor padre.

## [v27.0.0] - 2026-04-12
### Solucionado (Pixel-Forced Img & Calibration Bug)
- **Corrección de Variables de Calibración**: Se ha corregido un bug crítico de mapeo de datos donde el script de exportación intentaba leer `photo_pos_x` en lugar de la variable real guardada en base de datos (`photo_x`).
- **Anclaje en Píxeles Duros (`<img>` Fixed)**: El motor de captura `html2canvas` sufre un bug conocido al renderizar transformaciones en contenedores de tamaño porcentual (`100%`). Se ha solucionado inyectando una etiqueta `<img>` convencional con el tamaño absoluto forzado inline (`150px x 205px`), eliminando definitivamente el efecto "Miniatura".

## [v26.0.0] - 2026-04-12
### Solucionado (No-Flex Absolute Architecture)
- **Eliminación Total de Flexbox**: Se ha erradicado `display: flex` de toda la lógica de exportación. Esta es la solución definitiva al bug de "Miniaturas" en `html2canvas`, que colapsaba el tamaño de las imágenes al procesar contenedores flex con transformaciones.
- **Anclaje Absoluto Quirúrgico**: Todos los elementos de la carta (Foto, Nombre, Posición) usan ahora posicionamiento absoluto puro (`top:0, left:0, width:100%, height:100%`), obligando al motor de renderizado a ocupar todo el espacio disponible.
- **Normalización de Transformaciones**: Ajustado el `transform-origin` y la jerarquía de capas para asegurar que el zoom del usuario no desplace la imagen fuera de los límites de la carta.

## [v25.0.0] - 2026-04-12
### Rediseño (Táctica Móvil Definitivo)
- **Barra Táctica Móvil Nativa**: Nuevo componente `mobile-tactic-topbar` exclusivo para móvil dentro de la vista de tácticas. Muestra nombre y formación, con cada botón en fila individual y estética premium.
- **Cero Scroll Doble**: `app-wrapper` y `view-tacticas` en `overflow: hidden` en móvil, eliminando las dobles barras de scroll.
- **Cero Scroll Horizontal**: El campo ocupa el ancho exacto del viewport compensando el padding lateral del contenedor.
- **Arquitectura Divergente**: En móvil se oculta el header global; en escritorio permanece intacto.

## [v22.7.2] - 2026-04-12
### Corregido (Rediseño Táctico)
- **Controles de Dibujo**: Restaurados los botones de "Guardar Diseño" y "Restablecer" en el nuevo encabezado responsivo.

## [v22.7.1] - 2026-04-12
### Corregido (Hotfix)
- **Error de Referencia**: Corregido el fallo `btnEditBoard is not defined` que bloqueaba la apertura del detalle de táctica.

## [v22.7.0] - 2026-04-12
### Añadido (Rediseño Táctico Móvil Elite)
- **Cartas "Integrated Name"**: Los nombres de los jugadores en móvil ahora se muestran en una banda inferior interna con degradado, eliminando solapamientos y mejorando la estética del campo.
- **Header Responsivo**: Reorganización de los controles de táctica (Guardar, Exportar, Dibujo) en un contenedor compacto optimizado para pantallas táctiles.
- **Scroll Cero**: Ajustes de viewport en el contenedor del campo para garantizar un ajuste perfecto al ancho de la pantalla en dispositivos móviles.
- **Forzado de Caché**: Actualización a versión `?v=22.7.0` en el script principal.

## [v22.6.0] - 2026-04-12
### Corregido (Mitigación de Recursión RLS)
- **Estrategia de Guardado Directo**: Sustitución de `upsert` por operaciones de `.update().eq('id', id)` dirigidas. Al evitar la lógica de "comprobación de existencia" de upsert, se reduce la probabilidad de disparar recursiones infinitas en las políticas de seguridad de Supabase.
- **Throttle Secuencial**: Añadido un retardo de 150ms entre cada guardado de jugador durante la finalización del partido. Esto evita picos de concurrencia que saturan el motor de políticas RLS.
- **Forzado de Caché**: Actualización a versión `?v=22.6.0` en el script principal.

## [v22.5.0] - 2026-04-12
### Corregido (Sincronización Avanzada & UUID)
- **Normalización de IDs**: Implementada lógica de limpieza de IDs. La aplicación ahora detecta IDs temporales (Timestamps) y permite que Supabase genere UUIDs válidos, sincronizándolos de vuelta a la app local tras el primer guardado.
- **Optimizador de Persistencia**: Reescrita la función `finalizeMatch` para consolidar cambios de jugadores en memoria. Ahora se realiza un único guardado por jugador al finalizar el partido, mitigando errores de recursión en las políticas RLS de Supabase.
- **Forzado de Caché**: Añadido parámetro de versión `?v=22.5.0` a la carga del script principal para asegurar el uso de la lógica corregida.

## [v22.4.0] - 2026-04-12
### Corregido (Persistencia & Estabilidad)
- **Error de Renderizado Hotfix**: Corregido el fallo `TypeError: Cannot set properties of null` en la vista de Jornadas que impedía visualizar el resumen tras finalizar partidos.
- **Integridad de Base de Datos**: Añadida la sincronización obligatoria de `team_id` en las operaciones `upsert` de Jugadores y Sesiones. Esto resuelve los errores 400 (Bad Request) y 500 (Internal Server Error) de Supabase.
- **Robustez de Guardado**: Implementada gestión de errores `try-catch` con logs detallados para monitorizar fallos en la persistencia de datos en la nube.

## [v22.3.0] - 2026-04-12
### Corregido (Restauración de Jornadas)
- **Capa de Permisos Reactivada**: Se ha restaurado la llamada crítica a `applyRolePermissions()` en el ciclo de carga inicial (`loadTeamData`). Esto soluciona el problema de los botones de gestión invisibles (Nueva Jornada, Añadir Partido, etc.) para los Managers y Capitanes.
- **Sincronización de Controles**: Se ha refinado la lógica de visibilidad para asegurar que los contenedores de finalización de jornada y sumarios administrativos respeten estrictamente la jerarquía del club.

## [v22.2.0] - 2026-04-12
### Añadido (UX Refinement & Polish)
- **Inicio Inteligente**: Se ha refinado la lógica de entrada. Los usuarios con perfil activo ahora aterrizan directamente en el **Dashboard (Inicio)** para una gestión inmediata, mientras que los nuevos registros mantienen su flujo hacia el editor de ficha.
- **Seguridad en Salida**: Implementado un diálogo de confirmación `jbConfirm` vinculado al botón "SALIR". Esto previene cierres de sesión accidentales durante la navegación.
- **Iconografía Premium**: Sustitución de emojis por un sistema de iconos SVG minimalista de trazado uniforme (2px). Se han añadido efectos de iluminación (`gold-glow`) y animaciones de elevación vertical al interactuar con el menú inferior.

## [v22.0.0-DESKTOP] - 2026-04-12
### Añadido (Desktop UX Elite)
- **Layout Divergente (Bento Box)**: Diseño web reescrito con enfoque dual. Ahora, en pantallas grandes (más de 1024px de ancho), el Dashboard abandona el estiramiento móvil antiestético y se distribuye en dos sobrias columnas asimétricas protegidas por un `max-width` dinámico.
  - Columna Izquierda (Ancha): Bienvenida, Barra de Win Ratio premium y Rachas.
  - Columna Derecha (Estrecha): Tarjetas cuadradas de Totales (Jugadores/Jornadas) y los contadores top (Goleadores y Asistentes).
- **Personalidad Extendida**: El banner principal de bienvenida ahora extrae el rol asíncrono del sistema (ej: `[MANAGER]`, `[CAPITÁN]`) para mostrar el rango jerárquico junto al nombre en una placa flotante.
- **Ratio Premium**: La barra de análisis ha sido engrosada. Las victorias ahora brillan en métrica corporativa (`linear-gradient dorado`), mientra que tanto empates como derrotas se oscurecen en la escala de grises para darle mayor seriedad al dato visual.

## [v21.1.0-UX] - 2026-04-12
### Añadido (Dashboard & Widgets)
- **Dashboard Mejorado**: Se ha rediseñado la vista principal (`🏠 INICIO`) añadiendo tres componentes analíticos vitales:
  1. **Top Asistentes**: Igual que con los goleadores, ahora se muestran los 3 jugadores con más asistencias del equipo, usando datos históricos combinados (Oficial + Amistoso). Posicionado junto a "Top Goleadores" en una cuadrícula simétrica `1fr 1fr`.
  2. **Ratio de Victorias**: Una barra de progreso tricolor horizontal que mide instantáneamente el éxito del club en el historial total de partidos y muestra en formato texto los resultados brutos exactos (`x V | y E | z D`).
  3. **Racha (Últimos 5 Partidos)**: Sistema de medallas de color dinámico que ilustra la tendencia inmediata del roster en los últimos 5 encuentros, mostrando tarjetas verdes, naranjas o rojas según V/E/D.

### Alterado (Arquitectura SPA vs Recargas)
- **Eliminación Total de Recargas Forzadas**: Reestructuración masiva del flujo de sesión. Se han eliminado todos los bloqueos derivados de llamadas a `location.reload()`:
  - Guardar o actualizar la ficha de un jugador ahora sincroniza contextualmente a las memorias locales (`loadTeamData()`) en `~100ms`, permitiendo el salto instantáneo a "MI PERFIL" sin perder el estado local.
  - Expulsar o abandonar el club ahora redirige el scope hacia autenticación sin la penalidad visual parpadeante de una recarga global del navegador.

### Corregido (Flujos Huérfanos)
- **Modal de Perfil (Plantilla)**: Se detectó que el evento de clic en jugadores de la pantalla `👥 PLANTILLA` activaba una búsqueda a un contenedor fantasma (`#profile-modal`). Se ha reimplementado desde cero usando el sistema de capas de `jb-global-dialog`, permitiendo a los capitanes analizar el perfil renderizado y las estadísticas del jugador seleccionado en un sub-modal en lugar de chocar contra un error silencioso de DOM nulo.
- **Selector de Partido Inicial (Jornadas)**: Subsanado un error cruzado de etiquetas HTML donde el botón de "OFICIAL" forzaba "Amistoso" y viceversa en las métricas. Se ha estructurado bajo un group param (`name="sessionType"`) mediante Radio Buttons customizados.

## [v21.0.0-TOAST] - 2026-04-11
### Añadido (Sistema de Feedback Visual)
- **Sistema de Toasts Premium**: Nuevo sistema de notificaciones no intrusivas con 3 variantes (✅ success, ❌ error, 💡 info). Cada toast incluye:
  - Animación de entrada slide-in desde la derecha con efecto de escala
  - Barra de progreso animada para auto-dismiss
  - Clic para cerrar manualmente
  - Máximo apilable con diseño glassmorphism coherente con el tema
- **`window.jbAlert(message)`**: Reemplazo directo del `alert()` nativo. Usa el mismo diálogo global (`#jb-global-dialog`) pero oculta el botón "Cancelar" y muestra solo "ACEPTAR". Devuelve una Promise para flujos async.
- **`window.jbLoading`**: Overlay global con spinner animado y texto personalizable. Incluye timeout de seguridad de 15 segundos para evitar bloqueos permanentes si una operación falla silenciosamente.
  - Se usa en: Guardado de ficha de jugador y guardado de diseño táctico.

### Corregido (Bugs Críticos)
- **Eliminación de 23 `alert()` nativos**: Todos los `window.alert()` han sido reemplazados por `window.jbToast()` o `window.jbAlert()`, cumpliendo la regla "Cero Modales Nativos" del sistema de diseño.
  - Errores de Supabase → `jbToast('...', 'error')`
  - Confirmaciones exitosas → `jbToast('...', 'success')`
  - Validaciones de seguridad → `jbToast('...', 'error')` con return
- **Eliminación de funciones fantasma**: Removido bloque de inicialización al final de `app.js` que llamaba a 6 funciones inexistentes (`setupAuth`, `setupTeamSelectors`, `setupPlantillaHandlers`, `setupTacticHandlers`, `setupSessionHandlers`, `setupMatchHandlers`), previniendo errores silenciosos en consola.

### Técnico
- **CSS**: Nuevos tokens de color `--success`, `--success-glow`, `--error`, `--error-glow` en `:root`.
- **CSS**: ~170 líneas nuevas para toasts, loading overlay, y animaciones (`toastSlideIn`, `toastSlideOut`, `toastProgress`, `spinLoader`).
- **HTML**: Nuevos contenedores `#jb-toast-container` y `#jb-loading-overlay` inyectados al inicio del `<body>`.
- **JS**: ~85 líneas nuevas para las funciones `jbToast`, `dismissToast`, `jbAlert` y `jbLoading`.

## [v20.4.4-STABLE] - 2026-04-09
### Corregido (Alineación Fotográfica)
- **Eliminación de Distorsión en Nombres y Posiciones**: Se ha sustituido el modificador `transform: scale()` (que corrompía la posición interna de los textos y etiquetas al exportar en imagen) por un aumento volumétrico orgánico del contenedor `(+30% cqw)`.
- **Integridad Interna de la Carta**: Al expandirse el "envoltorio" de la carta orgánicamente, la fotografía de los jugadores, la etiqueta de posición amarilla (`.slot-pos`) y el nombre (`h4`) se posicionan de nuevo simétricamente en el centro sin colapsar entre ellos.

## [v20.4.3-BOOST] - 2026-04-09
### Ajustado (Realce Fotográfico)
- **Escalado de Cartas en Exportación**: Aumentado el tamaño global de las cartas un 30% `scale(1.3)` exclusivamente para la captura en imagen, haciéndolas mucho más legibles y protagonistas respecto al tamaño masivo del estadio de fondo.
- **Sombreado Premium**: Añadido un anillo de sombra oscura e iluminación ámbar `box-shadow` detrás de las descripciones tácticas para darles un aspecto tridimensional sobre el césped 2D de la foto.

## [v20.4.2-HOTFIX] - 2026-04-09
### Corregido (Persistencia de Diseño)
- **Guardado en la Nube de Custom Positions**: Solucionado un error de sincronización donde los cambios de posición realizados en el modo "Modificar Dibujo" no se enviaban a la base de datos, provocando que se perdieran al refrescar la página.

## [v20.4.1-NATIVE] - 2026-04-09
### Corregido (Renderizado Táctico Fiel)
- **Eliminación de Distorsiones en Exportación**: Se ha eliminado la hoja de estilos artificial que forzaba el formato de "cartas grandes" en las capturas. Ahora la foto respeta rigurosamente el diseño, tamaño, escala y posiciones originales de las piezas en la pizarra.
- **Encuadre Absoluto del Portero**: Redimensionado el campo interno de la captura para que mida siempre 1085px de alto exactos, garantizando que entra con total holgura dentro del marco (salvando de los márgenes a los porteros).

## [v20.4.0-REAL] - 2026-04-09
### Ajustado (Restauración Oficial)
- **Fondo Emerald Pitch**: Restaurada la imagen oficial `emerald_pitch.png` como fondo de exportación para máxima fidelidad.
- **Corrección de Encuadre**: Ajustada la altura del lienzo (1440px) y los márgenes internos para asegurar que el **Portero (POR)** sea plenamente visible.
- **Scorebug Compacto**: Rediseño del marcador superior para que sea más elegante y no tape a los delanteros en formaciones ofensivas.
- **Renderizado Sincronizado**: Aumentado el tiempo de preparación de la captura para garantizar la carga de todos los assets gráficos.

## [v20.3.0-PHOTO] - 2026-04-09
### Añadido (Exportación de Alta Fidelidad)
- **Captura Espejo Automática**: El sistema de exportación ahora replica exactamente la proporción y disposición de la pizarra táctica XL.
- **Centrado Inteligente**: Implementado un layout basado en Flexbox que centra el campo automáticamente en el marco de la imagen.
- **Fondo Elite Integrado**: La imagen exportada ahora incluye el fondo reglamentario con rayas y sombras dinámicas.
- **Limpieza de Interfaz**: Se eliminan automáticamente los botones de edición y controles del clon del campo para generar una imagen limpia y profesional.
- **Resolución Optimizada**: Marco de exportación fijado en 1080x1350 para máxima calidad en RRSS.

## [v20.2.1-FIX] - 2026-04-09
### Ajustado (Blindaje Total)
- **Cierre de Brecha en Slots**: Corregido el error que permitía abrir el modal de gestión en slots ocupados mientras se editaba el dibujo táctico.
- **Bloqueo de Un Solo Clic**: Deshabilitada la función de mandar al banquillo o cambiar jugador mediante clic directo durante la fase de diseño.

## [v20.2.0-PURE] - 2026-04-09
### Añadido (Blindaje de Modos)
- **Bloqueo de Gestión en Edición**: Mientras el modo "Modificar Dibujo" está activo, se deshabilitan todas las funciones de gestión de plantilla (arrastre del banquillo y clics en slots).
- **Feedback Visual de Bloqueo**: El panel del banquillo muestra un estado oscurecido con un aviso de "GESTIÓN BLOQUEADA" durante el diseño táctico.
- **Prevención de Errores de Arrastre**: Se desactiva el `draggable` de las fichas de los jugadores cuando se está editando la estructura de la formación.

## [v20.1.0-ELITE] - 2026-04-09
### Ajustado (Refinamiento Estético Desktop)
- **Sidebar Glassmorphism**: Rediseño de la barra lateral con fondo translúcido (25px blur) e indicador de sección integrado.
- **Campo Táctico XL**: Aumento de la longitud vertical del campo (aspect-ratio 1:1.55) para una visualización más profesional en pantallas grandes.
- **UX Premium**: Mejora en la alineación de iconos y tipografía del menú lateral para un aspecto más cohesivo.
- **Layout Adaptativo**: Ajuste de paddings globales para acomodar el nuevo ancho del sidebar.

## [v20.0.0-PRO] - 2026-04-09
### Añadido (Interfaz Élite Desktop)
- **Navegación Híbrida Inteligente**: Nueva arquitectura de navegación que detecta el dispositivo automáticamente.
- **Sidebar de Escritorio**: Implementación de una barra lateral fija a la izquierda (90px) con estética premium, iconos con glow y bordes luminosos.
- **Layout Adaptativo**: Todo el contenido principal se desplaza automáticamente para dejar espacio al sidebar en pantallas de PC.
- **Feedback Activo Pro**: Indicador lateral luminoso y efectos de escalado en los iconos del sidebar para una navegación más fluida.

## [v19.2.0-ELITE] - 2026-04-09
### Añadido (Seguridad de Diseño)
- **Separación de Modos**: Implementado un sistema de bloqueo que separa la asignación de jugadores (Modo Gestión) de la edición de posiciones (Modo Diseño).
- **Botón "Modificar Dibujo"**: Nuevo control en cabecera para habilitar la edición manual de la formación.
- **Feedback Visual de Edición**: Al activar el modo diseño, los slots muestran un borde punteado animado para indicar que son movibles.
- **Prevención de Errores**: Se bloquea el arrastre accidental de jugadores cuando se está moviendo la estructura de la formación.

## [v19.0.0-DRAG] - 2026-04-09
### Añadido (Pizarra Táctica Dinámica)
- **Posiciones Personalizadas**: Ahora puedes arrastrar a los jugadores libremente por el campo en la sección de Tácticas para crear dibujos tácticos a medida.
- **Botón "Guardar Diseño"**: Permite persistir las coordenadas (X/Y) personalizadas de una formación en Supabase.
- **Botón "Reset"**: Permite volver instantáneamente a la formación estándar del sistema (4-4-2, 3-5-2, etc.).
- **Soporte Táctil**: Implementación con Pointer Events para una experiencia fluida tanto en móviles como en PC.
- **Base de Datos**: Nueva columna `custom_positions` en la tabla `tactics`.

## [v18.1.0-SECURITY] - 2026-04-09
### Añadido (Capa de Seguridad Blindada)
- **Implementación de CSP (Content Security Policy)**: Nueva política de seguridad que indica al navegador qué fuentes de datos y scripts son de confianza, bloqueando preventivamente cualquier conexión a dominios externos no autorizados (exfiltración).
- **Validación Proactiva de Entrada**: Añadida una capa de detección de caracteres maliciosos en los formularios (`playerName`, `consoleID`) para rechazar inyecciones antes de que se procesen.

## [v18.0.0-SECURITY] - 2026-04-09
### Añadido (Blindaje Élite & Optimización)
- **Seguridad: Protección Anti-XSS**: Implementación de un motor de higienización (`escapeHTML`) que neutraliza cualquier intento de inyección de código (HTML/JS) en nombres de jugadores, IDs de consola y nombres de clubes.
- **Seguridad: Prevención de Mass Assignment**: Restricción de campos en las peticiones a Supabase y diseño de políticas **Row Level Security (RLS)** para impedir la manipulación no autorizada de roles o estadísticas desde la consola del navegador.
- **Rendimiento: Optimización de Base de Datos**: Creación de índices en `team_id`, `user_id` y `status` para reducir drásticamente la latencia en las consultas, mitigando los retardos del plan gratuito de Supabase.
- **Supabase Hardening**: Generación de un script SQL maestro (`supabase_security.sql`) para el refuerzo total del backend.

## [v17.0.0-FIXED] - 2026-04-07
### Reversión Total (Hotfix)
- **Restauración de Sistema**: Los archivos `app.js`, `style.css` y `changelog.md` han sido revertidos íntegramente al commit de la **v17.0.0** (`48e66ca`) para recuperar la estabilidad visual y funcional.
- **Parche de Arranque**: Corregida la llamada `setupNavigation()` en `app.js` para garantizar que la aplicación cargue correctamente tras la reversión.

## [v17.0.0] - 2026-04-07
### Añadido (Broadcast Top Horizon)
- **Marcador al Top (Scorebug Top)**: Reubicación del banner informativo (nombre, hora y formación) a la zona superior de la imagen, aprovechando el espacio de las gradas y liberando el césped inferior.
- **Expansión Horizontal Maestro**: Ampliación del área táctica a `1020px` y ajuste de margen `left: 30px`. Esto clava el eje central del equipo (POR, DFC, MCD) con las líneas de cal del estadio.
- **Jerarquía Visual Mejorada**: Las cartas defensivas ahora son totalmente visibles sin la interferencia del marcador inferior previo.

## [v16.0.0] - 2026-04-07
### Corregido (Pitch Alignment Calibration)
- **Sincronización con el Terreno Real**: Re-calculo de las dimensiones del contenedor táctico (`960px x 920px`) y aplicación de un offset vertical (`top: 260px`) para saltar las gradas de la imagen de fondo.
- **Alineación de Cal**: Los jugadores ahora se sitúan exactamente sobre las líneas de cal fotográficas (áreas, círculo central y bandas) del estadio real.
- **Mantenimiento de 'Infinite Pitch'**: Se conserva el `overflow: visible` para garantizar que ninguna carta se corte, independientemente de su posición extrema.

## [v15.0.0] - 2026-04-07
### Corregido (Infinite Pitch Elite)
- **Eliminación de Recortes de Borde**: Desactivación del `overflow: hidden` y expansión del área táctica al 100% del canvas de exportación. Ahora el Portero y los extremos pueden ocupar los bordes sin cortarse.
- **Reubicación de Posición 'Top-Right'**: La etiqueta de posición se ha movido al interior de la carta, en la esquina superior derecha, logrando un look de cromo profesional y despejando la base para el nombre.
- **Márgenes de Seguridad HD**: Re-calibración de las coordenadas de la 3-1-4-2 para asegurar que, aunque las cartas estén en el borde, mantengan una distancia de cortesía respecto al límite físico de la imagen.

## [v14.0.0] - 2026-04-07
### Corregido (Formation Precision Elite)
- **Calibración Táctica (3-1-4-2)**: Reubicación de coordenadas para maximizar el espacio entre cartas. Se han ensanchado las bandas (MI/MD) y se ha desplazado verticalmente el bloque defensivo hacia la base para evitar solapamientos.
- **Etiquetas de Posición 'Below-Card'**: Reubicación de la etiqueta de posición a una zona claramente inferior fuera de la carta (`bottom: -32px`), eliminando el ruido visual sobre el nombre del jugador.

## [v13.0.0] - 2026-04-07
### Añadido (Full Formation Export)
- **Visibilidad de Formación Completa**: Se ha eliminado la restricción que ocultaba los slots vacíos. Ahora, la exportación muestra todas las posiciones tácticas de la formación elegida, incluso si no tienen jugadores asignados.
- **Estilo de Slot Vacío Mirror**: Implementación de un diseño de "esqueleto" (borde discontinuo, fondo translúcido e icono '+') para los slots vacíos, manteniendo la coherencia visual con el panel táctico.

## [v12.0.0] - 2026-04-07
### Corregido (Broadcast Balanced Elite)
- **Punto de Equilibrio de Escala**: Re-ajuste del tamaño de las cartas a 150px x 210px. Este tamaño es el "sweet spot" que mantiene un gran impacto visual sin provocar solapamientos en formaciones cerradas (como la 3-1-4-2).
- **Recalibración Tipográfica**: Ajuste proporcional de las fuentes y espaciados para el nuevo ancho de 150px, asegurando legibilidad pro sin saturar la carta.

## [v11.0.0] - 2026-04-07
### Corregido (Broadcast Giant Calibration)
- **Eliminación de Restricciones de Tamaño**: Se han desactivado las propiedades `max-width` y `max-height` heredadas que impedían que las cartas de la exportación alcanzaran su tamaño gigante (200x280px).
- **Ajuste de Composición Vertical**: Desplazamiento de toda la formación táctica 10px hacia la base de la imagen para un balance visual superior y cercanía al Scorebug.

## [v10.0.0] - 2026-04-07
### Añadido (Broadcast Giant Elite Overhaul)
- **Escalado Masivo de Cartas**: Aumento del tamaño de las cartas a 200px x 280px para una presencia dominante y profesional en la exportación final.
- **Centrado de Imágenes 'Perfect Crop'**: Ajuste de las propiedades de alineación para asegurar que las fotos de los jugadores estén perfectamente centradas en sus slots.
- **Tipografía Escalada**: Incremento proporcional del tamaño de fuente en dorsales (1.8rem), nombres (1.35rem) y etiquetas de posición para mantener la legibilidad a gran escala.
- **Sombras de Profundidad**: Refinamiento de las sombras paralelas para dar un aspecto tridimensional sobre el césped fotográfico.

## [v9.0.0] - 2026-04-07
### Añadido (Tactical Mirror Sincronización)
- **Sincronización Visual Absoluta**: Las cartas de la exportación ahora son un espejo idéntico de las del dashboard (Dorsal arriba-izq, Nombre abajo, Posición Badge debajo).
- **Eliminación de Líneas Redundantes**: Se han ocultado las líneas tácticas generadas por código para delegar la visualización del campo exclusivamente a la textura del fondo.
- **Nuevo Fondo 'Emerald Pitch'**: Integración de `emerald_pitch.png`, que incluye un césped profesional con líneas de cal reales integradas fotográficamente.
- **Refinamiento de Proporciones**: Ajuste de las dimensiones de las cartas (160x220px) para una mayor elegancia y fidelidad al diseño original de la aplicación.

## [v8.0.0] - 2026-04-07
### Añadido (Emerald Pure Elite Overhaul)
- **Fondo de Césped Profesional Puro**: Sustitución total de la imagen de fondo por una textura de césped de estadio HD (`emerald_grass.png`), eliminando elementos humanos o distracciones para un acabado minimalista y pro.
- **Líneas HD de Alta Visibilidad**: Las marcas del campo (áreas, círculo, cal) ahora son más gruesas (3px) y cuentan con un efecto de brillo para resaltar sobre la textura del césped.
- **Calibración de Contraste**: Ajuste de capas para que el color verde esmeralda sea el protagonista sin comprometer la legibilidad de las cartas de jugador.

## [v7.0.0] - 2026-04-07
### Añadido (Social Elite Ultra-Pro Overhaul)
- **Fondo Fotográfico Real**: Integración de la imagen `stadium_bg.png` como telón de fondo para una estética de broadcast auténtica.
- **Corrección de Deformación Visual**: Solucionado el bug que estiraba las etiquetas (barras amarillas) verticalmente; ahora tienen el tamaño exacto del contenido.
- **Dorsales No Intrusivos**: Reducción del tamaño de los números (1.1rem) y reubicación estratégica para evitar tapar los rostros de los jugadores.
- **Campo de Máxima Escala**: El trazado del campo táctico se ha ampliado a 1040px de ancho para un impacto visual dominante sobre el fondo del estadio.
- **Optimización de Contraste**: Mejora en los degradados de las cartas (Glassmorphism v3.1) para asegurar legibilidad sobre texturas de césped real.

## [v6.1.0] - 2026-04-07
### Añadido (Broadcast Pre-Match Evolution)
- **Suelo Unificado (Cinema Turf)**: El campo táctico se integra directamente en el estadio; las líneas flotan sobre el césped sin recuadros sólidos, creando un acabado de realidad aumentada.
- **Cartas Glassmorphism v3**: Rediseño total de los slots con un tamaño imponente (210x340px) y un acabado de cristal translúcido con desenfoque de fondo.
- **Dorsales y Etiquetas integradas**: Eliminación definitiva de las cajas blancas y amarillas. Los números son ahora tipografía dorada integrada y los nombres aparecen sobre un degradado orgánico.
- **TV Scorebug Banner**: Implementación de un marcador de estilo televisión en la parte inferior para agrupar la información del club y el partido con un look broadcast profesional.
- **Consistencia de Escala**: Se ha forzado el tamaño absoluto en la exportación para que todas las cartas midan exactamente lo mismo independientemente del nombre.

## [v5.0.0] - 2026-04-07
### Añadido (Reverse Elite Overhaul)
- **Layout Invertido**: Cambio estructural masivo en la exportación: el campo táctico ahora encabeza la imagen (parte superior) y la información del club se traslada a la base.
- **Cartas Pro Impact (v4)**: Las cartas de jugadores han aumentado significativamente de escala (185x265px) para un impacto visual dominante.
- **Resplandor Anterior (Back-Glow)**: Implementación de una luz ámbar difusa que emana tras cada carta, separándola del césped y aportando profundidad 3D.
- **Bordes Definidos**: Aplicación de marcos dorados de 3px con alta nitidez para estructurar las cartas tipo FUT.
- **Dorsales y Etiquetas de Gala**: Rediseño de los números dorsales (ahora en fondo blanco sólido) y las posiciones para mejor legibilidad a gran escala.
- **Banner de Información Premium**: Nueva sección inferior con tipografía de alta gama sobre un fondo negro sólido con sutiles degradados dorados.

## [v4.9.0] - 2026-04-07
### Añadido (Pro Matchday Redesign v3)
- **Cartas Rectangulares (FUT Style)**: Rediseño total de los slots en la exportación, pasando de formas cuadradas a rectángulos verticales profesionales (155x220px).
- **Layout de Nombre Inferior**: El nombre del jugador ahora aparece en la base de la carta, integrado en una franja de color sólido para máxima visibilidad.
- **Retorno al Grass Elite**: El campo vuelve a ser verde, utilizando un degradado **Emerald Elite** con líneas blancas nítidas, combinando realismo y elegancia.
- **Cabecera "High-Contrast"**: El nombre del club ahora es blanco puro con sombras profundas y resplandor amber, garantizando legibilidad total sobre cualquier fondo.
- **Elementos Flotantes**: Dorsales y posiciones reposicionados artísticamente en las esquinas de las nuevas cartas rectangulares.

## [v4.8.1] - 2026-04-07
### Mejorado (Aesthetic Elite Redesign)
- **Visual Matchday v2**: Rediseño total de la exportación de tácticas.
    - **Fondo Obsidian**: Eliminada la imagen de hierba genérica; sustituida por un degradado negro profundo con resplandor amber.
    - **Pitch Dark Gold**: En la imagen, el campo es ahora carbón oscuro con líneas doradas, resaltando las cartas de los jugadores.
    - **Limpieza de Roster**: Los slots vacíos (iconos "+") se ocultan automáticamente en la exportación para un acabado profesional tipo TV.
    - **Nueva Marca 'Elite Unit'**: Añadida una firma visual en el pie de la imagen para reforzar la identidad del club.

## [v4.8.0] - 2026-04-07
### Añadido
- **Exportación de Tácticas (Matchday Image)**: Nueva funcionalidad para generar y descargar imágenes profesionales de la alineación.
    - **Captura de Alta Fidelidad**: Integración de `html2canvas` para renderizar el campo táctico en resolución 1080x1350 (ideal para redes sociales).
    - **Matchday Graphic**: El diseño incluye automáticamente el nombre del club, la hora del partido y la formación sobre un fondo de estadio atmosférico.
    - **Selector de Hora Elite**: Modal personalizado para indicar la hora de la jornada antes de la descarga, manteniendo la regla de "Cero Modales Nativos".
    - **Botón de Acción Rápida**: Acceso directo desde la cabecera de la pizarra táctica.

## [v4.7.0] - 2026-04-07
### Corregido
- **Error 400 en Supabase**: Se ha resuelto el fallo al guardar tácticas asegurando que los IDs de nuevas tácticas se generen como UUIDs válidos en lugar de timestamps numéricos.
- **Persistencia Robusta**: Ahora el sistema actualiza el ID local tras la inserción inicial en Supabase, evitando duplicados y errores en ediciones posteriores.

### Mejorado (Mobile Elite UI v2)
- **Navegación Rectangular Fija**: Se ha ajustado la barra inferior para que sea un rectángulo sólido fijo al borde (`bottom: 0`), optimizando el espacio y la estética.
- **Header Ultra-Compacto**: Reducción de tamaños en el header del club y botones de acción para priorizar el área de juego.
- **Cartas Tácticas Gigantes**: Aumentado el tamaño de los slots de jugador en móviles para una mejor interacción táctil.
- **Ocultación de Dorsales**: Se han eliminado los números del campo en móviles para limpiar la vista y centrar la atención en los nombres.
- **Escalado Quirúrgico de Nombres**: Refinamiento del algoritmo de ajuste dinámico para que incluso nombres muy largos se vean íntegros y legibles.

## [v4.6.0] - 2026-04-07
### Corregido
- **Fallo Crítico de Persistencia**: Reparada la función `saveTacticsCloud` en `app.js`. Ahora se incluye el `team_id` en el `upsert` de Supabase, lo que garantiza que las tácticas se guarden y recuperen correctamente por club tras recargar la página.

### Añadido
- **Rediseño Mobile Elite (Optimización de Espacio)**:
    - **Navegación Rectangular Fija**: Sustituida la navegación flotante por una barra rectangular fija en la base (360px-430px) para maximizar el área de visualización.
    - **Iconografía y Tipografía Adaptativa**: Reducidos los tamaños de iconos y etiquetas en el menú inferior para mayor discreción.
    - **Cabecera Global Compacta**: Reducción de paddings y tamaños de fuente en el header para liberar espacio vertical.
    - **Campo Táctico Expandido**: Aumentada la altura del campo (`pitch-container`) y el tamaño de las tarjetas de los jugadores para aprovechar el espacio ganado.
- **Refinamiento de Nombres (Mobile-First)**:
    - Nueva lógica de escalado ultra-agresivo en `app.js` que ajusta dinámicamente `scaleX` y `letter-spacing` para que nombres largos quepan íntegros en las cartas tácticas sin mostrar puntos suspensivos ("...").



## [v4.5.2] - 2026-04-07
### Corregido
- **Restauración de Escritorio (PC)**:
    - Se ha devuelto la tipografía de los nombres en PC a su tamaño original (`0.85rem`), eliminando la regresión que los hacía ver demasiado pequeños.
- **Escalado Inteligente Device-Aware (Móvil)**:
    - Implementación de lógica en `app.js` que detecta dinámicamente si el usuario está en móvil (`window.innerWidth < 1024`).
    - En móviles, se aplica una base de `0.65rem` con un factor de `scaleX` progresivo. Esto permite que nombres cortos como "ALBER" se vean con buen tamaño y nombres largos como "KRATINHOS" se ajusten sin cortarse.
    - Se ha ampliado el `max-width` del nombre en móvil al `115%` para evitar recortes prematuros y mejorar la estética de la tarjeta.

## [v4.5.1] - 2026-04-07

## [v4.5.0] - 2026-04-07

## [v4.4.1] - 2026-04-07

## [v4.4.0] - 2026-04-07


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
