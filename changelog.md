# Changelog - JB-SQUAD
<br>

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
- **Hotfix Syntax**: Corregido error de sintaxis `missing ) after argument list` causado por una firma de función truncada y discrepancias en el cierre del listener principal.
- **Ajuste API jbToast**: Alineadas todas las llamadas al sistema de notificaciones con la función global `window.jbToast(msg, type)`.
- **Corrección de Hooks**: Corregida la referencia a `renderHome` por `renderHomeDashboard` para asegurar que el banner de convocatoria aparezca correctamente tras el login.

## [v31.8.4] - 2026-04-12
### Ajustado (Optimización Mobile Viewport)
... (resto del archivo)
