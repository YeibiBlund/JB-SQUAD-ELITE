# 📋 JB-SQUAD ELITE — Future Plans

Ideas y mejoras pendientes para abordar en el futuro.

---

## 🔋 Optimización de Consumo de Datos (Supabase Bandwidth)

**Fecha:** 19/04/2026  
**Prioridad:** Media-Alta  
**Estado:** ⏳ Pendiente

### Contexto
Se realizó una auditoría completa de todas las llamadas a Supabase y se detectaron varios puntos donde se desperdicia ancho de banda innecesariamente. Implementar estas mejoras podría reducir el consumo un **50-70%**.

### Cambios Propuestos

#### 1. Cachear `renderAvailabilityBanner()` (Prioridad MÁXIMA)
- **Problema:** Se ejecuta en CADA cambio de vista del navbar, haciendo 2 queries por pulsación.
- **Solución:** Variable `bannerCache` con TTL de 60 segundos. Reutilizar el dato de memoria si no ha expirado.
- **Archivos:** `app.js` (líneas ~333, ~3703-3746)
- **Dificultad:** Fácil | **Riesgo:** Nulo

#### 2. Eliminar doble llamada al banner en Home
- **Problema:** `switchView('home')` llama al banner, y luego el wrapper de `renderHomeDashboard` lo vuelve a llamar.
- **Solución:** Eliminar la llamada duplicada en el wrapper (~línea 3759).
- **Archivos:** `app.js`
- **Dificultad:** 1 línea | **Riesgo:** Cero

#### 3. Fix N+1 en `fetchTeamRequests()`
- **Problema:** Hace una query individual por cada solicitud pendiente para obtener el nombre del usuario.
- **Solución:** Usar JOIN inline: `.select('id, created_at, user_id, profiles(full_name)')` y eliminar el `Promise.all`.
- **Archivos:** `js/data.js` (líneas ~361-377)
- **Dificultad:** Fácil | **Riesgo:** Bajo

#### 4. Seleccionar columnas específicas en `loadTeamData()`
- **Problema:** `select('*')` en `players`, `sessions` y `tactics` descarga campos pesados (JSONs de partidos, asignaciones, etc.).
- **Solución:** Reemplazar por columnas específicas. Ojo: `sessions.matches` se usa para stats globales, así que es el más delicado.
- **Archivos:** `js/data.js` (líneas ~17-93)
- **Dificultad:** Compleja | **Riesgo:** Medio

#### 5. Cachear `updateJoinRequestsBadge()`
- **Problema:** Se ejecuta en cada cambio de vista para actualizar el badge de solicitudes.
- **Solución:** Mismo patrón de caché con TTL de 60s.
- **Archivos:** `app.js` (línea ~334)
- **Dificultad:** Fácil | **Riesgo:** Nulo

#### 6. Filtrar votos del calendario por mes
- **Problema:** `renderPlayerCalendar` descarga TODOS los votos históricos del jugador, aunque solo se muestre un mes.
- **Solución:** Añadir filtro de rango de fechas a la query de `availability_votes`.
- **Archivos:** `app.js` (líneas ~3791-3799)
- **Dificultad:** Fácil | **Riesgo:** Bajo

### Orden de Implementación Recomendado
1. Puntos 1, 2, 3, 5 → Fáciles, sin riesgo, gran ahorro inmediato
2. Punto 6 → Fácil, ahorro creciente con el tiempo
3. Punto 4 → Requiere revisión a fondo de dependencias

---

<!-- Añadir más ideas futuras debajo de esta línea -->

## ⛓️ Reestructuración del Flujo Core (Convocatorias -> Jornadas)

**Fecha:** 25/04/2026  
**Prioridad:** Crítica  
**Estado:** ⏳ Análisis Completado / Pdte. Ejecución

### Contexto
Actualmente las secciones de "Convocatorias", "Tácticas" y "Jornadas" operan como entidades aisladas. Al finalizar un partido, el sistema utiliza la `activeTacticId` seleccionada en ese preciso momento, lo que provoca desincronización de estadísticas si el manager inicia o finaliza la jornada con la táctica incorrecta o sin confirmar. 

### El Flujo "Túnel" (Propuesta)
El objetivo es transformar el flujo en un "túnel" direccional donde sea imposible saltarse pasos o tener datos fantasma:

1. **Fase de Convocatoria (Votación):**
   - El equipo vota la disponibilidad.
   - Al cerrar la votación, se ofrece "Diseñar Táctica de la Jornada" (carga automáticamente a los disponibles).

2. **Fase de Pizarra Táctica:**
   - Se diseña el 11 inicial. No se guarda como una táctica global genérica, sino vinculada temporalmente a la siguiente jornada.

3. **Fase de Partido (El "Check-in" obligatorio):**
   - Al pulsar "NUEVA JORNADA", la app **obligará** a seleccionar la táctica/alineación base.
   - En ese momento, se **clonan** los 11 jugadores y se inyectan dentro de la estructura de la Jornada (`activeSession.lineup`).
   - La pizarra táctica global deja de importar para este partido. Queda "blindado".

4. **Fase Live Match (Cambios):**
   - Si durante la jornada hay cambios en el 11, se habilita una opción "Modificar Alineación del Partido" directamente en el panel de Live Match.
   - Los cambios de jugadores se hacen *in situ* y actualizan el `lineup` interno del partido en curso.

5. **Finalización:**
   - Al pitar el final, las estadísticas (PJ y W) se calculan única y exclusivamente a partir del `lineup` interno del partido.
   - Se elimina la heurística actual de "adivinar" jugadores desde votaciones por cercanía de fechas.

### Beneficios
- Imposible registrar un partido sin saber quién jugó.
- Desacoplamiento total entre la "Pizarra de pruebas" y los "Partidos oficiales".
- Matemáticas de rendimiento 100% exactas sin intervención manual.
