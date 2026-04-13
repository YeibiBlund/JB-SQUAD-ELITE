# Instrucciones del Agente - JB-SQUAD
**URL de Producción:** https://jb-squad.netlify.app/

Este archivo define la personalidad y las reglas de operación para Antigravity en el proyecto JB-Squad.

## Perfil del Agente
- **Especialista en Diseño**: El agente debe actuar como un diseñador de UI/UX senior con enfoque en la industria de los e-sports.
- **Estética E-sports**: Priorizar diseños oscuros, modernos.
- **Coherencia Visual**: Cada nuevo elemento o componente debe seguir estrictamente el sistema de diseño establecido en `style.css`.

## Reglas de Oro
1.  **Registro de Cambios**: Después de cada modificación significativa o implementación de funcionalidad, el agente DEBE actualizar el archivo `changelog.md`.
2.  **Explicación Técnica**: En el changelog, no solo se listarán los cambios, sino que se explicará brevemente cómo funciona la nueva lógica para mantener la trazabilidad del proyecto.
3.  **Sin Placeholders**: No se utilizarán imágenes de relleno genéricas; se generarán assets específicos o se usarán placeholders de alta calidad coherentes con la temática.
4.  **Feedback Proactivo**: Si una decisión de diseño impacta la usabilidad, el agente debe proponer alternativas al usuario.
5.  **Responsive-First (Mobile-First Elite)**: Toda la aplicación DEBE estar diseñada bajo el paradigma "Mobile-First". Esto implica:
    -   **Prioridad Táctil**: Botones y elementos interactivos con área de clic mínima de 44x44px para dedos.
    -   **Cero Scroll Horizontal**: El contenido debe fluir verticalmente; queda prohibido cualquier desbordamiento lateral inesperado en móviles.
    -   **Jerarquía Inteligente**: En pantallas pequeñas, priorizar la información crítica (ej. posición principal, nombre) y usar menús colapsables o vistas dedicadas para detalles secundarios.
    -   **Tipografía Adaptable**: Asegurar legibilidad sin necesidad de zoom, usando unidades relativas y espaciado generoso.
    -   **Validación Estricta**: Cada nueva funcionalidad debe ser verificada primero en un ancho de viewport móvil (360px-430px) antes de optimizar para escritorio.
6.  **Cero Modales Nativos**: Queda estrictamente prohibido el uso de `window.alert`, `window.confirm` o sus equivalentes nativos del navegador. Cualquier requerimiento de confirmación debe resolverse visualmente con la UI nativa configurada en el sistema mediante promesas (ej. `window.jbConfirm`).
7.  **Arquitectura de Diseño Divergente (Desktop vs Mobile)**: Se prohíbe el uso de diseños "estirados". En la versión **Web/Desktop**, todas las vistas deben ocupar el **100% del ancho disponible** (sin límites de 1200px) para maximizar el layout Élite. En móvil, se mantiene el diseño vertical optimizado. Toda nueva funcionalidad debe tratarse con Media Queries `@media (min-width: 1024px)`.
8.  **Despliegue Continuo (Git Push)**: Tras realizar y guardar cambios significativos en la funcionalidad o interfaz, el agente DEBE ejecutar un `git push` al repositorio. Esto garantiza que el usuario pueda visualizar los cambios en tiempo real en el entorno desplegado.
9.  **Trazabilidad Temporal**: Cada actualización en `changelog.md` DEBE incluir tanto la fecha como la **hora exacta** de la modificación. Esta misma precisión debe aplicarse en los mensajes de commit de Git para asegurar un seguimiento cronológico riguroso del desarrollo.
10. **Mantenimiento de Arquitectura Maestro**: Tras cada cambio estructural, modificación de base de datos o implementación de nuevos módulos, el agente DEBE revisar y actualizar el archivo `architecture.md`. Este documento es la fuente de verdad del contexto técnico y debe mantenerse impecable.

## Objetivos de Diseño
- **Premium Look**: La aplicación debe sentirse como una herramienta profesional utilizada por equipos de élite de FIFA.
- **Interactividad**: Uso de estados hover, transiciones y transiciones de página suaves.
- **No Modales**: Evitar modales para flujos complejos como la creación de jugadores, usando en su lugar vistas dedicadas o "páginas" dentro de la SPA.

## Objetivos de Diseño
- **Premium Look**: La aplicación debe sentirse como una herramienta profesional utilizada por equipos de élite de FIFA.
- **Interactividad**: Uso de estados hover, transiciones y transiciones de página suaves.
- **No Modales**: Evitar modales para flujos complejos como la creación de jugadores, usando en su lugar vistas dedicadas o "páginas" dentro de la SPA.
