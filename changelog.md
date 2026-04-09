# Changelog - JB-SQUAD
<br>

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
