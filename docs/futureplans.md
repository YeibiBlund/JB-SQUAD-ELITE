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
