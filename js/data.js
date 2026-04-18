/**
 * JB-SQUAD ELITE: Sincronización de Datos (Supabase)
 */

/**
 * Carga todos los datos del equipo desde Supabase hacia el estado global.
 */
async function loadTeamData() {
    console.log(">>> [DATOS] Iniciando sincronización élite...");
    if (!state.team) return;

    try {
        // 1. Cargar Jugadores
        const { data: dbPlayers } = await supabase.from('players').select('*').eq('team_id', state.team.id);
        if (dbPlayers) {
            window.state.players = dbPlayers.map(p => ({
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
        }

        // 2. Cargar Sesiones
        const { data: dbSessions } = await supabase.from('sessions').select('*').eq('team_id', state.team.id);
        if (dbSessions) {
            window.state.sessions = dbSessions.filter(s => s.status === 'closed').map(s => ({
                id: s.id,
                date: s.date,
                status: s.status,
                mvpId: s.mvp_id,
                matches: s.matches
            }));
            const active = dbSessions.find(s => s.status === 'active');
            window.state.activeSession = active ? {
                id: active.id,
                date: active.date,
                status: active.status,
                mvpId: active.mvp_id,
                matches: active.matches
            } : null;
        }

        // 3. Cargar Tácticas
        const { data: dbTactics } = await supabase.from('tactics').select('*').eq('team_id', state.team.id);
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

        // Detectar mi ficha (AUTOGESTIÓN)
        window.state.userPlayer = window.state.players.find(p => p.user_id === state.user.auth.id);
        
        // Disparar eventos de actualización de UI (si las funciones existen)
        if (typeof updateTeamHeader === 'function') updateTeamHeader();
        if (typeof applyRolePermissions === 'function') applyRolePermissions();
        if (typeof renderPlayers === 'function') renderPlayers();
        if (typeof renderSessions === 'function') renderSessions();
        if (typeof renderTacticsList === 'function') renderTacticsList();
        if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
        if (typeof renderAvailabilityBanner === 'function') renderAvailabilityBanner();

        // Re-vincular componentes UI tras carga de datos
        if (typeof populatePositionSelects === 'function') populatePositionSelects();
        if (typeof renderAvatarGallery === 'function') renderAvatarGallery();
        if (typeof setupNavigation === 'function') setupNavigation();
        if (typeof setupFormHandlers === 'function') setupFormHandlers();
        if (typeof setupTacticHandlers === 'function') setupTacticHandlers();
        if (typeof setupSessionHandlers === 'function') setupSessionHandlers();
        if (typeof setupTableSorting === 'function') setupTableSorting();
        if (typeof setupEventListeners === 'function') setupEventListeners();

    } catch (err) {
        console.error(">>> [ERROR] loadTeamData:", err);
    }
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
            stats: player.stats || { official: { goals: 0, assists: 0, matches: 0 }, friendly: { goals: 0, assists: 0, matches: 0 } }
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
            mvp_id: session.mvpId
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
async function deleteSessionCloud(sessionId) {
    if (!supabase) return;
    await supabase.from('sessions').delete().eq('id', sessionId);
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
    await supabase.from('teams').upsert({
        id: state.team.id,
        name: state.team.name,
        manager_name: state.team.manager_name
    });
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

    const { data, error } = await supabase
        .from('team_requests')
        .select('id, created_at, user_id')
        .eq('team_id', tId);
        
    if (error) {
        console.error(">>> [ERROR] fetchTeamRequests:", error.message);
        return [];
    }

    // Cargar nombres de perfiles manualmente para evitar joins complejos si RLS es estricto
    const augmentedData = await Promise.all((data || []).map(async (req) => {
        const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', req.user_id).single();
        return { ...req, profiles: prof };
    }));

    return augmentedData;
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
