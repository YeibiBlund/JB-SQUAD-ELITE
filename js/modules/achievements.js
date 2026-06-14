/**
 * JB-SQUAD ELITE - Achievements Engine
 * v67.0 - Motor Dinámico de Logros
 */

(function() {
    'use strict';

    // Iconos de FontAwesome 6 (Clases) en lugar de SVGs fijos
    const ICON = {
        GOAL: `<i class="fa-solid fa-futbol"></i>`,
        GOAL_MATCH: `<i class="fa-solid fa-fire-flame-curved"></i>`,
        OFFICIAL: `<i class="fa-solid fa-trophy"></i>`,
        ASSIST: `<i class="fa-solid fa-shoe-prints"></i>`,
        STREAK: `<i class="fa-solid fa-bolt"></i>`,
        STREAK_FIRE: `<i class="fa-solid fa-meteor"></i>`,
        SHIELD: `<i class="fa-solid fa-shield-halved"></i>`,
        FWD: `<i class="fa-solid fa-crosshairs"></i>`,
        MID: `<i class="fa-solid fa-compass"></i>`,
        DEF: `<i class="fa-solid fa-shield-halved"></i>`,
        STAR: `<i class="fa-solid fa-star"></i>`,
        CROWN: `<i class="fa-solid fa-crown"></i>`,
        CALENDAR: `<i class="fa-solid fa-calendar-check"></i>`
    };

    // Tiers Config
    const TIERS = {
        bronze: { name: 'Común', weight: 1 },
        silver: { name: 'Raro', weight: 2 },
        gold: { name: 'Épico', weight: 3 },
        platinum: { name: 'Legendario', weight: 4 },
        ruby: { name: 'Mítico', weight: 5 }
    };

    window.AchievementsDB = [
        // --- 1. GOLES TOTALES ---
        { id: 'g_10', family: 'goals_total', title: 'Goleador Novato', desc: 'Alcanza los 10 goles totales.', tier: 'bronze', iconSvg: ICON.GOAL, check: (p, ctx) => ctx.totalGoals >= 10, progress: (p, ctx) => ({ cur: ctx.totalGoals, max: 10 }) },
        { id: 'g_20', family: 'goals_total', title: 'Goleador Consagrado', desc: 'Alcanza los 20 goles totales.', tier: 'silver', iconSvg: ICON.GOAL, check: (p, ctx) => ctx.totalGoals >= 20, progress: (p, ctx) => ({ cur: ctx.totalGoals, max: 20 }) },
        { id: 'g_50', family: 'goals_total', title: 'Leyenda del Gol', desc: 'Alcanza los 50 goles totales.', tier: 'gold', iconSvg: ICON.GOAL, check: (p, ctx) => ctx.totalGoals >= 50, progress: (p, ctx) => ({ cur: ctx.totalGoals, max: 50 }) },
        { id: 'g_100', family: 'goals_total', title: 'Depredador del Área', desc: 'Alcanza los 100 goles totales.', tier: 'platinum', iconSvg: ICON.GOAL, check: (p, ctx) => ctx.totalGoals >= 100, progress: (p, ctx) => ({ cur: ctx.totalGoals, max: 100 }) },
        { id: 'g_200', family: 'goals_total', title: 'Dios del Fútbol', desc: 'Alcanza los 200 goles totales.', tier: 'ruby', iconSvg: ICON.GOAL, check: (p, ctx) => ctx.totalGoals >= 200, progress: (p, ctx) => ({ cur: ctx.totalGoals, max: 200 }) },
        
        // --- 2. GOLES EN UN PARTIDO ---
        { id: 'g_match_2', family: 'goals_match', title: 'Doblete Mágico', desc: 'Marca 2 goles en un solo partido.', tier: 'bronze', iconSvg: ICON.GOAL_MATCH, check: (p, ctx) => ctx.maxGoalsInOneMatch >= 2 },
        { id: 'g_match_3', family: 'goals_match', title: 'Hat-Trick Hero', desc: 'Marca 3 goles en un solo partido.', tier: 'silver', iconSvg: ICON.GOAL_MATCH, check: (p, ctx) => ctx.maxGoalsInOneMatch >= 3 },
        { id: 'g_match_4', family: 'goals_match', title: 'Póker Brillante', desc: 'Marca 4 goles en un solo partido.', tier: 'gold', iconSvg: ICON.GOAL_MATCH, check: (p, ctx) => ctx.maxGoalsInOneMatch >= 4 },
        { id: 'g_match_5', family: 'goals_match', title: 'Repóker Divino', desc: 'Marca 5 goles en un solo partido.', tier: 'platinum', iconSvg: ICON.GOAL_MATCH, check: (p, ctx) => ctx.maxGoalsInOneMatch >= 5 },

        // --- 3. RENDIMIENTO OFICIAL ---
        { id: 'off_g_10', family: 'off_goals', title: 'Jugador de Torneos', desc: 'Marca 10 goles en partidos Oficiales.', tier: 'silver', iconSvg: ICON.OFFICIAL, check: (p, ctx) => ctx.officialGoals >= 10, progress: (p, ctx) => ({ cur: ctx.officialGoals, max: 10 }) },
        { id: 'off_g_25', family: 'off_goals', title: 'Héroe del Ascenso', desc: 'Marca 25 goles en partidos Oficiales.', tier: 'gold', iconSvg: ICON.OFFICIAL, check: (p, ctx) => ctx.officialGoals >= 25, progress: (p, ctx) => ({ cur: ctx.officialGoals, max: 25 }) },
        { id: 'off_g_50', family: 'off_goals', title: 'Mito Competitivo', desc: 'Marca 50 goles en partidos Oficiales.', tier: 'platinum', iconSvg: ICON.OFFICIAL, check: (p, ctx) => ctx.officialGoals >= 50, progress: (p, ctx) => ({ cur: ctx.officialGoals, max: 50 }) },
        { id: 'off_g_100', family: 'off_goals', title: 'Leyenda Competitiva', desc: 'Marca 100 goles en partidos Oficiales.', tier: 'ruby', iconSvg: ICON.OFFICIAL, check: (p, ctx) => ctx.officialGoals >= 100, progress: (p, ctx) => ({ cur: ctx.officialGoals, max: 100 }) },
        { id: 'off_g_match_3', family: 'off_match', title: 'Hat-Trick Oficial', desc: 'Marca 3 goles en un único partido Oficial.', tier: 'platinum', iconSvg: ICON.OFFICIAL, check: (p, ctx) => ctx.maxOfficialGoalsInOneMatch >= 3 },
        { id: 'off_a_10', family: 'off_assists', title: 'Pase de Oro', desc: 'Reparte 10 asistencias en partidos Oficiales.', tier: 'silver', iconSvg: ICON.OFFICIAL, check: (p, ctx) => ctx.officialAssists >= 10, progress: (p, ctx) => ({ cur: ctx.officialAssists, max: 10 }) },
        { id: 'off_a_25', family: 'off_assists', title: 'Director de Orquesta', desc: 'Reparte 25 asistencias en partidos Oficiales.', tier: 'gold', iconSvg: ICON.OFFICIAL, check: (p, ctx) => ctx.officialAssists >= 25, progress: (p, ctx) => ({ cur: ctx.officialAssists, max: 25 }) },
        { id: 'off_a_50', family: 'off_assists', title: 'Rey de la Asistencia', desc: 'Reparte 50 asistencias en partidos Oficiales.', tier: 'platinum', iconSvg: ICON.OFFICIAL, check: (p, ctx) => ctx.officialAssists >= 50, progress: (p, ctx) => ({ cur: ctx.officialAssists, max: 50 }) },

        // --- 4. ASISTENCIAS TOTALES ---
        { id: 'a_10', family: 'assists_total', title: 'Visión Periférica', desc: 'Alcanza las 10 asistencias totales.', tier: 'bronze', iconSvg: ICON.ASSIST, check: (p, ctx) => ctx.totalAssists >= 10, progress: (p, ctx) => ({ cur: ctx.totalAssists, max: 10 }) },
        { id: 'a_20', family: 'assists_total', title: 'Playmaker', desc: 'Alcanza las 20 asistencias totales.', tier: 'silver', iconSvg: ICON.ASSIST, check: (p, ctx) => ctx.totalAssists >= 20, progress: (p, ctx) => ({ cur: ctx.totalAssists, max: 20 }) },
        { id: 'a_50', family: 'assists_total', title: 'Socio Perfecto', desc: 'Alcanza las 50 asistencias totales.', tier: 'gold', iconSvg: ICON.ASSIST, check: (p, ctx) => ctx.totalAssists >= 50, progress: (p, ctx) => ({ cur: ctx.totalAssists, max: 50 }) },
        { id: 'a_100', family: 'assists_total', title: 'Mago del Balón', desc: 'Alcanza las 100 asistencias totales.', tier: 'platinum', iconSvg: ICON.ASSIST, check: (p, ctx) => ctx.totalAssists >= 100, progress: (p, ctx) => ({ cur: ctx.totalAssists, max: 100 }) },
        { id: 'a_200', family: 'assists_total', title: 'El Titiritero', desc: 'Alcanza las 200 asistencias totales.', tier: 'ruby', iconSvg: ICON.ASSIST, check: (p, ctx) => ctx.totalAssists >= 200, progress: (p, ctx) => ({ cur: ctx.totalAssists, max: 200 }) },
        { id: 'a_match_3', title: 'Asistente Letal', desc: 'Reparte 3 asistencias en un mismo partido.', tier: 'gold', iconSvg: ICON.ASSIST, check: (p, ctx) => ctx.maxAssistsInOneMatch >= 3 },
        
        // Las rachas por jornada se han movido a la sección "Rachas Activas" (Estado de Forma)
        // y ya no forman parte de la vitrina estática permanente.
        
        // --- 6. RENDIMIENTO POSICIONAL ---
        { id: 'pos_fwd_15', family: 'goals_fwd', title: 'Killer del Área', desc: 'Marca 15 goles como Delantero.', tier: 'silver', iconSvg: ICON.FWD, check: (p, ctx) => ctx.goalsAsFwd >= 15, progress: (p, ctx) => ({ cur: ctx.goalsAsFwd, max: 15 }) },
        { id: 'pos_fwd_30', family: 'goals_fwd', title: 'Punta de Lanza', desc: 'Marca 30 goles como Delantero.', tier: 'gold', iconSvg: ICON.FWD, check: (p, ctx) => ctx.goalsAsFwd >= 30, progress: (p, ctx) => ({ cur: ctx.goalsAsFwd, max: 30 }) },
        { id: 'pos_fwd_ast_10', family: 'ast_fwd', title: 'Falso 9', desc: 'Da 10 asistencias como Delantero.', tier: 'silver', iconSvg: ICON.FWD, check: (p, ctx) => ctx.assistsAsFwd >= 10, progress: (p, ctx) => ({ cur: ctx.assistsAsFwd, max: 10 }) },
        { id: 'pos_fwd_ast_25', family: 'ast_fwd', title: 'Extremo Letal', desc: 'Da 25 asistencias como Delantero.', tier: 'gold', iconSvg: ICON.FWD, check: (p, ctx) => ctx.assistsAsFwd >= 25, progress: (p, ctx) => ({ cur: ctx.assistsAsFwd, max: 25 }) },
        
        { id: 'pos_mid_15', family: 'goals_mid', title: 'Motor del Equipo', desc: 'Marca 15 goles como Medio.', tier: 'silver', iconSvg: ICON.MID, check: (p, ctx) => ctx.goalsAsMid >= 15, progress: (p, ctx) => ({ cur: ctx.goalsAsMid, max: 15 }) },
        { id: 'pos_mid_30', family: 'goals_mid', title: 'El Todocampista', desc: 'Marca 30 goles como Medio.', tier: 'gold', iconSvg: ICON.MID, check: (p, ctx) => ctx.goalsAsMid >= 30, progress: (p, ctx) => ({ cur: ctx.goalsAsMid, max: 30 }) },
        { id: 'pos_mid_ast_10', family: 'ast_mid', title: 'Visión Privilegiada', desc: 'Da 10 asistencias como Medio.', tier: 'silver', iconSvg: ICON.MID, check: (p, ctx) => ctx.assistsAsMid >= 10, progress: (p, ctx) => ({ cur: ctx.assistsAsMid, max: 10 }) },
        { id: 'pos_mid_ast_25', family: 'ast_mid', title: 'Maestro Titiritero', desc: 'Da 25 asistencias como Medio.', tier: 'gold', iconSvg: ICON.MID, check: (p, ctx) => ctx.assistsAsMid >= 25, progress: (p, ctx) => ({ cur: ctx.assistsAsMid, max: 25 }) },
        
        { id: 'pos_def_5', family: 'goals_def', title: 'Defensa Goleador', desc: 'Marca 5 goles como Defensa.', tier: 'silver', iconSvg: ICON.DEF, check: (p, ctx) => ctx.goalsAsDef >= 5, progress: (p, ctx) => ({ cur: ctx.goalsAsDef, max: 5 }) },
        { id: 'pos_def_10', family: 'goals_def', title: 'El Káiser', desc: 'Marca 10 goles como Defensa.', tier: 'gold', iconSvg: ICON.DEF, check: (p, ctx) => ctx.goalsAsDef >= 10, progress: (p, ctx) => ({ cur: ctx.goalsAsDef, max: 10 }) },
        { id: 'pos_def_ast_10', family: 'ast_def', title: 'Lateral Profundo', desc: 'Reparte 10 asistencias como Defensa.', tier: 'silver', iconSvg: ICON.DEF, check: (p, ctx) => ctx.assistsAsDef >= 10, progress: (p, ctx) => ({ cur: ctx.assistsAsDef, max: 10 }) },

        // --- 7. MVP Y HÍBRIDOS ---
        { id: 'hyb_gk_cs_5', family: 'cs_gk', title: 'Cerrojo bajo palos', desc: '5 porterías a cero como Portero.', tier: 'silver', iconSvg: ICON.SHIELD, check: (p, ctx) => ctx.cleanSheetsAsGK >= 5, progress: (p, ctx) => ({ cur: ctx.cleanSheetsAsGK, max: 5 }) },
        { id: 'hyb_def_cs_10', family: 'cs_def', title: 'Muro de Contención', desc: '10 porterías a cero como Defensa.', tier: 'gold', iconSvg: ICON.SHIELD, check: (p, ctx) => ctx.cleanSheetsAsDef >= 10, progress: (p, ctx) => ({ cur: ctx.cleanSheetsAsDef, max: 10 }) },
        { id: 'hyb_goal_ast_1', title: 'Hombre Orquesta', desc: 'Gol y asistencia en un mismo partido.', tier: 'silver', iconSvg: ICON.STAR, check: (p, ctx) => ctx.hasGoalAndAssistSameMatch },
        { id: 'hyb_def_goal_cs', title: 'Defensa Total', desc: 'Portería a cero y gol como Defensa (1 partido).', tier: 'platinum', iconSvg: ICON.SHIELD, check: (p, ctx) => ctx.hasDefGoalAndCSSameMatch },
        { id: 'hyb_mvp_1_1', title: 'Dominio Absoluto', desc: 'MVP, gol y asistencia en un mismo partido.', tier: 'platinum', iconSvg: ICON.CROWN, check: (p, ctx) => ctx.hasMvpGoalAssistSameMatch },
        
        { id: 'mvp_gk', family: 'mvp_pos', title: 'El Santo', desc: 'MVP jugando como Portero.', tier: 'gold', iconSvg: ICON.CROWN, check: (p, ctx) => ctx.mvpsAsGK >= 1 },
        { id: 'mvp_def', family: 'mvp_pos', title: 'Mariscal de Campo', desc: 'MVP jugando de Defensa.', tier: 'gold', iconSvg: ICON.CROWN, check: (p, ctx) => ctx.mvpsAsDef >= 1 },
        { id: 'mvp_mid', family: 'mvp_pos', title: 'Dueño del Ritmo', desc: 'MVP jugando como Medio.', tier: 'gold', iconSvg: ICON.CROWN, check: (p, ctx) => ctx.mvpsAsMid >= 1 },
        { id: 'mvp_fwd', family: 'mvp_pos', title: 'La Estrella', desc: 'MVP jugando de Delantero.', tier: 'gold', iconSvg: ICON.CROWN, check: (p, ctx) => ctx.mvpsAsFwd >= 1 },
        { id: 'mvp_god', family: 'mvp_god', title: 'Dios del Partido', desc: 'MVP con 3 goles y 2 asistencias.', tier: 'ruby', iconSvg: ICON.CROWN, check: (p, ctx) => ctx.hasGodModeMvp },

        // --- COMPROMISO ---
        { id: 'com_3_yes', family: 'com_total', title: 'Fijo en el 11', desc: 'Vota SÍ en 5 convocatorias seguidas.', tier: 'bronze', iconSvg: ICON.CALENDAR, check: (p, ctx) => ctx.maxConsecutiveYes >= 5, progress: (p, ctx) => ({ cur: ctx.maxConsecutiveYes, max: 5 }) },
        { id: 'com_5_yes', family: 'com_total', title: 'Soldado de Club', desc: 'Vota SÍ en 10 convocatorias seguidas.', tier: 'silver', iconSvg: ICON.CALENDAR, check: (p, ctx) => ctx.maxConsecutiveYes >= 10, progress: (p, ctx) => ({ cur: ctx.maxConsecutiveYes, max: 10 }) },
        { id: 'com_20_yes_streak', family: 'com_total', title: 'Sangre de Capitán', desc: 'Vota SÍ en 20 convocatorias seguidas.', tier: 'gold', iconSvg: ICON.CALENDAR, check: (p, ctx) => ctx.maxConsecutiveYes >= 20, progress: (p, ctx) => ({ cur: ctx.maxConsecutiveYes, max: 20 }) },
        { id: 'com_20_yes', family: 'com_total_global', title: 'Leyenda del Vestuario', desc: '30 convocatorias totales votando SÍ.', tier: 'gold', iconSvg: ICON.CALENDAR, check: (p, ctx) => ctx.totalYesVotes >= 30, progress: (p, ctx) => ({ cur: ctx.totalYesVotes, max: 30 }) },
        { id: 'com_fid_80', family: 'com_fid', title: 'Fidelidad Absoluta', desc: 'Asistencia > 80% (mín. 20 conv).', tier: 'gold', iconSvg: ICON.STAR, check: (p, ctx) => ctx.totalVotes >= 20 && (ctx.totalYesVotes / ctx.totalVotes >= 0.8) },
        { id: 'com_fid_90', family: 'com_fid', title: 'Incondicional', desc: 'Asistencia > 90% (mín. 40 conv).', tier: 'platinum', iconSvg: ICON.CROWN, check: (p, ctx) => ctx.totalVotes >= 40 && (ctx.totalYesVotes / ctx.totalVotes >= 0.9) },

        // --- 9. API EA: PASES Y PRECISIÓN ---
        { id: 'ea_pass_500', family: 'ea_passes', title: 'Distribuidor', desc: 'Acumula 500 pases completados.', tier: 'bronze', iconSvg: ICON.STAR, check: (p, ctx) => ctx.totalPasses >= 500, progress: (p, ctx) => ({ cur: ctx.totalPasses, max: 500 }) },
        { id: 'ea_pass_1000', family: 'ea_passes', title: 'El Metrónomo', desc: 'Acumula 1.000 pases completados.', tier: 'silver', iconSvg: ICON.STAR, check: (p, ctx) => ctx.totalPasses >= 1000, progress: (p, ctx) => ({ cur: ctx.totalPasses, max: 1000 }) },
        { id: 'ea_pass_2500', family: 'ea_passes', title: 'Reloj Suizo', desc: 'Acumula 2.500 pases completados.', tier: 'gold', iconSvg: ICON.STAR, check: (p, ctx) => ctx.totalPasses >= 2500, progress: (p, ctx) => ({ cur: ctx.totalPasses, max: 2500 }) },
        { id: 'ea_pass_5000', family: 'ea_passes', title: 'Arquitecto', desc: 'Acumula 5.000 pases completados.', tier: 'platinum', iconSvg: ICON.STAR, check: (p, ctx) => ctx.totalPasses >= 5000, progress: (p, ctx) => ({ cur: ctx.totalPasses, max: 5000 }) },
        { id: 'ea_pass_10000', family: 'ea_passes', title: 'Dios del Pase', desc: 'Acumula 10.000 pases completados.', tier: 'ruby', iconSvg: ICON.STAR, check: (p, ctx) => ctx.totalPasses >= 10000, progress: (p, ctx) => ({ cur: ctx.totalPasses, max: 10000 }) },

        { id: 'ea_prec_1', family: 'ea_prec', title: 'Pase Seguro', desc: '>90% precisión en 1 Jornada (mín. 15 pases).', tier: 'bronze', iconSvg: ICON.STAR, check: (p, ctx) => ctx.perfectPassSessions >= 1, progress: (p, ctx) => ({ cur: ctx.perfectPassSessions, max: 1 }) },
        { id: 'ea_prec_5', family: 'ea_prec', title: 'Francotirador', desc: '>90% precisión en 5 Jornadas (mín. 15 pases).', tier: 'silver', iconSvg: ICON.STAR, check: (p, ctx) => ctx.perfectPassSessions >= 5, progress: (p, ctx) => ({ cur: ctx.perfectPassSessions, max: 5 }) },
        { id: 'ea_prec_10', family: 'ea_prec', title: 'Cirujano', desc: '>90% precisión en 10 Jornadas (mín. 15 pases).', tier: 'gold', iconSvg: ICON.STAR, check: (p, ctx) => ctx.perfectPassSessions >= 10, progress: (p, ctx) => ({ cur: ctx.perfectPassSessions, max: 10 }) },
        { id: 'ea_prec_20', family: 'ea_prec', title: 'Francotirador de Élite', desc: '>90% precisión en 20 Jornadas (mín. 15 pases).', tier: 'platinum', iconSvg: ICON.STAR, check: (p, ctx) => ctx.perfectPassSessions >= 20, progress: (p, ctx) => ({ cur: ctx.perfectPassSessions, max: 20 }) },
        { id: 'ea_prec_30', family: 'ea_prec', title: 'Inmune a la Presión', desc: '>90% precisión en 30 Jornadas (mín. 15 pases).', tier: 'ruby', iconSvg: ICON.STAR, check: (p, ctx) => ctx.perfectPassSessions >= 30, progress: (p, ctx) => ({ cur: ctx.perfectPassSessions, max: 30 }) },

        // --- 10. API EA: ENTRADAS (DEFENSA) ---
        { id: 'ea_tack_30', family: 'ea_tackles', title: 'El Ladrón', desc: 'Acumula 30 entradas con éxito.', tier: 'bronze', iconSvg: ICON.DEF, check: (p, ctx) => ctx.totalTackles >= 30, progress: (p, ctx) => ({ cur: ctx.totalTackles, max: 30 }) },
        { id: 'ea_tack_100', family: 'ea_tackles', title: 'El Muro', desc: 'Acumula 100 entradas con éxito.', tier: 'silver', iconSvg: ICON.DEF, check: (p, ctx) => ctx.totalTackles >= 100, progress: (p, ctx) => ({ cur: ctx.totalTackles, max: 100 }) },
        { id: 'ea_tack_200', family: 'ea_tackles', title: 'Aspiradora', desc: 'Acumula 200 entradas con éxito.', tier: 'gold', iconSvg: ICON.DEF, check: (p, ctx) => ctx.totalTackles >= 200, progress: (p, ctx) => ({ cur: ctx.totalTackles, max: 200 }) },
        { id: 'ea_tack_300', family: 'ea_tackles', title: 'Cortacésped', desc: 'Acumula 300 entradas con éxito.', tier: 'platinum', iconSvg: ICON.DEF, check: (p, ctx) => ctx.totalTackles >= 300, progress: (p, ctx) => ({ cur: ctx.totalTackles, max: 300 }) },
        { id: 'ea_tack_400', family: 'ea_tackles', title: 'Muro de Hierro', desc: 'Acumula 400 entradas con éxito.', tier: 'ruby', iconSvg: ICON.DEF, check: (p, ctx) => ctx.totalTackles >= 400, progress: (p, ctx) => ({ cur: ctx.totalTackles, max: 400 }) },

        // --- 11. API EA: CALIFICACIÓN PERFECTA ---
        { id: 'ea_rat_3', family: 'ea_rating10', title: 'Partido Perfecto', desc: 'Lograr una nota de 10.0 en 3 partidos.', tier: 'bronze', iconSvg: ICON.STAR, check: (p, ctx) => ctx.totalRating10 >= 3, progress: (p, ctx) => ({ cur: ctx.totalRating10, max: 3 }) },
        { id: 'ea_rat_10', family: 'ea_rating10', title: 'Clase Magistral', desc: 'Lograr una nota de 10.0 en 10 partidos.', tier: 'silver', iconSvg: ICON.STAR, check: (p, ctx) => ctx.totalRating10 >= 10, progress: (p, ctx) => ({ cur: ctx.totalRating10, max: 10 }) },
        { id: 'ea_rat_15', family: 'ea_rating10', title: 'Profesor del Balón', desc: 'Lograr una nota de 10.0 en 15 partidos.', tier: 'gold', iconSvg: ICON.STAR, check: (p, ctx) => ctx.totalRating10 >= 15, progress: (p, ctx) => ({ cur: ctx.totalRating10, max: 15 }) },
        { id: 'ea_rat_20', family: 'ea_rating10', title: 'Cátedra Futbolística', desc: 'Lograr una nota de 10.0 en 20 partidos.', tier: 'platinum', iconSvg: ICON.STAR, check: (p, ctx) => ctx.totalRating10 >= 20, progress: (p, ctx) => ({ cur: ctx.totalRating10, max: 20 }) },
        { id: 'ea_rat_30', family: 'ea_rating10', title: 'Garganta Profunda', desc: 'Lograr una nota de 10.0 en 30 partidos.', tier: 'ruby', iconSvg: ICON.STAR, check: (p, ctx) => ctx.totalRating10 >= 30, progress: (p, ctx) => ({ cur: ctx.totalRating10, max: 30 }) },

        // --- 12. MVP SILENCIOSO ---
        { id: 'ea_mvp_sil_1', family: 'ea_silent_mvp', title: 'Héroe Anónimo', desc: 'Ser MVP sin marcar ni asistir (1 partido).', tier: 'bronze', iconSvg: ICON.CROWN, check: (p, ctx) => ctx.silentMvps >= 1, progress: (p, ctx) => ({ cur: ctx.silentMvps, max: 1 }) },
        { id: 'ea_mvp_sil_5', family: 'ea_silent_mvp', title: 'Eje del Equipo', desc: 'Ser MVP sin marcar ni asistir (5 partidos).', tier: 'silver', iconSvg: ICON.CROWN, check: (p, ctx) => ctx.silentMvps >= 5, progress: (p, ctx) => ({ cur: ctx.silentMvps, max: 5 }) },
        { id: 'ea_mvp_sil_10', family: 'ea_silent_mvp', title: 'Jugador de Club', desc: 'Ser MVP sin marcar ni asistir (10 partidos).', tier: 'gold', iconSvg: ICON.CROWN, check: (p, ctx) => ctx.silentMvps >= 10, progress: (p, ctx) => ({ cur: ctx.silentMvps, max: 10 }) },
        { id: 'ea_mvp_sil_15', family: 'ea_silent_mvp', title: 'Motor Invisible', desc: 'Ser MVP sin marcar ni asistir (15 partidos).', tier: 'platinum', iconSvg: ICON.CROWN, check: (p, ctx) => ctx.silentMvps >= 15, progress: (p, ctx) => ({ cur: ctx.silentMvps, max: 15 }) },
        { id: 'ea_mvp_sil_20', family: 'ea_silent_mvp', title: 'Leyenda en la Sombra', desc: 'Ser MVP sin marcar ni asistir (20 partidos).', tier: 'ruby', iconSvg: ICON.CROWN, check: (p, ctx) => ctx.silentMvps >= 20, progress: (p, ctx) => ({ cur: ctx.silentMvps, max: 20 }) },

        // --- 13. API EA: PORTEROS (PARADAS) ---
        { id: 'ea_gk_sv_50', family: 'ea_gk_saves', title: 'El Pulpo', desc: 'Acumula 50 paradas.', tier: 'bronze', iconSvg: ICON.SHIELD, check: (p, ctx) => ctx.totalSaves >= 50, progress: (p, ctx) => ({ cur: ctx.totalSaves, max: 50 }) },
        { id: 'ea_gk_sv_150', family: 'ea_gk_saves', title: 'Reflejos Felinos', desc: 'Acumula 150 paradas.', tier: 'silver', iconSvg: ICON.SHIELD, check: (p, ctx) => ctx.totalSaves >= 150, progress: (p, ctx) => ({ cur: ctx.totalSaves, max: 150 }) },
        { id: 'ea_gk_sv_300', family: 'ea_gk_saves', title: 'Araña Negra', desc: 'Acumula 300 paradas.', tier: 'gold', iconSvg: ICON.SHIELD, check: (p, ctx) => ctx.totalSaves >= 300, progress: (p, ctx) => ({ cur: ctx.totalSaves, max: 300 }) },
        { id: 'ea_gk_sv_500', family: 'ea_gk_saves', title: 'Muro de Goma', desc: 'Acumula 500 paradas.', tier: 'platinum', iconSvg: ICON.SHIELD, check: (p, ctx) => ctx.totalSaves >= 500, progress: (p, ctx) => ({ cur: ctx.totalSaves, max: 500 }) },
        { id: 'ea_gk_sv_1000', family: 'ea_gk_saves', title: 'San Pedro', desc: 'Acumula 1.000 paradas.', tier: 'ruby', iconSvg: ICON.SHIELD, check: (p, ctx) => ctx.totalSaves >= 1000, progress: (p, ctx) => ({ cur: ctx.totalSaves, max: 1000 }) },
        
        { id: 'ea_gk_match_8', family: 'ea_gk_match', title: 'Manos Mágicas', desc: 'Realiza 8 paradas en un solo partido.', tier: 'silver', iconSvg: ICON.SHIELD, check: (p, ctx) => ctx.maxSavesInOneMatch >= 8 },
        { id: 'ea_gk_match_12', family: 'ea_gk_match', title: 'Modo Pulpo', desc: 'Realiza 12 paradas en un solo partido.', tier: 'gold', iconSvg: ICON.SHIELD, check: (p, ctx) => ctx.maxSavesInOneMatch >= 12 },
        { id: 'ea_gk_match_15_cs', title: 'Milagro en la Portería', desc: '15+ paradas en un partido y Portería a Cero.', tier: 'platinum', iconSvg: ICON.SHIELD, check: (p, ctx) => ctx.hasSaves15AndCS },

        // --- 14. API EA: DEFENSA EFICIENTE ---
        { id: 'ea_def_prec_5', family: 'ea_def_prec', title: 'Corte Limpio', desc: '100% éxito en entradas en 5 jornadas (mín. 5/jornada).', tier: 'silver', iconSvg: ICON.DEF, check: (p, ctx) => ctx.perfectTackleSessions >= 5, progress: (p, ctx) => ({ cur: ctx.perfectTackleSessions, max: 5 }) },
        { id: 'ea_def_prec_15', family: 'ea_def_prec', title: 'Cirujano Defensivo', desc: '100% éxito en entradas en 15 jornadas (mín. 5/jornada).', tier: 'gold', iconSvg: ICON.DEF, check: (p, ctx) => ctx.perfectTackleSessions >= 15, progress: (p, ctx) => ({ cur: ctx.perfectTackleSessions, max: 15 }) },
        { id: 'ea_def_prec_30', family: 'ea_def_prec', title: 'El Elegante', desc: '100% éxito en entradas en 30 jornadas (mín. 5/jornada).', tier: 'ruby', iconSvg: ICON.DEF, check: (p, ctx) => ctx.perfectTackleSessions >= 30, progress: (p, ctx) => ({ cur: ctx.perfectTackleSessions, max: 30 }) },

        // --- 15. API EA: CENTROCAMPISTAS ---
        { id: 'ea_mid_pass_30', family: 'ea_mid_vol', title: 'Director de Orquesta', desc: 'Completa más de 30 pases en un partido.', tier: 'silver', iconSvg: ICON.MID, check: (p, ctx) => ctx.maxPassesInOneMatch >= 30 },
        { id: 'ea_mid_pass_45', family: 'ea_mid_vol', title: 'Omnipresente', desc: 'Completa más de 45 pases en un partido.', tier: 'gold', iconSvg: ICON.MID, check: (p, ctx) => ctx.maxPassesInOneMatch >= 45 },
        { id: 'ea_mid_pass_60', family: 'ea_mid_vol', title: 'Dueño del Balón', desc: 'Completa más de 60 pases en un partido.', tier: 'platinum', iconSvg: ICON.MID, check: (p, ctx) => ctx.maxPassesInOneMatch >= 60 },
        { id: 'ea_mid_masterclass', title: 'Masterclass', desc: 'MVP y 100% de precisión de pase (mín. 15 intentos).', tier: 'platinum', iconSvg: ICON.CROWN, check: (p, ctx) => ctx.hasMasterclassMatch },

        // --- 16. API EA: DELANTEROS EXÓTICOS ---
        { id: 'ea_fwd_killer_3', family: 'ea_fwd_killer', title: 'Depredador Silencioso', desc: 'Marcar 3 goles dando 5 pases o menos en el partido.', tier: 'gold', iconSvg: ICON.FWD, check: (p, ctx) => ctx.hasSilentKillerMatch },
        { id: 'ea_fwd_altruism_3', family: 'ea_fwd_alt', title: 'Solidaridad Ofensiva', desc: 'Como DC o Extremo: 3 asistencias y 0 goles.', tier: 'silver', iconSvg: ICON.FWD, check: (p, ctx) => ctx.hasExtremeAltruismMatch }
    ];

    /**
     * Motor de Cálculo de Logros.
     * Analiza el historial de un jugador y devuelve los IDs de los logros desbloqueados.
     */
    window.calculatePlayerAchievements = async function(player, globalState, forceRecalc = false) {
        if (!player || !globalState) return { unlockedIds: [], ctx: null };

        // Hybrid Architecture: Leer desde Supabase si existe (0ms load time)
        if (!forceRecalc && player.achievements_cache && Array.isArray(player.achievements_cache.unlockedIds)) {
            return {
                unlockedIds: player.achievements_cache.unlockedIds,
                ctx: player.achievements_cache.ctx
            };
        }
        
        let ctx = {
            totalGoals: 0,
            totalAssists: 0,
            officialGoals: 0,
            officialAssists: 0,
            maxGoalsInOneMatch: 0,
            maxOfficialGoalsInOneMatch: 0,
            maxAssistsInOneMatch: 0,
            goalsAsDef: 0,
            goalsAsMid: 0,
            goalsAsFwd: 0,
            assistsAsDef: 0,
            assistsAsMid: 0,
            assistsAsFwd: 0,
            cleanSheetsAsGK: 0,
            cleanSheetsAsDef: 0,
            hasGoalAndAssistSameMatch: false,
            hasMvpGoalAssistSameMatch: false,
            hasDefGoalAndCSSameMatch: false,
            hasGodModeMvp: false,
            mvpsAsGK: 0,
            mvpsAsDef: 0,
            mvpsAsMid: 0,
            mvpsAsFwd: 0,
            totalYesVotes: 0,
            totalVotes: 0,
            maxConsecutiveYes: 0,
            currentConsecutiveYes: 0,
            
            // Rachas por JORNADA (Session)
            maxSessionGoalStreak: 0,
            maxSessionAssistStreak: 0,
            maxSessionCSStreak: 0,

            // Variables API EA
            totalPasses: 0,
            totalTackles: 0,
            totalRating10: 0,
            silentMvps: 0,
            perfectPassSessions: 0,
            
            // Expandidas API EA
            totalSaves: 0,
            maxSavesInOneMatch: 0,
            hasSaves15AndCS: false,
            perfectTackleSessions: 0,
            maxPassesInOneMatch: 0,
            hasMasterclassMatch: false,
            hasSilentKillerMatch: false,
            hasExtremeAltruismMatch: false
        };

        // 1. Análisis de Convocatorias (Availability Votes)
        if (player.user_id && window.supabase) {
            try {
                const { data: votes, error } = await window.supabase
                    .from('availability_votes')
                    .select(`
                        vote,
                        availability_polls (
                            scheduled_time
                        )
                    `)
                    .eq('user_id', player.user_id);
                
                if (votes && !error) {
                    const sortedVotes = votes
                        .filter(v => v.availability_polls)
                        .sort((a,b) => new Date(a.availability_polls.scheduled_time) - new Date(b.availability_polls.scheduled_time));

                    let currentConsecutiveYes = 0;
                    sortedVotes.forEach(v => {
                        ctx.totalVotes++;
                        if (v.vote === 'yes' || v.vote === 'late') {
                            ctx.totalYesVotes++;
                            currentConsecutiveYes++;
                            if (currentConsecutiveYes > ctx.maxConsecutiveYes) {
                                ctx.maxConsecutiveYes = currentConsecutiveYes;
                            }
                        } else {
                            currentConsecutiveYes = 0;
                        }
                    });
                    ctx.currentConsecutiveYes = currentConsecutiveYes;
                }
            } catch (err) {
                console.error("Error obteniendo votos para logros:", err);
            }
        }

        // 2. Análisis de Partidos y Posiciones (Sessions)
        const defPositions = ['DFC', 'LI', 'LD', 'CAI', 'CAD'];
        const midPositions = ['MCD', 'MC', 'MVI', 'MVD', 'MI', 'MD', 'MCO'];
        const fwdPositions = ['EI', 'ED', 'DC', 'SD'];
        const gkPositions = ['POR'];

        if (globalState.sessions) {
            // Asegurarnos de que las sesiones están ordenadas cronológicamente (más antiguo primero)
            const sortedSessions = [...globalState.sessions].sort((a,b) => new Date(a.date) - new Date(b.date));
            
            let currentSessGoalStreak = 0;
            let currentSessAssistStreak = 0;
            let currentSessCSStreak = 0;

            sortedSessions.forEach(sess => {
                const matches = sess.matches || [];
                const lineUpDict = (sess.lineup && sess.lineup.assignments) ? sess.lineup.assignments : {};
                const isOfficial = (sess.match_type === 'official');
                
                // Buscar la posición principal del jugador en esta sesión (si estuvo)
                let playedPos = null;
                for (const [pos, pid] of Object.entries(lineUpDict)) {
                    if (pid === player.id) {
                        playedPos = pos;
                        break;
                    }
                }

                const isDef = defPositions.includes(playedPos);
                const isMid = midPositions.includes(playedPos);
                const isFwd = fwdPositions.includes(playedPos);
                const isGK = gkPositions.includes(playedPos);
                
                let sessGoals = 0;
                let sessAssists = 0;
                let sessPlayedMatches = 0;
                let sessCSMatches = 0;

                // Nuevas variables para rastrear estadísticas EA a nivel de sesión
                let sessionPassesMade = 0;
                let sessionPassAttempts = 0;
                let sessionTacklesMade = 0;
                let sessionTackleAttempts = 0;

                matches.forEach(m => {
                    const events = m.events || [];
                    let matchGoals = 0;
                    let matchAssists = 0;

                    events.forEach(ev => {
                        if (ev.type === 'goal' && ev.scorerId === player.id) {
                            matchGoals++;
                            sessGoals++;
                            ctx.totalGoals++;
                            if (isOfficial) ctx.officialGoals++;
                            
                            if (isDef) ctx.goalsAsDef++;
                            if (isMid) ctx.goalsAsMid++;
                            if (isFwd) ctx.goalsAsFwd++;
                        }
                        if (ev.type === 'goal' && ev.assistId === player.id) {
                            matchAssists++;
                            sessAssists++;
                            ctx.totalAssists++;
                            if (isOfficial) ctx.officialAssists++;
                            
                            if (isDef) ctx.assistsAsDef++;
                            if (isMid) ctx.assistsAsMid++;
                            if (isFwd) ctx.assistsAsFwd++;
                        }
                    });

                    if (playedPos) sessPlayedMatches++;

                    // Records por partido
                    if (matchGoals > ctx.maxGoalsInOneMatch) ctx.maxGoalsInOneMatch = matchGoals;
                    if (isOfficial && matchGoals > ctx.maxOfficialGoalsInOneMatch) ctx.maxOfficialGoalsInOneMatch = matchGoals;
                    if (matchAssists > ctx.maxAssistsInOneMatch) ctx.maxAssistsInOneMatch = matchAssists;
                    if (matchGoals >= 1 && matchAssists >= 1) ctx.hasGoalAndAssistSameMatch = true;

                    // MVP (Por partido o por sesión)
                    const isMvp = (sess.mvp_id === player.id || m.mvpId === player.id); 
                    if (isMvp) {
                        if (isGK) ctx.mvpsAsGK++;
                        if (isDef) ctx.mvpsAsDef++;
                        if (isMid) ctx.mvpsAsMid++;
                        if (isFwd) ctx.mvpsAsFwd++;

                        if (matchGoals >= 1 && matchAssists >= 1) ctx.hasMvpGoalAssistSameMatch = true;
                        if (matchGoals >= 3 && matchAssists >= 2) ctx.hasGodModeMvp = true;

                        // MVP Silencioso
                        if (matchGoals === 0 && matchAssists === 0) ctx.silentMvps++;
                    }

                    // --- Extracción de Datos API EA ---
                    if (m.eaPlayers && m.eaPlayers[player.id]) {
                        const eaStats = m.eaPlayers[player.id];
                        
                        // Pases
                        const passesMade = parseInt(eaStats.passesmade) || 0;
                        const passAttempts = parseInt(eaStats.passattempts) || 0;
                        ctx.totalPasses += passesMade;
                        sessionPassesMade += passesMade;
                        sessionPassAttempts += passAttempts;
                        
                        if (passesMade > ctx.maxPassesInOneMatch) ctx.maxPassesInOneMatch = passesMade;

                        // Entradas
                        const tacklesMade = parseInt(eaStats.tacklesmade) || 0;
                        const tackleAttempts = parseInt(eaStats.tackleattempts) || 0;
                        ctx.totalTackles += tacklesMade;
                        sessionTacklesMade += tacklesMade;
                        sessionTackleAttempts += tackleAttempts;

                        // Paradas
                        const saves = parseInt(eaStats.saves) || 0;
                        ctx.totalSaves += saves;
                        if (saves > ctx.maxSavesInOneMatch) ctx.maxSavesInOneMatch = saves;
                        
                        const rGoals = m.scoreAway || 0;
                        if (saves >= 15 && rGoals === 0) ctx.hasSaves15AndCS = true;

                        // Nota perfecta
                        if (eaStats.rating === '10.0' || eaStats.rating === 10) {
                            ctx.totalRating10++;
                        }
                        
                        // Masterclass & Asesino Silencioso
                        if (isMvp && passAttempts >= 15 && passesMade === passAttempts) ctx.hasMasterclassMatch = true;
                        if (matchGoals >= 3 && passAttempts <= 5) ctx.hasSilentKillerMatch = true;
                    }
                    
                    // Altruismo FWD
                    if (isFwd && matchAssists >= 3 && matchGoals === 0) ctx.hasExtremeAltruismMatch = true;

                    // Porterías a cero
                    const rivalGoals = m.scoreAway || 0;
                    if (rivalGoals === 0 && playedPos) { 
                        sessCSMatches++;
                        if (isGK) ctx.cleanSheetsAsGK++;
                        if (isDef) {
                            ctx.cleanSheetsAsDef++;
                            if (matchGoals >= 1) ctx.hasDefGoalAndCSSameMatch = true;
                        }
                    }
                });

                // Rachas por JORNADA (Sesión)
                if (sessPlayedMatches > 0) {
                    
                    // Comprobar la precisión de pase de toda la sesión (mínimo 15 intentos)
                    if (sessionPassAttempts >= 15) {
                        const passAccuracy = sessionPassesMade / sessionPassAttempts;
                        if (passAccuracy >= 0.90) {
                            ctx.perfectPassSessions++;
                        }
                    }

                    // Eficiencia de entradas de toda la sesión (mínimo 5 intentos)
                    if (sessionTackleAttempts >= 5) {
                        if (sessionTacklesMade === sessionTackleAttempts) {
                            ctx.perfectTackleSessions++;
                        }
                    }

                    if (sessGoals > 0) {
                        currentSessGoalStreak++;
                        if (currentSessGoalStreak > ctx.maxSessionGoalStreak) ctx.maxSessionGoalStreak = currentSessGoalStreak;
                    } else {
                        currentSessGoalStreak = 0;
                    }

                    if (sessAssists > 0) {
                        currentSessAssistStreak++;
                        if (currentSessAssistStreak > ctx.maxSessionAssistStreak) ctx.maxSessionAssistStreak = currentSessAssistStreak;
                    } else {
                        currentSessAssistStreak = 0;
                    }

                    if (sessCSMatches === sessPlayedMatches && (isDef || isGK)) {
                        currentSessCSStreak++;
                        if (currentSessCSStreak > ctx.maxSessionCSStreak) ctx.maxSessionCSStreak = currentSessCSStreak;
                    } else {
                        currentSessCSStreak = 0;
                    }
                }
            });
            
            // Exportar rachas activas (NUEVO v69.0)
            ctx.currentSessionGoalStreak = currentSessGoalStreak;
            ctx.currentSessionAssistStreak = currentSessAssistStreak;
            ctx.currentSessionCSStreak = currentSessCSStreak;
        }

        // --- FALLBACK PARA ESTADÍSTICAS MANUALES O LEGACY ---
        const totalOff = player.stats?.official || {};
        const totalFri = player.stats?.friendly || {};
        
        const fallbackGoals = (totalOff.goals || 0) + (totalFri.goals || 0);
        const fallbackAssists = (totalOff.assists || 0) + (totalFri.assists || 0);
        const fallbackCleanSheets = (totalOff.cleanSheets || 0) + (totalFri.cleanSheets || 0);
        
        if (fallbackGoals > ctx.totalGoals) ctx.totalGoals = fallbackGoals;
        if (fallbackAssists > ctx.totalAssists) ctx.totalAssists = fallbackAssists;
        if ((totalOff.goals || 0) > ctx.officialGoals) ctx.officialGoals = (totalOff.goals || 0);
        if ((totalOff.assists || 0) > ctx.officialAssists) ctx.officialAssists = (totalOff.assists || 0);

        // Fallback de imbatibilidad basado en la posición natural del jugador
        if (gkPositions.includes(player.position) && fallbackCleanSheets > ctx.cleanSheetsAsGK) {
            ctx.cleanSheetsAsGK = fallbackCleanSheets;
        }
        if (defPositions.includes(player.position) && fallbackCleanSheets > ctx.cleanSheetsAsDef) {
            ctx.cleanSheetsAsDef = fallbackCleanSheets;
        }

        // 3. Chequeo de Logros
        const unlockedIds = [];
        window.AchievementsDB.forEach(ach => {
            if (ach.check(player, ctx)) {
                unlockedIds.push(ach.id);
            }
        });

        // 4. Guardar en LocalStorage para compatibilidad con código viejo (hasta que todo sea puro DB)
        const cacheKey = `jb_achievements_${player.id}`;
        try {
            localStorage.setItem(cacheKey, JSON.stringify({ unlocked: unlockedIds, timestamp: Date.now() }));
        } catch(e) {}

        return { unlockedIds, ctx };
    };

    /**
     * Devuelve el objeto completo del trofeo y añade metadatos
     */
    window.getHydratedAchievements = function(unlockedIds, player, ctx) {
        let hydrated = window.AchievementsDB.map(ach => {
            let prog = null;
            if (ach.progress && player && ctx) {
                prog = ach.progress(player, ctx);
                // Evitar que el progreso actual supere al máximo visualmente
                if (prog.cur > prog.max) prog.cur = prog.max;
            }
            let baseWeight = TIERS[ach.tier].weight;
            let priorityBonus = ach.id.startsWith('com_') ? 0 : 0.5;

            return {
                ...ach,
                unlocked: unlockedIds.includes(ach.id),
                weight: baseWeight + priorityBonus,
                progressData: prog
            };
        });

        // Filtrar redundancias: Si un jugador tiene varios logros de la misma familia desbloqueados,
        // solo mostramos el de mayor tier/peso.
        const unlockedFamilyMaxWeight = {};
        hydrated.forEach(a => {
            if (a.unlocked && a.family) {
                if (!unlockedFamilyMaxWeight[a.family] || a.weight > unlockedFamilyMaxWeight[a.family]) {
                    unlockedFamilyMaxWeight[a.family] = a.weight;
                }
            }
        });

        // Ocultar los de menor peso
        hydrated.forEach(a => {
            if (a.unlocked && a.family) {
                if (a.weight < unlockedFamilyMaxWeight[a.family]) {
                    a.isHidden = true;
                }
            }
        });

        return hydrated.filter(a => !a.isHidden);
    };

    /**
     * Abre el modal de detalle del logro y calcula la rareza global
     */
    window.openAchievementDetailModal = async function(achId, currentProgress = null) {
        const ach = window.AchievementsDB.find(a => a.id === achId);
        if (!ach) return;

        // 1. Mostrar Modal y Datos Básicos
        const modal = document.getElementById('modal-ach-details');
        document.getElementById('ach-detail-title').textContent = ach.title;
        document.getElementById('ach-detail-desc').textContent = ach.desc;
        
        const iconContainer = document.getElementById('ach-detail-icon');
        iconContainer.innerHTML = ach.iconSvg;
        iconContainer.className = `tier-${ach.tier}`;
        
        // Estilo de rareza en el icono
        const colors = { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2' };
        iconContainer.style.color = colors[ach.tier] || '#fff';
        iconContainer.style.border = `2px solid ${colors[ach.tier] || '#fff'}`;
        iconContainer.style.boxShadow = `0 0 20px ${colors[ach.tier]}80`;

        // 2. Progreso
        const progContainer = document.getElementById('ach-detail-progress-container');
        if (currentProgress && currentProgress.max > 0) {
            progContainer.style.display = 'block';
            document.getElementById('ach-detail-progress-text').textContent = `${currentProgress.cur}/${currentProgress.max}`;
            const pct = Math.min(100, Math.max(0, (currentProgress.cur / currentProgress.max) * 100));
            document.getElementById('ach-detail-progress-bar').style.width = `${pct}%`;
        } else {
            progContainer.style.display = 'none';
        }

        // 3. Resetear y Mostrar Modal
        const rarityValue = document.getElementById('ach-detail-rarity-value');
        const rarityDesc = document.getElementById('ach-detail-rarity-desc');
        rarityValue.textContent = "Calculando...";
        rarityDesc.textContent = "Revisando plantillas...";
        modal.style.display = 'flex';

        // 4. Calcular Rareza en Background
        try {
            if (!window.state || !window.state.players) throw new Error("No player data");
            
            // state.players ya contiene la plantilla completa y activa del equipo
            const activePlayers = window.state.players;
            if (activePlayers.length === 0) throw new Error("No active players");

            let unlockedCount = 0;
            
            // Cálculos paralelos para mayor velocidad
            const promises = activePlayers.map(p => window.calculatePlayerAchievements(p, window.state));
            const results = await Promise.all(promises);
            
            results.forEach(res => {
                if (res.unlockedIds.includes(ach.id)) unlockedCount++;
            });

            const percentage = ((unlockedCount / activePlayers.length) * 100).toFixed(1);
            
            rarityValue.textContent = `${percentage}%`;
            rarityDesc.textContent = `${unlockedCount} de ${activePlayers.length} jugadores lo tienen`;
            
            // Colores según rareza (0-10% legendario, 10-30% epico, >50% comun)
            if (percentage <= 10) rarityValue.style.color = '#00ffff'; // Electric Cyan
            else if (percentage <= 30) rarityValue.style.color = '#ffd700'; // Gold
            else if (percentage <= 60) rarityValue.style.color = '#c0c0c0'; // Silver
            else rarityValue.style.color = '#cd7f32'; // Bronze
        } catch (err) {
            console.error("Error calculating rarity:", err);
            rarityValue.textContent = "N/A";
            rarityDesc.textContent = "No se pudo calcular";
        }
    };

    /**
     * Recalcula todos los logros de toda la plantilla y los guarda en Supabase.
     * Llamado automáticamente al Cerrar Jornada.
     */
    window.recalculateAllAchievements = async function() {
        if (!window.state || !window.state.players || !window.supabase) return;
        
        console.log(">>> [LOGROS] Iniciando recálculo masivo en Background...");
        const promises = window.state.players.map(async (player) => {
            // Forzar recálculo pasando true
            const result = await window.calculatePlayerAchievements(player, window.state, true);
            
            // Guardar en Supabase (caché híbrido)
            if (player.id && !player.id.toString().includes('-')) {
                const cacheData = {
                    unlockedIds: result.unlockedIds,
                    ctx: result.ctx,
                    timestamp: Date.now()
                };
                
                try {
                    await window.supabase
                        .from('players')
                        .update({ achievements_cache: cacheData })
                        .eq('id', player.id);
                        
                    // Actualizar memoria local para vista instantánea
                    player.achievements_cache = cacheData;
                } catch (e) {
                    console.error(`>>> [LOGROS] Error guardando caché para ${player.name}:`, e);
                }
            }
        });
        
        await Promise.allSettled(promises);
        console.log(">>> [LOGROS] Recálculo masivo finalizado.");
    };

})();
