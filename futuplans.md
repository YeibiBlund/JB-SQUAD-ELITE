# Investigación y Conexión con Telemetría de EA Sports (PRO CLUBS) 🎮

Hemos logrado penetrar las barreras de EA Sports y obtener acceso directo a los datos de los partidos de Clubes Pro (FC 24 / FC 25). Aquí está TODO el contexto y descubrimientos técnicos para poder continuar el desarrollo.

### 1. El Problema del CORS y la Solución (Edge Function)
La API de EA (`https://proclubs.ea.com/api/fc/clubs/matches`) es pública, pero bloquea las peticiones desde el navegador (CORS) a menos que se hagan desde `ea.com`. 
- **Solución:** Creamos una *Edge Function* en Supabase llamada `ea-fetcher` escrita en Deno/TypeScript. Esta función actúa como un puente (Proxy). Nuestro Front-End llama a Supabase, y Supabase llama a EA falsificando las cabeceras (`Referer` y `User-Agent`), saltándose el bloqueo CORS.
- **Autenticación:** Para facilitar el acceso desde la app, deshabilitamos el "Enforce JWT" en Supabase para esta función y utilizamos la clave pública `anon` (`eyJ...`) en la cabecera `Authorization`.

### 2. La Estructura de Datos de EA
Cuando llamamos a la API enviando `clubId` (Ej: 3597) y `matchType` (Ej: `friendlyMatch`), EA devuelve un Array de los últimos partidos. Cada partido incluye:
- `matchId`: ID único del partido (vital para evitar duplicados).
- `timestamp` y `timeAgo`: Fecha y hora exacta.
- `clubs`: Diccionario con ambos equipos. Contiene los resultados, goles (`goals`), goles en contra (`goalsAgainst`), y resultados brutos (`wins`, `ties`, `losses`).
- `players`: Diccionario dividido por equipo, que contiene todos los jugadores que participaron y sus estadísticas súper detalladas.

### 3. Estadísticas Individuales Descubiertas (¡El Tesoro!)
Para cada jugador, EA devuelve un objeto gigantesco. Hasta ahora hemos procesado y extraído:
- `playername`: El nombre de usuario en la consola (GamerTag / PSN ID). **Este es nuestro puente de enlace con la base de datos de JB-SQUAD (columna `console_id`).**
- `pos`: Posición que jugó (midfielder, forward, defender, goalkeeper).
- `rating`: La nota oficial del jugador en ese partido (Ej: "7.30").
- `goals` y `assists`: Goles y Asistencias directas.
- `passattempts` y `passesmade`: Pases intentados y completados (Ideal para calcular el % de pases).
- `tackleattempts` y `tacklesmade`: Entradas intentadas y completadas (Balones recuperados).
#### 3.1. Listado Exhaustivo de Datos Potenciales (Diccionario Completo EA)
Analizando el JSON bruto de EA, hemos detectado que devuelven todo este abanico de métricas individuales. Aunque de momento no usemos la mayoría, este es el "Diccionario de Datos" completo que podríamos explotar en el futuro:

**⚽ Ofensiva y Generación de Juego:**
- `goals`: Goles marcados.
- `assists`: Asistencias dadas.
- `shots`: Tiros totales realizados.
- `passattempts`: Pases intentados.
- `passesmade`: Pases completados con éxito (Ideal para % de precisión).
- `SCORE`: Puntuación bruta ofensiva acumulada.

**🛡️ Defensiva y Destrucción:**
- `tackleattempts`: Entradas intentadas.
- `tacklesmade`: Entradas con éxito (Balones recuperados).
- `cleansheetsdef`: Portería a cero (Booleano exclusivo para Defensas).
- `cleansheetsany`: Portería a cero global.

**🧤 Métricas Exclusivas de Porteros (Goalkeepers):**
- `saves`: Paradas totales.
- `ballDiveSaves`: Paradas con estirada o palomita.
- `crossSaves`: Salidas por alto completadas (centros).
- `goodDirectionSaves`: Paradas por buena colocación/dirección.
- `parrySaves`: Desvíos o rechaces exitosos.
- `punchSaves`: Despejes de puños.
- `reflexSaves`: Paradas de reflejos puros.
- `cleansheetsgk`: Portería a cero (Exclusivo de Portero).
- `goalsconceded`: Goles encajados por el portero.

**⚖️ Disciplina, Resultados y MVP:**
- `mom`: Man of the Match (MVP del partido, devuelve `1` o `0`).
- `rating`: Nota o valoración del partido (Ej. `7.30`).
- `redcards`: Tarjetas rojas directas o por doble amarilla.
- `vprohackreason`: Código de razón de desconexión o expulsión del jugador.
- `userResult`, `wins`, `losses`: Resultados asignados a ese usuario individualmente.

**⏱️ Tiempos y Ritmo de Juego:**
- `gameTime`: Tiempo de partido virtual.
- `secondsPlayed`: Segundos exactos que el jugador ha estado en el campo.
- `realtimegame`: Segundos en tiempo real de juego activo.
- `realtimeidle`: Segundos en tiempo real inactivo (Pausas, menús).
- `match_event_aggregate_0` al `3`: Agregadores de eventos temporales (posiblemente zonas del campo o momentos de calor).

**⚙️ Metadatos Virtual Pro (Técnicos):**
- `archetypeid`: ID del arquetipo físico/habilidad del jugador.
- `pos`: Posición ocupada en el campo.
- `namespace` y `vproattr`: Atributos técnicos internos de progresión del jugador en el juego.

### 4. El "Modo Exploratorio" Actual (Panel Master)
Actualmente, el código de extracción se encuentra en `js/modules/ea_sync.js`. 
- Se ha implementado un botón en el **Panel Master -> Pestaña "TEST EA API"** que permite introducir un `clubId` y obtener los últimos partidos renderizados en tiempo real.
- Este código *no guarda nada* en la base de datos de momento, solo sirve para visualizar qué estadísticas existen y probar la estabilidad del puente.

### 5. Hoja de Ruta para Automatizar en Producción (Pendiente)
Cuando queramos que esto sea 100% automático y guarde los datos en JB-SQUAD:
1. **Tabla de Control (`ea_sync_history`):** Ya tenemos el código SQL escrito para crear esta tabla. Servirá para registrar cada `matchId` de EA y evitar importar el mismo partido dos veces.
2. **Auto-Conciliación (Mapping):** En `ea_sync.js`, al obtener los datos, se buscará a los jugadores en la tabla `players` de JB-SQUAD comparando el `playername` de EA con el `console_id` o `name`.
3. **Inyección en la Jornada:** Los datos parseados se volcarán automáticamente dentro del JSON `matches` de la sesión (Jornada) activa de nuestro equipo.
4. **Cálculo Global:** Una vez guardados, las estadísticas globales de JB-SQUAD (el ranking Elite) se actualizarán solas gracias a nuestra lógica existente.
5. **Nuevos Modos de Juego (`matchType`):** Averiguar cuál es el código exacto para extraer partidos de Liga, Copas o Playoffs (generalmente suele ser `gameType9` o `gameType13`).
6. **Nuevos Títulos / Premios (Logros):** Aprovechando los datos extraídos, crear nuevas métricas en la UI como "Mejor Pasador de la Temporada" o "Muro Infranqueable (Tackles)".

### 6. Código Fuente de la Edge Function (`ea-fetcher`)
Este es el código exacto en Deno/TypeScript que hemos desplegado en Supabase. Actúa como el Proxy maestro con el "Disfraz Élite" para saltarnos el bloqueo de CORS de EA Sports:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { clubId, matchType } = await req.json()
    if (!clubId) throw new Error("El ID del club es obligatorio");

    const type = matchType || 'friendlyMatch';
    const eaUrl = `https://proclubs.ea.com/api/fc/clubs/matches?platform=common-gen5&clubIds=${clubId}&matchType=${type}`;

    // EL DISFRAZ ÉLITE (Spoofing de navegador completo)
    const eaResponse = await fetch(eaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': 'https://www.ea.com/',
        'Origin': 'https://www.ea.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
        'Sec-Ch-Ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'
      }
    });

    if (!eaResponse.ok) {
      throw new Error(`Error de EA: ${eaResponse.status} - ${eaResponse.statusText}`);
    }

    const data = await eaResponse.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
```

---

## 7. Nuevo Flujo de Trabajo Élite (Post-Automatización) 🚀

Con la integración de la Telemetría de EA, el trabajo del Mánager se reduce un 90% y la aplicación se vuelve mucho más autónoma. Este será el nuevo ciclo de vida de una Jornada:

### 1. La Convocatoria (Planificación)
- **El flujo se mantiene:** El mánager abre convocatoria para medir el *hype* y saber quién está disponible. 
- **La táctica es orientativa:** La alineación inicial en la pizarra sirve como estrategia y planteamiento táctico, pero ya no será inamovible (si alguien se cae o llega tarde, la realidad la mandará EA).

### 2. El "Modo Live" (A jugar sin estrés)
- Se juega la noche de Clubes Pro.
- **Cambio Radical:** El Mánager *ya no necesita apuntar nada*. Se acabó crear la jornada antes de jugar y apuntar goleadores 1 a 1 a mano. Solo toca centrarse en ganar los partidos.

### 3. El Volcado Mágico (Cierre de Sesión)
- Al terminar de jugar (o al día siguiente), el Mánager entra en JB-SQUAD.
- Entra a la pestaña de "Jornadas" y pulsa un gran botón **"📥 SINCRONIZAR JORNADA DE HOY"**.
- El sistema busca en EA todos los partidos jugados en el último día y crea un **Borrador de Jornada** automático.
- Este borrador ya detecta el 11 inicial real (EA nos chiva quién jugó de verdad), los resultados, el MVP, los goles y las asistencias.

### 4. La Aprobación Final
- El Mánager solo tiene que echar un vistazo visual al borrador: *"Vale, jugamos 4 partidos, todo cuadra"*.
- Pulsa el botón **"✅ APROBAR JORNADA"**.
- En ese momento, todas las estadísticas caen de golpe a la Base de Datos, actualizando el Ránking Elite de forma instantánea.
