/**
 * JB-SQUAD ELITE: Sincronización de Datos (Supabase)
 */

/**
 * Carga todos los datos del equipo desde Supabase hacia el estado global.
 */
async function loadTeamData() {
    console.log(">>> [DATOS] Iniciando sincronización élite...");
    
    try {
        // Resetear cachés y datos locales
        window.state.players = [];
        window.state.historyCache = {}; 


        // Cargar mi ficha (AUTOGESTIÓN) - SIEMPRE
        if (state.user && state.user.auth) {
            const { data: myPlayer } = await supabase
                .from('players')
                .select('id, user_id, team_id, name, console_id, avatar_id, primary_pos, secondary_pos, dorsal, photo_url, photo_scale, photo_x, photo_y, stats')
                .eq('user_id', state.user.auth.id)
                .maybeSingle();

            
            if (myPlayer) {
                // [NUEVO] Sincronización proactiva (v48.2) - Autocuración por RLS
                // Si el jugador tiene equipo por membresía pero su ficha no está vinculada, se vincula a sí mismo.
                if (state.team && myPlayer.team_id !== state.team.id) {
                    console.log(">>> [SYNC] Corrigiendo vinculación de ficha técnica (Self-Healing)...");
                    await supabase.from('players').update({ team_id: state.team.id }).eq('id', myPlayer.id);
                    myPlayer.team_id = state.team.id;
                }

                window.state.userPlayer = {
                    id: myPlayer.id,
                    user_id: myPlayer.user_id,
                    name: myPlayer.name,
                    consoleID: myPlayer.console_id,
                    avatarID: myPlayer.avatar_id,
                    primaryPos: myPlayer.primary_pos,
                    secondaryPos: myPlayer.secondary_pos,
                    dorsal: myPlayer.dorsal,
                    photo_url: myPlayer.photo_url,
                    photo_scale: myPlayer.photo_scale,
                    photo_x: myPlayer.photo_x,
                    photo_y: myPlayer.photo_y,
                    stats: myPlayer.stats
                };
                // Añadir a la lista general para que las vistas funcionen
                window.state.players = [window.state.userPlayer];
            }
        }

        // Si hay equipo, cargar el resto de la plantilla y datos
        if (state.team) {
            // 1. Cargar Jugadores (Excluyendo al usuario si ya se cargó para evitar duplicados)
            const { data: dbPlayers } = await supabase
                .from('players')
                .select('id, user_id, name, console_id, avatar_id, primary_pos, secondary_pos, dorsal, photo_url, photo_scale, photo_x, photo_y, stats')
                .eq('team_id', state.team.id)
                .neq('user_id', state.user.auth.id);


            if (dbPlayers) {
                const otherPlayers = dbPlayers.map(p => ({
                    id: p.id,
                    user_id: p.user_id,
                    name: p.name,
                    consoleID: p.console_id,
                    avatarID: p.avatar_id,
                    primaryPos: p.primary_pos,
                    secondaryPos: p.secondary_pos,
                    dorsal: p.dorsal,
                    photo_url: p.photo_url,
                    photo_scale: p.photo_scale,
                    photo_x: p.photo_x,
                    photo_y: p.photo_y,
                    stats: p.stats
                }));
                window.state.players = [...window.state.players, ...otherPlayers];
            }

            // 2. Cargar Sesiones
            const { data: dbSessions } = await supabase.from('sessions').select('id, date, status, mvp_id, matches, poll_id, lineup').eq('team_id', state.team.id);

            if (dbSessions) {
                window.state.sessions = dbSessions.filter(s => s.status === 'closed').map(s => ({
                    id: s.id,
                    date: s.date,
                    status: s.status,
                    mvpId: s.mvp_id,
                    matches: s.matches,
                    poll_id: s.poll_id,
                    lineup: s.lineup
                }));
                const active = dbSessions.find(s => s.status === 'active');
                window.state.activeSession = active ? {
                    id: active.id,
                    date: active.date,
                    status: active.status,
                    mvpId: active.mvp_id,
                    matches: active.matches,
                    poll_id: active.poll_id,
                    lineup: active.lineup
                } : null;
            }

            // 3. Cargar Tácticas
            const { data: dbTactics } = await supabase.from('tactics').select('id, name, formation, assignments, custom_positions, is_active').eq('team_id', state.team.id);

            if (dbTactics) {
                window.state.savedTactics = dbTactics.map(t => ({
                    id: t.id,
                    name: t.name,
                    formation: t.formation,
                    assignments: t.assignments,
                    customPositions: t.custom_positions || {},
                    isActive: t.is_active
                }));
            }
        }

        // --- ACTUALIZACIÓN DE UI (SIEMPRE DISPONIBLE) ---
        if (typeof updateTeamHeader === 'function') updateTeamHeader();
        if (typeof applyRolePermissions === 'function') applyRolePermissions();
        if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
        
        // Estas funciones deben ejecutarse aunque no haya equipo (para crear ficha)
        if (typeof populatePositionSelects === 'function') populatePositionSelects();
        if (typeof renderAvatarGallery === 'function') renderAvatarGallery();
        
        if (state.team) {
            if (typeof renderPlayers === 'function') renderPlayers();
            if (typeof renderSessions === 'function') renderSessions();
            if (typeof renderTacticsList === 'function') renderTacticsList();
            if (typeof renderAvailabilityBanner === 'function') renderAvailabilityBanner();
            if (typeof setupTacticHandlers === 'function') setupTacticHandlers();
            if (typeof setupSessionHandlers === 'function') setupSessionHandlers();
        }

        // Setup base
        if (typeof setupNavigation === 'function') setupNavigation();
        if (typeof setupFormHandlers === 'function') setupFormHandlers();
        if (typeof setupTableSorting === 'function') setupTableSorting();
        if (typeof setupEventListeners === 'function') setupEventListeners();

    } catch (err) {
        console.error(">>> [ERROR] loadTeamData:", err);
    }
}

/**
 * Recupera convocatorias cerradas que aún no han sido vinculadas a una jornada.
 */
async function fetchUnlinkedPolls() {
    if (!supabase || !state.team) return [];
    
    // Obtenemos todas las convocatorias cerradas
    const { data: polls, error: pollErr } = await supabase
        .from('availability_polls')
        .select('id, title, scheduled_time, final_alignment')
        .eq('team_id', state.team.id)
        .eq('status', 'closed')
        .order('scheduled_time', { ascending: false });

    if (pollErr || !polls) return [];

    // Obtenemos todos los poll_ids usados en sessions
    const { data: sessions, error: sessErr } = await supabase
        .from('sessions')
        .select('poll_id')
        .eq('team_id', state.team.id)
        .not('poll_id', 'is', null);

    if (sessErr) return [];

    const usedPollIds = sessions.map(s => s.poll_id);
    
    // Filtramos las convocatorias que no están en usedPollIds
    return polls.filter(p => !usedPollIds.includes(p.id));
}

/**
 * Guarda todas las tácticas en Supabase.
 */
async function saveTacticsCloud() {
    if (!supabase || !state.team) return;
    
    const tacticsToSave = state.savedTactics.map(t => ({
        id: t.id,
        name: t.name,
        formation: t.formation,
        assignments: t.assignments,
        custom_positions: t.customPositions || {},
        team_id: state.team.id,
        is_active: t.id === state.activeTacticId
    }));

    const { error } = await supabase.from('tactics').upsert(tacticsToSave);
    if (error) console.error('Error guardando tácticas:', error.message);
}

/**
 * Guarda/Actualiza un jugador en la nube.
 */
async function savePlayerCloud(player) {
    if (!supabase || !state.team) return;
    try {
        const payload = {
            team_id: state.team.id,
            name: player.name,
            console_id: player.consoleID,
            avatar_id: player.avatarID,
            primary_pos: player.primaryPos,
            secondary_pos: player.secondaryPos,
            dorsal: player.dorsal,
            photo_url: player.photo_url,
            photo_scale: player.photo_scale,
            photo_x: player.photo_x,
            photo_y: player.photo_y,
            stats: player.stats || { official: { goals: 0, assists: 0, matches: 0, wins: 0 }, friendly: { goals: 0, assists: 0, matches: 0, wins: 0 } }
        };

        if (player.id && player.id.toString().includes('-')) {
            await supabase.from('players').update(payload).eq('id', player.id);
        } else {
            const { data } = await supabase.from('players').insert(payload).select();
            if (data && data[0]) player.id = data[0].id;
        }
    } catch (err) {
        console.error(">>> [ERROR] savePlayerCloud:", err.message);
    }
}

/**
 * Guarda/Actualiza una sesión de juego.
 */
async function saveSessionCloud(session) {
    if (!supabase || !state.team) return;
    try {
        const payload = {
            team_id: state.team.id,
            date: session.date,
            status: session.status,
            matches: session.matches,
            mvp_id: session.mvpId,
            poll_id: session.poll_id,
            lineup: session.lineup
        };

        if (session.id && session.id.toString().includes('-')) {
            // UUID válido → UPDATE
            await supabase.from('sessions').update(payload).eq('id', session.id);
        } else {
            // ID temporal (timestamp) → INSERT y sincronizar UUID de vuelta
            const { data } = await supabase.from('sessions').insert(payload).select();
            if (data && data[0]) {
                session.id = data[0].id;
            }
        }
    } catch (err) {
        console.error(">>> [ERROR] saveSessionCloud:", err.message);
    }
}

/**
 * Elimina una sesión de juego en Supabase.
 */
/**
 * Elimina una sesión de juego en Supabase.
 */
async function deleteSessionCloud(sessionId) {
    if (!supabase) return;
    try {
        const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
        if (error) throw error;
        console.log(`>>> [DATOS] Sesión ${sessionId} eliminada de la nube.`);
    } catch (err) {
        console.error(">>> [ERROR] deleteSessionCloud:", err.message);
    }
}

/**
 * Recalcula todas las estadísticas de los jugadores basándose únicamente en las sesiones cerradas.
 * (v50.0 - Sistema de Auto-curación)
 */
async function recalculateAllStats() {
    if (!supabase || !state.team) return { error: 'No conectado' };

    try {
        window.jbLoading.show('Recalculando estadísticas...');
        
        // 1. Resetear estadísticas locales de todos los jugadores
        state.players.forEach(p => {
            p.stats = {
                official: { goals: 0, assists: 0, matches: 0, wins: 0, mvps: 0 },
                friendly: { goals: 0, assists: 0, matches: 0, wins: 0, mvps: 0 }
            };
            p.mvp_count = 0; // Si usas esta variable fuera del objeto stats
        });

        // 2. Cargar todas las sesiones del equipo
        const { data: sessions, error: sessErr } = await supabase
            .from('sessions')
            .select('*')
            .eq('team_id', state.team.id)
            .eq('status', 'closed');

        if (sessErr) throw sessErr;

        // 2.5 Cargar historial de convocatorias (v50.1)
        const { data: polls } = await supabase
            .from('availability_polls')
            .select('id, scheduled_time, final_alignment')
            .eq('team_id', state.team.id);

        // 3. Procesar cada sesión y partido
        sessions.forEach(session => {
            const matches = session.matches || [];
            
            // 3.0. Buscar la convocatoria (v51.0: Priorizar vinculación explícita poll_id)
            let matchingPoll = null;
            if (session.poll_id) {
                matchingPoll = polls?.find(p => p.id === session.poll_id);
            }
            
            // Fallback a fechas para sesiones legacy (v50.2)
            if (!matchingPoll && polls && polls.length > 0) {
                const sDate = new Date(session.date);
                polls.forEach(p => {
                    const pDate = new Date(p.scheduled_time);
                    const diffDays = Math.abs(sDate - pDate) / (1000 * 60 * 60 * 24);
                    if (diffDays <= 2) {
                        if (!matchingPoll || diffDays < (Math.abs(sDate - new Date(matchingPoll.scheduled_time)) / (1000 * 60 * 60 * 24))) {
                            matchingPoll = p;
                        }
                    }
                });
            }

            // Determinar alineación maestra de la sesión (v51.0)
            if (session.lineup) {
                const sl = session.lineup;
                if (Array.isArray(sl) && sl.length > 0) {
                    masterLineup = sl.map(id => id.toString());
                } else if (sl.assignments) {
                    masterLineup = Object.values(sl.assignments).filter(id => id).map(id => id.toString());
                }
            } 
            
            if (!masterLineup && matchingPoll && matchingPoll.final_alignment) {
                const fa = matchingPoll.final_alignment;
                if (fa.assignments) masterLineup = Object.values(fa.assignments).filter(id => id).map(id => id.toString());
                else if (Array.isArray(fa)) masterLineup = fa.filter(id => id).map(id => id.toString());
                else if (typeof fa === 'object') masterLineup = Object.values(fa).filter(v => v).map(id => id.toString());
            }

            matches.forEach(match => {
                const mType = match.type || 'friendly';
                const isWin = match.scoreHome > match.scoreAway;

                // 3.1. Determinar quién jugó este partido (Prioridad: match.lineup > masterLineup)
                let currentLineup = [];
                if (match.lineup && Array.isArray(match.lineup) && match.lineup.length > 0) {
                    currentLineup = match.lineup;
                } else if (masterLineup) {
                    currentLineup = masterLineup; 
                } else if (match.events) {
                    const involved = new Set();
                    match.events.forEach(ev => {
                        if (ev.scorerId) involved.add(ev.scorerId.toString());
                        if (ev.assistantId) involved.add(ev.assistantId.toString());
                    });
                    if (match.mvpId) involved.add(match.mvpId.toString());
                    currentLineup = Array.from(involved);
                }

                // Sumar PJ y Victorias
                currentLineup.forEach(pId => {
                    const player = state.players.find(p => p.id.toString() === pId.toString());
                    if (player) {
                        player.stats[mType].matches++;
                        if (isWin) player.stats[mType].wins++;
                    }
                });

                // 3.2. Sumar Goles y Asistencias (Esto ya funcionaba bien)
                if (match.events && Array.isArray(match.events)) {
                    match.events.forEach(ev => {
                        const scorer = state.players.find(p => p.id.toString() === ev.scorerId?.toString());
                        const assistant = state.players.find(p => p.id.toString() === ev.assistantId?.toString());
                        
                        if (scorer) scorer.stats[mType].goals++;
                        if (assistant) assistant.stats[mType].assists++;
                    });
                }
                // 3.3. MVP de partido (si existiera en el futuro)
                if (match.mvpId) {
                    const mvpP = state.players.find(p => p.id.toString() === match.mvpId.toString());
                    if (mvpP) {
                        mvpP.stats[mType].mvps = (mvpP.stats[mType].mvps || 0) + 1;
                    }
                }
            });

            // 3.4. MVP de la sesión
            if (session.mvp_id) {
                const mvpS = state.players.find(p => p.id.toString() === session.mvp_id.toString());
                if (mvpS) {
                    // Si no sabemos si la sesión fue oficial o amistosa, miramos los partidos
                    const hasOfficial = matches.some(m => m.type === 'official');
                    const type = hasOfficial ? 'official' : 'friendly';
                    mvpS.stats[type].mvps = (mvpS.stats[type].mvps || 0) + 1;
                    mvpS.mvp_count = (mvpS.mvp_count || 0) + 1;
                }
            }
        });

        // 4. Guardar todos los jugadores en la nube (Secuencial para evitar bloqueos)
        for (let p of state.players) {
            await savePlayerCloud(p);
            await new Promise(r => setTimeout(r, 100)); // Delay de seguridad
        }

        window.jbLoading.hide();
        window.jbToast('¡Estadísticas sincronizadas con éxito!', 'success');
        return { success: true };

    } catch (err) {
        console.error(">>> [ERROR] recalculateAllStats:", err);
        window.jbLoading.hide();
        window.jbToast('Error al recalcular: ' + err.message, 'error');
        return { error: err.message };
    }
}

/**
 * Elimina una táctica en Supabase.
 */
async function deleteTacticCloud(tacticId) {
    if (!supabase || !state.team) return;
    try {
        const { error } = await supabase.from('tactics').delete().eq('id', tacticId);
        if (error) throw error;
    } catch (err) {
        console.error(">>> [ERROR] deleteTacticCloud:", err.message);
        window.jbToast('Error al eliminar de la nube: ' + err.message, 'error');
    }
}

/**
 * Marca una táctica como activa para el equipo en Supabase.
 */
async function setActiveTacticInDB(tacticId) {
    if (!supabase || !state.team) return;
    try {
        // 1. Desactivar todas las del equipo
        await supabase.from('tactics')
            .update({ is_active: false })
            .eq('team_id', state.team.id);

        // 2. Activar la seleccionada
        const { error } = await supabase.from('tactics')
            .update({ is_active: true })
            .eq('id', tacticId);

        if (error) throw error;

        // 3. Actualizar estado local
        state.savedTactics.forEach(t => {
            t.isActive = (t.id === tacticId);
        });
        state.activeTacticId = tacticId;
        
    } catch (err) {
        console.error(">>> [ERROR] setActiveTacticInDB:", err.message);
        window.jbToast('Error al activar táctica:', 'error');
    }
}

/**
 * Guarda/Actualiza la configuración del equipo.
 */
async function saveTeamCloud() {
    if (!supabase || !state.team) return;
    const { error } = await supabase
        .from('teams')
        .update({ 
            name: state.team.name,
            socials: state.team.socials || {}
        })
        .eq('id', state.team.id);
    
    if (error) console.error(">>> [ERROR] saveTeamCloud:", error.message);
}

/**
 * Actualiza el rango de un miembro en Supabase.
 */
async function updateMemberRoleCloud(userId, newRole) {
    if (!supabase || !state.team) return;
    try {
        const { data, error } = await supabase
            .from('memberships')
            .update({ role: newRole })
            .eq('user_id', userId)
            .eq('team_id', state.team.id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            console.error(">>> [RLS] No se pudo actualizar el rango. Verifica las políticas de Supabase.");
            window.jbToast('Error: No tienes permisos suficientes para cambiar rangos en este club.', 'error', 5000);
            return;
        }

        window.jbToast('Rango actualizado correctamente', 'success');
        if (typeof renderMembersList === 'function') await renderMembersList();
    } catch (err) {
        console.error(">>> [ERROR] updateMemberRoleCloud:", err.message);
        window.jbToast('Error al actualizar rango: ' + err.message, 'error');
    }
}

/**
 * Elimina a un miembro del equipo en Supabase.
 */
async function deleteMemberCloud(userId) {
    if (!supabase || !state.team) return;
    try {
        const { error } = await supabase
            .from('memberships')
            .delete()
            .eq('user_id', userId)
            .eq('team_id', state.team.id);

        if (error) throw error;

        // 2. Sincronizar ficha (v48.0 fix)
        await supabase.from('players').update({ team_id: null }).eq('user_id', userId);

        window.jbToast('Miembro eliminado del club', 'success');
        if (typeof renderMembersList === 'function') await renderMembersList();
    } catch (err) {
        console.error(">>> [ERROR] deleteMemberCloud:", err.message);
        window.jbToast('Error al eliminar miembro: ' + err.message, 'error');
    }
}

/**
 * Envía una solicitud de fichaje a un equipo.
 */
async function sendTeamRequest(teamId) {
    if (!supabase || !state.user) return { error: 'No autenticado' };
    
    // El UNIQUE(user_id) en BD se encarga de la restricción de 1 solicitud
    const { data, error } = await supabase
        .from('team_requests')
        .insert({
            user_id: state.user.auth.id,
            team_id: teamId
        });
        
    if (error) {
        if (error.code === '23505') {
            return { error: 'Ya tienes una solicitud pendiente en este u otro equipo. Solo puedes tener una activa.' };
        }
        return { error: error.message };
    }
    return { data };
}

/**
 * Obtiene las solicitudes de fichaje para un equipo (Admin only).
 */
async function fetchTeamRequests(teamId) {
    if (!supabase) return [];
    const tId = teamId || (window.state && window.state.team ? window.state.team.id : null);
    if (!tId) return [];

    const { data: requests, error } = await supabase
        .from('team_requests')
        .select('id, created_at, user_id')
        .eq('team_id', tId);
        
    if (error) {
        console.error(">>> [ERROR] fetchTeamRequests:", error.message);
        return [];
    }

    if (!requests || requests.length === 0) return [];

    // Obtener nombres de los perfiles en una sola query (evita error de JOIN de PostgREST)
    const userIds = requests.map(r => r.user_id);
    const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

    if (profError) {
        console.error(">>> [ERROR] fetchTeamRequests (profiles):", profError.message);
        return requests; // Devolver sin nombre si falla
    }

    const profileMap = {};
    profiles.forEach(p => profileMap[p.id] = p.full_name);

    return requests.map(r => ({
        ...r,
        profiles: { full_name: profileMap[r.user_id] || 'USUARIO DESCONOCIDO' }
    }));
}


/**
 * Acepta una solicitud de fichaje.
 */
async function acceptTeamRequest(requestId) {
    if (!supabase) return;
    try {
        // 1. Obtener la solicitud para tener user_id y team_id
        const { data: req, error: reqErr } = await supabase
            .from('team_requests')
            .select('*')
            .eq('id', requestId)
            .single();
        
        if (reqErr || !req) throw new Error("No se encontró la solicitud original.");

        // 2. Crear la membresía
        const { error: memErr } = await supabase.from('memberships').insert({
            user_id: req.user_id,
            team_id: req.team_id,
            role: 'jugador'
        });
        if (memErr) throw memErr;

        // 3. Eliminar la solicitud
        await supabase.from('team_requests').delete().eq('id', requestId);

        // 4. Vincular ficha técnica al club (v48.0 fix)
        // Buscamos si el jugador ya tiene ficha para no sobrescribir sus stats/dorsal
        const { data: existingPlayer } = await supabase.from('players').select('id').eq('user_id', req.user_id).maybeSingle();
        
        if (existingPlayer) {
            await supabase.from('players').update({ team_id: req.team_id }).eq('user_id', req.user_id);
        } else {
            const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', req.user_id).single();
            await supabase.from('players').insert({
                user_id: req.user_id,
                team_id: req.team_id,
                name: profile?.full_name || 'Nuevo Jugador'
            });
        }
        
        window.jbToast('Jugador aceptado en el club', 'success');
    } catch (err) {
        console.error(">>> [ERROR] acceptTeamRequest:", err.message);
        window.jbToast('Error al aceptar solicitud: ' + err.message, 'error');
        throw err; // Re-lanzar para que app.js sepa que falló
    }
}

/**
 * Rechaza una solicitud de fichaje.
 */
async function rejectTeamRequest(requestId) {
    if (!supabase) return;
    const { error } = await supabase.from('team_requests').delete().eq('id', requestId);
    if (!error) {
        window.jbToast('Solicitud rechazada', 'success');
    } else {
        window.jbToast('Error al rechazar solicitud', 'error');
    }
}

/**
 * Sincroniza retroactivamente a todos los miembros de un club con la tabla 'players'.
 * Util para corregir usuarios que se unieron antes de la v48.0. (v48.1)
 */
async function syncTeamMembers() {
    if (!supabase || !state.team) return { error: 'No conectado' };
    
    try {
        // 1. Obtener todos los miembros reales
        const { data: members, error: memErr } = await supabase
            .from('memberships')
            .select('user_id, profiles(full_name)')
            .eq('team_id', state.team.id);

        if (memErr) throw memErr;

        // 2. Procesar cada miembro en paralelo
        const promises = members.map(async (m) => {
            const { data: existingPlayer } = await supabase
                .from('players')
                .select('id')
                .eq('user_id', m.user_id)
                .maybeSingle();

            if (existingPlayer) {
                return supabase.from('players').update({ team_id: state.team.id }).eq('user_id', m.user_id);
            } else {
                return supabase.from('players').insert({
                    user_id: m.user_id,
                    team_id: state.team.id,
                    name: m.profiles?.full_name || 'Jugador Sincro'
                });
            }
        });

        await Promise.all(promises);
        return { success: true };
    } catch (err) {
        console.error(">>> [ERROR] syncTeamMembers:", err.message);
        return { error: err.message };
    }
}
