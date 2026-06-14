// equipo.js

// --- ESTADO Y LISTENERS DE ORDENACIÓN PARA ASISTENCIA (v61.0) ---
var processedAttendancePlayers = [];
var attendanceSortKey = 'name';
var attendanceSortDesc = false;

var attendanceHeaders = document.querySelectorAll('#table-attendance-stats th[data-sort]');
attendanceHeaders.forEach(th => {
    th.addEventListener('click', () => {
        const key = th.getAttribute('data-sort');
        if (attendanceSortKey === key) {
            attendanceSortDesc = !attendanceSortDesc;
        } else {
            attendanceSortKey = key;
            attendanceSortDesc = (key !== 'name');
        }
        
        attendanceHeaders.forEach(h => {
            const arrow = h.querySelector('span');
            if (arrow) {
                const hKey = h.getAttribute('data-sort');
                if (hKey === attendanceSortKey) {
                    arrow.textContent = attendanceSortDesc ? '↓' : '↑';
                    arrow.style.opacity = '1';
                } else {
                    arrow.textContent = '↕';
                    arrow.style.opacity = '0.3';
                }
            }
        });
        
        renderAttendanceTableRows();
    });
});

// --- Lógica del Club "Mi Equipo" v31.0 ---
async function renderMiEquipoView() {
    if (!state.team) return;
    window.jbLoading.show('Sincronizando Club...');

    // 1. Datos del Club
    document.getElementById('mgmt-team-name').textContent = state.team.name.toUpperCase();
    const foundationDate = new Date(state.team.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    document.getElementById('mgmt-team-foundation').textContent = `FUNDADO EL ${foundationDate}`;

    // 2. Escudo
    const crestDisplay = document.getElementById('team-crest-display');
    const localCrest = localStorage.getItem(`jb_crest_${state.team.id}`);
    
    if (state.team.crest_url) {
        crestDisplay.innerHTML = `<img src="${state.team.crest_url}" alt="Escudo">`;
    } else if (localCrest) {
        crestDisplay.innerHTML = `<img src="${localCrest}" alt="Escudo">`;
    } else {
        crestDisplay.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
    }

    // 3. Estadísticas Agregadas
    let totalGoals = 0;
    let totalAssists = 0;
    state.players.forEach(p => {
        totalGoals += (parseInt(p.stats?.official?.goals) || 0) + (parseInt(p.stats?.friendly?.goals) || 0);
        totalAssists += (parseInt(p.stats?.official?.assists) || 0) + (parseInt(p.stats?.friendly?.assists) || 0);
    });

    document.getElementById('team-total-matches').textContent = state.sessions.length;
    document.getElementById('team-total-goals').textContent = totalGoals;
    document.getElementById('team-total-assists').textContent = totalAssists;
    document.getElementById('team-total-members').textContent = state.players.length;

    // 4. Lista de Miembros y Roles
    await renderMembersList();

    // 5. LISTA DE SOLICITUDES (v47.0)
    await renderJoinRequests();

    // 6. Reset visual de pestañas (v49.1 fix)
    const tabsContainer = document.getElementById('team-view-tabs');
    if (state.user?.role === 'manager') {
        if (tabsContainer) tabsContainer.style.display = 'flex';
        // Forzar que el panel de plantilla sea el inicial
        const firstTab = tabsContainer?.querySelector('[data-target="team-roster-panel"]');
        if (firstTab) firstTab.click();
    } else {
        if (tabsContainer) tabsContainer.style.display = 'none';
        document.getElementById('team-roster-panel').style.display = 'block';
    }
    
    window.jbLoading.hide();
}

async function renderJoinRequests() {
    const panel = document.getElementById('team-requests-panel');
    const requestsContainer = document.getElementById('team-requests-list');
    const countBadge = document.getElementById('requests-count-badge');
    
    if (!panel || !requestsContainer) return;

    // Solo el Manager ve los tabs y las solicitudes
    const tabsContainer = document.getElementById('team-view-tabs');
    if (state.user?.role !== 'manager') {
        panel.style.display = 'none';
        if (tabsContainer) tabsContainer.style.display = 'none';
        return;
    }

    const requests = await fetchTeamRequests();
    
    // Mostrar los tabs ahora que sabemos que el usuario es Manager
    if (tabsContainer) tabsContainer.style.display = 'flex';
    
    // Actualizamos el counter original y el nuevo badge de la pestaña
    if (countBadge) {
        countBadge.textContent = requests.length > 0 ? `${requests.length} PENDIENTES` : '0 PENDIENTES';
        countBadge.style.display = requests.length > 0 ? 'inline-block' : 'none';
    }
    
    const tabBadge = document.getElementById('requests-tab-badge');
    if (tabBadge) {
         tabBadge.textContent = requests.length;
         tabBadge.style.display = requests.length > 0 ? 'inline-block' : 'none';
    }

    if (requests.length === 0) {
        requestsContainer.innerHTML = `
            <div class="card-elite" style="text-align: center; opacity: 0.6; padding: 40px 20px; background: transparent; border: 1px dashed rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; gap: 10px;">
                <span style="font-size: 2rem;">📭</span>
                <h3 style="font-size: 0.9rem; color: #fff; font-weight: 800; letter-spacing: 1px;">BANDEJA VACÍA</h3>
                <p style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Actualmente no tienes ninguna solicitud pendiente para unirse a tu club.</p>
            </div>
        `;
        return;
    }


    requestsContainer.innerHTML = '';
    requests.forEach(req => {
        const card = document.createElement('div');
        card.className = 'request-card fade-in';
        const name = req.profiles?.full_name || 'USUARIO DESCONOCIDO';
        
        card.innerHTML = `
            <div class="request-info">
                <strong>${escapeHTML(name).toUpperCase()}</strong>
                <p>Enviada: ${new Date(req.created_at).toLocaleDateString()}</p>
            </div>
            <div class="request-actions">
                <button class="btn-reject" onclick="window.handleRequestAction('${req.id}', 'reject')">RECHAZAR</button>
                <button class="btn-approve" onclick="window.handleRequestAction('${req.id}', 'accept')">ACEPTAR</button>
            </div>
        `;
        requestsContainer.appendChild(card);
    });
}

window.updateJoinRequestsBadge = async function() {
    const isAdmin = state.user?.role === 'manager' || state.user?.role === 'capitan';
    const badge = document.getElementById('nav-requests-badge');
    if (!badge || !isAdmin) return;

    // Caché de 60 segundos (v49.5)
    const now = Date.now();
    if (state.requestsBadgeCache.timestamp && (now - state.requestsBadgeCache.timestamp < 60000)) {
        renderBadge(state.requestsBadgeCache.count);
        return;
    }

    const requests = await fetchTeamRequests();
    const count = requests.length;
    
    state.requestsBadgeCache = { count, timestamp: now };
    renderBadge(count);

    function renderBadge(n) {
        badge.textContent = n;
        badge.style.display = n > 0 ? 'flex' : 'none';
    }
};


window.handleRequestAction = async function(requestId, action) {
    if (action === 'reject') {
        const msg = '¿Rechazar esta solicitud?';
        if (!await window.jbConfirm(msg)) return;
        
        window.jbLoading.show('Procesando...');
        try {
            await rejectTeamRequest(requestId);
            window.jbToast('Solicitud rechazada.', 'info');
            await loadTeamData();
            await renderMiEquipoView();
            window.updateJoinRequestsBadge();
        } catch (err) {
            console.error(err);
            window.jbToast('Error al procesar', 'error');
        }
        window.jbLoading.hide();
        return;
    }

    // ACEPTAR
    window.jbLoading.show('Consultando historial...');
    try {
        const { data: req } = await supabase.from('team_requests').select('*').eq('id', requestId).single();
        if (!req) throw new Error("Solicitud no encontrada.");

        // Check for ghost player
        const { data: teamPlayers } = await supabase.from('players').select('id, user_id, stats, name').eq('team_id', req.team_id);
        const ghostPlayer = teamPlayers?.find(p => p.user_id === null && p.stats?.original_user_id === req.user_id);
        
        window.jbLoading.hide();

        let resetStats = false;
        if (ghostPlayer) {
            const msg = `¡Jugador Retornado!\n\nEl jugador ${ghostPlayer.name} ya formó parte de este club. \n\nPulsa ACEPTAR para recuperar su historial estadístico antiguo.\nPulsa CANCELAR para crearle una ficha nueva desde cero.`;
            resetStats = !confirm(msg); // If they cancel, they want to reset stats.
        } else {
            if (!await window.jbConfirm('¿Quieres aceptar a este jugador en el club?')) return;
        }

        window.jbLoading.show('Fichando jugador...');
        await acceptTeamRequest(requestId, resetStats, ghostPlayer?.id);
        window.jbToast('¡Jugador fichado con éxito!', 'success');
        
        await loadTeamData();
        await renderMiEquipoView();
        window.updateJoinRequestsBadge();
    } catch (err) {
        console.error(">>> [ERROR] Acción de solicitud fallida:", err);
        window.jbToast('Error al procesar la solicitud', 'error');
    }
    window.jbLoading.hide();
}

async function renderAttendancePanel() {
    const tbody = document.getElementById('attendance-stats-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px; font-size: 0.75rem; color: var(--text-muted);">Cargando estadísticas de asistencia...</td></tr>';
    
    try {
        window.jbLoading.show('Consultando historial de convocatorias...');
        
        // 1. Obtener todas las convocatorias del equipo
        const { data: polls, error: pollsErr } = await supabase
            .from('availability_polls')
            .select('id')
            .eq('team_id', state.team.id);
        
        if (pollsErr) throw pollsErr;
        
        let votes = [];
        if (polls && polls.length > 0) {
            const pollIds = polls.map(p => p.id);
            const { data: votesData, error: votesErr } = await supabase
                .from('availability_votes')
                .select('user_id, vote')
                .in('poll_id', pollIds);
            
            if (votesErr) throw votesErr;
            votes = votesData || [];
        }
        
        // 2. Obtener todas las alineaciones de jornadas finalizadas y activas
        const sessionsToScan = [...(state.sessions || [])];
        if (state.activeSession) {
            sessionsToScan.push(state.activeSession);
        }
        
        // 3. Procesar datos para cada jugador en memoria
        processedAttendancePlayers = state.players.map(p => {
            let yesCount = 0;
            let noCount = 0;
            
            if (p.user_id) {
                const playerVotes = votes.filter(v => v.user_id === p.user_id);
                playerVotes.forEach(v => {
                    if (v.vote === 'yes' || v.vote === 'late') yesCount++;
                    else if (v.vote === 'no') noCount++;
                });
            }
            
            let lineupsCount = 0;
            sessionsToScan.forEach(sess => {
                if (sess.lineup) {
                    let assignedIds = [];
                    if (Array.isArray(sess.lineup)) {
                        assignedIds = sess.lineup.map(id => id.toString());
                    } else if (sess.lineup.assignments) {
                        assignedIds = Object.values(sess.lineup.assignments).filter(id => id).map(id => id.toString());
                    }
                    
                    if (assignedIds.includes(p.id.toString()) || assignedIds.includes(p.id)) {
                        lineupsCount++;
                    }
                }
            });
            
            const totalVotes = yesCount + noCount;
            const ratio = totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0;
            
            return {
                id: p.id,
                name: p.name,
                primaryPos: p.primaryPos,
                dorsal: p.dorsal,
                photo_url: p.photo_url,
                photo_scale: p.photo_scale,
                photo_x: p.photo_x,
                photo_y: p.photo_y,
                avatarId: p.avatarId,
                yesCount,
                noCount,
                ratio,
                lineupsCount
            };
        });
        
        // 4. Renderizar filas ordenadas
        renderAttendanceTableRows();
        
    } catch (err) {
        console.error(">>> [ERROR] renderAttendancePanel:", err.message);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 30px; font-size: 0.75rem; color: #F44336;">Error al cargar datos: ${err.message}</td></tr>`;
    } finally {
        window.jbLoading.hide();
    }
}

function renderAttendanceTableRows() {
    const tbody = document.getElementById('attendance-stats-tbody');
    if (!tbody) return;
    
    if (processedAttendancePlayers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px; font-size: 0.75rem; color: var(--text-muted);">No hay jugadores registrados en el equipo.</td></tr>';
        return;
    }
    
    // Algoritmo de ordenación
    const sorted = [...processedAttendancePlayers].sort((a, b) => {
        let valA = a[attendanceSortKey];
        let valB = b[attendanceSortKey];
        
        if (typeof valA === 'string') {
            return attendanceSortDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        
        return attendanceSortDesc ? valB - valA : valA - valB;
    });
    
    tbody.innerHTML = sorted.map(p => {
        const avatar = AVATARS.find(av => {
            const tid = (typeof p.avatarId === 'string') ? parseInt(p.avatarId) : p.avatarId;
            return av.id === (tid || 1);
        });
        
        // Lógica semántica de compromiso (FIFA/Elite)
        let ratioColor = 'rgba(255,255,255,0.08)';
        if (p.ratio >= 80) ratioColor = '#4CAF50';
        else if (p.ratio >= 50) ratioColor = '#FF9800';
        else if (p.ratio > 0) ratioColor = '#F44336';
        
        const transform = getPlayerTransform(p);
        
        return `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                <td style="padding: 12px 15px; display: flex; align-items: center; gap: 10px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; overflow: hidden; border: 2px solid var(--primary); background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        ${p.photo_url ? `<img src="${p.photo_url}" style="width:100%; height:100%; object-fit:cover; transform: ${transform}">` : (avatar ? avatar.svg : '👤')}
                    </div>
                    <div style="min-width: 0;">
                        <div style="font-weight: 800; color: #fff; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${(p.name || '').toUpperCase()}</div>
                        <div style="font-size: 0.6rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">${p.primaryPos || 'JUGADOR'} - Dorsal ${p.dorsal || 'S/D'}</div>
                    </div>
                </td>
                <td style="padding: 12px 15px; text-align: center; font-weight: 900; color: #4CAF50; font-size: 0.85rem;">${p.yesCount}</td>
                <td style="padding: 12px 15px; text-align: center; font-weight: 900; color: #F44336; font-size: 0.85rem;">${p.noCount}</td>
                <td style="padding: 12px 15px; text-align: center; font-weight: 900;">
                    <span style="background: ${ratioColor}; color: #000; padding: 3px 8px; border-radius: 6px; font-size: 0.65rem; font-weight: 900;">
                        ${p.ratio}%
                    </span>
                </td>
                <td style="padding: 12px 15px; text-align: center; font-weight: 900; color: var(--primary); font-size: 0.85rem;">
                    <div style="display: inline-flex; align-items: center; gap: 5px; background: rgba(240, 165, 0, 0.1); border: 1px solid rgba(240, 165, 0, 0.2); padding: 2px 8px; border-radius: 4px;">
                        <span style="font-size: 0.7rem;">🛡️</span> <span>${p.lineupsCount}</span>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// --- EDICIÓN MANUAL DE ESTADÍSTICAS (v50.4) ---
window.openEditStatsModal = function(playerId) {
    const player = state.players.find(p => p.id == playerId);
    if (!player) return;

    document.getElementById('edit-stats-id').value = playerId;
    document.getElementById('edit-stats-name').textContent = `EDITAR: ${player.name.toUpperCase()}`;
    
    const off = player.stats?.official || { matches: 0, goals: 0, assists: 0, wins: 0, cleanSheets: 0 };
    document.getElementById('edit-pj-off').value = off.matches || 0;
    document.getElementById('edit-g-off').value = off.goals || 0;
    document.getElementById('edit-a-off').value = off.assists || 0;
    document.getElementById('edit-w-off').value = off.wins || 0;
    document.getElementById('edit-cs-off').value = off.cleanSheets || 0;

    document.getElementById('modal-edit-stats').style.display = 'flex';
};

window.closeEditStatsModal = function() {
    document.getElementById('modal-edit-stats').style.display = 'none';
};

var formEditStats = document.getElementById('form-edit-stats');
if (formEditStats) {
    formEditStats.onsubmit = async (e) => {
        e.preventDefault();
        const playerId = document.getElementById('edit-stats-id').value;
        const player = state.players.find(p => p.id == playerId);
        if (!player) return;

        window.jbLoading.show('Guardando cambios...');
        
        // Actualizar objeto local
        if (!player.stats) player.stats = { official: {}, friendly: {} };
        if (!player.stats.official) player.stats.official = {};

        player.stats.official.matches = parseInt(document.getElementById('edit-pj-off').value) || 0;
        player.stats.official.goals = parseInt(document.getElementById('edit-g-off').value) || 0;
        player.stats.official.assists = parseInt(document.getElementById('edit-a-off').value) || 0;
        player.stats.official.wins = parseInt(document.getElementById('edit-w-off').value) || 0;
        player.stats.official.cleanSheets = parseInt(document.getElementById('edit-cs-off').value) || 0;

        try {
            // Guardar en Supabase (savePlayerCloud está en data.js)
            await savePlayerCloud(player);
            window.jbToast('Estadísticas actualizadas.', 'success');
            window.closeEditStatsModal();
            await loadTeamData();
            await renderMembersList();
        } catch (err) {
            console.error(">>> [ERROR] Error al editar stats manual:", err);
            window.jbToast('Error al guardar.', 'error');
        }
        window.jbLoading.hide();
    };
}

window.renderMembersList = async function() {
    const membersListContainer = document.getElementById('team-members-list');
    const { data: members, error } = await supabase
        .from('memberships')
        .select('role, user_id, profiles(full_name)')
        .eq('team_id', state.team.id);

    if (error || !members) {
        membersListContainer.innerHTML = '<p style="text-align:center; opacity:0.5;">No se pudo cargar la lista.</p>';
        return;
    }

    // ORDENAR POR RANGO: Manager (1) > Capitan (2) > Jugador (3)
    const roleOrder = { 'manager': 1, 'capitan': 2, 'jugador': 3 };
    members.sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99));

    document.getElementById('member-count-badge').textContent = `${members.length} MIEMBROS`;

    // Limpiar e Inyectar Encabezado
    membersListContainer.innerHTML = `
        <div class="member-table-header">
            <div></div> <!-- Avatar -->
            <div>JUGADOR</div>
            <div>RANGO</div>
            <div style="text-align:center;">PJ</div>
            <div style="text-align:center;">G</div>
            <div style="text-align:center;">A</div>
            <div style="text-align:right;">ACCIONES</div>
        </div>
    `;

    const isManager = state.user.role === 'manager';

    members.forEach(m => {
        const playerCard = state.players.find(p => p.user_id === m.user_id);
        const avatar = playerCard ? AVATARS.find(av => av.id === (playerCard.avatarID || playerCard.avatar_id || 1)) : AVATARS[0];
        const photo = playerCard?.photo_url;
        
        // Cálculo de estadísticas consolidadas
        const stats = playerCard?.stats || { official: { matches: 0, goals: 0, assists: 0 }, friendly: { matches: 0, goals: 0, assists: 0 } };
        const totalPJ = (stats.official?.matches || 0) + (stats.friendly?.matches || 0);
        const totalG = (stats.official?.goals || 0) + (stats.friendly?.goals || 0);
        const totalA = (stats.official?.assists || 0) + (stats.friendly?.assists || 0);

        const row = document.createElement('div');
        row.className = 'member-admin-row';
        
        row.innerHTML = `
            <div class="member-admin-avatar">
                ${photo ? `<img src="${photo}" style="width:100%; height:100%; object-fit:cover;">` : (avatar ? avatar.svg : '')}
            </div>
            <div class="member-admin-info" ${isManager && playerCard ? `onclick="window.openEditStatsModal('${playerCard.id}')" style="cursor:pointer;" title="Editar Estadísticas"` : ''}>
                <h4 style="${isManager && playerCard ? 'color: var(--primary); text-decoration: underline dotted rgba(240,165,0,0.4);' : ''}">${escapeHTML(m.profiles?.full_name?.toUpperCase() || 'ANÓNIMO')}</h4>
            </div>
            <div>
                ${isManager && m.user_id !== state.user.auth.id ? `
                    <select class="role-selector-elite" data-user-id="${m.user_id}">
                        <option value="jugador" ${m.role === 'jugador' ? 'selected' : ''}>JUGADOR</option>
                        <option value="capitan" ${m.role === 'capitan' ? 'selected' : ''}>CAPITÁN</option>
                        <option value="manager" ${m.role === 'manager' ? 'selected' : ''}>MANAGER</option>
                    </select>
                ` : `
                    <span class="member-role-badge role-${m.role}">${m.role.toUpperCase()}</span>
                `}
            </div>
            <div class="member-stat-cell pj">${totalPJ}</div>
            <div class="member-stat-cell g">${totalG}</div>
            <div class="member-stat-cell a">${totalA}</div>
            <div class="member-admin-actions" style="text-align:right;">
                <div style="display:flex; justify-content:flex-end; align-items:center; gap: 8px;">
                    ${isManager && m.user_id !== state.user.auth.id ? `
                        <button class="btn-delete-row" style="width:28px; height:28px; font-size:0.7rem; padding:0; display:flex; align-items:center; justify-content:center;" onclick="window.kickMemberFromAdmin('${m.user_id}', '${escapeHTML(m.profiles?.full_name || 'ANÓNIMO')}')" title="Expulsar del Club">🗑️</button>
                    ` : ''}
                </div>
            </div>
        `;

        if (isManager && m.user_id !== state.user.auth.id) {
            const selector = row.querySelector('.role-selector-elite');
            selector.onchange = async (e) => {
                const newRole = e.target.value;
                const confirmed = await window.jbConfirm(`¿Cambiar el rango de ${m.profiles.full_name.toUpperCase()} a ${newRole.toUpperCase()}?`);
                if (confirmed) {
                    window.jbLoading.show('Actualizando rango...');
                    await updateMemberRoleCloud(m.user_id, newRole);
                    window.jbLoading.hide();
                } else {
                    selector.value = m.role;
                }
            };
        }

        membersListContainer.appendChild(row);
    });
}


// --- LÓGICA DE CONFIGURACIÓN DEL CLUB (v49.0) ---
window.loadTeamSettingsIntoForm = function() {
    if (!state.team) return;
    const inputName = document.getElementById('input-team-name');
    const inputTwitter = document.getElementById('input-team-twitter');
    const inputTwitch = document.getElementById('input-team-twitch');
    const crestDisplay = document.getElementById('team-crest-display');

    if (inputName) inputName.value = state.team.name || '';
    if (inputTwitter) inputTwitter.value = state.team.socials?.twitter || '';
    if (inputTwitch) inputTwitch.value = state.team.socials?.twitch || '';
    
    if (crestDisplay) {
        const crestSource = state.team.crest_url || localStorage.getItem(`jb_crest_${state.team.id}`);
        if (crestSource) {
            crestDisplay.innerHTML = `<img src="${crestSource}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
        } else {
            crestDisplay.innerHTML = '🛡️';
        }
    }
};

// Configurar Handler de Escudo e inputs
var crestTrigger = document.getElementById('team-crest-trigger');
var crestInput = document.getElementById('team-crest-input');
var btnSaveSettings = document.getElementById('btn-save-team-settings');

if (crestTrigger && crestInput) {
    crestTrigger.onclick = () => {
        if (state.user.role === 'manager') crestInput.click();
        else window.jbToast('Solo el Manager puede cambiar el escudo.', 'error');
    };
    
    crestInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64 = event.target.result;
                window.jbLoading.show('Subiendo Escudo...');
                await updateTeamCrest(base64);
                window.jbLoading.hide();
                window.loadTeamSettingsIntoForm(); // Refrescar miniatura
            };
            reader.readAsDataURL(file);
        }
    };
}

if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', async () => {
        if (state.user?.role !== 'manager') return;
        
        const sanitizeSocial = (val) => {
            if (!val) return '';
            if (val.includes('/')) {
                const parts = val.split('/').filter(p => p.trim() !== '');
                return parts.pop() || '';
            }
            return val.replace('@', '');
        };

        const newName = document.getElementById('input-team-name').value.trim();
        const twitter = sanitizeSocial(document.getElementById('input-team-twitter').value.trim());
        const twitch = sanitizeSocial(document.getElementById('input-team-twitch').value.trim());

        if (!newName) {
            window.jbToast('El nombre del club no puede estar vacío.', 'error');
            return;
        }

        window.jbLoading.show('Guardando ajustes del club...');
        
        state.team.name = newName;
        state.team.socials = {
            twitter: twitter,
            twitch: twitch
        };

        await saveTeamCloud(); // js/data.js
        updateTeamHeader();
        
        // Actualizar nombre en la UI de gestión
        const mgmtName = document.getElementById('mgmt-team-name');
        if (mgmtName) mgmtName.textContent = newName.toUpperCase();

        window.jbLoading.hide();
        window.jbToast('¡Ajustes del club actualizados!', 'success');
    });
}

async function updateTeamCrest(base64) {
    if (!supabase || !state.team) return;
    const { error } = await supabase
        .from('teams')
        .update({ crest_url: base64 })
        .eq('id', state.team.id);

    if (error) {
        console.warn(">>> Error al subir escudo:", error.message);
        localStorage.setItem(`jb_crest_${state.team.id}`, base64);
        window.jbToast('Escudo guardado localmente (Falta columna en DB)', 'info');
    } else {
        state.team.crest_url = base64;
        window.jbToast('¡Escudo actualizado!', 'success');
    }
    updateTeamHeader();
}

/* ==========================================================================
   GESTIÓN GLOBAL DE LIGAS Y EQUIPOS (v57.2)
   ========================================================================== */

window.unlockGlobalMgmt = async function() {
    const input = await window.jbInput("🔐 ACCESO ADMINISTRADOR", "Introduzca el código de gestión global:", "password");
    if (!input) return;

    window.jbLoading.show('Verificando código...');
    const realCode = await fetchGlobalConfig('global_mgmt_code');
    window.jbLoading.hide();

    if (realCode && input === realCode) {
        isGlobalUnlocked = true;
        document.getElementById('global-locked-state').style.display = 'none';
        document.getElementById('global-unlocked-state').style.display = 'block';
        
        // Simular clic en la pestaña para que se active visualmente
        const tab = Array.from(teamTabs).find(t => t.getAttribute('data-target') === 'team-global-panel');
        if (tab) tab.click();
        
        window.jbToast('✅ Acceso concedido.', 'success');
        window.renderGlobalMgmt();
    } else {
        window.jbToast('❌ Código incorrecto.', 'error');
    }
}

window.renderGlobalMgmt = async function() {
    if (!isGlobalUnlocked) return;
    await window.renderGlobalLeagues();
    await window.renderGlobalTeams();

    // Setup Listeners de los botones si no existen
    document.getElementById('btn-unlock-global').onclick = window.unlockGlobalMgmt;
    document.getElementById('btn-add-global-league').onclick = window.handleAddGlobalLeague;
    document.getElementById('btn-add-global-team').onclick = window.handleAddGlobalTeam;
}

window.renderGlobalLeagues = async function() {
    const list = document.getElementById('global-leagues-list');
    if (!list) return;

    const { data: leagues } = await supabase.from('global_leagues').select('*').order('name');
    
    if (leagues) {
        // Seleccionar la primera por defecto si no hay ninguna
        if (!state.mgmtSelectedLeagueId && leagues.length > 0) {
            state.mgmtSelectedLeagueId = leagues[0].id;
        }

        list.innerHTML = leagues.map(l => {
            const isActive = state.mgmtSelectedLeagueId === l.id;
            return `
                <div class="card-elite league-card-edit ${isActive ? 'active' : ''}" 
                     onclick="window.selectGlobalLeague('${l.id}')"
                     style="padding: 20px 15px; text-align: center; cursor: pointer; transition: 0.3s; position: relative; overflow: hidden;">
                    
                    <div class="league-edit-btn" title="Editar Liga" 
                         onclick="event.stopPropagation(); window.handleEditGlobalLeague('${l.id}', '${l.name}')">
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </div>
                    
                    <img src="${l.logo_url || neutralCrest}" style="width: 55px; height: 55px; object-fit: contain; margin-bottom: 12px; filter: drop-shadow(0 0 8px rgba(0,0,0,0.3));">
                    <div style="font-size: 0.7rem; font-weight: 900; color: #fff; letter-spacing: 1.5px; opacity: ${isActive ? '1' : '0.6'}">${l.name.toUpperCase()}</div>
                </div>
            `;
        }).join('');
    }
}

window.selectGlobalLeague = function(id) {
    state.mgmtSelectedLeagueId = id;
    window.renderGlobalLeagues();
    window.renderGlobalTeams();
}

window.renderGlobalTeams = async function() {
    const list = document.getElementById('global-teams-list');
    const leagueId = state.mgmtSelectedLeagueId;
    if (!list) return;

    list.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--primary); font-size: 0.7rem; letter-spacing: 2px;">SINCRONIZANDO EQUIPOS...</div>';

    if (!leagueId) {
        list.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-size: 0.75rem;">Selecciona una liga para ver sus equipos.</div>';
        return;
    }

    const { data: linkData } = await supabase.from('league_teams').select('team_id').eq('league_id', leagueId);
    const teamIds = linkData ? linkData.map(d => d.team_id) : [];

    if (teamIds.length === 0) {
        list.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-size: 0.75rem; background: rgba(0,0,0,0.1); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.05);">No hay equipos registrados en esta competición.</div>';
        return;
    }

    const { data: teams } = await supabase.from('global_teams').select('*').in('id', teamIds).order('name');
    
    if (teams && teams.length > 0) {
        list.innerHTML = teams.map(t => `
            <div class="card-elite team-card-edit" 
                 onclick="window.handleEditGlobalTeam('${t.id}', '${t.name}')"
                 style="padding: 15px 20px; display: flex; align-items: center; gap: 18px; border: 1px solid rgba(255,255,255,0.03); cursor: pointer; transition: 0.3s; background: rgba(255,255,255,0.02); border-radius: 12px; min-height: 90px;">
                
                <!-- Escudo Premium: Imagen maximizada dentro del círculo -->
                <div style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 50%; padding: 3px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); flex-shrink: 0; border: 2px solid rgba(255,255,255,0.15); overflow: hidden;">
                    <img src="${t.crest_url || neutralCrest}" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));">
                </div>

                <div style="flex: 1; display: flex; align-items: center;">
                    <div style="font-size: 0.9rem; font-weight: 900; color: #fff; letter-spacing: 0.5px; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${t.name.toUpperCase()}</div>
                </div>

                <div class="edit-icon" style="opacity: 0; transition: 0.3s; color: var(--primary);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
            </div>
        `).join('');
    }
}

window.handleAddGlobalLeague = async function() {
    const name = await window.jbInput("🏆 NUEVA LIGA", "Nombre de la competición:");
    if (!name) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        window.jbLoading.show('Procesando logo...');
        const compressedBlob = await compressImage(file, 200);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target.result;
            const { error } = await addGlobalLeague(name, base64);
            window.jbLoading.hide();

            if (error) window.jbToast(error, 'error');
            else {
                window.jbToast('¡Liga añadida con éxito!', 'success');
                window.renderGlobalMgmt();
            }
        };
        reader.readAsDataURL(compressedBlob);
    };
    fileInput.click();
}

window.handleEditGlobalLeague = async function(id, oldName) {
    const newName = await window.jbInput("📝 EDITAR LIGA", "Nuevo nombre (cancela o deja vacío para mantener):");
    const finalName = (newName !== null && newName.trim() !== "") ? newName : oldName;

    // Preguntar directamente por el logo
    if (await window.jbConfirm(`¿Quieres subir un NUEVO LOGO para ${finalName.toUpperCase()}?`)) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            window.jbLoading.show('Actualizando logo...');
            const compressedBlob = await compressImage(file, 200);
            const reader = new FileReader();
            reader.onload = async (event) => {
                const { error } = await updateGlobalLeague(id, finalName, event.target.result);
                window.jbLoading.hide();
                if (error) window.jbToast(error, 'error');
                else { window.jbToast('¡Liga actualizada!', 'success'); window.renderGlobalMgmt(); }
            };
            reader.readAsDataURL(compressedBlob);
        };
        fileInput.click();
    } else if (finalName !== oldName) {
        window.jbLoading.show('Guardando cambios...');
        const { error } = await updateGlobalLeague(id, finalName, null);
        window.jbLoading.hide();
        if (error) window.jbToast(error, 'error');
        else { window.jbToast('¡Nombre actualizado!', 'success'); window.renderGlobalMgmt(); }
    }
}

window.handleAddGlobalTeam = async function() {
    const leagueId = state.mgmtSelectedLeagueId;
    if (!leagueId) {
        window.jbToast('Selecciona primero una liga para añadir el equipo en ella.', 'warning');
        return;
    }

    const name = await window.jbInput("🛡️ NUEVO EQUIPO", "Nombre del rival:");
    if (!name) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        window.jbLoading.show('Optimizando escudo...');
        const compressedBlob = await compressImage(file, 250);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target.result;
            const { error } = await addGlobalTeam(name, base64, leagueId);
            window.jbLoading.hide();

            if (error) window.jbToast(error, 'error');
            else {
                window.jbToast('¡Equipo registrado!', 'success');
                window.renderGlobalMgmt();
            }
        };
        reader.readAsDataURL(compressedBlob);
    };
    fileInput.click();
}

window.handleEditGlobalTeam = async function(id, oldName) {
    const newName = await window.jbInput("📝 EDITAR RIVAL", "Nuevo nombre (cancela o deja vacío para mantener):");
    const finalName = (newName !== null && newName.trim() !== "") ? newName : oldName;

    // Preguntar directamente por el escudo
    if (await window.jbConfirm(`¿Quieres actualizar el ESCUDO de ${finalName.toUpperCase()}?`)) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            window.jbLoading.show('Procesando escudo...');
            const compressedBlob = await compressImage(file, 250);
            const reader = new FileReader();
            reader.onload = async (event) => {
                const { error } = await updateGlobalTeam(id, finalName, event.target.result);
                window.jbLoading.hide();
                if (error) window.jbToast(error, 'error');
                else { window.jbToast('¡Rival actualizado!', 'success'); window.renderGlobalMgmt(); }
            };
            reader.readAsDataURL(compressedBlob);
        };
        fileInput.click();
    } else if (finalName !== oldName) {
        window.jbLoading.show('Guardando...');
        const { error } = await updateGlobalTeam(id, finalName, null);
        window.jbLoading.hide();
        if (error) window.jbToast(error, 'error');
        else { window.jbToast('Nombre actualizado.', 'success'); window.renderGlobalMgmt(); }
    }
}

/* ==========================================================================
   LÓGICA DE DISPONIBILIDAD (CONVOCATORIAS) - v31.9.0
   ========================================================================== */

async function fetchActivePoll() {
    if (!state.team) return null;
    
    // --- Búsqueda de Convocatoria Activa ---
    // Tomamos la más reciente que esté en estado 'open'
    const { data, error } = await supabase
        .from('availability_polls')
        .select('*')
        .eq('team_id', state.team.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') console.error('Error poll:', error);
    return data || null;
}

async function fetchPollVotes(pollId) {
    const { data, error } = await supabase
        .from('availability_votes')
        .select('*, profiles(id, full_name, avatar_id)')
        .eq('poll_id', pollId);


    if (error) console.error('Error votes:', error);
    console.log(">>> [CONVOCATORIAS] Votos recuperados:", data);
    return data || [];
}

async function createPoll(title, date, time) {
    if (!state.team || !state.user) return;
    
    // --- SEGURIDAD: Solo Manager o Capitán (v49.3) ---
    const role = state.user.role;
    if (role !== 'manager' && role !== 'capitan') {
        window.jbToast('Acceso Denegado: No tienes permisos para crear convocatorias.', 'error');
        return;
    }
    
    // Usar la fecha elegida combinada con la hora
    // Usar la fecha elegida combinada con la hora, tratándola como hora local (v53.7)
    const scheduledTime = new Date(`${date}T${time}`).toISOString();

    const { data, error } = await supabase
        .from('availability_polls')
        .insert([{
            team_id: state.team.id,
            created_by: state.user.auth.id,
            title: title,
            scheduled_time: scheduledTime,
            status: 'open'
        }])
        .select()
        .maybeSingle();

    if (error) {
        window.jbToast('Error al crear: ' + error.message, 'error');
    } else {
        state.activePoll = data;
        window.jbToast('¡Convocatoria creada!', 'success');
        
        // --- AUTO-VOTO PARA JUGADORES "SIEMPRE DISPONIBLES" (v58.0) ---
        try {
            const availablePlayers = state.players.filter(p => p.alwaysAvailable && p.user_id);
            if (availablePlayers.length > 0) {
                const autoVotes = availablePlayers.map(p => ({
                    poll_id: data.id,
                    user_id: p.user_id,
                    vote: 'yes',
                    voted_at: new Date().toISOString()
                }));
                await supabase.from('availability_votes').upsert(autoVotes, { onConflict: 'poll_id,user_id' });
                console.log(`>>> [CONVOCATORIAS] Auto-votos procesados: ${availablePlayers.length}`);
            }
        } catch (vErr) {
            console.error(">>> [ERROR] Auto-voto falló:", vErr);
        }

        sharePollWhatsApp(data);
        renderAvailabilityPanel();
    }
}

async function votePoll(vote, minutes = 0) {
    if (!state.activePoll || !state.user) return;

    const { error } = await supabase
        .from('availability_votes')
        .upsert([{
            poll_id: state.activePoll.id,
            user_id: state.user.auth.id,
            vote: vote,
            minutes_late: minutes,
            voted_at: new Date().toISOString()
        }], { onConflict: 'poll_id,user_id' });

    if (error) {
        window.jbToast('Error al votar: ' + error.message, 'error');
    } else {
        window.jbToast('¡Voto registrado!', 'success');
        renderAvailabilityPanel();
    }
}



function sharePollWhatsApp(poll) {
    const url = `https://jb-squad.netlify.app/?poll=${poll.id}`;
    const d = new Date(poll.scheduled_time);
    const timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const teamName = state.team?.name?.toUpperCase() || 'EQUIPO';
    const text = `⚽ *CONVOCATORIA ${teamName}* ⚽\n\n📅 ${poll.title} — Hoy ${timeStr}\n\n¿Estás disponible? Vota aquí 👇\n🔗 ${url}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
}

async function renderAvailabilityPanel() {
    if (!state.team) return;
    
    // Mostrar/Ocultar botón de nueva según rango
    const isManagerOrCapitan = state.user && (state.user.role === 'manager' || state.user.role === 'capitan');
    if (btnNewPoll) btnNewPoll.style.display = isManagerOrCapitan ? 'flex' : 'none';

    const poll = await fetchActivePoll();
    state.activePoll = poll;

    if (!poll) {
        activePollContainer.innerHTML = `<p class="empty-poll-msg" style="text-align: center; opacity: 0.5; padding: 40px;">No hay ninguna convocatoria activa.</p>`;
        renderPollHistory();
        return;
    }

    const votes = await fetchPollVotes(poll.id);
    state.activePoll.votes = votes; // Sincronizamos votos con el estado para el cierre
    const myVote = votes.find(v => v.user_id === state.user.auth.id);
    
    // --- Lógica de Ordenación por Posición (v49.5) ---
    const positionOrder = ['POR', 'DFC', 'LD', 'CAD', 'LI', 'CAI', 'MCD', 'MC', 'MVI', 'MVD', 'MD', 'MI', 'MCO', 'EI', 'ED', 'DC'];
    const sortVotes = (arr) => {
        return arr.sort((a, b) => {
            const playerA = state.players.find(p => p.user_id === a.user_id);
            const playerB = state.players.find(p => p.user_id === b.user_id);
            const posA = (playerA?.primaryPos || '??').toUpperCase();
            const posB = (playerB?.primaryPos || '??').toUpperCase();
            
            const idxA = positionOrder.indexOf(posA);
            const idxB = positionOrder.indexOf(posB);
            
            return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
        });
    };

    const yesVotes = sortVotes(votes.filter(v => v.vote === 'yes'));
    const lateVotes = sortVotes(votes.filter(v => v.vote === 'late'));
    const noVotes = sortVotes(votes.filter(v => v.vote === 'no'));

    const pollDateObj = new Date(poll.scheduled_time);
    const scheduledTime = pollDateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const scheduledDate = pollDateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    const isToday = pollDateObj.toDateString() === new Date().toDateString();
    const dateLabel = isToday ? 'Hoy' : scheduledDate;

    activePollContainer.innerHTML = `
        <div class="poll-active-card fade-in">
            ${isManagerOrCapitan ? `
            <button onclick="window.jbOpenCancelPollModal('${poll.id}')" class="poll-cancel-btn-desktop" title="Cancelar Convocatoria">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            ` : ''}
            <div class="poll-main-layout">
                <div class="poll-left-side">
                    <div class="poll-header">
                        <div class="poll-header-actions">
                            ${isManagerOrCapitan ? `
                                <button onclick="window.jbSharePoll()" class="btn-share-wa-circle" title="Re-enviar a WhatsApp">
                                    <svg width="20" height="20" viewBox="0 0 448 512" fill="currentColor">
                                        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.8 69.4 27.2 106.2 27.2h.1c122.3 0 222-99.6 222-222 0-59.3-23-115.1-65.1-157.1zM223.9 446.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 367.3l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-82.7 184.6-184.5 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.1-3.2-5.5-.3-8.4 2.4-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.6-9.3 1.9-3.7 .9-7-1.3-9.5-2.4-2.5-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                                        </svg>
                                    </button>
                                    <button onclick="window.jbEditPoll('${poll.id}')" class="btn-poll-edit">EDITAR</button>
                                    <button onclick="window.jbClosePoll('${poll.id}', true)" class="btn-poll-align">CREAR ALINEACIÓN</button>
                                    <button onclick="window.jbOpenCancelPollModal('${poll.id}')" class="poll-cancel-btn-mobile" title="Cancelar Convocatoria">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                            ` : `<span class="poll-status-tag open">ABIERTA</span>`}
                        </div>
                        <div class="poll-info">
                            <h2>${poll.title}</h2>
                            <p>🕒 ${dateLabel} ${scheduledTime}</p>
                        </div>
                    </div>

                    <div class="poll-vote-grid">
                        <button class="btn-vote vote-yes ${myVote?.vote === 'yes' ? 'active' : ''}" onclick="window.jbVote('yes')">
                            <span class="vote-icon">✅</span>
                            <span>SÍ</span>
                        </button>
                        <button class="btn-vote vote-no ${myVote?.vote === 'no' ? 'active' : ''}" onclick="window.jbVote('no')">
                            <span class="vote-icon">❌</span>
                            <span>NO</span>
                        </button>
                        <button class="btn-vote vote-late ${myVote?.vote === 'late' ? 'active' : ''}" onclick="window.jbToggleLateSelector()">
                            <span class="vote-icon">🕐</span>
                            <span>LLEGO TARDE</span>
                        </button>

                        <div id="late-minutes-selector" class="minutes-selector" style="${myVote?.vote === 'late' ? 'display:flex;' : 'display:none;'}">
                            <button class="min-btn ${myVote?.minutes_late === 15 ? 'active' : ''}" onclick="window.jbVote('late', 15)">+15m</button>
                            <button class="min-btn ${myVote?.minutes_late === 30 ? 'active' : ''}" onclick="window.jbVote('late', 30)">+30m</button>
                            <button class="min-btn ${myVote?.minutes_late === 45 ? 'active' : ''}" onclick="window.jbVote('late', 45)">+45m</button>
                            <button class="min-btn ${myVote?.minutes_late === 60 ? 'active' : ''}" onclick="window.jbVote('late', 60)">+1h</button>
                        </div>
                    </div>
                </div>

                <!-- Panel Derecho: Resultados -->
                <div class="poll-right-side">
                    <div class="poll-results-summary">
                        <div class="results-group collapsed-mobile">
                            <div class="results-group-title" onclick="window.jbToggleGroup(this.parentElement)">
                                <span>DISPONIBLES</span> <span>${yesVotes.length}</span>
                            </div>
                            <div class="results-voters-list">
                                ${yesVotes.map(v => renderVoterRow(v)).join('')}
                            </div>
                        </div>
                        <div class="results-group collapsed-mobile">
                            <div class="results-group-title" onclick="window.jbToggleGroup(this.parentElement)">
                                <span>LLEGAN TARDE</span> <span>${lateVotes.length}</span>
                            </div>
                            <div class="results-voters-list">
                                ${lateVotes.map(v => renderVoterRow(v)).join('')}
                            </div>
                        </div>
                        <div class="results-group collapsed-mobile">
                            <div class="results-group-title" onclick="window.jbToggleGroup(this.parentElement)">
                                <span>NO PUEDEN</span> <span>${noVotes.length}</span>
                            </div>
                            <div class="results-voters-list">
                                ${noVotes.map(v => renderVoterRow(v)).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    renderPollHistory();
}

function renderVoterRow(vote) {
    const profile = vote.profiles;
    if (!profile) return `<div class="voter-row empty">?</div>`;
    
    const avatar = AVATARS.find(a => a.id === parseInt(profile.avatar_id)) || AVATARS[0];
    // Buscar la posición en el estado global (state.players)
    const player = state.players.find(p => p.user_id === vote.user_id);
    const position = player ? player.primaryPos : 'N/A';
    const posClass = getPositionColorClass(position);
    
    let lateInfo = '';
    if (vote.vote === 'late' && vote.minutes_late) {
        lateInfo = `<span class="late-row-tag">+${vote.minutes_late}m</span>`;
    }

    return `
        <div class="voter-row fade-in">
            <div class="voter-row-avatar">
                <div class="voter-avatar-svg-container">${avatar.svg}</div>
            </div>
            <div class="voter-row-info">
                <span class="voter-row-name">${profile.full_name}</span>
                <span class="voter-row-pos ${posClass}">${position}</span>
            </div>
            ${lateInfo}
        </div>
    `;
}
