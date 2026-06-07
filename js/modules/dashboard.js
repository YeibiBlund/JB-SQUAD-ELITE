// dashboard.js

// --- TEMPORARY BACKFILL SCRIPT FOR WIN PERCENTAGE (OPTION B) ---
window.devFixWins = async function() {
    if (!state.team) {
        console.error("❌ No hay equipo cargado.");
        return;
    }
    
    console.log("🔍 === DIAGNÓSTICO COMPLETO ===");
    console.log("Sesiones en state.sessions:", state.sessions.length);
    console.log("Jugadores en state.players:", state.players.length);
    
    // Mostrar info de cada sesión
    state.sessions.forEach((s, i) => {
        console.log(`  Sesión ${i}: type="${s.type}", status="${s.status}", matches=${s.matches?.length || 0}`);
        if (s.matches) {
            s.matches.forEach((m, j) => {
                console.log(`    Partido ${j}: ${m.scoreHome}-${m.scoreAway} (type=${m.type})`);
            });
        }
    });
    
    // Mostrar stats actuales de cada jugador
    state.players.forEach(p => {
        console.log(`  Jugador "${p.name}": official.matches=${p.stats?.official?.matches || 0}, friendly.matches=${p.stats?.friendly?.matches || 0}`);
    });

    console.log("\n🔧 Iniciando recálculo retrospectivo...");
    let updatedPlayers = new Set();
    
    // Resetear wins a 0
    for (let p of state.players) {
        if (!p.stats) p.stats = { official: { goals: 0, assists: 0, matches: 0, wins: 0 }, friendly: { goals: 0, assists: 0, matches: 0, wins: 0 } };
        if (!p.stats.official) p.stats.official = { goals: 0, assists: 0, matches: 0, wins: 0 };
        if (!p.stats.friendly) p.stats.friendly = { goals: 0, assists: 0, matches: 0, wins: 0 };
        if (p.stats.official.wins === undefined) p.stats.official.wins = 0;
        if (p.stats.friendly.wins === undefined) p.stats.friendly.wins = 0;
        p.stats.official.wins = 0;
        p.stats.friendly.wins = 0;
    }

    // Calcular total de victorias del club en todo el historial
    let totalClubWins = 0;
    for (let session of state.sessions) {
        if (!session.matches || session.matches.length === 0) continue;
        const winsInSession = session.matches.filter(m => m.scoreHome > m.scoreAway).length;
        totalClubWins += winsInSession;
        console.log(`  Sesión (type=${session.type}): ${winsInSession} victorias de ${session.matches.length} partidos`);
    }
    console.log(`\n📊 Total victorias del club: ${totalClubWins}`);

    if (totalClubWins === 0) {
        console.log("⚠️ No se encontraron victorias en el historial. Nada que actualizar.");
        return;
    }

    // Aplicar victorias: a cada jugador que tenga PJ, asignar wins proporcionales
    // Como solo hay 1 jornada, asignamos las victorias a quienes tengan partidos
    for (let p of state.players) {
        let changed = false;
        
        // Para categoría official
        if (p.stats.official.matches > 0) {
            p.stats.official.wins = Math.min(p.stats.official.matches, totalClubWins);
            console.log(`  ✅ ${p.name} -> official wins: ${p.stats.official.wins}/${p.stats.official.matches}`);
            changed = true;
        }
        
        // Para categoría friendly
        if (p.stats.friendly.matches > 0) {
            p.stats.friendly.wins = Math.min(p.stats.friendly.matches, totalClubWins);
            console.log(`  ✅ ${p.name} -> friendly wins: ${p.stats.friendly.wins}/${p.stats.friendly.matches}`);
            changed = true;
        }
        
        if (changed) updatedPlayers.add(p);
    }
    
    console.log(`\n📤 Subiendo correcciones de ${updatedPlayers.size} jugadores a Supabase...`);
    for (let p of updatedPlayers) {
        const { error } = await supabase.from('players').update({ stats: p.stats }).eq('id', p.id);
        if (error) {
            console.error("❌ Error al actualizar:", p.name, error);
        } else {
            console.log(`  ✅ ${p.name} guardado OK`);
        }
    }
    console.log("\n🎉 Backfill completado. Recarga la página para ver los porcentajes actualizados.");
};

// --- LÓGICA SIEMPRE DISPONIBLE (v58.0) ---
window.toggleAlwaysAvailable = async (status) => {
    if (!state.userPlayer) return;
    
    window.jbLoading.show(status ? 'Activando auto-asistencia...' : 'Desactivando auto-asistencia...');
    try {
        const { error } = await supabase
            .from('players')
            .update({ always_available: status })
            .eq('id', state.userPlayer.id);

        if (error) throw error;

        // Actualizar estado local
        state.userPlayer.alwaysAvailable = status;
        const pIndex = state.players.findIndex(p => p.id === state.userPlayer.id);
        if (pIndex !== -1) state.players[pIndex].alwaysAvailable = status;

        window.jbToast(status ? 'Auto-asistencia ACTIVADA' : 'Auto-asistencia DESACTIVADA', 'success');
        
        // Re-renderizar perfil para ver el cambio
        renderPlayerProfileDetail(state.userPlayer);
        
    } catch (err) {
        console.error(">>> [ERROR] toggleAlwaysAvailable:", err);
        window.jbToast('Error al actualizar preferencia', 'error');
        // Revertir el checkbox visualmente si falla (esto se hace re-renderizando)
        renderPlayerProfileDetail(state.userPlayer);
    }
    window.jbLoading.hide();
};

/**
 * RENDERIZA EL DASHBOARD DE ADMINISTRACIÓN GLOBAL (v59.0)
 */
/**
 * RENDERIZA EL DASHBOARD DE ADMINISTRACIÓN GLOBAL (v59.3)
 */
window.renderAdminDashboard = async function() {
    if (!state.user?.profile?.is_admin) return;
    
    // --- SETUP LISTENERS UNA SOLA VEZ ---
    if (!window._adminPanelInitialized) {
        window._adminPanelInitialized = true;
        
        const adminTabs = document.querySelectorAll('#admin-tabs .elite-tab-btn');
        adminTabs.forEach(btn => {
            btn.onclick = () => {
                adminTabs.forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                const target = btn.dataset.target;
                document.querySelectorAll('.admin-panel-content').forEach(p => p.style.display = 'none');
                document.getElementById(target).style.display = 'block';
            };
        });

        const btnGenerate = document.getElementById('btn-admin-generate-code');
        if (btnGenerate) {
            btnGenerate.onclick = async () => {
                const code = document.getElementById('admin-new-invite-code').value.trim().toUpperCase();
                const uses = parseInt(document.getElementById('admin-new-invite-uses').value) || 10;
                const type = document.getElementById('admin-new-invite-type').value;

                if (!code) { window.jbToast('Escribe un código válido.', 'warning'); return; }
                window.jbLoading.show('Generando invitación...');
                const { error } = await supabase.from('invitations').insert([{ code, max_uses: uses, type }]);
                window.jbLoading.hide();
                if (error) window.jbToast('Error: ' + error.message, 'error');
                else {
                    window.jbToast('¡Código generado con éxito!', 'success');
                    document.getElementById('admin-new-invite-code').value = '';
                    window.renderAdminDashboard();
                }
            };
        }
    }

    window.jbLoading.show('Cargando datos globales...');
    
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch masivo de datos para tenerlos en memoria
        const [{ count: teamCount }, { count: userCount }, { data: allSessions }, { data: todayLogins }, { data: teamsData }, { data: invites }, { data: profiles }, { data: memberships }, { data: allLogins }] = await Promise.all([
            supabase.from('teams').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('sessions').select('team_id, matches'),
            supabase.from('login_logs').select('id').gte('login_at', thirtyDaysAgo.toISOString()),
            supabase.from('teams').select('id, name, created_at'),
            supabase.from('invitations').select('*').order('created_at', { ascending: false }),
            supabase.from('profiles').select('id, full_name, created_at, invite_code_used'),
            supabase.from('memberships').select('user_id, team_id, role'),
            supabase.from('login_logs').select('user_id, login_at').order('login_at', { ascending: false })
        ]);

        let totalMatches = 0;
        if (allSessions) allSessions.forEach(s => { if (s.matches) totalMatches += s.matches.length; });

        // Guardar en estado para sorting rápido
        state.adminData = {
            stats: { teams: teamCount, users: userCount, matches: totalMatches, todayLogins: todayLogins?.length || 0 },
            teams: teamsData || [],
            invites: invites || [],
            profiles: profiles || [],
            memberships: memberships || [],
            logins: allLogins || [],
            sessions: allSessions || []
        };

        renderAdminUI();

    } catch (err) {
        console.error(">>> [ERROR] renderAdminDashboard:", err);
        window.jbToast('Error al cargar datos globales.', 'error');
    } finally {
        window.jbLoading.hide();
    }
}

/**
 * SOLO RENDERIZA LA UI CON LOS DATOS YA CARGADOS (Soporta Ordenación)
 */
function renderAdminUI() {
    const data = state.adminData;
    if (!data) return;

    // 1. Stats Cards
    document.getElementById('admin-total-teams').textContent = data.stats.teams;
    document.getElementById('admin-total-users').textContent = data.stats.users;
    document.getElementById('admin-total-matches').textContent = data.stats.matches;
    document.getElementById('admin-today-logins').textContent = data.stats.todayLogins;

    // 2. Directorio Rápido (Ordenable)
    const teamListEl = document.getElementById('admin-teams-list');
    if (teamListEl) {
        let sortedTeams = data.teams.map(t => {
            const members = data.memberships.filter(m => m.team_id === t.id);
            const managerMem = members.find(m => m.role === 'manager');
            const managerProfile = data.profiles.find(p => p.id === managerMem?.user_id);
            return { ...t, memberCount: members.length, managerName: managerProfile ? managerProfile.full_name : 'SIN MANAGER' };
        });

        const sort = state.adminSort?.teams;
        if (sort) {
            sortedTeams.sort((a, b) => {
                let valA = a[sort.column];
                let valB = b[sort.column];
                if (sort.column === 'members') { valA = a.memberCount; valB = b.memberCount; }
                if (sort.column === 'manager') { valA = a.managerName; valB = b.managerName; }
                if (typeof valA === 'string') return sort.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                return sort.direction === 'asc' ? valA - valB : valB - valA;
            });
        }

        teamListEl.innerHTML = sortedTeams.map(team => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 12px 10px; font-weight: 800; color: var(--primary);">${team.name.toUpperCase()}</td>
                <td style="padding: 12px 10px;">${team.memberCount} MIEMBROS</td>
                <td style="padding: 12px 10px; opacity: 0.7;">${team.managerName.toUpperCase()}</td>
                <td style="padding: 12px 10px; text-align: right; opacity: 0.5;">${new Date(team.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');
    }

    // 3. Gestión de Usuarios (Ordenable)
    const usersListEl = document.getElementById('admin-all-users-list');
    if (usersListEl) {
        let sortedUsers = data.profiles.map(u => {
            const membership = data.memberships.find(m => m.user_id === u.id);
            const team = data.teams.find(t => t.id === membership?.team_id);
            const lastLoginObj = data.logins.find(l => l.user_id === u.id);
            return { 
                ...u, 
                teamName: team ? team.name.toUpperCase() : 'ZZZ_SIN_EQUIPO', 
                lastLogin: lastLoginObj ? new Date(lastLoginObj.login_at).getTime() : 0,
                lastLoginStr: lastLoginObj ? new Date(lastLoginObj.login_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'NUNCA'
            };
        });

        const sort = state.adminSort?.users;
        if (sort) {
            sortedUsers.sort((a, b) => {
                let valA = a[sort.column];
                let valB = b[sort.column];
                if (sort.column === 'name') { valA = a.full_name; valB = b.full_name; }
                if (sort.column === 'team') { valA = a.teamName; valB = b.teamName; }
                if (sort.column === 'last_login') { valA = a.lastLogin; valB = b.lastLogin; }
                if (typeof valA === 'string') return sort.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                return sort.direction === 'asc' ? valA - valB : valB - valA;
            });
        }

        usersListEl.innerHTML = sortedUsers.map(u => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 12px 10px; font-weight: 800; color: #fff;">${u.full_name.toUpperCase()}</td>
                <td style="padding: 12px 10px; opacity: 0.8; font-size: 0.65rem;">${u.teamName.replace('ZZZ_', '')}</td>
                <td style="padding: 12px 10px; opacity: 0.5;">${new Date(u.created_at).toLocaleDateString()}</td>
                <td style="padding: 12px 10px; opacity: 0.5;">${u.lastLoginStr}</td>
                <td style="padding: 12px 10px; text-align: right;">
                    <button onclick="window.deleteUser('${u.id}', '${u.full_name}')" style="background: none; border: none; color: var(--error); cursor: pointer; padding: 5px; font-size: 0.6rem; font-weight: 900; border: 1px solid rgba(255,0,0,0.2); border-radius: 4px;">🗑️ BORRAR</button>
                </td>
            </tr>
        `).join('');
    }

    // 4. Gestión Completa de Clubes (v59.3)
    const clubsListEl = document.getElementById('admin-all-clubs-list');
    if (clubsListEl) {
        let sortedClubs = data.teams.map(t => {
            const members = data.memberships.filter(m => m.team_id === t.id);
            const managerMem = members.find(m => m.role === 'manager');
            const managerProfile = data.profiles.find(p => p.id === managerMem?.user_id);
            
            const teamSessions = data.sessions.filter(s => s.team_id === t.id);
            let matchCount = 0;
            teamSessions.forEach(s => { if (s.matches) matchCount += s.matches.length; });

            return { 
                ...t, 
                managerName: managerProfile ? managerProfile.full_name : 'SIN ASIGNAR',
                memberCount: members.length,
                matchCount: matchCount
            };
        });

        const sort = state.adminSort?.clubs;
        if (sort) {
            sortedClubs.sort((a, b) => {
                let valA = a[sort.column];
                let valB = b[sort.column];
                if (sort.column === 'manager') { valA = a.managerName; valB = b.managerName; }
                if (sort.column === 'members') { valA = a.memberCount; valB = b.memberCount; }
                if (sort.column === 'matches') { valA = a.matchCount; valB = b.matchCount; }
                if (typeof valA === 'string') return sort.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                return sort.direction === 'asc' ? valA - valB : valB - valA;
            });
        }

        clubsListEl.innerHTML = sortedClubs.map(c => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 12px 10px; font-weight: 800; color: var(--primary);">${c.name.toUpperCase()}</td>
                <td style="padding: 12px 10px; opacity: 0.8;">${c.managerName.toUpperCase()}</td>
                <td style="padding: 12px 10px; opacity: 0.6;">${c.memberCount} MIEMBROS</td>
                <td style="padding: 12px 10px; color: #fff;">${c.matchCount} PJ</td>
                <td style="padding: 12px 10px; opacity: 0.5;">${new Date(c.created_at).toLocaleDateString()}</td>
                <td style="padding: 12px 10px; text-align: right;">
                    <button onclick="window.deleteTeam('${c.id}', '${c.name}')" style="background: none; border: none; color: var(--error); cursor: pointer; padding: 5px; font-size: 0.6rem; font-weight: 900; border: 1px solid rgba(255,0,0,0.2); border-radius: 4px;">🗑️ DISOLVER</button>
                </td>
            </tr>
        `).join('');
    }

    // 5. Invitaciones
    const invitesListEl = document.getElementById('admin-invites-list');
    if (invitesListEl) {
        invitesListEl.innerHTML = data.invites.map(inv => {
            const typeLabel = inv.type === 'founding' ? 'FUNDACIÓN' : 'REGISTRO';
            const typeColor = inv.type === 'founding' ? 'var(--primary)' : '#fff';
            return `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px 10px; font-weight: 900; color: #fff;">${inv.code}</td>
                    <td style="padding: 12px 10px; font-weight: 800; font-size: 0.6rem; color: ${typeColor};">${typeLabel}</td>
                    <td style="padding: 12px 10px; color: var(--primary);">${inv.used_count}</td>
                    <td style="padding: 12px 10px; opacity: 0.5;">${inv.max_uses}</td>
                    <td style="padding: 12px 10px; text-align: right;">
                        <button onclick="window.deleteInviteCode('${inv.id}')" style="background: none; border: none; color: var(--error); cursor: pointer; padding: 5px;">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // 6. Ranking de Fidelidad
    const loginCounts = {};
    data.logins.forEach(l => { loginCounts[l.user_id] = (loginCounts[l.user_id] || 0) + 1; });
    const rankingEl = document.getElementById('admin-users-ranking');
    if (rankingEl) {
        const sortedUsers = data.profiles
            .map(p => ({ name: p.full_name, count: loginCounts[p.id] || 0 }))
            .sort((a, b) => b.count - a.count);
        rankingEl.innerHTML = sortedUsers.map((u, idx) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-weight: 900; color: var(--primary); opacity: 0.5;">#${idx + 1}</span>
                    <span style="font-weight: 700;">${u.name.toUpperCase()}</span>
                </div>
                <span style="background: var(--primary); color: #000; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 900;">${u.count} LOGINS</span>
            </div>
        `).join('');
    }
}

/**
 * GESTIÓN DE ORDENACIÓN DE TABLAS ADMIN (v59.2)
 */
window.sortAdminTable = function(tableKey, columnKey) {
    if (!state.adminSort) state.adminSort = {};
    const current = state.adminSort[tableKey] || { column: '', direction: 'asc' };
    
    if (current.column === columnKey) {
        current.direction = current.direction === 'asc' ? 'desc' : 'asc';
    } else {
        current.column = columnKey;
        current.direction = 'asc';
    }
    
    state.adminSort[tableKey] = current;
    renderAdminUI();
}

/**
 * ELIMINA UN EQUIPO DE LA PLATAFORMA (v59.3)
 */
window.deleteTeam = async function(teamId, teamName) {
    if (!await window.jbConfirm(`¿ESTÁS COMPLETAMENTE SEGURO? Se disolverá el club ${teamName.toUpperCase()} borrando sus sesiones, estadísticas y miembros permanentemente.`)) return;
    window.jbLoading.show('Disolviendo club...');
    try {
        const { error } = await supabase.rpc('delete_team_by_admin', { target_team_id: teamId });
        if (error) throw error;
        window.jbToast('Club disuelto correctamente.', 'success');
        window.renderAdminDashboard();
    } catch (err) {
        console.error(">>> [ERROR] deleteTeam:", err);
        window.jbToast('Error al disolver club.', 'error');
    } finally {
        window.jbLoading.hide();
    }
}

/**
 * ELIMINA UN USUARIO DE LA PLATAFORMA (v59.1)
 */
window.deleteUser = async function(userId, userName) {
    if (userId === state.user?.auth?.id) { window.jbToast('No puedes borrarte a ti mismo.', 'warning'); return; }
    if (!await window.jbConfirm(`¿ESTÁS COMPLETAMENTE SEGURO? Se borrará la cuenta de ${userName.toUpperCase()} y todos sus datos vinculados de forma permanente.`)) return;
    window.jbLoading.show('Eliminando usuario...');
    try {
        const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: userId });
        if (error) throw error;
        window.jbToast('Usuario eliminado correctamente.', 'success');
        window.renderAdminDashboard();
    } catch (err) {
        console.error(">>> [ERROR] deleteUser:", err);
        window.jbToast('Error al eliminar usuario.', 'error');
    } finally {
        window.jbLoading.hide();
    }
}

/**
 * ELIMINA UN CÓDIGO DE INVITACIÓN (v59.0)
 */
window.deleteInviteCode = async function(id) {
    if (!await window.jbConfirm('¿Seguro que quieres eliminar este código?')) return;
    window.jbLoading.show('Eliminando...');
    const { error } = await supabase.from('invitations').delete().eq('id', id);
    window.jbLoading.hide();
    if (error) window.jbToast('Error al borrar: ' + error.message, 'error');
    else {
        window.jbToast('Código eliminado.', 'success');
        window.renderAdminDashboard();
    }
}

/**
 * CONMUTADOR DE SUB-PESTAÑAS DE PORTERÍAS A CERO (GENERAL / PORTEROS) v61.0 (Sólo Mobile en v63.0)
 */
window.switchCSTab = function(tab) {
    window.activeCleanSheetsTab = tab;
    
    // Elementos Móvil
    const btnGeneralM = document.getElementById('btn-cs-tab-general-mobile');
    const btnKeepersM = document.getElementById('btn-cs-tab-keepers-mobile');
    const listGeneralM = document.getElementById('mobile-top-cleansheets-list');
    const listKeepersM = document.getElementById('mobile-top-keepers-list');
    
    if (tab === 'keepers') {
        // Mobile update
        if (btnGeneralM) {
            btnGeneralM.style.background = 'transparent';
            btnGeneralM.style.borderColor = 'rgba(255,255,255,0.05)';
            btnGeneralM.style.color = 'var(--text-muted)';
        }
        if (btnKeepersM) {
            btnKeepersM.style.background = 'rgba(240, 165, 0, 0.15)';
            btnKeepersM.style.borderColor = 'rgba(240, 165, 0, 0.3)';
            btnKeepersM.style.color = '#fff';
        }
        if (listGeneralM) listGeneralM.style.setProperty('display', 'none', 'important');
        if (listKeepersM) listKeepersM.style.setProperty('display', 'flex', 'important');
    } else {
        // Mobile update
        if (btnKeepersM) {
            btnKeepersM.style.background = 'transparent';
            btnKeepersM.style.borderColor = 'rgba(255,255,255,0.05)';
            btnKeepersM.style.color = 'var(--text-muted)';
        }
        if (btnGeneralM) {
            btnGeneralM.style.background = 'rgba(240, 165, 0, 0.15)';
            btnGeneralM.style.borderColor = 'rgba(240, 165, 0, 0.3)';
            btnGeneralM.style.color = '#fff';
        }
        if (listKeepersM) listKeepersM.style.setProperty('display', 'none', 'important');
        if (listGeneralM) listGeneralM.style.setProperty('display', 'flex', 'important');
    }
};
window.switchMobileCSTab = window.switchCSTab;

/**
 * CONMUTADOR DE PESTAÑAS PRINCIPALES DE RANKINGS EN MÓVIL v62.0
 */
window.switchMobileRankingTab = function(activeTab) {
    const tabs = ['goals', 'assists', 'winrate', 'cleansheets'];
    
    tabs.forEach(tab => {
        const btn = document.getElementById(`m-btn-${tab}`);
        const content = document.getElementById(`mobile-tab-${tab}`);
        
        if (btn) {
            if (tab === activeTab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
        
        if (content) {
            if (tab === activeTab) {
                content.style.setProperty('display', 'block', 'important');
            } else {
                content.style.setProperty('display', 'none', 'important');
            }
        }
    });
};

/**
 * MÓDULO VISUAL: TARJETAS DE PLANTILLA 3D (v62.0)
 */
async function loadAttendanceVotesForCards() {
    if (state.attendanceRatioCache) return state.attendanceRatioCache;

    try {
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

        const cache = {};
        state.players.forEach(p => {
            let yesCount = 0;
            let noCount = 0;
            if (p.user_id) {
                const playerVotes = votes.filter(v => v.user_id === p.user_id);
                playerVotes.forEach(v => {
                    if (v.vote === 'yes' || v.vote === 'late') yesCount++;
                    else if (v.vote === 'no') noCount++;
                });
            }
            const totalVotes = yesCount + noCount;
            const ratio = totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0;
            cache[p.id] = ratio;
        });

        state.attendanceRatioCache = cache;
        return cache;
    } catch (err) {
        console.error(">>> [ERROR] loadAttendanceVotesForCards:", err.message);
        const cache = {};
        state.players.forEach(p => cache[p.id] = 0);
        return cache;
    }
}

function generatePlayerStreakHTML(player) {
    if (!state.sessions || state.sessions.length === 0) {
        return `
            <span class="streak-circle none" title="Sin partidos">-</span>
            <span class="streak-circle none" title="Sin partidos">-</span>
            <span class="streak-circle none" title="Sin partidos">-</span>
            <span class="streak-circle none" title="Sin partidos">-</span>
            <span class="streak-circle none" title="Sin partidos">-</span>
        `;
    }

    const closedSessions = [...state.sessions]
        .filter(s => s.status === 'closed')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const playerMatches = [];

    for (let sess of closedSessions) {
        if (!sess.matches || sess.matches.length === 0) continue;

        let sessionLineupIds = [];
        if (sess.lineup) {
            if (Array.isArray(sess.lineup)) {
                sessionLineupIds = sess.lineup.map(id => id.toString());
            } else if (sess.lineup.assignments) {
                sessionLineupIds = Object.values(sess.lineup.assignments).filter(id => id).map(id => id.toString());
            } else if (typeof sess.lineup === 'object') {
                sessionLineupIds = Object.values(sess.lineup).filter(id => id && typeof id !== 'object').map(id => id.toString());
            }
        }

        if (!sessionLineupIds.includes(player.id.toString()) && !sessionLineupIds.includes(player.id)) {
            continue;
        }

        const sessMatches = [...sess.matches].reverse();
        for (let match of sessMatches) {
            let result = 'E';
            const sh = match.scoreHome || 0;
            const sa = match.scoreAway || 0;

            if (sh === sa) {
                result = 'E';
            } else if (sh > sa) {
                result = 'V';
            } else {
                result = 'D';
            }

            playerMatches.push({
                result: result,
                rival: match.rival || 'Rival'
            });

            if (playerMatches.length >= 5) break;
        }

        if (playerMatches.length >= 5) break;
    }

    if (playerMatches.length === 0) {
        return `
            <span class="streak-circle none" title="Sin partidos">-</span>
            <span class="streak-circle none" title="Sin partidos">-</span>
            <span class="streak-circle none" title="Sin partidos">-</span>
            <span class="streak-circle none" title="Sin partidos">-</span>
            <span class="streak-circle none" title="Sin partidos">-</span>
        `;
    }

    const recentMatches = playerMatches.slice(0, 5).reverse();
    const placeholdersNeeded = 5 - recentMatches.length;
    let html = '';

    for (let i = 0; i < placeholdersNeeded; i++) {
        html += `<span class="streak-circle none" title="Sin partidos">-</span>`;
    }

    recentMatches.forEach(m => {
        let className = 'draw';
        let title = `Empate vs ${m.rival}`;
        if (m.result === 'V') {
            className = 'win';
            title = `Victoria vs ${m.rival}`;
        } else if (m.result === 'D') {
            className = 'loss';
            title = `Derrota vs ${m.rival}`;
        }

        html += `<span class="streak-circle ${className}" title="${title}">${m.result}</span>`;
    });

    return html;
}

function generateFUTCardFrontHTML(player) {
    const avatar = AVATARS.find(av => av.id === (player.avatarID || player.avatar_id || 1));
    const photo = player.photo_url;
    const name = player.name || 'SIN NOMBRE';
    const dorsal = player.dorsal || '00';
    const pos = player.primaryPos || '??';

    return `
        <div class="player-card-fut large">
            <div class="dorsal-large">${dorsal}</div>
            <div class="pos-large">${pos}</div>
            <div class="player-img-large">
                ${photo ? `<img src="${photo}">` : (avatar ? avatar.svg : '')}
            </div>
            <div class="name-banner-large">
                <h2 style="font-size: ${name.length > 10 ? '1.0rem' : '1.3rem'}">${name.toUpperCase()}</h2>
            </div>
        </div>
    `;
}

function generateFUTCardBackHTML(player, attendanceRatio, streakHTML) {
    const name = player.name || 'SIN NOMBRE';
    const dorsal = player.dorsal || '00';
    const pos = player.primaryPos || '??';

    const offStats = player.stats?.official || { matches: 0, goals: 0, assists: 0, cleanSheets: 0 };
    const friStats = player.stats?.friendly || { matches: 0, goals: 0, assists: 0, cleanSheets: 0 };
    
    const initMatches = (offStats.matches || 0) + (friStats.matches || 0);
    const initGoals = (offStats.goals || 0) + (friStats.goals || 0);
    const initAssists = (offStats.assists || 0) + (friStats.assists || 0);
    const initCleanSheets = (offStats.cleanSheets || 0) + (friStats.cleanSheets || 0);

    return `
        <div class="card-back-header">
            <div class="card-back-name">${name.toUpperCase()}</div>
            <div class="card-back-meta">
                <span class="card-back-pos">${pos}</span>
                <span class="card-back-dorsal">#${dorsal}</span>
            </div>
        </div>

        <div class="card-back-tabs">
            <button class="card-back-tab-btn active" data-tab="glo" data-player-id="${player.id}">GLO</button>
            <button class="card-back-tab-btn" data-tab="ofi" data-player-id="${player.id}">OFI</button>
            <button class="card-back-tab-btn" data-tab="ami" data-player-id="${player.id}">AMI</button>
        </div>

        <div class="card-back-stats-list" id="card-back-stats-${player.id}" style="transition: opacity 0.15s ease;">
            <div class="card-back-stat-row">
                <span class="card-back-stat-label">PARTIDOS JUGADOS</span>
                <span class="card-back-stat-value" data-stat="matches">${initMatches}</span>
            </div>
            <div class="card-back-stat-row">
                <span class="card-back-stat-label">GOLES</span>
                <span class="card-back-stat-value highlight" data-stat="goals">${initGoals}</span>
            </div>
            <div class="card-back-stat-row">
                <span class="card-back-stat-label">ASISTENCIAS</span>
                <span class="card-back-stat-value highlight" data-stat="assists">${initAssists}</span>
            </div>
            <div class="card-back-stat-row">
                <span class="card-back-stat-label">PORTERÍAS A 0</span>
                <span class="card-back-stat-value" data-stat="cleansheets">${initCleanSheets}</span>
            </div>
            <div class="card-back-stat-row">
                <span class="card-back-stat-label">ASISTENCIA (% SÍ)</span>
                <span class="card-back-stat-value" style="color:#4CAF50;">${attendanceRatio}%</span>
            </div>
        </div>

        <div class="card-back-streak-zone">
            <div class="card-back-streak-title">Últimos 5 Partidos (Racha)</div>
            <div class="card-back-streak-row">
                ${streakHTML}
            </div>
        </div>
    `;
}

function setupCardBackTabEvents(cardInner, player, attendanceRatio) {
    const tabs = cardInner.querySelectorAll('.card-back-tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabType = tab.getAttribute('data-tab');
            const offStats = player.stats?.official || { matches: 0, goals: 0, assists: 0, cleanSheets: 0 };
            const friStats = player.stats?.friendly || { matches: 0, goals: 0, assists: 0, cleanSheets: 0 };

            let matches = 0, goals = 0, assists = 0, cleansheets = 0;

            if (tabType === 'ofi') {
                matches = offStats.matches || 0;
                goals = offStats.goals || 0;
                assists = offStats.assists || 0;
                cleansheets = offStats.cleanSheets || 0;
            } else if (tabType === 'ami') {
                matches = friStats.matches || 0;
                goals = friStats.goals || 0;
                assists = friStats.assists || 0;
                cleansheets = friStats.cleanSheets || 0;
            } else {
                matches = (offStats.matches || 0) + (friStats.matches || 0);
                goals = (offStats.goals || 0) + (friStats.goals || 0);
                assists = (offStats.assists || 0) + (friStats.assists || 0);
                cleansheets = (offStats.cleanSheets || 0) + (friStats.cleanSheets || 0);
            }

            const statsListContainer = cardInner.querySelector(`#card-back-stats-${player.id}`);
            if (statsListContainer) {
                statsListContainer.style.opacity = '0.2';
                setTimeout(() => {
                    statsListContainer.querySelector('[data-stat="matches"]').textContent = matches;
                    statsListContainer.querySelector('[data-stat="goals"]').textContent = goals;
                    statsListContainer.querySelector('[data-stat="assists"]').textContent = assists;
                    statsListContainer.querySelector('[data-stat="cleansheets"]').textContent = cleansheets;
                    statsListContainer.style.opacity = '1';
                }, 120);
            }
        });
    });
}

async function renderCardsView() {
    const container = document.getElementById('cards-squad-container');
    if (!container) return;

    container.innerHTML = '<div style="text-align: center; padding: 50px; font-size: 0.9rem; color: var(--text-muted);">Cargando álbum de cartas...</div>';

    window.jbLoading.show('Generando Álbum Elite...');
    const attendanceCache = await loadAttendanceVotesForCards();
    window.jbLoading.hide();

    if (!state.players || state.players.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 50px; font-size: 0.9rem; color: var(--text-muted);">No hay jugadores registrados en el equipo.</div>';
        return;
    }

    container.innerHTML = '';

    const categories = {
        porteros: { title: '🧤 Porteros', players: [], positions: ['GK', 'POR', 'PO'] },
        defensas: { title: '🛡️ Defensas', players: [], positions: ['DFC', 'LI', 'LD', 'LTI', 'LTD', 'DFD', 'DFI', 'DF'] },
        mediocampistas: { title: '🪄 Mediocampistas', players: [], positions: ['MCD', 'MC', 'MCO', 'MI', 'MD', 'VOL'] },
        delanteros: { title: '⚡ Delanteros', players: [], positions: ['DC', 'ED', 'EI', 'SD', 'SP', 'DEL', 'PRU'] }
    };

    state.players.forEach(player => {
        const pPos = (player.primaryPos || 'DC').toUpperCase();
        if (categories.porteros.positions.includes(pPos)) {
            categories.porteros.players.push(player);
        } else if (categories.defensas.positions.includes(pPos)) {
            categories.defensas.players.push(player);
        } else if (categories.mediocampistas.positions.includes(pPos)) {
            categories.mediocampistas.players.push(player);
        } else {
            categories.delanteros.players.push(player);
        }
    });

    const POSITION_PRIORITY = {
        'GK': 1, 'POR': 1, 'PO': 1,
        'DFC': 2, 'DF': 2, 'LI': 3, 'LD': 3, 'LTI': 3, 'LTD': 3, 'DFD': 3, 'DFI': 3,
        'MCD': 4, 'MC': 5, 'MI': 6, 'MD': 6, 'MCO': 7, 'VOL': 5,
        'SD': 8, 'SP': 8, 'ED': 9, 'EI': 9, 'DC': 10, 'DEL': 10, 'PRU': 10
    };

    Object.keys(categories).forEach(catKey => {
        categories[catKey].players.sort((a, b) => {
            const prioA = POSITION_PRIORITY[a.primaryPos?.toUpperCase()] || 99;
            const prioB = POSITION_PRIORITY[b.primaryPos?.toUpperCase()] || 99;
            return prioA - prioB;
        });
    });

    Object.keys(categories).forEach(catKey => {
        const cat = categories[catKey];
        if (cat.players.length === 0) return;

        const catTitle = document.createElement('h2');
        catTitle.className = 'position-group-title';
        catTitle.textContent = `${cat.title} (${cat.players.length})`;
        container.appendChild(catTitle);

        const grid = document.createElement('div');
        grid.className = 'cards-squad-grid';

        cat.players.forEach(player => {
            const cardCol = document.createElement('div');
            cardCol.className = 'card-container';

            const streakHTML = generatePlayerStreakHTML(player);
            const frontCardHTML = generateFUTCardFrontHTML(player);
            const backCardHTML = generateFUTCardBackHTML(player, attendanceCache[player.id] || 0, streakHTML);

            cardCol.innerHTML = `
                <div class="card-inner" id="card-inner-${player.id}">
                    <div class="card-front">
                        ${frontCardHTML}
                    </div>
                    <div class="card-back">
                        ${backCardHTML}
                    </div>
                </div>
            `;

            const cardInner = cardCol.querySelector('.card-inner');
            cardInner.addEventListener('click', (e) => {
                if (e.target.closest('.card-back-tab-btn')) {
                    return;
                }
                cardInner.classList.toggle('flipped');
            });

            setupCardBackTabEvents(cardInner, player, attendanceCache[player.id] || 0);

            grid.appendChild(cardCol);
        });

        container.appendChild(grid);
    });
}

// ==========================================================================
// SECCIÓN: HISTORIAL DE RIVALES H2H (v65.0)
// ==========================================================================
