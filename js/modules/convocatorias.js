// convocatorias.js

// --- EDICIÓN DE CONVOCATORIA (v56.0) ---
window.jbEditPoll = function(pollId) {
    if (!state.activePoll || state.activePoll.id !== pollId) return;
    
    const poll = state.activePoll;
    const formContainer = document.getElementById('new-poll-form-container');
    const btnNew = document.getElementById('btn-new-poll');
    const formTitle = formContainer.querySelector('h3');
    const btnSave = document.getElementById('btn-save-poll');
    
    // Rellenar campos
    document.getElementById('poll-title').value = poll.title;
    const d = new Date(poll.scheduled_time);
    document.getElementById('poll-date').value = d.toISOString().split('T')[0];
    
    // Formatear hora local HH:mm para el input type="time"
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    document.getElementById('poll-time').value = `${hours}:${minutes}`;
    
    // Ajustar UI del formulario para modo edición
    formTitle.textContent = "EDITAR CONVOCATORIA";
    btnSave.textContent = "ACTUALIZAR CONVOCATORIA";
    state.editingPollId = pollId;
    
    formContainer.style.display = 'block';
    if (btnNew) btnNew.style.display = 'none';
    
    // Scroll al formulario
    formContainer.scrollIntoView({ behavior: 'smooth' });
};

async function updatePoll(pollId, title, date, time) {
    window.jbLoading.show('Actualizando convocatoria...');
    try {
        const scheduledTime = new Date(`${date}T${time}`).toISOString();
        const { error } = await supabase
            .from('availability_polls')
            .update({
                title: title,
                scheduled_time: scheduledTime
            })
            .eq('id', pollId);

        if (error) throw error;

        window.jbToast('Convocatoria actualizada con éxito', 'success');
        await renderAvailabilityPanel(); // Refrescar UI
    } catch (err) {
        console.error(">>> [ERROR] updatePoll:", err);
        window.jbToast('Error al actualizar: ' + err.message, 'error');
    }
    window.jbLoading.hide();
}

async function renderPollHistory() {
    // Redirigir a la nueva lógica de calendario (v53.0)
    renderPollsCalendar();
}

/**
 * RENDERIZA EL CALENDARIO DE CONVOCATORIAS (v53.0)
 */
async function renderPollsCalendar() {
    const grid = document.getElementById('polls-calendar-grid');
    const label = document.getElementById('polls-calendar-month-label');
    if (!grid || !label || !state.team) return;

    const year = currentPollsCalendarDate.getFullYear();
    const month = currentPollsCalendarDate.getMonth();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const today = new Date();
    const todayStr = today.toDateString();

    label.textContent = `${monthNames[month].toUpperCase()} ${year}`;

    // 1. Obtener todas las convocatorias del equipo
    const { data: allPolls, error } = await supabase
        .from('availability_polls')
        .select('id, title, scheduled_time, status, final_alignment')
        .eq('team_id', state.team.id);

    if (error) return;

    // Limpiar grid DESPUÉS del await para evitar race condition (v53.1)
    grid.innerHTML = '';

    // Mapear por fecha para acceso rápido
    const pollsByDate = new Map();
    allPolls.forEach(p => {
        const d = new Date(p.scheduled_time);
        const dateStr = d.toDateString();
        if (!pollsByDate.has(dateStr)) pollsByDate.set(dateStr, []);
        pollsByDate.get(dateStr).push(p);
    });

    // 2. Grid Logic
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay === 0) ? 6 : firstDay - 1;

    // Celdas vacías
    for (let i = 0; i < offset; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        grid.appendChild(cell);
    }

    // Generar días
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const dateStr = dateObj.toDateString();
        const dayPolls = pollsByDate.get(dateStr);
        
        const cell = document.createElement('div');
        cell.className = 'calendar-day has-date';
        
        // Destaque hoy
        if (dateStr === todayStr) cell.classList.add('today-highlight');

        if (dayPolls && dayPolls.length > 0) {
            // Si hay una abierta, marcamos como activa (pueden haber varias, buscamos 'open')
            const active = dayPolls.find(p => p.status === 'open');
            if (active) cell.classList.add('poll-day-active');

            // Mostrar la cerrada más reciente en el calendario si existen
            const closedPolls = dayPolls.filter(p => p.status === 'closed');
            if (closedPolls.length > 0) {
                const latestClosed = closedPolls[0];
                // Verde si tiene alineación, Rojo si no
                if (latestClosed.final_alignment) cell.classList.add('poll-day-success');
                else cell.classList.add('poll-day-cancel');

                cell.onclick = () => window.jbViewPollDetail(latestClosed.id);
            } else if (active) {
                cell.onclick = () => window.jbToast(`Convocatoria Activa: ${active.title}`, 'info');
            }
        }

        cell.innerHTML = `<span class="calendar-day-number">${d}</span>`;
        grid.appendChild(cell);
    }

    // 3. Resumen Mensual (v53.0)
    let totalPolls = 0;
    let successPolls = 0;
    let cancelledPolls = 0;

    allPolls.forEach(p => {
        const d = new Date(p.scheduled_time);
        if (d.getMonth() === month && d.getFullYear() === year && p.status === 'closed') {
            totalPolls++;
            if (p.final_alignment) successPolls++;
            else cancelledPolls++;
        }
    });

    const summaryName = document.getElementById('polls-summary-month-name');
    const summaryStats = document.getElementById('polls-summary-stats');
    if (summaryName && summaryStats) {
        summaryName.textContent = `RESUMEN ${monthNames[month].toUpperCase()}`;
        summaryStats.innerHTML = `
            <div class="month-stat-card">
                <span class="label">Convocatorias</span>
                <span class="value">${totalPolls}</span>
            </div>
            <div class="month-stat-card" style="border-left: 3px solid var(--success);">
                <span class="label">Con Alineación</span>
                <span class="value" style="color: var(--success);">${successPolls}</span>
            </div>
            <div class="month-stat-card" style="border-left: 3px solid var(--error);">
                <span class="label">Archivadas</span>
                <span class="value" style="color: var(--error);">${cancelledPolls}</span>
            </div>
        `;
    }
}

// initPollHistoryFilters obsoleta en v53.0 (calendario reemplaza el select)
async function initPollHistoryFilters() { /* NOOP - Calendar replaces this */ }



window.jbViewPollDetail = async (id) => {
    const overlay = document.getElementById('poll-detail-overlay');
    const titleEl = document.getElementById('report-poll-title');
    const dateEl = document.getElementById('report-poll-date');
    const votersList = document.getElementById('report-voters-list');
    const countYes = document.getElementById('report-count-yes');
    const countLate = document.getElementById('report-count-late');
    const countNo = document.getElementById('report-count-no');
    const tacticList = document.getElementById('report-tactic-list');
    const noTactic = document.getElementById('report-no-tactic');
    const pitchContainer = document.getElementById('report-mini-pitch-container');
    const btnDeleteReport = document.getElementById('btn-delete-report');
    const btnReopenReport = document.getElementById('btn-reopen-report');
    
    // Filtros de calendario para el reporte (v53.0)
    const monthStart = new Date(currentPollsCalendarDate.getFullYear(), currentPollsCalendarDate.getMonth(), 1).toISOString();
    const monthEnd = new Date(currentPollsCalendarDate.getFullYear(), currentPollsCalendarDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

    if (!overlay) return;
    window.jbLoading.show('Generando reporte...');

    // 1. Obtener datos de la encuesta y sus votos
    const { data: poll, error: pollErr } = await supabase.from('availability_polls').select('*').eq('id', id).single();
    const { data: votes, error: voteErr } = await supabase.from('availability_votes').select('*').eq('poll_id', id);

    if (pollErr || !poll) {
        window.jbToast('Error al cargar el reporte', 'error');
        window.jbLoading.hide();
        return;
    }

    // 2. Poblar Header
    titleEl.textContent = poll.title.toUpperCase();
    dateEl.textContent = `JORNADA DEL ${new Date(poll.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`;

    // 3. Poblar Contadores
    countYes.textContent = votes?.filter(v => v.vote === 'yes').length || 0;
    countLate.textContent = votes?.filter(v => v.vote === 'late').length || 0;
    countNo.textContent = votes?.filter(v => v.vote === 'no').length || 0;

    // 4. Función de Renderizado Filtrado
    const renderVotersList = (filterType) => {
        votersList.innerHTML = '';
        const filtered = votes?.filter(v => v.vote === filterType) || [];
        
        // Actualizar estado activo en los pills
        document.querySelectorAll('.stat-pill').forEach(p => p.classList.remove('active'));
        document.getElementById(`pill-report-${filterType}`)?.classList.add('active');

        if (filtered.length === 0) {
            votersList.innerHTML = `<p style="font-size: 0.7rem; opacity: 0.4; text-align: center; padding: 20px;">Nadie en esta categoría.</p>`;
            return;
        }

        filtered.forEach(vote => {
            const player = state.players.find(p => p.user_id === vote.user_id);
            const name = player ? player.name.toUpperCase() : 'DESCONOCIDO';
            const icon = vote.vote === 'yes' ? '✅' : (vote.vote === 'late' ? '🕒' : '❌');
            const color = vote.vote === 'yes' ? '#4CAF50' : (vote.vote === 'late' ? '#FF9800' : '#F44336');
            
            const row = document.createElement('div');
            row.className = 'voter-row fade-in';
            row.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: 6px; border: 1px solid rgba(255,255,255,0.03);`;
            row.innerHTML = `
                <span style="font-size: 0.75rem; font-weight: 800; color: #fff;">${name}</span>
                <span style="color: ${color}; font-size: 0.8rem;">${icon} ${vote.vote === 'late' && vote.minutes_late ? `<small style="font-size:0.6rem;">+${vote.minutes_late}m</small>` : ''}</span>
            `;
            votersList.appendChild(row);
        });
    };

    // 4. Configurar Listeners de Filtro
    document.querySelectorAll('.stat-pill').forEach(pill => {
        pill.onclick = () => renderVotersList(pill.dataset.status);
    });

    // 5. Render Inicial (Por defecto: SÍ)
    renderVotersList('yes');

    // 4. Renderizar Táctica (Si existe snapshot)
    if (poll.final_alignment) {
        noTactic.style.display = 'none';
        pitchContainer.style.display = 'block';
        
        // Re-renderizamos en el contenedor del reporte (Modo Lista)
        const snapshot = poll.final_alignment;
        if (tacticList) {
            tacticList.innerHTML = '';
            
            const formation = FORMATIONS[snapshot.formation];
            if (formation) {
                formation.forEach(slot => {
                    const assignedId = snapshot.assignments[slot.id];
                    if (assignedId) {
                        const player = state.players.find(p => p.id.toString() === assignedId.toString());
                        if (player) {
                            // Obtenemos el status para ver si jugó con badge verde o similar
                            const status = votes?.find(v => v.user_id === player.user_id)?.vote;
                            const statusColor = status === 'yes' ? '#4CAF50' : (status === 'late' ? '#FF9800' : 'rgba(255,255,255,0.2)');
                            
                            const avatar = AVATARS.find(av => av.id === (player.avatarId || player.avatar_id || 1)) || AVATARS[0];
                            const posClass = getPositionColorClass(slot.pos) || '';
                            
                            const row = document.createElement('div');
                            row.className = 'voter-row fade-in';
                            row.style.cssText = `background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; display: flex; align-items: center; gap: 15px;`;
                            
                            row.innerHTML = `
                                <div style="width: 38px; height: 38px; border-radius: 5px; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; position: relative;">
                                    ${player.photo_url ? `<img src="${player.photo_url}" style="width: 100%; height: 100%; object-fit: cover;">` : `<div style="width: 80%; height: 80%;">${avatar.svg}</div>`}
                                    <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: ${statusColor};"></div>
                                </div>
                                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                                    <span style="font-size: 0.85rem; font-weight: 800; color: #fff;">${player.name.toUpperCase()}</span>
                                </div>
                                <div>
                                    <span class="voter-row-pos ${posClass}" style="font-size: 0.75rem; padding: 4px 8px;">${slot.pos}</span>
                                </div>
                            `;
                            tacticList.appendChild(row);
                        }
                    }
                });
            }
            
            if (tacticList.children.length === 0) {
                tacticList.innerHTML = '<p style="font-size: 0.7rem; opacity: 0.5; text-align: center; margin-top: 20px;">Sin titulares asignados.</p>';
            }
        }
    } else {
        noTactic.style.display = 'flex';
        pitchContainer.style.display = 'none';
    }

    if (btnDeleteReport) {
        if (state.user && state.user.role === 'manager') {
            btnDeleteReport.style.display = 'block';
            btnDeleteReport.onclick = async () => {
                const confirmed = await window.jbConfirm('¿Borrar esta jornada histórica de forma permanente?');
                if (confirmed) {
                    window.jbLoading.show('Eliminando historial...');
                    
                    // 1. Borramos los votos huérfanos primero para evitar errores de Foreign Key Constraint si existen.
                    await supabase.from('availability_votes').delete().eq('poll_id', id);

                    // 2. Intentamos borrar la poll y forzamos a que nos devuelva la fila borrada (.select())
                    const { data: delData, error: delErr } = await supabase.from('availability_polls').delete().eq('id', id).select();
                    window.jbLoading.hide();
                    
                    if (delErr) {
                        window.jbToast('Error de Base de Datos: ' + delErr.message, 'error');
                    } else if (!delData || delData.length === 0) {
                        // Supabase RLS lo ha bloqueado en silencio.
                        window.jbToast('Bloqueo de Seguridad RLS: Debes habilitar el DELETE en Supabase.', 'error');
                    } else {
                        window.jbToast('Historial eliminado con éxito', 'success');
                        state.historyCache = {}; // Invalidar caché
                        overlay.style.display = 'none';
                        renderPollHistory();
                    }

                }
            };
        } else {
            btnDeleteReport.style.display = 'none';
        }
    }

    // --- Configuración de Botón Reabrir (v34.2) ---
    if (btnReopenReport) {
        const isAuthorized = state.user && (state.user.role === 'manager' || state.user.role === 'capitan');
        
        // Solo permitimos reabrir si es la jornada CERRADA más reciente
        // Para saberlo, consultamos rápido la última cerrada de este equipo
        const isLastClosed = async () => {
            const { data } = await supabase
                .from('availability_polls')
                .select('id')
                .eq('team_id', state.team.id)
                .eq('status', 'closed')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            return data && data.id === id;
        };

        if (isAuthorized && poll.status === 'closed') {
            isLastClosed().then(last => {
                btnReopenReport.style.display = last ? 'block' : 'none';
            });
            btnReopenReport.onclick = () => window.jbReopenPoll(id);
        } else {
            btnReopenReport.style.display = 'none';
        }
    }

    overlay.style.display = 'flex';
    window.jbLoading.hide();
};

// Close logic
document.getElementById('close-poll-detail')?.addEventListener('click', () => {
    document.getElementById('poll-detail-overlay').style.display = 'none';
});

// Exponer funciones globales para los onclick
window.jbVote = (vote, minutes = 0) => votePoll(vote, minutes);
window.jbToggleLateSelector = () => {
    const sel = document.getElementById('late-minutes-selector');
    if (sel) sel.style.display = sel.style.display === 'flex' ? 'none' : 'flex';
};
window.jbOpenCancelPollModal = (id) => {
    const modal = document.getElementById('modal-cancel-poll');
    if (!modal) return;
    
    modal.style.display = 'flex';
    
    // Configurar botones del modal
    const btnArchive = document.getElementById('btn-modal-archive-poll');
    const btnDelete = document.getElementById('btn-modal-delete-poll');
    
    if (btnArchive) {
        btnArchive.onclick = async () => {
            modal.style.display = 'none';
            await window.jbClosePoll(id, false);
        };
    }
    
    if (btnDelete) {
        btnDelete.onclick = async () => {
            modal.style.display = 'none';
            await window.jbDeletePoll(id);
        };
    }
};

window.jbDeletePoll = async (id) => {
    const confirmed = await window.jbConfirm('⚠️ ¿ESTÁS COMPLETAMENTE SEGURO DE QUE QUIERES BORRAR ESTA CONVOCATORIA?\n\nSe eliminarán todos los votos y no aparecerá en el historial.');
    if (!confirmed) return;

    window.jbLoading.show('Borrando definitivamente...');
    try {
        // 1. Desvincular jornadas que apunten a esta convocatoria (v54.2)
        await supabase.from('sessions').update({ poll_id: null }).eq('poll_id', id);

        // 2. Borrar votos asociados
        await supabase.from('availability_votes').delete().eq('poll_id', id);
        
        // 3. Borrar la encuesta
        const { error } = await supabase.from('availability_polls').delete().eq('id', id);
        
        if (error) throw error;
        
        window.jbToast('Convocatoria eliminada', 'success');
        state.activePoll = null;
        await renderAvailabilityPanel();
        await renderPollHistory();
    } catch (err) {
        console.error(">>> [ERROR] Delete Poll:", err);
        window.jbToast('Error al borrar convocatoria: ' + err.message, 'error');
    }
    window.jbLoading.hide();
};

window.jbClosePoll = async (id, withAlignment = false) => {
    // --- SEGURIDAD: Solo Manager o Capitán (v49.4) ---
    const role = state.user?.role;
    if (role !== 'manager' && role !== 'capitan') {
        window.jbToast('Acceso Denegado', 'error');
        return;
    }

    const msg = withAlignment 
        ? '¿Cerrar jornada y pasar a CREAR LA ALINEACIÓN?' 
        : '¿Seguro que quieres CANCELAR y archivar esta jornada sin alinear?';

    const confirmed = await window.jbConfirm(msg);
    if (!confirmed) return;

    window.jbLoading.show('Procesando jornada...');

    // 1. Lógica de Alineación (si aplica)
    if (withAlignment && state.activePoll && state.activePoll.votes) {
        state.alignmentMode.active = true;
        state.alignmentMode.currentPollId = id; 
        state.alignmentMode.voters = {};
        state.activePoll.votes.forEach(v => {
            if (v.user_id) state.alignmentMode.voters[v.user_id.toString()] = v.vote;
        });

        const tacticId = state.activeTacticId || (state.savedTactics.length > 0 ? state.savedTactics[0].id : null);
        if (tacticId) {
            const activeTactic = state.savedTactics.find(t => t.id === tacticId);
            if (activeTactic) {
                activeTactic.assignments = {}; 
                await saveTacticsCloud(); 
            }
        }
    }

    // 2. Auto-voto NO para los que no votaron
    try {
        const { data: dbVotes } = await supabase.from('availability_votes').select('user_id').eq('poll_id', id);
        if (state.players) {
            const votedUserIds = (dbVotes || []).map(v => String(v.user_id));
            const nonVoters = state.players.filter(p => p.user_id && !votedUserIds.includes(String(p.user_id)));
            if (nonVoters.length > 0) {
                const autoVotes = nonVoters.map(p => ({
                    poll_id: id, user_id: p.user_id, vote: 'no', voted_at: new Date().toISOString()
                }));
                await supabase.from('availability_votes').upsert(autoVotes, { onConflict: 'poll_id,user_id' });
            }
        }
    } catch (e) {}

    // 3. Cerrar en Supabase
    const { error } = await supabase.from('availability_polls').update({ status: 'closed' }).eq('id', id);
    
    window.jbLoading.hide();

    if (error) {
        window.jbToast('Error: ' + error.message, 'error');
    } else {
        window.jbToast(withAlignment ? 'Jornada cerrada. ¡A por el 11!' : 'Jornada archivada', 'success');
        state.historyCache = {};
        await renderAvailabilityPanel();
        
        if (withAlignment) {
            const tacticId = state.activeTacticId || (state.savedTactics.length > 0 ? state.savedTactics[0].id : null);
            switchView('tacticas');
            if (tacticId) openPitchView(tacticId);
        }
    }
};

window.jbReopenPoll = async (id) => {
    window.jbLoading.show('Comprobando estado...');
    
    // 1. Ver si hay alguna ya abierta
    const activePoll = await fetchActivePoll();
    
    if (activePoll) {
        const msg = `Ya existe una convocatoria activa ("${activePoll.title}").\n\n¿Quieres ELIMINAR la actual y reabrir la anterior? Esta acción no se puede deshacer.`;
        window.jbLoading.hide(); 
        const confirmReplace = await window.jbConfirm(msg);
        if (!confirmReplace) return;

        window.jbLoading.show('Eliminando anterior...');
        // Borrar la activa actual (la errónea)
        await supabase.from('availability_votes').delete().eq('poll_id', activePoll.id);
        await supabase.from('availability_polls').delete().eq('id', activePoll.id);
    } else {
        window.jbLoading.hide();
        const confirmed = await window.jbConfirm('¿Quieres volver a activar esta convocatoria?');
        if (!confirmed) return;
    }

    window.jbLoading.show('Reabriendo convocatoria...');
    
    const { error } = await supabase
        .from('availability_polls')
        .update({ status: 'open' })
        .eq('id', id);

    window.jbLoading.hide();

    if (error) {
        window.jbToast('Error al reabrir: ' + error.message, 'error');
    } else {
        window.jbToast('¡Convocatoria reabierta con éxito!', 'success');
        
        const overlay = document.getElementById('poll-detail-overlay');
        if (overlay) overlay.style.display = 'none';
        
        state.historyCache = {};
        renderAvailabilityPanel();
        renderPollHistory();
        window.switchView('view-convocatorias');
    }
};
window.jbSharePoll = () => {
    const role = state.user?.role;
    if (role !== 'manager' && role !== 'capitan') return;
    if (!state.activePoll) return;
    
    const modal = document.getElementById('modal-share-wa');
    if (modal) modal.style.display = 'flex';
};

window.jbShareStandard = () => {
    const modal = document.getElementById('modal-share-wa');
    if (modal) modal.style.display = 'none';
    if (state.activePoll) sharePollWhatsApp(state.activePoll);
};

window.jbShareReminder = async () => {
    const modal = document.getElementById('modal-share-wa');
    if (modal) modal.style.display = 'none';
    if (!state.activePoll || !state.team) return;

    window.jbLoading.show('Buscando pendientes...');

    try {
        // 1. Obtener miembros actuales con sus perfiles para tener los nombres reales (full_name)
        const { data: members, error: memErr } = await supabase
            .from('memberships')
            .select('user_id, profiles(full_name)')
            .eq('team_id', state.team.id);

        if (memErr || !members) throw memErr || new Error("No se encontraron miembros");

        // 2. Identificar quién falta por votar
        // Obtenemos IDs de los que YA votaron
        const votedUserIds = state.activePoll.votes.map(v => v.user_id);
        
        // Filtramos miembros del equipo que NO están en la lista de votos
        const missingVoters = members.filter(m => 
            m.user_id && 
            !votedUserIds.includes(m.user_id)
        );

        if (missingVoters.length === 0) {
            window.jbToast('¡Todos han votado!', 'success');
            window.jbLoading.hide();
            return;
        }

        // 3. Construir mensaje
        const teamName = state.team?.name?.toUpperCase() || 'EQUIPO';
        const url = `https://jb-squad.netlify.app/?poll=${state.activePoll.id}`;
        
        // Mapeamos los nombres desde profiles.full_name
        let voterList = missingVoters.map(m => `• ${m.profiles?.full_name || 'Jugador Anónimo'}`).join('\n');
        
        const text = `⚠️ *RECORDATORIO DE VOTO - ${teamName}* ⚠️\n\nTodavía faltan por confirmar para la convocatoria de *${state.activePoll.title}*:\n\n${voterList}\n\nPor favor, confirmad vuestra asistencia aquí 👇\n🔗 ${url}`;
        
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
    } catch (err) {
        console.error(">>> [ERROR] Share Reminder:", err);
        window.jbToast('Error al obtener lista de pendientes', 'error');
    }

    window.jbLoading.hide();
};

window.jbToggleGroup = (el) => {
    el.classList.toggle('expanded');
};

window.jbToggleReportSection = (el) => {
    el.parentElement.classList.toggle('expanded');
};

// Deep Linking y Notificaciones
async function checkPollFromURL() {
    const params = new URLSearchParams(window.location.search);
    const pollId = params.get('poll');
    if (pollId) {
        // Guardar en session por si tiene que loguearse
        sessionStorage.setItem('pendingPollVote', pollId);
        
        // Si ya está logueado, ir directo
        if (state.user && state.team) {
            switchView('convocatorias');
            // Limpiar URL sin recargar
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

window.renderAvailabilityBanner = async function() {
    if (!state.user || !state.team) return;
    
    // Caché de 60 segundos (v49.5)
    const now = Date.now();
    let poll;
    if (state.bannerCache.timestamp && (now - state.bannerCache.timestamp < 60000)) {
        poll = state.bannerCache.data;
    } else {
        poll = await fetchActivePoll();
        state.bannerCache = { data: poll, timestamp: now };
    }

    const pollBtn = document.querySelector('.nav-btn[data-view="convocatorias"]');


    if (!poll) {
        if (navPollBadge) navPollBadge.style.display = 'none';
        if (pollBtn) pollBtn.classList.remove('nav-highlight');
        return;
    }

    const votes = await fetchPollVotes(poll.id);
    const myVote = votes.find(v => v.user_id === state.user.auth.id);
    
    if (!myVote) {
        if (navPollBadge) navPollBadge.style.display = 'block';
        if (pollBtn) pollBtn.classList.add('nav-highlight');
        
        // Mostrar banner flotante si aún no ha votado y estamos en Home
        if (state.currentView === 'home') {
            const existingBanner = document.querySelector('.availability-banner');
            if (!existingBanner) {
                const banner = document.createElement('div');
                banner.className = 'availability-banner shadow-premium';
                banner.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:1.2rem;">📋</span>
                        <div>
                            <p style="font-size:0.8rem; font-weight:800; margin:0;">CONVOCATORIA ABIERTA</p>
                            <p style="font-size:0.6rem; opacity:0.8; margin:0;">${poll.title} - ${new Date(poll.scheduled_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                    <button class="btn-gold" style="width:auto; padding:5px 15px; font-size:0.7rem;" onclick="this.parentElement.remove(); window.jbSwitchToPoll()">VOTAR NOW</button>
                `;
                document.body.appendChild(banner);
                window.jbSwitchToPoll = () => switchView('convocatorias');
            }
        }
    } else {
        if (navPollBadge) navPollBadge.style.display = 'none';
        if (pollBtn) pollBtn.classList.remove('nav-highlight');
    }
}

// Integrar check inicial
window.addEventListener('load', () => {
    setTimeout(checkPollFromURL, 1000); // Dar tiempo a que cargue el estado
});

// Escuchar cambios de autenticación para activar el banner
var originalRenderHomeDashboard = window.renderHomeDashboard || renderHomeDashboard;
window.renderHomeDashboard = async () => {
    if (typeof originalRenderHomeDashboard === 'function') {
        await originalRenderHomeDashboard();
    }
    renderAvailabilityBanner();
    // Verificar si hay voto pendiente de enlace
    const pendingPoll = sessionStorage.getItem('pendingPollVote');
    if (pendingPoll) {
        sessionStorage.removeItem('pendingPollVote');
        switchView('convocatorias');
    }
};
