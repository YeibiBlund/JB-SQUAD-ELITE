/**
 * JB-SQUAD ELITE: EA Sports Pro Clubs API Sync Module
 * Maneja la importación inteligente de partidos desde EA Telemetry.
 */

const EASync = (function() {
    const EA_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyendhd3dscHN1bnBydGZieXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NzA2MjYsImV4cCI6MjA5MTA0NjYyNn0.fbzl-aw_KGbxLh6NPvga-S7Wd4UPLYqcyfmEs9Cau_M';
    
    // Variables de Estado del Modal
    let currentTargetDate = null;
    let currentExistingSession = null;
    let fetchedMatches = [];
    let eaClubId = null;
    let pendingPlayerMappings = {}; // eaName -> localId
    let manualMatchEdits = {}; // matchId -> { scoreHome, scoreAway, events: [{scorerId, assistantId}] }
    
    function init() {
        // Inicialización de event listeners si fuera necesario
    }

    /**
     * Abre el modal de sincronización enfocado en un día concreto del calendario.
     * @param {Date} dateObj - Objeto Date del día seleccionado.
     * @param {Object} existingSession - Objeto session de la DB si ya existe para este día (null si es nuevo).
     */
    async function openSyncModalForDate(dateObj, existingSession = null) {
        currentTargetDate = dateObj;
        currentExistingSession = existingSession;
        manualMatchEdits = {}; // Resetear ediciones manuales al abrir
        
        // 1. Obtener EA Club ID
        eaClubId = window.state.team?.ea_club_id || localStorage.getItem('jb_ea_club_id');
        if (!eaClubId) {
            eaClubId = prompt("Introduce el ID de tu club en EA Sports (Solo lo pediremos una vez):", "3597");
            if (!eaClubId) return;
            localStorage.setItem('jb_ea_club_id', eaClubId);
            if (window.supabase && window.state.team) {
                window.supabase.from('teams').update({ ea_club_id: eaClubId }).eq('id', window.state.team.id).then();
            }
        }

        // 2. Crear y renderizar el cascarón del Modal
        renderModalShell();

        // 3. Fetch Data de EA
        await fetchAndFilterMatches();
    }

    function renderModalShell() {
        const existing = document.getElementById('ea-sync-modal');
        if (existing) existing.remove();

        const dateStr = currentTargetDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const modalHtml = `
            <div id="ea-sync-modal" class="modal-overlay fade-in" style="display:flex; align-items:center; justify-content:center; z-index:9999;">
                <div class="modal-content card-elite" style="max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(0,255,136,0.3); padding-bottom:15px; margin-bottom: 20px;">
                        <div>
                            <h2 style="margin:0; font-size:1.4rem; color:#fff;">📥 SINCRONIZAR <span style="color:#00ff88;">EA SPORTS</span></h2>
                            <p style="margin:5px 0 0 0; font-size:0.8rem; color:var(--text-muted); text-transform:capitalize;">${dateStr}</p>
                        </div>
                        <button onclick="document.getElementById('ea-sync-modal').remove()" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:1.5rem;">&times;</button>
                    </div>

                    <div id="ea-sync-content" style="min-height: 200px; position:relative;">
                        <div style="text-align:center; padding: 50px 0;">
                            <div class="spinner" style="margin:0 auto 15px auto; width:40px; height:40px; border:3px solid rgba(0,255,136,0.3); border-top-color:#00ff88; border-radius:50%; animation:spin 1s linear infinite;"></div>
                            <p style="color:var(--primary); font-weight:800; letter-spacing:1px;">CONECTANDO CON SERVIDORES EA...</p>
                            <p style="font-size:0.75rem; color:var(--text-muted);">Buscando partidos jugados en esta fecha.</p>
                        </div>
                    </div>

                    <div id="ea-sync-footer" style="display:none; justify-content:space-between; align-items:center; margin-top: 20px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 20px;">
                        <span id="ea-sync-counter" style="color:var(--text-muted); font-size:0.8rem;">0 partidos seleccionados</span>
                        <div style="display:flex; gap:10px;">
                            <button class="btn-cancel" onclick="document.getElementById('ea-sync-modal').remove()">CANCELAR</button>
                            <button id="btn-confirm-ea-sync" class="btn-elite" onclick="EASync.confirmSync()" disabled>CONFIRMAR E IMPORTAR</button>
                        </div>
                    </div>
                </div>
            </div>
            <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    async function fetchAndFilterMatches() {
        const contentDiv = document.getElementById('ea-sync-content');
        
        try {
            const res = await fetch('https://drzwawwlpsunprtfbytu.supabase.co/functions/v1/ea-fetcher', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${EA_ANON_KEY}`
                },
                body: JSON.stringify({ clubId: eaClubId, matchType: 'friendlyMatch' })
            });

            if (!res.ok) throw new Error("Los servidores de EA no responden o el ID es incorrecto.");
            const allMatches = await res.json();
            
            if (!Array.isArray(allMatches)) throw new Error("Formato de respuesta inválido de EA.");

            // Filtrar por fecha seleccionada en el calendario
            // Rango ampliado: Desde las 20:00 del día seleccionado hasta las 05:00 de la madrugada del día siguiente.
            const targetStart = new Date(currentTargetDate);
            targetStart.setHours(20, 0, 0, 0);

            const targetEnd = new Date(currentTargetDate);
            targetEnd.setDate(targetEnd.getDate() + 1);
            targetEnd.setHours(5, 0, 0, 0);

            fetchedMatches = allMatches.filter(m => {
                const matchDate = new Date(m.timestamp * 1000);
                return matchDate >= targetStart && matchDate <= targetEnd;
            });

            if (fetchedMatches.length === 0) {
                contentDiv.innerHTML = `
                    <div style="text-align:center; padding: 40px; background:rgba(255,255,255,0.02); border-radius:10px;">
                        <span style="font-size:3rem; display:block; margin-bottom:15px; opacity:0.5;">📉</span>
                        <h3 style="color:#fff;">No hay partidos de EA en esta fecha</h3>
                        <p style="color:var(--text-muted); font-size:0.8rem;">Asegúrate de que seleccionaste el día correcto en el calendario o de que los partidos realmente se jugaron en este día (EA usa el horario UTC).</p>
                    </div>
                `;
                return;
            }

            renderMatchSelectionList();

        } catch (error) {
            console.error(">>> [EA SYNC ERROR]:", error);
            contentDiv.innerHTML = `<p style="color:#ff4444; text-align:center; padding:30px;">Error de extracción: ${error.message}</p>`;
        }
    }

    function renderMatchSelectionList() {
        const contentDiv = document.getElementById('ea-sync-content');
        const footer = document.getElementById('ea-sync-footer');
        
        let html = '<p style="font-size:0.8rem; color:var(--primary); margin-bottom:15px;">Selecciona los partidos que quieres guardar. Se ignorarán los que dejes desmarcados.</p>';
        html += '<div style="display:flex; flex-direction:column; gap:12px;">';

        fetchedMatches.forEach((m, index) => {
            const dateStr = new Date(m.timestamp * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute:'2-digit' });
            const myClub = m.clubs[eaClubId];
            if (!myClub) return;

            const myClubName = myClub.details?.name || "Mi Equipo";
            const rivalId = Object.keys(m.clubs).find(id => id !== eaClubId);
            const rivalName = rivalId ? m.clubs[rivalId].details.name : "Rival";
            
            const rawMyGoals = parseInt(myClub.goals) || 0;
            const rawRivalGoals = parseInt(myClub.goalsAgainst) || 0;
            const isDnf = myClub.winnerByDnf === "1" || myClub.winnerByDnf === 1 || myClub.winnerByDnf === "true" || myClub.winnerByDnf === true;

            // Detectar posible desconexión:
            let totalIndividualGoals = 0;
            const eaPlayers = m.players[eaClubId] || {};
            for (const pid in eaPlayers) {
                totalIndividualGoals += parseInt(eaPlayers[pid].goals || 0);
            }
            let isSuspicious = false;
            if ((rawMyGoals === 3 && rawRivalGoals === 0) || (rawMyGoals === 0 && rawRivalGoals === 3)) {
                if (totalIndividualGoals === 0 || isDnf) isSuspicious = true;
            }

            // Aplicar edición manual si existe
            const manualEdit = manualMatchEdits[m.matchId];
            const displayMyGoals = manualEdit ? manualEdit.scoreHome : rawMyGoals;
            const displayRivalGoals = manualEdit ? manualEdit.scoreAway : rawRivalGoals;
            
            let color = '#fff';
            let resBadge = 'E';
            let bgClass = 'rgba(255,255,255,0.05)';
            if (displayMyGoals > displayRivalGoals) { color = '#00ff88'; resBadge = 'V'; bgClass = 'rgba(0,255,136,0.1)'; }
            else if (displayMyGoals < displayRivalGoals) { color = '#ff4444'; resBadge = 'D'; bgClass = 'rgba(255,68,68,0.1)'; }

            const alreadyExists = currentExistingSession && currentExistingSession.matches && currentExistingSession.matches.some(exM => exM.eaMatchId === m.matchId);

            html += `
                <div class="ea-match-row ${alreadyExists ? 'imported' : ''}" style="background: ${alreadyExists ? 'rgba(0,0,0,0.5)' : bgClass}; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:15px; transition:all 0.2s; ${alreadyExists ? 'opacity:0.5;' : ''}">
                    <div style="display:flex; align-items:center;">
                        <div style="margin-right: 15px;">
                            <input type="checkbox" class="ea-match-checkbox" value="${m.matchId}" onchange="EASync.updateSelectionCounter()" ${alreadyExists ? 'disabled' : 'checked'}>
                        </div>
                        <div style="flex-grow:1;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                                <span style="font-size:0.75rem; color:var(--text-muted);">⏱️ ${dateStr} ${isSuspicious && !manualEdit ? '<span style="color:var(--warning); font-weight:bold; margin-left:10px;">⚠️ POSIBLE ABANDONO / DNF</span>' : ''}</span>
                                <span style="font-size:0.65rem; color:var(--text-muted);">ID: ${m.matchId}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight:800; color:var(--primary);">${myClubName}</span>
                                <div style="background:rgba(0,0,0,0.4); border-radius:4px; padding:4px 12px; font-weight:900; font-size:1.2rem; color:${color}; text-align:center; min-width:80px;">
                                    ${displayMyGoals} - ${displayRivalGoals}
                                </div>
                                <span style="color:#ccc; font-weight:700; text-align:right;">${rivalName}</span>
                            </div>
                            ${!alreadyExists ? `
                            <div style="margin-top: 10px; text-align: right;">
                                <button type="button" onclick="EASync.openManualEditor('${m.matchId}')" style="background:transparent; border:1px solid rgba(255,255,255,0.2); color:#fff; padding:4px 10px; border-radius:4px; font-size:0.7rem; cursor:pointer;">
                                    ${manualEdit ? '<span style="color:#00ff88;">✏️ EDITADO (MANUAL)</span>' : '✍️ EDITAR MARCADOR Y EVENTOS'}
                                </button>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <!-- Contenedor del editor manual (oculto por defecto) -->
                    <div id="ea-manual-editor-${m.matchId}" style="display:none; margin-top:15px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:15px;"></div>
                </div>
            `;
        });
        html += '</div>';

        // Mapeo Rápido de Jugadores Desconocidos
        const unknownPlayers = getUnknownPlayersInSelection();
        if (unknownPlayers.length > 0) {
            html += `
                <div style="margin-top:25px; background:rgba(240, 165, 0, 0.1); border:1px solid var(--warning); border-radius:8px; padding:15px;">
                    <h4 style="margin:0 0 10px 0; color:var(--warning); font-size:0.85rem;">⚠️ IDENTIFICACIÓN REQUERIDA</h4>
                    <p style="font-size:0.7rem; color:var(--text-muted); margin-bottom:10px;">EA ha devuelto nombres de jugadores que no coinciden con el ID de Consola de tu plantilla. Empareja a estos jugadores para que las stats vayan a la persona correcta:</p>
                    ${unknownPlayers.map(name => `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:0.8rem;">
                            <span style="color:#fff; font-weight:700;">ID EA: ${name}</span>
                            <select onchange="EASync.setMapping('${name}', this.value)" style="background:rgba(0,0,0,0.5); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:5px; border-radius:4px;">
                                <option value="">Ignorar (No guardar estadisticas suyas)</option>
                                ${window.state.players.map(p => `<option value="${p.id}">${p.name} (${p.consoleID || 'Sin ID'})</option>`).join('')}
                            </select>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        contentDiv.innerHTML = html;
        footer.style.display = 'flex';
        updateSelectionCounter();
    }

    // --- LÓGICA DE EDITOR MANUAL ANTI-DNF ---

    function openManualEditor(matchId) {
        const container = document.getElementById('ea-manual-editor-' + matchId);
        if (!container) return;
        
        if (container.style.display === 'block') {
            container.style.display = 'none';
            return;
        }

        const match = fetchedMatches.find(m => m.matchId === matchId);
        const myClub = match.clubs[eaClubId];
        const myClubName = myClub.details?.name || "Mi Equipo";
        const rawMyGoals = parseInt(myClub.goals) || 0;
        const rawRivalGoals = parseInt(myClub.goalsAgainst) || 0;
        
        const existingEdit = manualMatchEdits[matchId] || { scoreHome: rawMyGoals, scoreAway: rawRivalGoals, events: [] };

        const optionsHtml = getMatchPlayersOptionsHtml(matchId);

        let eventsHtml = '';
        existingEdit.events.forEach((ev, i) => {
            eventsHtml += buildEventRowHtml(matchId, i, ev.scorerId, ev.assistantId, optionsHtml);
        });

        // Generar tabla de estadísticas
        const eaPlayers = match.players[eaClubId] || {};
        let statsRowsHtml = '';
        for (const pid in eaPlayers) {
            const p = eaPlayers[pid];
            let localPlayer = window.state.players.find(x => (x.consoleID && x.consoleID.toLowerCase() === p.playername.toLowerCase()) || (x.name.toLowerCase() === p.playername.toLowerCase()));
            let playerName = localPlayer ? localPlayer.name : (pendingPlayerMappings[p.playername] ? window.state.players.find(x => x.id.toString() === pendingPlayerMappings[p.playername]).name : p.playername);
            
            statsRowsHtml += `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.75rem;">
                    <td style="padding:10px 5px; font-weight:700; color:#fff;">${playerName}</td>
                    <td style="padding:10px 5px; text-align:center;">${p.goals || 0}</td>
                    <td style="padding:10px 5px; text-align:center;">${p.assists || 0}</td>
                    <td style="padding:10px 5px; text-align:center; color:rgba(255,255,255,0.7);">${p.passesmade || 0}/${p.passattempts || 0}</td>
                    <td style="padding:10px 5px; text-align:center; color:rgba(255,255,255,0.7);">${p.tacklesmade || 0}/${p.tackleattempts || 0}</td>
                    <td style="padding:10px 5px; text-align:center; color:#00ff88;">${p.saves || 0}</td>
                    <td style="padding:10px 5px; text-align:center;">
                        <span style="color:#f1c40f; font-weight:bold;">${p.yellowcards || 0}</span> / 
                        <span style="color:#e74c3c; font-weight:bold;">${p.redcards || 0}</span>
                    </td>
                    <td style="padding:10px 5px; text-align:center; font-weight:900; color:var(--primary);">${p.rating || '0.0'}</td>
                </tr>
            `;
        }

        container.innerHTML = `
            <div style="background:rgba(0,0,0,0.5); border-radius:8px; overflow:hidden;">
                <!-- Pestañas -->
                <div style="display:flex; border-bottom:1px solid rgba(255,255,255,0.1);">
                    <button type="button" onclick="EASync.switchTab('${matchId}', 'events')" id="tab-btn-events-${matchId}" style="flex:1; background:rgba(0,255,136,0.1); border:none; border-bottom:2px solid var(--primary); color:var(--primary); padding:10px; cursor:pointer; font-weight:800; font-size:0.75rem; transition:all 0.2s; letter-spacing:1px;">🎯 EVENTOS</button>
                    <button type="button" onclick="EASync.switchTab('${matchId}', 'stats')" id="tab-btn-stats-${matchId}" style="flex:1; background:transparent; border:none; border-bottom:2px solid transparent; color:var(--text-muted); padding:10px; cursor:pointer; font-weight:800; font-size:0.75rem; transition:all 0.2s; letter-spacing:1px;">📊 ESTADÍSTICAS</button>
                </div>

                <!-- Contenido Eventos -->
                <div id="tab-content-events-${matchId}" style="padding:15px; display:block;">
                    <div style="display:flex; gap:15px; margin-bottom: 20px;">
                        <div>
                            <label style="display:block; font-size:0.65rem; color:var(--text-muted); margin-bottom:5px; text-transform:uppercase;">GOLES ${myClubName}</label>
                            <input type="number" id="ea-man-home-${matchId}" value="${existingEdit.scoreHome}" min="0" style="width:60px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:5px; border-radius:4px; text-align:center;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.65rem; color:var(--text-muted); margin-bottom:5px;">GOLES RIVAL</label>
                            <input type="number" id="ea-man-away-${matchId}" value="${existingEdit.scoreAway}" min="0" style="width:60px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:5px; border-radius:4px; text-align:center;">
                        </div>
                    </div>

                    <h4 style="margin:0 0 10px 0; color:var(--primary); font-size:0.85rem; display:flex; justify-content:space-between; text-transform:uppercase;">
                        <span>GOLES Y ASISTENCIAS DE ${myClubName}</span>
                        <button type="button" onclick="EASync.addManualEvent('${matchId}')" style="background:transparent; border:1px solid var(--primary); color:var(--primary); font-size:0.7rem; border-radius:4px; cursor:pointer; padding:2px 8px;">+ AÑADIR</button>
                    </h4>
                    
                    <div id="ea-man-events-${matchId}" style="display:flex; flex-direction:column; gap:10px;">
                        ${eventsHtml || '<p style="font-size:0.7rem; color:var(--text-muted); font-style:italic;">Sin goles individuales asignados.</p>'}
                    </div>

                    <div style="margin-top: 20px; display:flex; justify-content:flex-end; gap:10px;">
                        <button type="button" onclick="document.getElementById('ea-manual-editor-${matchId}').style.display='none'" class="btn-cancel">CERRAR</button>
                        <button type="button" onclick="EASync.saveManualEdit('${matchId}')" class="btn-elite" style="padding: 6px 15px; font-size: 0.8rem;">GUARDAR CAMBIOS</button>
                    </div>
                </div>

                <!-- Contenido Estadísticas -->
                <div id="tab-content-stats-${matchId}" style="padding:15px; display:none; overflow-x:auto;">
                    <table style="width:100%; border-collapse:collapse; min-width:500px;">
                        <thead>
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.2); color:var(--text-muted); font-size:0.65rem; text-align:center;">
                                <th style="text-align:left; padding-bottom:8px;">JUGADOR</th>
                                <th style="padding-bottom:8px;">G</th>
                                <th style="padding-bottom:8px;">A</th>
                                <th style="padding-bottom:8px;">PASES</th>
                                <th style="padding-bottom:8px;">ENTRADAS</th>
                                <th style="padding-bottom:8px;">PARADAS</th>
                                <th style="padding-bottom:8px;">TARJETAS (A/R)</th>
                                <th style="padding-bottom:8px;">NOTA</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${statsRowsHtml || '<tr><td colspan="8" style="text-align:center; padding:15px; font-size:0.75rem; color:var(--text-muted);">Sin datos individuales de EA.</td></tr>'}
                        </tbody>
                    </table>
                    <div style="margin-top: 15px; text-align:right;">
                        <button type="button" onclick="document.getElementById('ea-manual-editor-${matchId}').style.display='none'" class="btn-cancel" style="padding: 6px 15px; font-size: 0.8rem;">CERRAR</button>
                    </div>
                </div>
            </div>
        `;
        container.style.display = 'block';
    }

    function switchTab(matchId, tab) {
        const btnEvents = document.getElementById('tab-btn-events-' + matchId);
        const btnStats = document.getElementById('tab-btn-stats-' + matchId);
        const contentEvents = document.getElementById('tab-content-events-' + matchId);
        const contentStats = document.getElementById('tab-content-stats-' + matchId);

        if (tab === 'events') {
            btnEvents.style.background = 'rgba(0,255,136,0.1)';
            btnEvents.style.color = 'var(--primary)';
            btnEvents.style.borderBottomColor = 'var(--primary)';
            
            btnStats.style.background = 'transparent';
            btnStats.style.color = 'var(--text-muted)';
            btnStats.style.borderBottomColor = 'transparent';

            contentEvents.style.display = 'block';
            contentStats.style.display = 'none';
        } else {
            btnStats.style.background = 'rgba(0,255,136,0.1)';
            btnStats.style.color = 'var(--primary)';
            btnStats.style.borderBottomColor = 'var(--primary)';
            
            btnEvents.style.background = 'transparent';
            btnEvents.style.color = 'var(--text-muted)';
            btnEvents.style.borderBottomColor = 'transparent';

            contentStats.style.display = 'block';
            contentEvents.style.display = 'none';
        }
    }

    function buildEventRowHtml(matchId, idx, selScorer, selAssist, optionsHtml) {
        return `
            <div class="ea-man-ev-row" style="display:flex; gap:10px; align-items:center; background:rgba(255,255,255,0.05); padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
                <div style="flex-grow:1;">
                    <select class="ea-man-scorer" style="width:100%; margin-bottom:5px; background:rgba(0,0,0,0.5); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:5px; border-radius:4px;">
                        <option value="">-- Goleador --</option>
                        ${optionsHtml}
                    </select>
                    <select class="ea-man-assist" style="width:100%; background:rgba(0,0,0,0.5); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:5px; border-radius:4px;">
                        <option value="">-- Asistencia --</option>
                        ${optionsHtml}
                    </select>
                </div>
                <button type="button" onclick="this.parentElement.remove()" style="background:transparent; border:none; color:#ff4444; cursor:pointer; font-size:1.2rem;" title="Eliminar">&times;</button>
            </div>
        `.replace(`value="${selScorer}"`, `value="${selScorer}" selected`)
         .replace(`value="${selAssist}"`, `value="${selAssist}" selected`);
    }

    function addManualEvent(matchId) {
        const evContainer = document.getElementById('ea-man-events-' + matchId);
        if (!evContainer) return;
        
        // Limpiar el texto de "Sin goles" si existe
        if (evContainer.innerHTML.includes('Sin goles individuales')) {
            evContainer.innerHTML = '';
        }

        const optionsHtml = getMatchPlayersOptionsHtml(matchId);
        evContainer.insertAdjacentHTML('beforeend', buildEventRowHtml(matchId, Date.now(), '', '', optionsHtml));
    }

    function getMatchPlayersOptionsHtml(matchId) {
        const match = fetchedMatches.find(m => m.matchId === matchId);
        if (!match) return window.state.players.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        
        const eaPlayersList = match.players[eaClubId] || {};
        const playedIds = new Set();
        
        for (const pid in eaPlayersList) {
            const eaName = eaPlayersList[pid].playername;
            const found = window.state.players.find(p => (p.consoleID && p.consoleID.toLowerCase() === eaName.toLowerCase()) || (p.name.toLowerCase() === eaName.toLowerCase()));
            const mappedId = found ? found.id : pendingPlayerMappings[eaName];
            if (mappedId) playedIds.add(mappedId.toString());
        }

        const filteredPlayers = window.state.players.filter(p => playedIds.has(p.id.toString()));
        // Fallback a todos los jugadores si no hay mapeos o la lista está vacía
        const listToUse = filteredPlayers.length > 0 ? filteredPlayers : window.state.players;

        return listToUse.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    function saveManualEdit(matchId) {
        const scoreHome = parseInt(document.getElementById(`ea-man-home-${matchId}`).value) || 0;
        const scoreAway = parseInt(document.getElementById(`ea-man-away-${matchId}`).value) || 0;
        
        const events = [];
        const evRows = document.querySelectorAll(`#ea-man-events-${matchId} .ea-man-ev-row`);
        evRows.forEach(row => {
            const scorerId = row.querySelector('.ea-man-scorer').value;
            const assistId = row.querySelector('.ea-man-assist').value;
            if (scorerId) {
                events.push({
                    type: 'goal',
                    side: 'home',
                    scorerId: parseInt(scorerId),
                    assistantId: assistId ? parseInt(assistId) : null
                });
            }
        });

        manualMatchEdits[matchId] = {
            scoreHome,
            scoreAway,
            events
        };

        // Repintar lista principal
        renderMatchSelectionList();
    }

    // --- FIN LOGICA EDITOR MANUAL ---

    function getUnknownPlayersInSelection() {
        const unknowns = new Set();
        fetchedMatches.forEach(m => {
            const players = m.players[eaClubId] || {};
            for (const pid in players) {
                const eaName = players[pid].playername;
                const found = window.state.players.find(p => (p.consoleID && p.consoleID.toLowerCase() === eaName.toLowerCase()) || (p.name.toLowerCase() === eaName.toLowerCase()));
                if (!found && !pendingPlayerMappings[eaName]) {
                    unknowns.add(eaName);
                }
            }
        });
        return Array.from(unknowns);
    }

    function setMapping(eaName, localId) {
        if (localId) {
            pendingPlayerMappings[eaName] = localId;
        } else {
            delete pendingPlayerMappings[eaName];
        }
    }

    function updateSelectionCounter() {
        const checkboxes = document.querySelectorAll('.ea-match-checkbox:checked:not(:disabled)');
        const count = checkboxes.length;
        document.getElementById('ea-sync-counter').textContent = `${count} partido(s) seleccionado(s)`;
        document.getElementById('btn-confirm-ea-sync').disabled = count === 0;
    }

    async function confirmSync() {
        const checkboxes = document.querySelectorAll('.ea-match-checkbox:checked:not(:disabled)');
        if (checkboxes.length === 0) return;

        const selectedIds = Array.from(checkboxes).map(cb => cb.value);
        const matchesToImport = fetchedMatches.filter(m => selectedIds.includes(m.matchId));

        const btn = document.getElementById('btn-confirm-ea-sync');
        btn.textContent = '⏳ IMPORTANDO...';
        btn.disabled = true;

        try {
            const transformedMatches = matchesToImport.map(ea => transformEaMatchToLocal(ea));
            
            let sessionObj = currentExistingSession;
            let isNewSession = false;
            if (!sessionObj) {
                const d = new Date(currentTargetDate);
                const dd = String(d.getDate()).padStart(2, '0');
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const yyyy = d.getFullYear();
                
                sessionObj = {
                    id: Date.now(),
                    date: `${dd}/${mm}/${yyyy}`,
                    status: 'closed',
                    matches: [],
                    type: 'friendly',
                    team_id: window.state.team.id
                };
                isNewSession = true;
            }

            if (!sessionObj.matches) sessionObj.matches = [];
            sessionObj.matches = [...sessionObj.matches, ...transformedMatches];

            await window.saveSessionCloud(sessionObj);

            if (isNewSession && window.state && window.state.sessions) {
                window.state.sessions.push(sessionObj);
            }

            await window.recalculateAllStats();

            for (const eaName in pendingPlayerMappings) {
                const localId = pendingPlayerMappings[eaName];
                const player = window.state.players.find(p => p.id.toString() === localId);
                if (player) {
                    player.consoleID = eaName;
                    await window.savePlayerCloud(player);
                }
            }

            window.jbToast('¡Partidos importados con éxito!', 'success');
            document.getElementById('ea-sync-modal').remove();

            if (typeof window.renderSessions === 'function') window.renderSessions();
            if (typeof window.renderCalendar === 'function') {
                setTimeout(() => window.renderSessions(), 500); 
            }

        } catch (error) {
            console.error(">>> [IMPORT ERROR]:", error);
            window.jbToast('Error en la importación: ' + error.message, 'error');
            btn.textContent = 'CONFIRMAR E IMPORTAR';
            btn.disabled = false;
        }
    }

    function transformEaMatchToLocal(eaMatch) {
        const myClub = eaMatch.clubs[eaClubId];
        const rivalId = Object.keys(eaMatch.clubs).find(id => id !== eaClubId);
        const rivalData = rivalId ? eaMatch.clubs[rivalId] : null;

        const mappedEaPlayers = {};
        const eaPlayers = eaMatch.players[eaClubId] || {};
        
        for (const pid in eaPlayers) {
            const p = eaPlayers[pid];
            let localPlayer = window.state.players.find(x => (x.consoleID && x.consoleID.toLowerCase() === p.playername.toLowerCase()) || (x.name.toLowerCase() === p.playername.toLowerCase()));
            let mappedId = localPlayer ? localPlayer.id : pendingPlayerMappings[p.playername];
            
            if (mappedId) {
                mappedEaPlayers[mappedId] = p;
            }
        }

        // Revisar si existe edición manual para este partido
        const manualEdit = manualMatchEdits[eaMatch.matchId];
        const finalScoreHome = manualEdit ? manualEdit.scoreHome : (parseInt(myClub.goals) || 0);
        const finalScoreAway = manualEdit ? manualEdit.scoreAway : (parseInt(myClub.goalsAgainst) || 0);
        const finalEvents = manualEdit ? manualEdit.events : [];

        return {
            eaMatchId: eaMatch.matchId,
            timestamp: eaMatch.timestamp,
            scoreHome: finalScoreHome,
            scoreAway: finalScoreAway,
            type: 'friendly',
            rivalName: rivalData ? rivalData.details.name : 'Rival',
            rivalId: rivalId,
            eaPlayers: mappedEaPlayers, 
            events: finalEvents // Inyectar eventos manuales (goles y asistencias) para que recalculateAllStats los atrape prioritariamente
        };
    }

    return {
        init,
        openSyncModalForDate,
        updateSelectionCounter,
        confirmSync,
        setMapping,
        openManualEditor,
        switchTab,
        addManualEvent,
        saveManualEdit
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => EASync.init(), 1000);
});

window.EASync = EASync;
