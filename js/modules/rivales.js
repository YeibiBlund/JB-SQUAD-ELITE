// rivales.js

// --- LISTENERS HISTORIAL DE RIVALES (v65.0) ---
var btnRivalsHistory = document.getElementById('btn-rivals-history');
var btnBackToSessionsFromRivals = document.getElementById('btn-back-to-sessions-from-rivals');
var rivalsSearchInput = document.getElementById('rivals-search');

if (btnRivalsHistory) {
    btnRivalsHistory.addEventListener('click', () => {
        window.switchView('rivals-history');
        renderRivalsHistory();
    });
}

if (btnBackToSessionsFromRivals) {
    btnBackToSessionsFromRivals.addEventListener('click', () => {
        window.switchView('jornadas');
    });
}

if (rivalsSearchInput) {
    rivalsSearchInput.addEventListener('input', () => {
        filterRivalsTable(rivalsSearchInput.value);
    });
}

// Nueva función global para cerrar el modal del detalle del rival
window.closeRivalDetailModal = function() {
    const modal = document.getElementById('rival-detail-modal');
    if (modal) modal.style.display = 'none';
    
    // Quitar la selección visual de la fila
    document.querySelectorAll('.rival-row').forEach(row => {
        row.classList.remove('selected');
    });
};

// Cerrar el modal al hacer clic en el fondo translúcido (overlay)
var rivalModal = document.getElementById('rival-detail-modal');
if (rivalModal) {
    rivalModal.addEventListener('click', (e) => {
        if (e.target === rivalModal) {
            window.closeRivalDetailModal();
        }
    });
}

// --- LÓGICA DE AGREGACIÓN HISTORIAL DE RIVALES (v65.2.0) ---
var globalRivalsData = {}; // Cache local en memoria para búsquedas reactivas
var rivalsSortConfig = {
    key: 'displayName',
    desc: false
};
var hasSetupRivalsSorting = false;

function setupRivalsTableSorting() {
    if (hasSetupRivalsSorting) return;
    hasSetupRivalsSorting = true;

    document.querySelectorAll('.th-rivals-sortable').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.getAttribute('data-sort');
            if (rivalsSortConfig.key === key) {
                rivalsSortConfig.desc = !rivalsSortConfig.desc;
            } else {
                rivalsSortConfig.key = key;
                // Por defecto, columnas numéricas ordenan desc (V, E, D, PJ, % V, GF, GC), alfabética asc
                rivalsSortConfig.desc = key !== 'displayName';
            }
            renderRivalsHistory();
        });
    });
}

function updateRivalsSortHeaders() {
    document.querySelectorAll('.th-rivals-sortable').forEach(th => {
        const key = th.getAttribute('data-sort');
        let originalText = th.innerText.replace(' ▲', '').replace(' ▼', '');
        if (key === rivalsSortConfig.key) {
            originalText += rivalsSortConfig.desc ? ' ▼' : ' ▲';
        }
        th.innerText = originalText;
    });
}

function sortRivalsData(list) {
    const key = rivalsSortConfig.key;
    const desc = rivalsSortConfig.desc;

    return list.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (typeof valA === 'string') {
            valA = valA.toUpperCase();
            valB = valB.toUpperCase();
            return desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }

        // Numéricos (incluye winRatio, pj, v, e, d, gf, gc)
        return desc ? valB - valA : valA - valB;
    });
}

window.renderRivalsHistory = function() {
    const tableBody = document.getElementById('table-rivals-body');
    const detailPanel = document.getElementById('rival-detail-panel');
    if (!tableBody) return;

    // Inicializar listeners de ordenación perezosa
    setupRivalsTableSorting();

    // Actualizar visualmente indicadores de ordenación
    updateRivalsSortHeaders();

    // Reset de la vista detallada
    if (detailPanel) detailPanel.style.display = 'none';
    const modal = document.getElementById('rival-detail-modal');
    if (modal) modal.style.display = 'none';

    // 1. Recopilar sesiones de state.sessions y state.activeSession
    const sessionsToScan = [...(state.sessions || [])];
    if (state.activeSession) {
        sessionsToScan.push(state.activeSession);
    }

    // 2. Procesar y agrupar rivales consolidando por mayúsculas
    globalRivalsData = {};

    sessionsToScan.forEach(sess => {
        const matches = sess.matches || [];
        matches.forEach(m => {
            const rivalStr = m.rivalName || m.rival;
            if (!rivalStr || rivalStr.trim() === '') return;
            
            const rawRivalName = rivalStr.trim();
            const rivalKey = rawRivalName.toUpperCase(); // Consolidar sin duplicados

            if (!globalRivalsData[rivalKey]) {
                globalRivalsData[rivalKey] = {
                    key: rivalKey,
                    displayName: rawRivalName, // Conserva la primera capitalización encontrada
                    rivalCrest: m.rivalCrest || null,
                    pj: 0,
                    v: 0,
                    e: 0,
                    d: 0,
                    gf: 0,
                    gc: 0,
                    winRatio: 0,
                    matches: []
                };
            }

            const rData = globalRivalsData[rivalKey];
            rData.pj++;

            // Cálculos de marcador (scoreHome = JB Squad, scoreAway = Rival)
            const sh = m.scoreHome || 0;
            const sa = m.scoreAway || 0;

            rData.gf += sh;
            rData.gc += sa;

            if (sh === sa) {
                rData.e++;
            } else if (sh > sa) {
                rData.v++;
            } else {
                rData.d++;
            }

            rData.winRatio = rData.pj > 0 ? Math.round((rData.v / rData.pj) * 100) : 0;

            const uniqueMatchId = m.id || m.eaMatchId || `match_${Math.random().toString(36).substr(2, 9)}`;
            
            // Guardar metadatos del partido para el desglose detallado con fecha
            rData.matches.push({
                ...m,
                _tempId: uniqueMatchId,
                sessionDate: sess.date || null,
                sessionName: sess.name || (sess.date ? `Jornada del ${sess.date}` : `Jornada #${sess.id.toString().substring(0, 8)}`)
            });
        });
    });

    const rivalsList = Object.values(globalRivalsData);

    if (rivalsList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 35px; font-weight: 600;">
                    No se han registrado partidos contra rivales aún.
                </td>
            </tr>
        `;
        return;
    }

    // Ordenar dinámicamente según rivalsSortConfig
    const sortedList = sortRivalsData(rivalsList);

    renderRivalsTableRows(sortedList);
};

function renderRivalsTableRows(list) {
    const tableBody = document.getElementById('table-rivals-body');
    if (!tableBody) return;

    tableBody.innerHTML = list.map(rival => {
        const winRatio = rival.pj > 0 ? Math.round((rival.v / rival.pj) * 100) : 0;
        const crestUrl = rival.rivalCrest || neutralCrest;

        return `
            <tr class="rival-row" onclick="selectRivalDetail('${rival.key}')" id="rival-row-${rival.key}">
                <td style="padding: 12px 15px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 28px; height: 28px; background: rgba(255,255,255,0.03); border-radius: 50%; padding: 3px; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.05);">
                            <img src="${crestUrl}" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${neutralCrest}'" style="width: 100%; height: 100%; object-fit: contain;">
                        </div>
                        <span style="font-weight: 800; color: #fff; font-size: 0.85rem; letter-spacing: 0.5px;">${escapeHTML(rival.displayName.toUpperCase())}</span>
                    </div>
                </td>
                <td style="text-align: center; font-weight: 700;">${rival.pj}</td>
                <td style="text-align: center; font-weight: 800; color: #2ecc71;">${rival.v}</td>
                <td style="text-align: center; font-weight: 700; color: #f1c40f; opacity: 0.9;">${rival.e}</td>
                <td style="text-align: center; font-weight: 700; color: #e74c3c;">${rival.d}</td>
                <td style="text-align: center; font-weight: 600; color: rgba(255,255,255,0.8);">${rival.gf}</td>
                <td style="text-align: center; font-weight: 600; color: rgba(255,255,255,0.8);">${rival.gc}</td>
                <td style="text-align: center; font-weight: 900; color: #2ecc71; font-size: 0.85rem;">${winRatio}%</td>
            </tr>
        `;
    }).join('');
}

window.filterRivalsTable = function(query) {
    if (!globalRivalsData) return;
    const cleanQuery = (query || '').trim().toUpperCase();
    const allRivals = Object.values(globalRivalsData);

    const filtered = allRivals.filter(r => 
        r.displayName.toUpperCase().includes(cleanQuery)
    );

    renderRivalsTableRows(filtered);
};

window.selectRivalDetail = function(rivalKey) {
    const detailPanel = document.getElementById('rival-detail-panel');
    if (!detailPanel || !globalRivalsData[rivalKey]) return;

    // Resaltar visualmente la fila seleccionada
    document.querySelectorAll('.rival-row').forEach(row => {
        row.classList.remove('selected');
    });
    const selectedRow = document.getElementById(`rival-row-${rivalKey}`);
    if (selectedRow) selectedRow.classList.add('selected');

    const rival = globalRivalsData[rivalKey];
    const winRatio = rival.pj > 0 ? Math.round((rival.v / rival.pj) * 100) : 0;
    const crestUrl = rival.rivalCrest || neutralCrest;

    // Ordenar partidos: más recientes primero (ID descendente)
    const sortedMatches = [...rival.matches].sort((a, b) => b.id - a.id);

    detailPanel.innerHTML = `
        <!-- Cabecera del Panel Detalle -->
        <div style="display: flex; align-items: center; gap: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px;">
            <div style="width: 52px; height: 52px; background: rgba(255,255,255,0.03); border-radius: 50%; padding: 5px; flex-shrink: 0; border: 1px solid var(--glass-border);">
                <img src="${crestUrl}" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${neutralCrest}'" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
            <div>
                <span style="font-size: 0.6rem; color: var(--primary); text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; display: block; margin-bottom: 3px;">HISTORIAL DETALLADO</span>
                <h3 style="margin: 0; font-size: 1.3rem; color: #fff; font-weight: 900; line-height: 1.1; letter-spacing: 0.5px;">${escapeHTML(rival.displayName.toUpperCase())}</h3>
            </div>
            <button onclick="window.closeRivalDetailModal()" class="btn-cancel" style="margin-left: auto; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer; transition: all 0.2s;">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>

        <!-- Bento Tarjetas de Métricas Rápidas -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.02); border-radius: 8px; padding: 12px; text-align: center;">
                <span style="display: block; font-size: 0.55rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px; font-weight: 800; letter-spacing: 0.5px;">Balance Global</span>
                <span style="font-size: 1rem; font-weight: 900; color: #fff;">
                    <span style="color: #2ecc71;">${rival.v}V</span> - 
                    <span style="color: #f1c40f;">${rival.e}E</span> - 
                    <span style="color: #e74c3c;">${rival.d}D</span>
                </span>
            </div>
            <div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.02); border-radius: 8px; padding: 12px; text-align: center;">
                <span style="display: block; font-size: 0.55rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px; font-weight: 800; letter-spacing: 0.5px;">Eficacia H2H</span>
                <span style="font-size: 1rem; font-weight: 900; color: #2ecc71;">${winRatio}%</span>
            </div>
        </div>

        <!-- Listado Cronológico de Partidos -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <h4 style="margin: 0; font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1.5px; font-weight: 800;">PARTIDOS JUGADOS (${rival.pj})</h4>
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 420px; overflow-y: auto; padding-right: 4px;">
                ${sortedMatches.map(m => {
                    const isWin = m.scoreHome > m.scoreAway;
                    const isDraw = m.scoreHome === m.scoreAway;
                    const outcomeSymbol = isWin ? 'V' : (isDraw ? 'E' : 'D');
                    const outcomeColor = isWin ? '#2ecc71' : (isDraw ? '#f1c40f' : '#e74c3c');
                    
                    const conditionLabel = 'Vs';
                    const typeLabel = m.type === 'official' ? 'Oficial' : 'Amistoso';

                    return `
                        <div class="rival-match-item" onclick="toggleMatchEventsExpansion('${m._tempId}')">
                            <div style="display: flex; align-items: center; gap: 12px; overflow: hidden; max-width: 75%;">
                                <span style="width: 24px; height: 24px; border-radius: 4px; background: ${outcomeColor}; color: ${outcomeSymbol === 'E' ? '#000' : '#fff'}; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 900; flex-shrink: 0;">
                                    ${outcomeSymbol}
                                </span>
                                <div style="display: flex; flex-direction: column; overflow: hidden;">
                                    <span style="font-weight: 800; color: #fff; font-size: 0.78rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        ${escapeHTML(m.sessionName)}
                                    </span>
                                    <span style="font-size: 0.58rem; color: var(--text-muted); font-weight: 700; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px;">
                                        ${conditionLabel} | ${typeLabel}
                                    </span>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                                <span style="font-weight: 900; font-size: 1rem; color: var(--primary); letter-spacing: 0.5px;">
                                    ${m.scoreHome} - ${m.scoreAway}
                                </span>
                                <svg id="arrow-match-${m._tempId}" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s; color: var(--text-muted);">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </div>
                        </div>
                        <div id="events-match-${m._tempId}" class="rival-match-events">
                            <!-- Inyectado dinámicamente por JS -->
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    const modal = document.getElementById('rival-detail-modal');
    if (modal) modal.style.display = 'flex';
    detailPanel.style.display = 'flex';
};

window.toggleMatchEventsExpansion = function(tempId) {
    const eventsEl = document.getElementById(`events-match-${tempId}`);
    const arrowEl = document.getElementById(`arrow-match-${tempId}`);
    if (!eventsEl) return;

    const isVisible = window.getComputedStyle(eventsEl).display !== 'none';

    if (isVisible) {
        eventsEl.style.display = 'none';
        if (arrowEl) arrowEl.style.transform = 'rotate(0deg)';
    } else {
        let selectedMatch = null;
        const allRivals = Object.values(globalRivalsData);
        for (let rival of allRivals) {
            selectedMatch = rival.matches.find(m => String(m._tempId) === String(tempId));
            if (selectedMatch) break;
        }

        if (!selectedMatch) return;

        const events = selectedMatch.events ? selectedMatch.events.filter(e => e.side === 'home') : [];
        const eaPlayers = selectedMatch.eaPlayers || {};
        const eaPlayersList = Object.keys(eaPlayers).map(pid => {
            const st = eaPlayers[pid];
            return {
                pid,
                goals: parseInt(st.goals) || 0,
                assists: parseInt(st.assists) || 0,
                ...st
            };
        });
        const hasEAEvents = eaPlayersList.some(p => p.goals > 0 || p.assists > 0);

        if (events.length === 0 && !hasEAEvents) {
            eventsEl.innerHTML = `
                <div style="font-size: 0.65rem; color: var(--text-muted); text-align: center; padding: 6px 0; font-style: italic;">
                    No hay detalles de goles o asistencias registrados en este partido.
                </div>
            `;
        } else {
            let eventsHtml = '';
            
            if (hasEAEvents) {
                const scorersList = [];
                const assistersList = [];
                
                eaPlayersList.forEach(p => {
                    const playerName = getPlayerNameById(p.pid) || 'JUGADOR';
                    if (p.goals > 0) scorersList.push({ name: playerName, count: p.goals });
                    if (p.assists > 0) assistersList.push({ name: playerName, count: p.assists });
                });
                
                // Ordenar ambos por cantidad
                scorersList.sort((a, b) => b.count - a.count);
                assistersList.sort((a, b) => b.count - a.count);

                const maxRows = Math.max(scorersList.length, assistersList.length);
                const combinedRows = [];
                for (let i = 0; i < maxRows; i++) {
                    combinedRows.push({ scorer: scorersList[i], assister: assistersList[i] });
                }

                eventsHtml = combinedRows.map(row => {
                    const scorerHtml = row.scorer ? `
                        <span style="display: inline-flex; align-items: center; font-weight: 800; color: #fff;">
                            <svg class="icon-match-event" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px; filter: drop-shadow(0 0 2px rgba(240,165,0,0.4));">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                                <path d="M2 12h20"></path>
                            </svg>
                            ${row.scorer.name.toUpperCase()}${row.scorer.count > 1 ? ` <span style="color:var(--primary); font-size:0.6rem; margin-left:3px;">x${row.scorer.count}</span>` : ''}
                        </span>
                    ` : '<span></span>';

                    const assisterHtml = row.assister ? `
                        <span style="opacity: 0.85; font-style: italic; display: inline-flex; align-items: center; gap: 4px; color: #fff;">
                            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#2ecc71" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"></path>
                            </svg>
                            ${row.assister.name.toUpperCase()}${row.assister.count > 1 ? ` <span style="color:var(--success); font-size:0.6rem; margin-left:3px;">x${row.assister.count}</span>` : ''}
                        </span>
                    ` : '<span></span>';

                    return `
                        <div class="match-event-detail" style="margin-bottom: 5px; padding: 6px 10px; border-radius: 6px; background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.02); display: flex; justify-content: space-between; align-items: center; font-size: 0.68rem;">
                            ${scorerHtml}
                            ${assisterHtml}
                        </div>
                    `;
                }).join('');
            } else {
                eventsHtml = events.map(ev => {
                    const scorer = getPlayerNameById(ev.scorerId) || 'JUGADOR';
                    const assistant = ev.assistantId ? getPlayerNameById(ev.assistantId) : null;
                    
                    const goalSvg = `
                        <svg class="icon-match-event" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px; filter: drop-shadow(0 0 2px rgba(240,165,0,0.4));">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                            <path d="M2 12h20"></path>
                        </svg>
                    `;
                    
                    const assistSvg = assistant ? `
                        <span style="opacity: 0.85; font-style: italic; display: inline-flex; align-items: center; gap: 4px; color: #fff;">
                            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#2ecc71" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"></path>
                            </svg>
                            ${assistant}
                        </span>
                    ` : '';

                    return `
                        <div class="match-event-detail" style="margin-bottom: 5px; padding: 6px 10px; border-radius: 6px; background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.02); display: flex; justify-content: space-between; align-items: center; font-size: 0.68rem;">
                            <span style="display: inline-flex; align-items: center; font-weight: 800; color: #fff;">
                                ${goalSvg} ${scorer}
                            </span>
                            ${assistSvg}
                        </div>
                    `;
                }).join('');
            }
            
            eventsEl.innerHTML = eventsHtml;
        }

        eventsEl.style.display = 'block';
        if (arrowEl) arrowEl.style.transform = 'rotate(90deg)';
    }
};
