// jornadas.js

// --- LÓGICA DE JORNADAS Y PARTIDOS ---
window.setupSessionHandlers = function() {
    if (window._hasSetupSession) return;
    window._hasSetupSession = true;
    
    let lastFetchedPolls = []; 
    let globalLeagues = [];
    let globalTeams = [];

    // --- Selectores Globales (v55.0) ---
    const leagueSelect = document.getElementById('match-league-select');
    const rivalSelect = document.getElementById('match-rival-select');
    const manualRivalContainer = document.getElementById('manual-rival-container');
    const btnSetLocal = document.getElementById('btn-set-local');
    const btnSetVisitor = document.getElementById('btn-set-visitor');

    const loadGlobalData = async () => {
        console.log(">>> [DB] Cargando datos globales (Ligas)...");
        try {
            const { data: leagues, error } = await supabase.from('global_leagues').select('*').order('name');
            if (error) throw error;
            
            globalLeagues = leagues || [];
            console.log(`>>> [DB] Ligas cargadas: ${globalLeagues.length}`);
            
            if (leagueSelect) {
                leagueSelect.innerHTML = '<option value="none">Amistoso / Sin Liga</option>' + 
                    globalLeagues.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
            }
        } catch (err) { 
            console.error(">>> [ERROR] Error cargando ligas:", err); 
            window.jbToast("Error al cargar competiciones", "error");
        }
    };

    btnNewSession.addEventListener('click', async () => {
        // --- BLOQUEO JORNADA ACTIVA (v55.2) ---
        if (state.activeSession) {
            const confirmed = await window.jbConfirm(`⚠️ Ya tienes una jornada activa del ${state.activeSession.date}.\n\nPara empezar una nueva debes FINALIZAR la actual.\n\n¿Quieres ir a la jornada activa ahora?`);
            if (confirmed) {
                renderActiveSession();
                switchView('active-session');
            }
            return;
        }

        const activeTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
        if (sessionTacticName) {
            sessionTacticName.textContent = activeTactic ? activeTactic.name.toUpperCase() : 'SIN TÁCTICA ACTIVA';
        }
        
        // --- Cargar Convocatorias No Vinculadas ---
        const selectEl = document.getElementById('session-poll-select');
        if (selectEl) {
            selectEl.innerHTML = '<option value="">Cargando...</option>';
            selectEl.disabled = true;
            
            try {
                const unlinked = await fetchUnlinkedPolls();
                lastFetchedPolls = unlinked || []; // Guardamos para usar la fecha después
                
                if (!unlinked || unlinked.length === 0) {
                    selectEl.innerHTML = '<option value="">Sin convocatorias disponibles</option>';
                } else {
                    selectEl.innerHTML = unlinked.map(p => {
                        const dateStr = new Date(p.scheduled_time).toLocaleDateString('es-ES');
                        return `<option value="${p.id}">${p.title} (${dateStr})</option>`;
                    }).join('');
                    selectEl.disabled = false;
                }
            } catch (err) {
                selectEl.innerHTML = '<option value="">Error al cargar</option>';
            }
        }

        sessionStartModal.style.display = 'flex';
    });

    closeSessionStart.addEventListener('click', () => {
        sessionStartModal.style.display = 'none';
    });

    btnChangeSessionTactic.addEventListener('click', () => {
        sessionStartModal.style.display = 'none';
        switchView('tacticas');
    });

    btnConfirmSessionStart.addEventListener('click', async () => {
        const selectEl = document.getElementById('session-poll-select');
        if (selectEl && (!selectEl.value || selectEl.disabled)) {
            window.jbToast('Debes seleccionar una convocatoria para iniciar la jornada.', 'error');
            return;
        }
        const selectedPollId = selectEl ? selectEl.value : null;

        // --- DETERMINAR FECHA DE LA CONVOCATORIA (v54.1) ---
        let sessionDate = new Date().toLocaleDateString('es-ES'); // Por defecto hoy
        const linkedPoll = lastFetchedPolls.find(p => p.id === selectedPollId);
        if (linkedPoll) {
            const d = new Date(linkedPoll.scheduled_time);
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();
            sessionDate = `${dd}/${mm}/${yyyy}`;
        }

        // --- CAPTURAR ALINEACIÓN (Preservar Estructura para Renderizado) (v56.3) ---
        let currentLineup = null; 
        
        if (linkedPoll && linkedPoll.final_alignment) {
            currentLineup = linkedPoll.final_alignment;
        }

        // Fallback a táctica actual si no hay alineación en la convocatoria
        if (!currentLineup) {
            const activeTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
            currentLineup = activeTactic ? {
                formation: activeTactic.formation,
                assignments: activeTactic.assignments,
                customPositions: activeTactic.customPositions || {}
            } : [];
        }

        // --- INYECCIÓN AUTOMÁTICA DE JUGADORES DE PRUEBA (TRIAL PLAYERS) (v60.9) ---
        if (currentLineup) {
            if (currentLineup.formation) {
                const formationSlots = FORMATIONS[currentLineup.formation] || [];
                const clonedAssignments = currentLineup.assignments ? { ...currentLineup.assignments } : {};
                
                let trialIndex = 1;
                formationSlots.forEach(slot => {
                    const assignedVal = clonedAssignments[slot.id];
                    if (!assignedVal) {
                        clonedAssignments[slot.id] = `prueba_${trialIndex}`;
                        trialIndex++;
                    }
                });
                
                currentLineup = {
                    ...currentLineup,
                    assignments: clonedAssignments
                };
            } else if (Array.isArray(currentLineup)) {
                let trialIndex = 1;
                while (currentLineup.length < 11) {
                    currentLineup.push(`prueba_${trialIndex}`);
                    trialIndex++;
                }
            }
        }

        sessionStartModal.style.display = 'none';
        const selectedType = document.querySelector('input[name="sessionType"]:checked')?.value || 'friendly';
        
        const newSession = {
            id: Date.now(),
            date: sessionDate,
            matches: [],
            mvpId: null,
            type: selectedType,
            status: 'active',
            poll_id: selectedPollId,
            lineup: currentLineup
        };
        
        state.activeSession = newSession;
        window.jbLoading.show('Iniciando jornada...');
        try {
            await saveSessionCloud(newSession); 
        } catch (err) {
            console.error("Error al iniciar jornada:", err);
            window.jbToast("Error de conexión al iniciar jornada.", "error");
        } finally {
            window.jbLoading.hide();
        }
        
        renderActiveSession();
        switchView('active-session');
    });

    btnBackToSessions.addEventListener('click', () => {
        renderSessions();
        switchView('jornadas');
    });

    btnAddMatch.addEventListener('click', async () => {
        cancelQuickGoal(); // Limpiar por si acaso
        await loadGlobalData();

        // Sincronizar tipo de partido con el tipo de la jornada activa (v56.8)
        const mTypeSelect = document.getElementById('matchType');
        if (mTypeSelect && state.activeSession) {
            mTypeSelect.value = state.activeSession.type || 'friendly';
        }

        matchModal.style.display = 'flex';
        if (manualRivalContainer) manualRivalContainer.style.display = 'block';
    });

    if (leagueSelect) {
        leagueSelect.onchange = async () => {
            const leagueId = leagueSelect.value;
            console.log(`>>> [DB] Liga seleccionada: ${leagueId}`);
            
            if (leagueId === 'none') {
                rivalSelect.innerHTML = '<option value="manual">-- ESCRIBIR NOMBRE MANUAL --</option>';
                manualRivalContainer.style.display = 'block';
                return;
            }
            
            rivalSelect.innerHTML = '<option value="">Cargando equipos...</option>';
            try {
                const { data: teams, error } = await supabase
                    .from('league_teams')
                    .select('global_teams(*)')
                    .eq('league_id', leagueId);
                
                if (error) throw error;

                globalTeams = teams ? teams.map(t => t.global_teams) : [];
                console.log(`>>> [DB] Equipos cargados para liga ${leagueId}: ${globalTeams.length}`);
                
                rivalSelect.innerHTML = '<option value="manual">-- ESCRIBIR NOMBRE MANUAL --</option>' + 
                    globalTeams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
            } catch (err) {
                console.error(">>> [ERROR] Error cargando equipos:", err);
                window.jbToast("Error al cargar equipos de la liga", "error");
            }
        };
    }

    // --- FUNCIÓN HISTORIAL ENFRENTAMIENTOS H2H (v64.0) ---
    const h2hContainer = document.getElementById('match-h2h-container');
    const rivalInputEl = document.getElementById('rivalName');

    function updateMatchH2H(rivalName) {
        if (!h2hContainer) return;
        if (!rivalName || rivalName.trim() === '') {
            h2hContainer.style.display = 'none';
            h2hContainer.innerHTML = '';
            return;
        }
        
        const cleanRivalName = rivalName.trim().toUpperCase();
        let matchesVsRival = [];
        
        // Recopilar sesiones y partidos
        const sessionsToScan = [...(state.sessions || [])];
        if (state.activeSession) {
            sessionsToScan.push(state.activeSession);
        }
        
        sessionsToScan.forEach(sess => {
            const matches = sess.matches || [];
            matches.forEach(m => {
                if (m.rival && m.rival.trim().toUpperCase() === cleanRivalName) {
                    matchesVsRival.push({
                        ...m,
                        sessionName: sess.name || (sess.date ? `Jornada del ${sess.date}` : `Jornada #${sess.id.toString().substring(0, 8)}`)
                    });
                }
            });
        });
        
        if (matchesVsRival.length === 0) {
            h2hContainer.style.display = 'none';
            h2hContainer.innerHTML = '';
            return;
        }
        
        // Ordenar por ID de partido de forma descendente (los más recientes primero)
        matchesVsRival.sort((a, b) => b.id - a.id);
        
        // Métricas
        let winC = 0, drawC = 0, lossC = 0;
        let goalsF = 0, goalsC = 0;
        
        matchesVsRival.forEach(m => {
            if (m.scoreHome > m.scoreAway) winC++;
            else if (m.scoreHome === m.scoreAway) drawC++;
            else lossC++;
            goalsF += m.scoreHome || 0;
            goalsC += m.scoreAway || 0;
        });
        
        const totalPlayed = winC + drawC + lossC;
        const successRatio = Math.round((winC / totalPlayed) * 100);
        
        // Render del Historial H2H
        h2hContainer.innerHTML = `
            <!-- Cabecera Premium -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid rgba(240,165,0,0.2); padding-bottom: 8px;">
                <span style="font-size: 0.7rem; font-weight: 900; letter-spacing: 1px; color: var(--primary); display: flex; align-items: center; gap: 6px;">
                    📊 H2H VS ${escapeHTML(cleanRivalName)}
                </span>
                <span style="font-size: 0.55rem; background: rgba(240, 165, 0, 0.15); border: 1px solid rgba(240, 165, 0, 0.3); color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: 800;">
                    ${totalPlayed} ENCUENTROS
                </span>
            </div>
            
            <!-- Tarjetas de Métricas -->
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                <!-- Balance W/D/L -->
                <div style="flex: 1; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.02); border-radius: 6px; padding: 6px; display: flex; flex-direction: column; align-items: center;">
                    <span style="font-size: 0.5rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Balance</span>
                    <div style="display: flex; gap: 4px; font-size: 0.75rem; font-weight: 900;">
                        <span style="color: #4CAF50;">${winC}V</span>
                        <span style="color: #FFC107; opacity: 0.8;">${drawC}E</span>
                        <span style="color: #F44336;">${lossC}D</span>
                    </div>
                </div>
                
                <!-- Goles Favor / Contra -->
                <div style="flex: 1; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.02); border-radius: 6px; padding: 6px; display: flex; flex-direction: column; align-items: center;">
                    <span style="font-size: 0.5rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Goles</span>
                    <span style="font-size: 0.75rem; font-weight: 900; color: #fff;">
                        ${goalsF} <small style="font-size:0.5rem; color:var(--text-muted);">GF</small> - ${goalsC} <small style="font-size:0.5rem; color:var(--text-muted);">GC</small>
                    </span>
                </div>

                <!-- Eficacia -->
                <div style="flex: 1; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.02); border-radius: 6px; padding: 6px; display: flex; flex-direction: column; align-items: center;">
                    <span style="font-size: 0.5rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Éxito</span>
                    <span style="font-size: 0.75rem; font-weight: 900; color: #2ecc71;">
                        ${successRatio}%
                    </span>
                </div>
            </div>
            
            <!-- Lista de Partidos Previos (Máx 3 para mantener el modal compacto) -->
            <div style="display: flex; flex-direction: column; gap: 6px; max-height: 110px; overflow-y: auto; padding-right: 4px;">
                ${matchesVsRival.slice(0, 3).map(m => {
                    const isWin = m.scoreHome > m.scoreAway;
                    const isDraw = m.scoreHome === m.scoreAway;
                    let outcomeSymbol = isWin ? 'V' : (isDraw ? 'E' : 'D');
                    let outcomeColor = isWin ? '#2ecc71' : (isDraw ? '#f1c40f' : '#e74c3c');
                    let conditionLabel = 'Vs';
                    let typeLabel = (m.type || 'official') === 'official' ? 'Ofic.' : 'Amis.';
                    
                    return `
                        <div class="card-elite" style="padding: 6px 10px; margin: 0; display: flex; align-items: center; justify-content: space-between; font-size: 0.65rem; border-color: rgba(255,255,255,0.02); background: rgba(255,255,255,0.01);">
                            <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; width: 65%;">
                                <span style="width: 15px; height: 15px; border-radius: 3px; background: ${outcomeColor}; color: ${outcomeSymbol === 'E' ? '#000' : '#fff'}; display: flex; align-items: center; justify-content: center; font-size: 0.5rem; font-weight: 900; flex-shrink: 0;">
                                    ${outcomeSymbol}
                                </span>
                                <span style="font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(m.sessionName)}">
                                    ${escapeHTML(m.sessionName)}
                                </span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                                <span style="color: var(--text-muted); font-size: 0.55rem; font-weight: 700;">(${conditionLabel} | ${typeLabel})</span>
                                <span style="font-weight: 900; font-size: 0.7rem; color: var(--primary); letter-spacing: 0.5px;">
                                    ${m.scoreHome} - ${m.scoreAway}
                                </span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        h2hContainer.style.display = 'block';
    }

    if (rivalSelect) {
        rivalSelect.onchange = () => {
            const isManual = rivalSelect.value === 'manual';
            manualRivalContainer.style.display = isManual ? 'block' : 'none';
            
            if (isManual) {
                updateMatchH2H(rivalInputEl ? rivalInputEl.value : '');
            } else {
                const selectedTeam = globalTeams.find(t => t.id === rivalSelect.value);
                updateMatchH2H(selectedTeam ? selectedTeam.name : '');
            }
        };
    }

    // --- AUTOCOMPLETADO Y SUGERENCIAS DE RIVALES (v65.0) ---
    const suggestionsDropdown = document.getElementById('rival-suggestions-dropdown');
    let highlightedIndex = -1;
    let filteredSuggestions = [];

    function getHistoricalRivals() {
        const rivals = new Set();
        const sessionsToScan = [...(state.sessions || [])];
        if (state.activeSession) {
            sessionsToScan.push(state.activeSession);
        }
        sessionsToScan.forEach(sess => {
            const matches = sess.matches || [];
            matches.forEach(m => {
                if (m.rival) {
                    const trimmed = m.rival.trim();
                    if (trimmed) rivals.add(trimmed);
                }
            });
        });
        return Array.from(rivals).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    }

    function renderSuggestions(searchText) {
        if (!suggestionsDropdown) return;
        highlightedIndex = -1;
        
        if (!searchText || searchText.trim() === '') {
            suggestionsDropdown.style.display = 'none';
            suggestionsDropdown.innerHTML = '';
            filteredSuggestions = [];
            return;
        }

        const cleanSearch = searchText.trim().toLowerCase();
        const allRivals = getHistoricalRivals();
        
        // Filtrar rivales que coincidan con el texto de búsqueda
        filteredSuggestions = allRivals.filter(rival => 
            rival.toLowerCase().includes(cleanSearch)
        );

        if (filteredSuggestions.length === 0) {
            suggestionsDropdown.style.display = 'none';
            suggestionsDropdown.innerHTML = '';
            return;
        }

        // Renderizar los elementos
        suggestionsDropdown.innerHTML = filteredSuggestions.map((rival, index) => {
            return `<div class="rival-suggestion-item" data-index="${index}" data-value="${escapeHTML(rival)}">
                <span style="color: var(--primary); font-weight: 700; margin-right: 8px;">⚔️</span>${escapeHTML(rival)}
            </div>`;
        }).join('');

        suggestionsDropdown.style.display = 'block';

        // Añadir eventos click a los elementos de sugerencia
        const items = suggestionsDropdown.querySelectorAll('.rival-suggestion-item');
        items.forEach(item => {
            item.onclick = (e) => {
                e.stopPropagation();
                selectSuggestion(item.getAttribute('data-value'));
            };
            item.onmouseenter = () => {
                highlightIndex(parseInt(item.getAttribute('data-index')));
            };
        });
    }

    function highlightIndex(index) {
        highlightedIndex = index;
        if (!suggestionsDropdown) return;
        const items = suggestionsDropdown.querySelectorAll('.rival-suggestion-item');
        items.forEach((item, idx) => {
            if (idx === index) {
                item.classList.add('highlighted');
                // Hacer scroll automático si el elemento está fuera de vista en el dropdown
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('highlighted');
            }
        });
    }

    function selectSuggestion(rivalName) {
        if (!rivalInputEl) return;
        rivalInputEl.value = rivalName;
        if (suggestionsDropdown) {
            suggestionsDropdown.style.display = 'none';
            suggestionsDropdown.innerHTML = '';
        }
        filteredSuggestions = [];
        highlightedIndex = -1;
        
        // Actualizar H2H inmediatamente
        updateMatchH2H(rivalName);
    }

    if (rivalInputEl) {
        rivalInputEl.oninput = () => {
            const val = rivalInputEl.value;
            updateMatchH2H(val);
            renderSuggestions(val);
        };

        rivalInputEl.onkeydown = (e) => {
            if (suggestionsDropdown && suggestionsDropdown.style.display === 'block') {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIdx = (highlightedIndex + 1) % filteredSuggestions.length;
                    highlightIndex(nextIdx);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIdx = (highlightedIndex - 1 + filteredSuggestions.length) % filteredSuggestions.length;
                    highlightIndex(prevIdx);
                } else if (e.key === 'Enter') {
                    if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
                        e.preventDefault();
                        selectSuggestion(filteredSuggestions[highlightedIndex]);
                    }
                } else if (e.key === 'Escape') {
                    suggestionsDropdown.style.display = 'none';
                    suggestionsDropdown.innerHTML = '';
                    filteredSuggestions = [];
                    highlightedIndex = -1;
                }
            }
        };

        rivalInputEl.onclick = (e) => {
            e.stopPropagation();
            renderSuggestions(rivalInputEl.value);
        };
    }

    // Ocultar dropdown al hacer click fuera
    document.addEventListener('click', (e) => {
        if (suggestionsDropdown && !suggestionsDropdown.contains(e.target) && e.target !== rivalInputEl) {
            suggestionsDropdown.style.display = 'none';
            highlightedIndex = -1;
            filteredSuggestions = [];
        }
    });

    // Controles de local/visitante removidos

    closeMatchModal.onclick = () => {
        matchModal.style.display = 'none';
        if (h2hContainer) {
            h2hContainer.style.display = 'none';
            h2hContainer.innerHTML = '';
        }
    };

    matchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let rivalName = '';
        let rivalCrest = null;
        const isManual = rivalSelect.value === 'manual';

        if (isManual) {
            rivalName = document.getElementById('rivalName').value.trim();
            // v55.2: Escudo neutral para rivales manuales
            rivalCrest = "https://www.virtualpronetwork.com/api/media/images/teamlogos/default.png";
        } else {
            const selectedTeam = globalTeams.find(t => t.id === rivalSelect.value);
            rivalName = selectedTeam ? selectedTeam.name : 'Rival';
            rivalCrest = selectedTeam ? selectedTeam.crest_url : "https://www.virtualpronetwork.com/api/media/images/teamlogos/default.png";
        }

        if (!rivalName) return window.jbToast('Introduce el nombre del rival', 'warning');

        const type = document.getElementById('matchType').value;
        
        // Iniciar partido con datos extendidos (v55.0)
        window.startLiveMatch(rivalName, type, rivalCrest);
        
        matchModal.style.display = 'none';
        matchForm.reset();
        if (h2hContainer) {
            h2hContainer.style.display = 'none';
            h2hContainer.innerHTML = '';
        }
    });

    // Controles de partido en vivo (v55.0 - Dinámicos)
    btnAddGoalHome.addEventListener('click', () => {
        openGoalModal('home');
    });

    btnSubGoalHome.addEventListener('click', () => {
        if (currentMatch.scoreHome > 0) {
            const lastHomeGoalIndex = [...currentMatch.events].reverse().findIndex(e => e.side === 'home');
            if (lastHomeGoalIndex !== -1) {
                const actualIndex = currentMatch.events.length - 1 - lastHomeGoalIndex;
                currentMatch.events.splice(actualIndex, 1);
            }
            currentMatch.scoreHome--;
            updateLiveMatchUI();
        }
    });

    btnAddGoalAway.addEventListener('click', () => {
        currentMatch.scoreAway++;
        updateLiveMatchUI();
    });

    btnSubGoalAway.addEventListener('click', () => {
        if (currentMatch.scoreAway > 0) {
            const lastAwayGoalIndex = [...currentMatch.events].reverse().findIndex(e => e.side === 'away');
            if (lastAwayGoalIndex !== -1) {
                const actualIndex = currentMatch.events.length - 1 - lastAwayGoalIndex;
                currentMatch.events.splice(actualIndex, 1);
            }
            currentMatch.scoreAway--;
            updateLiveMatchUI();
        }
    });

    btnFinishMatch.addEventListener('click', async () => {
        const ok = await window.jbConfirm('¿Finalizar y registrar el partido?');
        if (ok) await finalizeMatch();
    });

    btnFinalizeSession.addEventListener('click', () => openMVPMedal());

    // Lógica de Registro de Gol
    closeGoalModal.onclick = () => goalModal.style.display = 'none';
    btnSaveGoal.addEventListener('click', () => saveGoalEvent());

    // Botón de Recalculación (v50.0)
    const btnRecalc = document.getElementById('btn-recalculate-stats');
    if (btnRecalc) {
        btnRecalc.addEventListener('click', async () => {
            const ok = await window.jbConfirm('¿Quieres recalcular todas las estadísticas?\n\nEsto analizará tus jornadas guardadas y pondrá los contadores a cero para volver a sumarlos correctamente.');
            if (ok) {
                const result = await recalculateAllStats();
                if (result.success) {
                    await loadTeamData(); // Recargar todo para ver cambios
                    switchView('home');
                }
            }
        });
    }

    // Botón Resetear Temporada (v50.7)
    const btnResetSeason = document.getElementById('btn-reset-season');
    if (btnResetSeason) {
        btnResetSeason.addEventListener('click', async () => {
            if (state.user?.role !== 'manager') return;
            
            const ok1 = await window.jbConfirm('⚠️ ADVERTENCIA CRÍTICA ⚠️\n\nEstás a punto de ELIMINAR TODO EL HISTORIAL de jornadas y poner TODAS LAS ESTADÍSTICAS A 0 para todos los jugadores.\n\n¿Quieres continuar?');
            if (!ok1) return;

            const ok2 = await window.jbConfirm('¿ESTÁS ABSOLUTAMENTE SEGURO?\n\nEsta acción NO SE PUEDE DESHACER. Se borrarán todos los partidos y goles actuales para empezar una nueva temporada.');
            if (!ok2) return;

            window.jbLoading.show('Borrando historial e iniciando nueva temporada...');
            try {
                // 1. Borrar todas las sesiones del equipo
                const { error: errSessions } = await supabase
                    .from('sessions')
                    .delete()
                    .eq('team_id', state.team.id);
                    
                if (errSessions) throw errSessions;

                // 2. Resetear stats de jugadores a 0
                for (let p of state.players) {
                    p.stats = {
                        official: { goals: 0, assists: 0, matches: 0, wins: 0, mvps: 0, cleanSheets: 0 },
                        friendly: { goals: 0, assists: 0, matches: 0, wins: 0, mvps: 0, cleanSheets: 0 }
                    };
                    p.mvp_count = 0;
                    await savePlayerCloud(p); // Importado de data.js
                }

                // 3. Resetear datos locales
                state.sessions = [];
                state.activeSession = null;
                localStorage.removeItem('jb_active_session');

                await loadTeamData(); // Recarga integral
                window.jbToast('¡NUEVA TEMPORADA INICIADA! Historial reseteado a 0.', 'success');
                switchView('home');
            } catch (err) {
                console.error(">>> [ERROR] Fallo al resetear la temporada:", err);
                window.jbToast('Hubo un error al intentar resetear la temporada.', 'error');
            }
            window.jbLoading.hide();
        });
    }

    // --- GESTIÓN DE CAMBIOS EN VIVO (v51.0) ---
    const btnManageLineup = document.getElementById('btn-manage-lineup');
    if (btnManageLineup) {
        btnManageLineup.addEventListener('click', () => {
            renderLineupChangesModal();
        });
    }

    const closeLineupChanges = document.getElementById('close-lineup-changes');
    if (closeLineupChanges) {
        closeLineupChanges.addEventListener('click', () => {
            document.getElementById('modal-lineup-changes').style.display = 'none';
        });
    }

    const btnSaveLineupChanges = document.getElementById('btn-save-lineup-changes');
    if (btnSaveLineupChanges) {
        btnSaveLineupChanges.addEventListener('click', async () => {
            if (state.activeSession) {
                window.jbLoading.show('Guardando cambios...');
                await saveSessionCloud(state.activeSession);
                window.jbLoading.hide();
                window.jbToast('Alineación actualizada para los próximos partidos.', 'success');
                document.getElementById('modal-lineup-changes').style.display = 'none';
            }
        });
    }
}

async function renderLineupChangesModal() {
    const modal = document.getElementById('modal-lineup-changes');
    const currentList = document.getElementById('current-lineup-list');
    const availableList = document.getElementById('available-subs-list');
    
    if (!state.activeSession) return;
    
    modal.style.display = 'flex';
    currentList.innerHTML = '<p style="font-size:0.7rem; opacity:0.5; padding: 15px; text-align:center;">Cargando...</p>';
    availableList.innerHTML = '<p style="font-size:0.7rem; opacity:0.5; padding: 15px; text-align:center;">Cargando...</p>';

    // 1. Obtener votos de la convocatoria vinculada
    let availablePlayerIds = [];
    if (state.activeSession.poll_id) {
        const { data: votes } = await supabase
            .from('availability_votes')
            .select('user_id, vote')
            .eq('poll_id', state.activeSession.poll_id)
            .in('vote', ['yes', 'late']);
        
        if (votes) {
            availablePlayerIds = votes.map(v => {
                const p = state.players.find(player => player.user_id === v.user_id);
                return p ? p.id : null;
            }).filter(id => id);
        }
    }

    const currentLineupIds = state.activeSession.lineup || [];
    
    // 2. Renderizar titulares
    currentList.innerHTML = '';
    currentLineupIds.forEach(id => {
        const player = state.players.find(p => p.id == id);
        if (!player) return;
        
        const item = document.createElement('div');
        item.className = 'player-roster-card';
        item.style.cssText = 'padding: 8px 12px; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.03); border-radius: 6px; margin-bottom: 5px;';
        item.innerHTML = `
            <span style="font-weight:900; color:var(--primary); width:20px;">${player.dorsal}</span>
            <span style="flex:1; font-size:0.8rem; font-weight:700;">${player.name.toUpperCase()}</span>
            <button class="btn-cancel" style="padding:4px 8px; font-size:0.6rem; border-radius:4px; width:auto; height:auto; margin:0;" onclick="window.removePlayerFromLineup('${player.id}')">QUITAR</button>
        `;
        currentList.appendChild(item);
    });

    if (currentLineupIds.length === 0) {
        currentList.innerHTML = '<p style="font-size:0.7rem; opacity:0.4; text-align:center; padding:10px;">No hay jugadores en el 11 actual.</p>';
    }

    // 3. Renderizar suplentes
    availableList.innerHTML = '';
    const subs = availablePlayerIds.filter(id => !currentLineupIds.includes(id));
    
    if (subs.length === 0 && availablePlayerIds.length > 0) {
        availableList.innerHTML = '<p style="font-size:0.7rem; opacity:0.5; text-align:center; padding:10px;">Todos los convocados están en el campo.</p>';
    } else if (availablePlayerIds.length === 0) {
        const allSubs = state.players.filter(p => !currentLineupIds.includes(p.id));
        allSubs.forEach(p => renderSubItem(p, availableList));
    } else {
        subs.forEach(id => {
            const player = state.players.find(p => p.id == id);
            if (player) renderSubItem(player, availableList);
        });
    }
}

function renderSubItem(player, container) {
    const item = document.createElement('div');
    item.className = 'player-roster-card';
    item.style.cssText = 'padding: 8px 12px; display: flex; align-items: center; gap: 10px; background: rgba(76, 175, 80, 0.05); border-radius: 6px; border: 1px solid rgba(76, 175, 80, 0.1); cursor: pointer; margin-bottom: 5px;';
    item.innerHTML = `
        <span style="font-weight:900; color:#4CAF50; width:20px;">${player.dorsal}</span>
        <span style="flex:1; font-size:0.8rem; font-weight:700;">${player.name.toUpperCase()}</span>
        <span style="font-size:0.6rem; color:#4CAF50; font-weight:900;">AÑADIR +</span>
    `;
    item.onclick = () => {
        if (state.activeSession.lineup.length >= 11) {
            window.jbToast('Ya hay 11 jugadores. Quita a uno primero.', 'warning');
            return;
        }
        state.activeSession.lineup.push(player.id);
        renderLineupChangesModal();
    };
    container.appendChild(item);
}

window.removePlayerFromLineup = (playerId) => {
    if (!state.activeSession) return;
    state.activeSession.lineup = state.activeSession.lineup.filter(id => id != playerId);
    renderLineupChangesModal();
};


window.renderSessions = function() {
    console.log(">>> [UI] Renderizando vista de Jornadas...");
    window.renderSessionsCalendar();
    window.renderActiveSessionBanner(); // v55.2
}

/**
 * Renderiza un banner informativo si hay una jornada en curso (v55.2)
 */
window.renderActiveSessionBanner = function() {
    const bannerContainer = document.getElementById('active-session-resume-banner');
    if (!bannerContainer) return;

    if (!state.activeSession) {
        bannerContainer.style.display = 'none';
        return;
    }

    const session = state.activeSession;
    if (!session) {
        bannerContainer.style.display = 'none';
        return;
    }

    const matches = session.matches || [];
    const wins = matches.filter(m => m.scoreHome > m.scoreAway).length;
    const draws = matches.filter(m => m.scoreHome === m.scoreAway).length;
    const losses = matches.filter(m => m.scoreHome < m.scoreAway).length;

    bannerContainer.style.display = 'block';
    bannerContainer.innerHTML = `
        <div class="card-elite" style="border: 1px solid var(--primary); background: linear-gradient(135deg, rgba(240, 165, 0, 0.1), rgba(240, 165, 0, 0.02)); padding: 25px; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; border-radius: 12px; box-shadow: 0 0 30px rgba(0,0,0,0.5);">
            <div style="display: flex; align-items: center; gap: 20px;">
                <div class="badge-live" style="font-size: 1.5rem; padding: 10px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">⏱️</div>
                <div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <span class="badge-live" style="animation: pulse 1.5s infinite;">EN CURSO</span>
                        <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 800; letter-spacing: 1px;">JORNADA DEL ${session.date}</span>
                    </div>
                    <h3 style="margin: 0; font-size: 1.2rem; color: #fff; font-weight: 900;">Sesión activa detectada</h3>
                    <p style="margin: 5px 0 0 0; font-size: 0.8rem; color: var(--text-muted);">Balance: <b style="color:var(--primary)">${wins}V - ${draws}E - ${losses}D</b> en ${matches.length} partidos.</p>
                </div>
            </div>
            <button onclick="window.resumeActiveSession()" class="btn-gold" style="width: auto; padding: 15px 35px; font-weight: 900; box-shadow: 0 0 30px rgba(240, 165, 0, 0.2); transform: scale(1.05);">RETOMAR AHORA</button>
        </div>
    `;
};

/**
 * Navega directamente a la gestión de la jornada activa (v55.2)
 */
window.resumeActiveSession = function() {
    if (!state.activeSession) {
        console.warn("No active session found to resume.");
        return;
    }
    window.renderActiveSession(state.activeSession);
};

window.renderSessionsCalendar = function() {
    const grid = document.getElementById('sessions-calendar-grid');
    const label = document.getElementById('sessions-calendar-month-label');
    const details = document.getElementById('sessions-day-details');
    if (!grid || !label) return;

    if (details) details.style.display = 'none'; // Ocultar detalles al cambiar de mes
    
    const year = currentSessionsCalendarDate.getFullYear();
    const month = currentSessionsCalendarDate.getMonth();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    label.textContent = `${monthNames[month].toUpperCase()} ${year}`;

    grid.innerHTML = '';
    
    // 1. Calcular offset para que el lunes sea el primer día
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay === 0) ? 6 : firstDay - 1;

    for (let i = 0; i < offset; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day';
        grid.appendChild(empty);
    }

    // 2. Mapear sesiones por fecha
    const sessionsByDate = new Map();
    const allSessions = [...state.sessions];
    if (state.activeSession) {
        if (!allSessions.find(s => s.id === state.activeSession.id)) {
            allSessions.push(state.activeSession);
        }
    }
    
    allSessions.forEach(s => {
        if (!s.date) return;
        // Normalizar fecha (Asumimos DD/MM/YYYY)
        const parts = s.date.split('/');
        if (parts.length === 3) {
            const dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
            const key = dateObj.toDateString();
            if (!sessionsByDate.has(key)) sessionsByDate.set(key, []);
            sessionsByDate.get(key).push(s);
        }
    });

    const todayStr = new Date().toDateString();

    // 3. Generar días
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const dateString = dateObj.toDateString();
        const daySessions = sessionsByDate.get(dateString);
        
        const cell = document.createElement('div');
        cell.className = 'calendar-day has-date';
        
        // Destacar día actual con borde azul (v52.1)
        if (dateString === todayStr) cell.classList.add('today-highlight');
        
        if (daySessions && daySessions.length > 0) {
            // Calcular tendencia del día (v52.1)
            let totalWins = 0;
            let totalLosses = 0;
            let totalDraws = 0;
            
            daySessions.forEach(s => {
                const wins = s.matches.filter(m => m.scoreHome > m.scoreAway).length;
                const losses = s.matches.filter(m => m.scoreHome < m.scoreAway).length;
                const draws = s.matches.filter(m => m.scoreHome === m.scoreAway).length;
                totalWins += wins;
                totalLosses += losses;
                totalDraws += draws;
            });
            
            cell.classList.add('day-played');
            if (totalWins > totalLosses) cell.classList.add('day-win');
            else if (totalLosses > totalWins) cell.classList.add('day-loss');
            else cell.classList.add('day-draw');
            
            cell.onclick = () => window.renderSessionDayDetails(dateString, daySessions);
            
            cell.innerHTML = `
                <span class="calendar-day-number">${d}</span>
                <div class="calendar-day-stats-column">
                    <div class="stat-v">${totalWins} V</div>
                    <div class="stat-e">${totalDraws} E</div>
                    <div class="stat-d">${totalLosses} D</div>
                </div>
            `;
        } else {
            cell.innerHTML = `<span class="calendar-day-number">${d}</span>`;
            const isManagerOrCap = state.user && (state.user.role === 'manager' || state.user.role === 'capitan');
            if (isManagerOrCap) {
                cell.style.cursor = 'pointer';
                cell.onclick = () => {
                    if (window.EASync && window.EASync.openSyncModalForDate) {
                        window.EASync.openSyncModalForDate(dateObj, null);
                    } else {
                        window.jbToast('Módulo EA Sync no disponible', 'error');
                    }
                };
            }
        }
        
        grid.appendChild(cell);
    }

    // 4. Calcular estadísticas del mes visible (v52.2)
    let monthTotalMatches = 0;
    let monthWins = 0;
    let monthLosses = 0;
    let monthDraws = 0;
    
    allSessions.forEach(s => {
        const parts = s.date.split('/');
        const sMonth = parseInt(parts[1]) - 1;
        const sYear = parseInt(parts[2]);
        
        if (sMonth === month && sYear === year) {
            monthTotalMatches += s.matches.length;
            s.matches.forEach(m => {
                if (m.scoreHome > m.scoreAway) monthWins++;
                else if (m.scoreHome < m.scoreAway) monthLosses++;
                else monthDraws++;
            });
        }
    });
    
    const summaryName = document.getElementById('summary-month-name');
    const summaryStats = document.getElementById('sessions-summary-stats');
    if (summaryName && summaryStats) {
        summaryName.textContent = `ESTADÍSTICAS ${monthNames[month].toUpperCase()}`;
        summaryStats.innerHTML = `
            <div class="month-stat-card">
                <span class="label">Partidos Jugados</span>
                <span class="value">${monthTotalMatches}</span>
            </div>
            <div class="month-stat-card" style="border-left: 3px solid var(--success);">
                <span class="label">Victorias</span>
                <span class="value" style="color: var(--success);">${monthWins}</span>
            </div>
            <div class="month-stat-card" style="border-left: 3px solid #FFC107;">
                <span class="label">Empates</span>
                <span class="value" style="color: #FFC107;">${monthDraws}</span>
            </div>
            <div class="month-stat-card" style="border-left: 3px solid var(--error);">
                <span class="label">Derrotas</span>
                <span class="value" style="color: var(--error);">${monthLosses}</span>
            </div>
        `;
    }
}

window.closeSessionDayModal = function() {
    const modal = document.getElementById('session-day-modal');
    if (modal) modal.style.display = 'none';
};

// Cerrar el modal al hacer clic en el fondo translúcido (overlay)
document.addEventListener('click', (e) => {
    const modal = document.getElementById('session-day-modal');
    if (modal && e.target === modal) {
        window.closeSessionDayModal();
    }
});

window.renderSessionDayDetails = function(dateString, sessions) {
    console.log(">>> [UI] Intentando abrir modal de jornada para:", dateString, "Sesiones:", sessions);
    const modal = document.getElementById('session-day-modal');
    const panel = document.getElementById('session-day-panel');
    if (!modal || !panel) {
        console.error(">>> [ERROR] No se encontró el modal o el panel en el DOM.");
        return;
    }

    // Formatear fecha
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const formattedDate = `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;

    // Calcular Balance Global del Día
    let v = 0, e = 0, d = 0;
    sessions.forEach(sess => {
        if (!sess.matches) return;
        sess.matches.forEach(m => {
            const sh = m.scoreHome || 0;
            const sa = m.scoreAway || 0;
            if (sh === sa) e++;
            else if (sh > sa) v++;
            else d++;
        });
    });

    const totalMatches = v + e + d;

    // Generar el HTML del panel
    let html = `
        <div class="modal-session-header" style="display: flex; align-items: center; gap: 20px; border-bottom: 1px solid rgba(240, 165, 0, 0.2); padding-bottom: 20px; position: relative;">
            <div style="width: 56px; height: 56px; background: linear-gradient(135deg, rgba(240, 165, 0, 0.15) 0%, rgba(10, 10, 10, 0.95) 100%); border-radius: 16px; padding: 12px; flex-shrink: 0; border: 1px solid var(--primary); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(240, 165, 0, 0.2);">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            </div>
            <div class="modal-session-title-wrap">
                <span style="font-size: 0.65rem; color: var(--primary); text-transform: uppercase; font-weight: 900; letter-spacing: 2px; display: block; margin-bottom: 4px; text-shadow: 0 0 8px rgba(240, 165, 0, 0.4);">RESUMEN DE JORNADA</span>
                <h3 style="margin: 0; font-size: 1.5rem; color: #fff; font-weight: 900; line-height: 1.1; letter-spacing: 0.5px;">${formattedDate}</h3>
            </div>
            
            ${(state.user && (state.user.role === 'manager' || state.user.role === 'capitan')) ? `
            <button onclick="window.closeSessionDayModal(); window.EASync.openSyncModalForDate(new Date('${dateString}'), state.sessions.find(s => s.date === '${sessions[0]?.date}'));" class="btn-recalc-ea" style="margin-left: auto; margin-right: 10px; background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.3); color: #00ff88; padding: 8px 15px; border-radius: 8px; font-weight: 800; font-size: 0.75rem; cursor: pointer; transition: all 0.2s;">
                <i class="fa-solid fa-rotate"></i> RECALCULAR (EA)
            </button>
            ` : `<div style="margin-left: auto;" class="modal-spacer"></div>`}
            
            <button onclick="window.closeSessionDayModal()" class="btn-cancel btn-close-modal" style="${(state.user && (state.user.role === 'manager' || state.user.role === 'capitan')) ? '' : 'margin-left: auto;'} width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #fff; cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>

        <div class="modal-session-summary-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 20px; margin-bottom: 10px;">
            <div style="background: linear-gradient(135deg, rgba(46, 204, 113, 0.1) 0%, rgba(0,0,0,0.4) 100%); border: 1px solid rgba(46, 204, 113, 0.2); border-radius: 12px; padding: 15px 10px; text-align: center; box-shadow: 0 8px 20px rgba(0,0,0,0.2); transition: transform 0.2s; cursor: default;" onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='rgba(46, 204, 113, 0.5)'" onmouseout="this.style.transform='none'; this.style.borderColor='rgba(46, 204, 113, 0.2)'">
                <span style="display: block; font-size: 0.6rem; color: rgba(255,255,255,0.5); text-transform: uppercase; font-weight: 900; letter-spacing: 1px; margin-bottom: 6px;">VICTORIAS</span>
                <span class="summary-val" style="font-size: 1.6rem; font-weight: 900; color: #2ecc71; text-shadow: 0 0 15px rgba(46, 204, 113, 0.4); line-height: 1;">${v}</span>
            </div>
            <div style="background: linear-gradient(135deg, rgba(241, 196, 15, 0.1) 0%, rgba(0,0,0,0.4) 100%); border: 1px solid rgba(241, 196, 15, 0.2); border-radius: 12px; padding: 15px 10px; text-align: center; box-shadow: 0 8px 20px rgba(0,0,0,0.2); transition: transform 0.2s; cursor: default;" onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='rgba(241, 196, 15, 0.5)'" onmouseout="this.style.transform='none'; this.style.borderColor='rgba(241, 196, 15, 0.2)'">
                <span style="display: block; font-size: 0.6rem; color: rgba(255,255,255,0.5); text-transform: uppercase; font-weight: 900; letter-spacing: 1px; margin-bottom: 6px;">EMPATES</span>
                <span style="font-size: 1.6rem; font-weight: 900; color: #f1c40f; text-shadow: 0 0 15px rgba(241, 196, 15, 0.4); line-height: 1;">${e}</span>
            </div>
            <div style="background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(0,0,0,0.4) 100%); border: 1px solid rgba(231, 76, 60, 0.2); border-radius: 12px; padding: 15px 10px; text-align: center; box-shadow: 0 8px 20px rgba(0,0,0,0.2); transition: transform 0.2s; cursor: default;" onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='rgba(231, 76, 60, 0.5)'" onmouseout="this.style.transform='none'; this.style.borderColor='rgba(231, 76, 60, 0.2)'">
                <span style="display: block; font-size: 0.6rem; color: rgba(255,255,255,0.5); text-transform: uppercase; font-weight: 900; letter-spacing: 1px; margin-bottom: 6px;">DERROTAS</span>
                <span style="font-size: 1.6rem; font-weight: 900; color: #e74c3c; text-shadow: 0 0 15px rgba(231, 76, 60, 0.4); line-height: 1;">${d}</span>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px; padding-bottom: 10px;">
    `;

    if (sessions.length === 0) {
        html += `<p style="text-align: center; opacity: 0.4; font-size: 0.75rem; padding: 30px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; margin-top: 10px;">No hay jornadas registradas en este día.</p>`;
    } else {
        sessions.forEach(session => {
            const isAdmin = state.user.role === 'manager' || state.user.role === 'capitan';
            const isActive = state.activeSession && session.id === state.activeSession.id;
            
            html += `
                <div style="background: linear-gradient(180deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.95) 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); position: relative; overflow: hidden;">
                    <!-- Decoración Superior -->
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: ${session.type === 'official' ? 'var(--primary)' : 'rgba(255,255,255,0.2)'};"></div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="background: ${session.type === 'official' ? 'rgba(240, 165, 0, 0.15)' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${session.type === 'official' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}; color: ${session.type === 'official' ? 'var(--primary)' : '#fff'}; font-size: 0.6rem; padding: 4px 10px; border-radius: 6px; font-weight: 900; letter-spacing: 1px; box-shadow: ${session.type === 'official' ? '0 0 10px rgba(240, 165, 0, 0.2)' : 'none'};">
                                ${session.type === 'official' ? 'OFICIAL' : 'AMISTOSO'}
                            </span>
                            ${isActive ? '<span style="background: rgba(231, 76, 60, 0.15); border: 1px solid #e74c3c; color: #e74c3c; font-size: 0.6rem; padding: 4px 10px; border-radius: 6px; font-weight: 900; letter-spacing: 1px; animation: pulse 2s infinite; box-shadow: 0 0 10px rgba(231, 76, 60, 0.3);">EN CURSO</span>' : ''}
                        </div>
                        ${isAdmin ? "<button onclick='window.closeSessionDayModal(); window.handleDeleteSession({id: \"" + session.id + "\", date: \"" + session.date + "\"})' style='background: rgba(231, 76, 60, 0.1); border: 1px solid rgba(231, 76, 60, 0.2); width: 32px; height: 32px; border-radius: 8px; cursor: pointer; color: #e74c3c; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;' onmouseover=\"this.style.background='rgba(231, 76, 60, 0.2)'; this.style.transform='scale(1.05)'\" onmouseout=\"this.style.background='rgba(231, 76, 60, 0.1)'; this.style.transform='none'\" title='Eliminar Jornada'>🗑️</button>" : ""}
                    </div>
            `;

            if (!session.matches || session.matches.length === 0) {
                html += `<p style="text-align: center; opacity: 0.4; font-size: 0.75rem; padding: 20px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; margin: 10px 0;">No hay partidos registrados en esta jornada.</p>`;
            }

            (session.matches || []).forEach((m, idx) => {
                const isWin = m.scoreHome > m.scoreAway;
                const isDraw = m.scoreHome === m.scoreAway;
                const outcomeColor = isWin ? '#2ecc71' : (isDraw ? '#f1c40f' : '#e74c3c');
                const outcomeBg = isWin ? 'rgba(46, 204, 113, 0.15)' : (isDraw ? 'rgba(241, 196, 15, 0.15)' : 'rgba(231, 76, 60, 0.15)');
                const outcomeSymbol = isWin ? 'V' : (isDraw ? 'E' : 'D');

                const homeGoals = m.events ? m.events.filter(e => e.side === 'home') : [];
                
                let eventsHtml = '';
                
                if (m.eaPlayers && Object.keys(m.eaPlayers).length > 0 && homeGoals.length === 0) {
                    const playersWithStats = [];
                    for (const pid in m.eaPlayers) {
                        const st = m.eaPlayers[pid];
                        const g = parseInt(st.goals) || 0;
                        const a = parseInt(st.assists) || 0;
                        const motm = st.mom === "1";
                        const r = parseFloat(st.rating) || 0;
                        // Incluir a todos los jugadores que tengan un registro en eaPlayers
                        playersWithStats.push({ pid, g, a, motm, r });
                    }
                    
                    // Ordenar por MVP, luego goles, luego asistencias, luego rating
                    playersWithStats.sort((a, b) => (b.motm ? 1 : 0) - (a.motm ? 1 : 0) || b.g - a.g || b.a - a.a || b.r - a.r);

                    if (playersWithStats.length > 0) {
                        const rowsHtml = playersWithStats.map(p => {
                            const scorer = getPlayerNameById(p.pid) || 'Jugador';
                            // Colores para el rating
                            const ratingColor = p.r >= 8.5 ? '#2ecc71' : (p.r >= 7.0 ? '#f1c40f' : '#fff');
                            
                            return `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                                    <td style="padding: 10px 15px; font-weight: 800; color: #fff; font-size: 0.8rem; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
                                        ${p.motm ? '<span style="font-size: 0.9rem;" title="MVP del Partido">⭐</span>' : ''}
                                        ${scorer.toUpperCase()}
                                    </td>
                                    <td style="padding: 10px 15px; text-align: center;">
                                        <span style="font-size: 0.75rem; font-weight: 900; background: rgba(255,255,255,0.05); padding: 3px 6px; border-radius: 4px; color: ${ratingColor}; border: 1px solid rgba(255,255,255,0.05);">${p.r.toFixed(1)}</span>
                                    </td>
                                    <td style="padding: 10px 15px; text-align: center;">
                                        ${p.g > 0 ? `<span style="font-weight: 900; color: var(--primary); font-size: 0.85rem;">${p.g}</span>` : '<span style="color: rgba(255,255,255,0.2);">-</span>'}
                                    </td>
                                    <td style="padding: 10px 15px; text-align: center;">
                                        ${p.a > 0 ? `<span style="font-weight: 900; color: var(--success); font-size: 0.85rem;">${p.a}</span>` : '<span style="color: rgba(255,255,255,0.2);">-</span>'}
                                    </td>
                                </tr>
                            `;
                        }).join('');

                        eventsHtml = `
                            <div class="match-events-table-wrapper" style="overflow-x: auto; margin-top: 5px;">
                                <table class="match-events-table" style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1.5px; text-align: left;">
                                            <th style="padding: 8px 15px;">Jugador</th>
                                            <th style="padding: 8px 15px; text-align: center;">Nota</th>
                                            <th style="padding: 8px 15px; text-align: center;" title="Goles">⚽</th>
                                            <th style="padding: 8px 15px; text-align: center;" title="Asistencias">👟</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${rowsHtml}
                                    </tbody>
                                </table>
                            </div>
                        `;
                    } else {
                        eventsHtml = `<div style="font-size: 0.8rem; color: rgba(255,255,255,0.3); text-align: center; padding: 25px 0; font-style: italic; letter-spacing: 0.5px;">Sin datos de jugadores para este partido.</div>`;
                    }
                } else {
                    eventsHtml = homeGoals.map(g => {
                        const scorer = getPlayerNameById(g.scorerId) || 'Jugador';
                        const assist = g.assistantId ? getPlayerNameById(g.assistantId) : null;
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(240, 165, 0, 0.1); border: 1px solid rgba(240, 165, 0, 0.2); display: flex; align-items: center; justify-content: center;">
                                        <span style="font-size: 0.8rem;">⚽</span>
                                    </div>
                                    <span style="font-weight: 800; color: #fff; font-size: 0.85rem; letter-spacing: 0.5px;">${scorer.toUpperCase()}</span>
                                </div>
                                ${assist ? `
                                    <div style="display: flex; align-items: center; gap: 8px; opacity: 0.8;">
                                        <span style="font-size: 0.6rem; text-transform: uppercase; font-weight: 800; color: var(--success); letter-spacing: 1px;">ASISTENCIA</span>
                                        <span style="font-size: 0.8rem; color: #fff; font-style: italic; font-weight: 700;">${assist.toUpperCase()}</span>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('');
                }

                const noEventsHtml = (!m.eaPlayers || Object.keys(m.eaPlayers).length === 0) && homeGoals.length === 0 
                    ? `<div style="font-size: 0.8rem; color: rgba(255,255,255,0.3); text-align: center; padding: 25px 0; font-style: italic; letter-spacing: 0.5px;">No se registraron goles de JB Squad en este encuentro.</div>` 
                    : '';

                html += `
                    <div style="border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 15px; overflow: hidden; background: linear-gradient(90deg, rgba(15,15,15,1) 0%, rgba(20,20,20,0.9) 100%); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 4px 15px rgba(0,0,0,0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.borderColor='rgba(255,255,255,0.15)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='none'; this.style.borderColor='rgba(255,255,255,0.08)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.3)'">
                        
                        <div onclick="window.toggleSessionMatchAccordion('${session.id}-${idx}')" class="session-match-card-grid" style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 18px 24px; cursor: pointer; border-left: 4px solid ${outcomeColor}; background: rgba(255,255,255,0.01);" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='rgba(255,255,255,0.01)'">
                            
                            <div class="match-card-left" style="display: flex; align-items: center; gap: 15px;">
                                <span style="width: 32px; height: 32px; border-radius: 8px; background: ${outcomeBg}; border: 1px solid ${outcomeColor}; color: ${outcomeColor}; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 900; flex-shrink: 0; box-shadow: 0 0 15px ${outcomeBg};">${outcomeSymbol}</span>
                                <div style="display: flex; flex-direction: column; gap: 4px;">
                                    <span style="font-size: 0.6rem; color: var(--primary); text-transform: uppercase; font-weight: 900; letter-spacing: 1px;">MI EQUIPO</span>
                                    <span style="font-weight: 900; font-size: 1rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.5px;">${escapeHTML(state.team ? state.team.name : 'JB SQUAD').toUpperCase()}</span>
                                </div>
                            </div>
                            
                            <div class="match-card-center" style="display: flex; align-items: center; justify-content: center;">
                                <span style="font-weight: 900; font-size: 1.5rem; color: var(--primary); text-shadow: 0 0 15px rgba(240, 165, 0, 0.4); background: rgba(0,0,0,0.6); padding: 8px 20px; border-radius: 8px; border: 1px solid rgba(240,165,0,0.2); min-width: 90px; text-align: center; letter-spacing: 2px;">${m.scoreHome} - ${m.scoreAway}</span>
                            </div>

                            <div class="match-card-right" style="display: flex; align-items: center; justify-content: flex-end; gap: 15px;">
                                <div style="display: flex; flex-direction: column; gap: 4px; text-align: right;">
                                    <span style="font-size: 0.6rem; color: rgba(255,255,255,0.5); text-transform: uppercase; font-weight: 900; letter-spacing: 1px;">RIVAL</span>
                                    <span style="font-weight: 900; font-size: 1rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.5px; max-width: 150px;">${escapeHTML(m.rivalName || m.rival || 'Rival').toUpperCase()}</span>
                                </div>
                                ${isAdmin ? `<button onclick="event.stopPropagation(); window.openEditMatchModal('${session.id}', ${idx})" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; cursor: pointer; color: var(--text-muted); font-size: 1rem; padding: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='var(--primary)'; this.style.color='#000'; this.style.borderColor='var(--primary)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.color='var(--text-muted)'; this.style.borderColor='rgba(255, 255, 255, 0.1)'; this.style.transform='none'" title="Editar Partido">✍️</button>` : ''}
                                
                                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <svg id="arrow-smatch-${session.id}-${idx}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div id="events-smatch-${session.id}-${idx}" style="display: none; background: rgba(0,0,0,0.6); border-top: 1px solid rgba(255,255,255,0.05);">
                            <div style="padding: 10px 24px 20px 24px;">
                                ${homeGoals.length > 0 ? `<div style="font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase; font-weight: 900; letter-spacing: 2px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed rgba(255,255,255,0.1); margin-top: 10px;">GOLES Y ASISTENCIAS</div>` : ''}
                                ${eventsHtml}
                                ${noEventsHtml}
                            </div>
                        </div>
                    </div>
                `;
            });

            if (session.mvpId) {
                html += `
                    <div style="margin-top: 15px; padding: 12px 16px; background: linear-gradient(90deg, rgba(240, 165, 0, 0.1) 0%, rgba(0,0,0,0.3) 100%); border: 1px solid rgba(240, 165, 0, 0.2); border-radius: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: inset 0 0 10px rgba(240, 165, 0, 0.05);">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.2rem;">⭐</span>
                            <span style="font-size: 0.65rem; color: var(--primary); letter-spacing: 2px; font-weight: 900; text-transform: uppercase;">MVP JORNADA</span>
                        </div>
                        <span style="color: #fff; font-weight: 900; font-size: 0.85rem; text-shadow: 0 0 5px rgba(255,255,255,0.5);">${getPlayerNameById(session.mvpId).toUpperCase()}</span>
                    </div>
                `;
            }

            html += `
                </div>
            `;
        });
    }

    html += `</div>`;
    panel.innerHTML = html;
    modal.style.display = 'flex';
};

window.toggleSessionMatchAccordion = function(id) {
    const content = document.getElementById(`events-smatch-${id}`);
    const arrow = document.getElementById(`arrow-smatch-${id}`);
    if (!content || !arrow) return;

    if (content.style.display === 'none') {
        content.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
        // Scroll automÃ¡tico hacia abajo al expandir
        setTimeout(() => {
            content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
    } else {
        content.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    }
};

window.handleDeleteSession = async function(session) {
    const confirmMsg = session.id === (state.activeSession ? state.activeSession.id : -1) 
        ? '¿Quieres eliminar la jornada actual en curso?'
        : `¿Eliminar la jornada del ${session.date}? Esto recalculará todas las estadísticas del club para asegurar que los datos sean correctos.`;
        
    const ok = await window.jbConfirm(confirmMsg);
    if (ok) {
        window.jbLoading.show('Eliminando y sincronizando...');
        
        // 1. Eliminar de la base de datos primero
        await deleteSessionCloud(session.id);

        // 2. Limpiar estado local
        if (state.activeSession && session.id === state.activeSession.id) {
            state.activeSession = null;
            localStorage.removeItem('jb_active_session');
        } else {
            state.sessions = state.sessions.filter(s => s.id !== session.id);
        }
        
        // 3. RECALCULAR TODO (La Fuente de la Verdad son las sesiones que quedan)
        await recalculateAllStats();
        
        await loadTeamData(); // Recargar todo para asegurar consistencia
        renderSessions();
        renderPlayers();
        switchView('jornadas');
        window.jbLoading.hide();
    }
}

function revertSessionStats(session) {
    session.matches.forEach(match => {
        const mType = match.type || 'friendly';

        // 1. Revertir Goles y Asistencias
        match.events.forEach(ev => {
            const scorer = state.players.find(p => p.id == ev.scorerId);
            const assistant = state.players.find(p => p.id == ev.assistantId);
            
            if (scorer && scorer.stats?.[mType]) {
                scorer.stats[mType].goals = Math.max(0, scorer.stats[mType].goals - 1);
            }
            if (assistant && assistant.stats?.[mType]) {
                assistant.stats[mType].assists = Math.max(0, assistant.stats[mType].assists - 1);
            }
        });

        // 2. Revertir PJ y Wins usando la alineación guardada en el partido
        if (match.lineup && Array.isArray(match.lineup)) {
            const isWin = match.scoreHome > match.scoreAway;
            const isCleanSheet = (match.scoreAway === 0);
            for (let playerId of match.lineup) {
                const player = state.players.find(p => p.id.toString() === playerId.toString());
                if (player && player.stats?.[mType]) {
                    player.stats[mType].matches = Math.max(0, player.stats[mType].matches - 1);
                    if (isWin) {
                        player.stats[mType].wins = Math.max(0, (player.stats[mType].wins || 0) - 1);
                    }
                    if (isCleanSheet) {
                        player.stats[mType].cleanSheets = Math.max(0, (player.stats[mType].cleanSheets || 0) - 1);
                    }
                }
            }
        }

        // 3. Revertir MVP de partido
        if (match.mvpId) {
            const mvpPlayer = state.players.find(p => p.id == match.mvpId);
            if (mvpPlayer && mvpPlayer.stats?.[mType]) {
                mvpPlayer.stats[mType].mvps = Math.max(0, mvpPlayer.stats[mType].mvps - 1);
            }
        }
    });

    // 4. Revertir MVP de jornada
    if (session.mvpId) {
        const mvpPlayer = state.players.find(p => p.id == session.mvpId);
        if (mvpPlayer) {
            const hasOfficial = session.matches.some(m => m.type === 'official');
            const type = hasOfficial ? 'official' : 'friendly';
            if (mvpPlayer.stats?.[type]) {
                mvpPlayer.stats[type].mvps = Math.max(0, mvpPlayer.stats[type].mvps - 1);
            }
        }
    }
}

window.renderActiveSession = function(sessionToView = null) {
    // Si no se pasa sesión, intentamos usar la activa
    const session = sessionToView || state.activeSession;
    if (!session) return switchView('jornadas');
    
    const isActive = state.activeSession && session.id === state.activeSession.id;
    switchView('active-session');

    const sessionNameEl = document.getElementById('active-session-name');
    if (sessionNameEl) sessionNameEl.textContent = session.date;
    
    if (isActive) {
        sessionMgmtControls.style.display = 'flex';
        sessionHistorySummary.style.display = 'none';
        sessionMvpBanner.style.display = 'none';
        sessionFinalizeContainer.style.display = 'block';
        
        const titleEl = document.getElementById('session-detail-title');
        if (titleEl) {
            // Conservar el span si existe, o reconstruir de forma que no se rompan IDs
            titleEl.innerHTML = `Jornada <span class="badge-live" style="font-size: 0.8rem; vertical-align: middle;">EN CURSO</span> <span id="active-session-name" style="display:none">${session.date}</span>`;
        }
    } else {
        sessionMgmtControls.style.display = 'none';
        sessionHistorySummary.style.display = 'block';
        sessionFinalizeContainer.style.display = 'none';
        
        const titleEl = document.getElementById('session-detail-title');
        if (titleEl) {
            titleEl.innerHTML = `Detalle de Jornada <span id="active-session-name" style="display:none">${session.date}</span>`;
        }
        
        const wins = session.matches.filter(m => m.scoreHome > m.scoreAway).length;
        const draws = session.matches.filter(m => m.scoreHome === m.scoreAway).length;
        const losses = session.matches.filter(m => m.scoreHome < m.scoreAway).length;
        document.getElementById('session-stats-history').textContent = `${wins}V - ${draws}E - ${losses}D`;

        if (session.mvpId) {
            sessionMvpBanner.style.display = 'flex';
            sessionMvpName.textContent = getPlayerNameById(session.mvpId);
        } else {
            sessionMvpBanner.style.display = 'none';
        }
    }
    
    const wins = session.matches.filter(m => m.scoreHome > m.scoreAway).length;
    const draws = session.matches.filter(m => m.scoreHome === m.scoreAway).length;
    const losses = session.matches.filter(m => m.scoreHome < m.scoreAway).length;
    document.getElementById('session-stats-summary').textContent = `${wins}V - ${draws}E - ${losses}D`;

    matchesList.innerHTML = '';
    session.matches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'match-card fade-in';
        const typeClass = match.type === 'official' ? 'badge-official' : 'badge-friendly';
        
        let eventsHTML = '';
        if (match.events && match.events.length > 0) {
            eventsHTML = `<div class="match-events-list">`;
            match.events.forEach(ev => {
                eventsHTML += `
                    <div class="match-event-detail">
                        <span>⚽ <strong>${getPlayerNameById(ev.scorerId)}</strong></span>
                        ${ev.assistantId ? `<span style="opacity: 0.6; font-style: italic;">👟 ${getPlayerNameById(ev.assistantId)}</span>` : ''}
                    </div>
                `;
            });
            eventsHTML += `</div>`;
        }

        const myTeamName = (state.team && state.team.name) ? state.team.name : 'MI CLUB';
        const myTeamCrest = (state.team && state.team.crest_url) ? state.team.crest_url : neutralCrest;
        const rivalName = match.rival || 'RIVAL';
        const rivalCrest = match.rivalCrest || neutralCrest;

        const nameLocal = myTeamName;
        const crestLocal = myTeamCrest;
        const nameVisitor = rivalName;
        const crestVisitor = rivalCrest;

        card.innerHTML = `
            <div class="match-card-main" style="display: flex; flex-direction: column; gap: 12px; padding: 10px 0;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 5px;">
                    <span class="${typeClass}" style="font-size: 0.5rem; letter-spacing: 1px;">${match.type.toUpperCase()}</span>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                    <!-- LOCAL -->
                    <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 10px; text-align: right;">
                        <span style="font-size: 0.75rem; font-weight: 800; color: var(--primary);">${nameLocal.toUpperCase()}</span>
                        <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.03); border-radius: 50%; padding: 4px; flex-shrink: 0;">
                            <img src="${crestLocal}" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${neutralCrest}'" style="width: 100%; height: 100%; object-fit: contain;">
                        </div>
                    </div>

                    <!-- MARCADOR -->
                    <div style="background: rgba(255,255,255,0.05); padding: 5px 12px; border-radius: 6px; font-weight: 900; font-size: 1.1rem; min-width: 60px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
                        ${match.scoreHome} - ${match.scoreAway}
                    </div>

                    <!-- VISITANTE -->
                    <div style="flex: 1; display: flex; align-items: center; justify-content: flex-start; gap: 10px;">
                        <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.03); border-radius: 50%; padding: 4px; flex-shrink: 0;">
                            <img src="${crestVisitor}" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${neutralCrest}'" style="width: 100%; height: 100%; object-fit: contain;">
                        </div>
                        <span style="font-size: 0.75rem; font-weight: 800; color: #fff;">${nameVisitor.toUpperCase()}</span>
                    </div>
                </div>
            </div>
            ${eventsHTML}
        `;
        matchesList.appendChild(card);
    });
}

window.startLiveMatch = function(rival, type, rivalCrest = null) {
    if (!rival) return;
    currentMatch = {
        id: Date.now(),
        rival: rival,
        rivalCrest: rivalCrest || 'img/default_crest.png',
        type: type,
        scoreHome: 0,
        scoreAway: 0,
        events: []
    };
    updateLiveMatchUI();
    switchView('match-live');
    
    // Renderizar la táctica en el mini-pitch del partido (v56.3)
    const livePitch = document.getElementById('live-football-pitch');
    if (livePitch) {
        let forcedTactic = null;
        if (state.activeSession && state.activeSession.lineup && !Array.isArray(state.activeSession.lineup)) {
            forcedTactic = state.activeSession.lineup;
        }
        renderPitch(livePitch, forcedTactic);
    }
}

window.removeMatchEvent = (index) => {
    currentMatch.events.splice(index, 1);
    currentMatch.scoreHome = currentMatch.events.filter(e => e.side === 'home').length;
    currentMatch.scoreAway = currentMatch.events.filter(e => e.side === 'away').length;
    updateLiveMatchUI();
};

var selectedGoalSide = 'home'; // v55.0

function openGoalModal(side = 'home') {
    selectedGoalSide = side;
    goalModal.style.display = 'flex';
    selectedGoalScorerId = null;
    selectedAssistantId = null;
    renderGoalSelection();
}

function handlePitchClick(playerId, playerName) {
    const livePitch = document.getElementById('live-football-pitch');
    const forcedTactic = state.activeSession?.lineup || null;
    
    // Caso 1: No hay goleador seleccionado -> Seleccionamos Goleador
    if (!pendingScorerId) {
        pendingScorerId = playerId;
        renderPitch(livePitch, forcedTactic);
        showQuickGoalFab(playerName);
        return;
    }

    // Caso 2: Click en el mismo jugador -> Cancelamos
    if (pendingScorerId === playerId) {
        cancelQuickGoal();
        return;
    }

    // Caso 3: Click en otro jugador -> Es el asistente
    confirmQuickGoal(pendingScorerId, playerId);
}

function showQuickGoalFab(scorerName) {
    if (!quickGoalStatus) return;
    quickGoalStatus.textContent = `GOL DE ${scorerName.toUpperCase()}... ¿ASISTENTE?`;
    quickGoalFab.classList.add('active');
    
    btnQuickNoAssistant.onclick = () => confirmQuickGoal(pendingScorerId, null);
    btnQuickCancel.onclick = () => cancelQuickGoal();
}

function cancelQuickGoal() {
    pendingScorerId = null;
    if (quickGoalFab) quickGoalFab.classList.remove('active');
    const livePitch = document.getElementById('live-football-pitch');
    if (livePitch) {
        const forcedTactic = state.activeSession?.lineup || null;
        renderPitch(livePitch, forcedTactic);
    }
}

async function confirmQuickGoal(scorerId, assistantId) {
    if (!currentMatch) return cancelQuickGoal();
    
    const scorerName = getPlayerNameById(scorerId);
    const assistantName = assistantId ? getPlayerNameById(assistantId) : 'SIN ASISTENCIA';
    
    const msg = assistantId 
        ? `¿Confirmar GOL de ${scorerName} con asistencia de ${assistantName}?`
        : `¿Confirmar GOL de ${scorerName} SIN ASISTENCIA?`;

    const ok = await window.jbConfirm(msg);
    if (ok) {
        // Registrar el evento (v56.7)
        currentMatch.events.push({
            type: 'goal',
            side: 'home',
            scorerId: scorerId,
            assistantId: assistantId,
            minute: 'Direct'
        });
        currentMatch.scoreHome++;
        updateLiveMatchUI();
        window.jbToast("Gol registrado con éxito", "success");
    }
    cancelQuickGoal();
}

function renderGoalSelection() {
    scorerSelection.innerHTML = '';
    assistantSelection.innerHTML = '';

    // Filtro Sugerido: Priorizar alineación guardada en la sesión (v56.2)
    let relevantPlayers = state.players;
    
    if (state.activeSession && state.activeSession.lineup && state.activeSession.lineup.length !== 0) {
        // Usar jugadores registrados en esta sesión (v56.3)
        const lineup = state.activeSession.lineup;
        let assignedIds = [];
        
        if (Array.isArray(lineup)) {
            assignedIds = lineup.map(id => id.toString());
        } else if (lineup.assignments) {
            assignedIds = Object.values(lineup.assignments).filter(id => id).map(id => id.toString());
        }
        
        relevantPlayers = state.players.filter(p => assignedIds.includes(p.id.toString()) || assignedIds.includes(p.id));

        // --- INYECTAR JUGADORES DE PRUEBA EN EL SELECTOR DE GOLES (v60.9) ---
        const trials = assignedIds.filter(id => id.startsWith('prueba_')).map(id => {
            const num = id.split('_')[1];
            return {
                id: id,
                name: `PRUEBA ${num}`,
                dorsal: `P${num}`,
                primaryPos: 'PRU'
            };
        });
        relevantPlayers = [...relevantPlayers, ...trials];
    } else {
        // Fallback: Usar táctica más reciente guardada
        const lastTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
        if (lastTactic && lastTactic.assignments) {
            const assignedIds = Object.values(lastTactic.assignments).filter(id => id).map(id => id.toString());
            relevantPlayers = state.players.filter(p => assignedIds.includes(p.id.toString()) || assignedIds.includes(p.id));
        }
    }

    // Ordenar por prioridad de posición (Ataque -> Portero) (v56.6)
    relevantPlayers.sort((a, b) => {
        const prioA = POSITION_PRIORITY[a.primaryPos] || 99;
        const prioB = POSITION_PRIORITY[b.primaryPos] || 99;
        return prioA - prioB;
    });

    scorerSelection.innerHTML = '';
    assistantSelection.innerHTML = '';

    relevantPlayers.forEach(player => {
        // Scorer
        const sItem = createPlayerSelectItem(player);
        sItem.onclick = () => {
            document.querySelectorAll('#scorer-selection .player-select-item').forEach(el => el.classList.remove('selected'));
            sItem.classList.add('selected');
            selectedGoalScorerId = player.id;
        };
        if (selectedGoalScorerId == player.id) sItem.classList.add('selected');
        scorerSelection.appendChild(sItem);
    });

    // Opción Sin Asistente (v56.6)
    const noAssistant = document.createElement('div');
    noAssistant.className = 'player-select-item';
    noAssistant.style.justifyContent = 'center';
    noAssistant.innerHTML = `<span style="font-size:0.7rem; font-weight:800; opacity:0.6;">SIN ASISTENTE</span>`;
    noAssistant.onclick = () => {
        document.querySelectorAll('#assistant-selection .player-select-item').forEach(el => el.classList.remove('selected'));
        noAssistant.classList.add('selected');
        selectedAssistantId = null;
    };
    if (!selectedAssistantId) noAssistant.classList.add('selected');
    assistantSelection.appendChild(noAssistant);

    relevantPlayers.forEach(player => {
        // Assistant
        const aItem = createPlayerSelectItem(player);
        aItem.onclick = () => {
            document.querySelectorAll('#assistant-selection .player-select-item').forEach(el => el.classList.remove('selected'));
            aItem.classList.add('selected');
            selectedAssistantId = player.id;
        };
        if (selectedAssistantId == player.id) aItem.classList.add('selected');
        assistantSelection.appendChild(aItem);
    });
}

function createPlayerSelectItem(player) {
    const div = document.createElement('div');
    div.className = 'player-select-item';
    div.innerHTML = `
        <span style="font-weight:800; font-size:0.8rem;">${player.dorsal}</span>
        <span style="font-size:0.85rem;">${player.name.split(' ')[0].toUpperCase()}</span>
    `;
    return div;
}

function saveGoalEvent() {
    if (!selectedGoalScorerId) {
        window.jbToast('Debes seleccionar al menos un goleador', 'error');
        return;
    }
    currentMatch.events.push({
        scorerId: selectedGoalScorerId,
        assistantId: selectedAssistantId,
        side: selectedGoalSide // v55.0 dinámico
    });

    if (selectedGoalSide === 'home') currentMatch.scoreHome++;
    else currentMatch.scoreAway++;

    goalModal.style.display = 'none';
    updateLiveMatchUI();
}

async function finalizeMatch() {
    if (!state.activeSession) return;
    
    // Priorizar el tipo del partido actual, sino el de la sesión (v56.9)
    const mType = currentMatch.type || state.activeSession.type || 'friendly';
    currentMatch.type = mType; 
    
    console.log(`>>> [STATS] Finalizando partido tipo: ${mType.toUpperCase()}`);

    const initStats = (p) => {
        if (!p.stats) p.stats = { 
            official: { goals: 0, assists: 0, matches: 0, wins: 0, cleanSheets: 0 }, 
            friendly: { goals: 0, assists: 0, matches: 0, wins: 0, cleanSheets: 0 } 
        };
        if (!p.stats.official) p.stats.official = { goals: 0, assists: 0, matches: 0, wins: 0, cleanSheets: 0 };
        if (!p.stats.friendly) p.stats.friendly = { goals: 0, assists: 0, matches: 0, wins: 0, cleanSheets: 0 };

        if (p.mvp_count === undefined) p.mvp_count = 0;
    };

    // Usaremos un Set para identificar qué jugadores han cambiado para guardarlos UNA SOLA VEZ (Evitar recursión RLS)
    const playersToSave = new Set();

    // 1. Procesar eventos (Goles/Asistencias)
    for (let ev of currentMatch.events) {
        const scorer = state.players.find(p => p.id == ev.scorerId);
        const assistant = state.players.find(p => p.id == ev.assistantId);
        
        if (scorer) {
            initStats(scorer);
            scorer.stats[mType].goals++;
            playersToSave.add(scorer);
        }
        if (assistant) {
            initStats(assistant);
            assistant.stats[mType].assists++;
            playersToSave.add(assistant);
        }
    }

    // 2. Procesar PJ (Partidos Jugados) - Priorizar alineación de sesión (v56.5)
    let assignedIds = [];
    if (state.activeSession && state.activeSession.lineup) {
        const sl = state.activeSession.lineup;
        if (Array.isArray(sl)) {
            assignedIds = sl.map(id => id.toString());
        } else if (sl.assignments) {
            assignedIds = Object.values(sl.assignments).filter(id => id).map(id => id.toString());
        } else if (typeof sl === 'object') {
            // Fallback para objetos planos de asignaciones (formato legacy)
            assignedIds = Object.values(sl).filter(id => id && typeof id !== 'object').map(id => id.toString());
        }
    }

    console.log(">>> [STATS] IDs Detectados para PJ:", assignedIds);

    if (assignedIds.length > 0) {
        // Guardar la alineación dentro del partido para trazabilidad absoluta
        currentMatch.lineup = assignedIds;
        
        for (let p of state.players) {
            const pIdStr = p.id.toString();
            if (assignedIds.includes(pIdStr)) {
                initStats(p);
                p.stats[mType].matches++;
                
                // Sumar victoria individual si el club ganó el partido
                if (currentMatch.scoreHome > currentMatch.scoreAway) {
                    p.stats[mType].wins = (p.stats[mType].wins || 0) + 1;
                }
                
                // Sumar Portería a 0 si el rival no marcó
                if (currentMatch.scoreAway === 0) {
                    p.stats[mType].cleanSheets = (p.stats[mType].cleanSheets || 0) + 1;
                }

                playersToSave.add(p);
                console.log(`>>> [STATS] PJ/P.0 sumado a: ${p.name}`);
            }
        }
    } else {
        // Fallback: Usar táctica actual si no hay alineación de sesión (compatibilidad)
        const lastTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
        if (lastTactic) {
            const assignedIds = Object.values(lastTactic.assignments).map(id => id.toString());
            currentMatch.lineup = assignedIds;
            for (let p of state.players) {
                if (assignedIds.includes(p.id.toString())) {
                    initStats(p);
                    p.stats[mType].matches++;
                    if (currentMatch.scoreHome > currentMatch.scoreAway) {
                        p.stats[mType].wins = (p.stats[mType].wins || 0) + 1;
                    }
                    playersToSave.add(p);
                }
            }
        }
    }

    // 3. Persistencia en la Nube optimizada (Secuencial con delay para mitigar recursión RLS)
    for (let p of playersToSave) {
        await savePlayerCloud(p);
        // Dar un respiro a las políticas de Postgres (150ms)
        await new Promise(resolve => setTimeout(resolve, 150));
    }

    state.activeSession.matches.push(currentMatch);
    await saveSessionCloud(state.activeSession);
    
    currentMatch = null;
    renderActiveSession();
    renderPlayers(); // Actualizar tabla global
    switchView('active-session');
}

function openMVPMedal() {
    const list = state.players;
    const msg = 'Selecciona al MVP de la noche (o cancelar si no hay):';
    
    // Creamos un diálogo custom con lista de jugadores
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <div class="modal-content" style="max-height: 80vh; overflow-y:auto;">
            <h2 class="gradient-text">MVP DE LA NOCHE</h2>
            <div id="mvp-picker" class="roster-grid" style="margin-top:20px;"></div>
            <button id="btn-no-mvp" class="btn-cancel" style="margin-top:20px; width:100%;">SIN MVP DE MI EQUIPO</button>
        </div>
    `;
    document.body.appendChild(overlay);

    const picker = overlay.querySelector('#mvp-picker');
    list.forEach(p => {
        const card = createPlayerSelectItem(p);
        card.style.padding = '15px';
        card.onclick = () => finishSession(p.id, overlay);
        picker.appendChild(card);
    });

    overlay.querySelector('#btn-no-mvp').onclick = () => finishSession(null, overlay);
}

async function finishSession(mvpId, overlay) {
    if (overlay) overlay.remove();
    
    if (state.activeSession) {
        state.activeSession.mvpId = mvpId;
        state.activeSession.status = 'closed';
        
        if (mvpId) {
            const mvpPlayer = state.players.find(p => p.id == mvpId);
            if (mvpPlayer) {
                mvpPlayer.stats.official.mvps = (mvpPlayer.stats.official.mvps || 0) + 1;
                await savePlayerCloud(mvpPlayer);
            }
        }
        
        await saveSessionCloud(state.activeSession);
        
        // Mover al historial local antes de limpiar la sesión activa
        state.sessions.push(state.activeSession);
        
        state.activeSession = null;
        localStorage.removeItem('jb_active_session');
    }
    
    // RECALCULAR LOGROS EN BACKGROUND (v69.0)
    if (typeof window.recalculateAllAchievements === 'function') {
        window.recalculateAllAchievements();
    }
    
    renderSessions();
    renderPlayers();
    switchView('jornadas');
}

window.openEditMatchModal = function(sessionId, matchIdx) {
    console.log(">>> [UI] Intentando abrir editor de partido para la sesión:", sessionId, "Indice:", matchIdx);
    const session = state.sessions.find(s => s.id == sessionId) || (state.activeSession && state.activeSession.id == sessionId ? state.activeSession : null);
    if (!session) {
        console.error(">>> [ERROR] No se encontró la sesión a editar.");
        window.jbToast("No se pudo cargar la sesión de juego", "error");
        return;
    }
    
    const match = session.matches[matchIdx];
    if (!match) {
        console.error(">>> [ERROR] No se encontró el partido a editar.");
        window.jbToast("No se pudo cargar el partido de juego", "error");
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'edit-match-modal';
    overlay.style.display = 'flex';
    overlay.style.zIndex = '10005';
    overlay.style.background = 'rgba(0,0,0,0.85)';
    overlay.style.backdropFilter = 'blur(8px)';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.padding = '15px';

    const jbGoals = match.events ? match.events.filter(e => e.side === 'home') : [];

    overlay.innerHTML = `
        <div class="card-elite modal-content" style="padding: 25px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; border: 1px solid var(--primary); border-radius: 12px; box-shadow: 0 0 30px rgba(0,0,0,0.5);">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px;">
                <div>
                    <span style="font-size: 0.6rem; color: var(--primary); text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; display: block; margin-bottom: 3px;">EDITAR PARTIDO PASADO</span>
                    <h3 style="margin: 0; font-size: 1.2rem; color: #fff; font-weight: 900; letter-spacing: 0.5px;">Vs ${escapeHTML(match.rival || 'Rival')}</h3>
                </div>
                <button onclick="document.getElementById('edit-match-modal').remove()" class="btn-cancel" style="width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer;">
                    ✕
                </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div class="form-group">
                    <label style="font-size: 0.65rem; color: var(--text-muted); font-weight: 800; margin-bottom: 6px; display: block; letter-spacing: 1px;">RIVAL</label>
                    <input type="text" id="edit-match-rival" value="${escapeHTML(match.rival || '')}" class="jb-input" style="width: 100%;" placeholder="Nombre del Rival">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label style="font-size: 0.65rem; color: var(--primary); font-weight: 800; margin-bottom: 6px; display: block; letter-spacing: 1px;">GOLES JB SQUAD</label>
                        <input type="number" id="edit-match-score-home" min="0" value="${match.scoreHome || 0}" style="width:100%; text-align: center; font-size: 1.2rem; font-weight: 900;" class="jb-input">
                    </div>
                    <div class="form-group">
                        <label style="font-size: 0.65rem; color: var(--text-muted); font-weight: 800; margin-bottom: 6px; display: block; letter-spacing: 1px;">GOLES RIVAL</label>
                        <input type="number" id="edit-match-score-away" min="0" value="${match.scoreAway || 0}" style="width:100%; text-align: center; font-size: 1.2rem; font-weight: 900;" class="jb-input">
                    </div>
                </div>

                <div style="border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 15px;">
                    <h4 style="font-size: 0.75rem; color: var(--primary); font-weight: 800; margin-top: 0; margin-bottom: 15px; letter-spacing: 1px; text-transform: uppercase;">Goles y Asistencias de JB Squad</h4>
                    <div id="edit-goals-list-container" style="display: flex; flex-direction: column; gap: 12px;">
                        <!-- Generado dinámicamente -->
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 15px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; margin-top: 5px;">
                <button onclick="document.getElementById('edit-match-modal').remove()" class="btn-cancel" style="flex: 1; padding: 12px; font-weight: 800;">CANCELAR</button>
                <button id="btn-save-edited-match" class="btn-gold" style="flex: 1; padding: 12px; font-weight: 900; box-shadow: 0 0 15px rgba(240, 165, 0, 0.2);">GUARDAR CAMBIOS</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const homeScoreInput = overlay.querySelector('#edit-match-score-home');
    const container = overlay.querySelector('#edit-goals-list-container');

    const updateGoalsEditorRows = (numGoals) => {
        if (!container) return;

        // Preservar selecciones del usuario hechas sobre la marcha
        const currentSelections = [];
        container.querySelectorAll('.edit-goal-row').forEach(row => {
            const scorer = row.querySelector('.goal-scorer-select').value;
            const assistant = row.querySelector('.goal-assistant-select').value;
            currentSelections.push({ scorer, assistant });
        });

        container.innerHTML = '';

        if (numGoals === 0) {
            container.innerHTML = `<p style="font-size: 0.65rem; color: var(--text-muted); font-style: italic; text-align: center; margin: 10px 0;">Sin goles de JB Squad.</p>`;
            return;
        }

        for (let i = 0; i < numGoals; i++) {
            let preScorerId = '';
            let preAssistantId = 'none';

            if (currentSelections[i]) {
                preScorerId = currentSelections[i].scorer;
                preAssistantId = currentSelections[i].assistant;
            } else if (jbGoals[i]) {
                preScorerId = jbGoals[i].scorerId || '';
                preAssistantId = jbGoals[i].assistantId || 'none';
            }

            const row = document.createElement('div');
            row.className = 'edit-goal-row';
            row.style.display = 'flex';
            row.style.gap = '10px';
            row.style.alignItems = 'center';
            
            const scorerSelectHtml = `
                <select class="goal-scorer-select jb-input" style="width: 100%; background: #000; color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; cursor: pointer;">
                    ${state.players.map(p => `<option value="${p.id}" ${p.id == preScorerId ? 'selected' : ''}>${escapeHTML(p.name.toUpperCase())}</option>`).join('')}
                </select>
            `;

            const assistantSelectHtml = `
                <select class="goal-assistant-select jb-input" style="width: 100%; background: #000; color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; cursor: pointer;">
                    <option value="none" ${preAssistantId === 'none' ? 'selected' : ''}>Sin Asistencia</option>
                    ${state.players.map(p => `<option value="${p.id}" ${p.id == preAssistantId ? 'selected' : ''}>${escapeHTML(p.name.toUpperCase())}</option>`).join('')}
                </select>
            `;

            row.innerHTML = `
                <div style="width: 25px; height: 25px; background: rgba(240, 165, 0, 0.1); border: 1px solid var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 900; color: var(--primary); flex-shrink: 0;">⚽</div>
                <div style="flex: 1;">
                    <label style="font-size: 0.55rem; color: var(--text-muted); display: block; margin-bottom: 4px; font-weight: 800;">GOLEADOR</label>
                    ${scorerSelectHtml}
                </div>
                <div style="flex: 1;">
                    <label style="font-size: 0.55rem; color: var(--text-muted); display: block; margin-bottom: 4px; font-weight: 800;">ASISTENTE</label>
                    ${assistantSelectHtml}
                </div>
            `;
            container.appendChild(row);
        }
    };

    homeScoreInput.addEventListener('input', (e) => {
        const val = Math.max(0, parseInt(e.target.value) || 0);
        updateGoalsEditorRows(val);
    });

    updateGoalsEditorRows(match.scoreHome || 0);

    overlay.querySelector('#btn-save-edited-match').onclick = async () => {
        const rivalVal = overlay.querySelector('#edit-match-rival').value.trim() || 'Rival';
        const scoreHomeVal = Math.max(0, parseInt(homeScoreInput.value) || 0);
        const scoreAwayVal = Math.max(0, parseInt(overlay.querySelector('#edit-match-score-away').value) || 0);

        const newEvents = [];
        overlay.querySelectorAll('.edit-goal-row').forEach(row => {
            const scorerId = row.querySelector('.goal-scorer-select').value;
            const assistantVal = row.querySelector('.goal-assistant-select').value;
            const assistantId = assistantVal === 'none' ? null : assistantVal;

            newEvents.push({
                side: 'home',
                scorerId: scorerId,
                assistantId: assistantId
            });
        });

        window.jbLoading.show('Guardando partido y recalculando estadísticas...');

        // Guardar valores antiguos por si es necesario hacer rollback de estabilidad
        const oldRival = match.rival;
        const oldScoreHome = match.scoreHome;
        const oldScoreAway = match.scoreAway;
        const oldEvents = match.events;

        // Modificar localmente
        match.rival = rivalVal;
        match.scoreHome = scoreHomeVal;
        match.scoreAway = scoreAwayVal;
        match.events = newEvents;

        try {
            // 1. Guardar la sesión en Postgres Supabase
            await saveSessionCloud(session);

            // 2. Recalcular estadísticas del club y jugadores
            await recalculateAllStats();

            // 3. Recargar integralmente todos los datos de la base de datos
            await loadTeamData();

            // 4. Refrescar interfaz de usuario
            if (typeof window.renderSessions === 'function') window.renderSessions();
            if (typeof window.renderPlayers === 'function') window.renderPlayers();

            // 5. Cerrar los modales
            overlay.remove();
            window.closeSessionDayModal();

            window.jbToast('Partido actualizado y estadísticas recalculadas con éxito', 'success');
        } catch (error) {
            console.error(">>> [ERROR] Guardando partido editado:", error);
            
            // Rollback en local por estabilidad
            match.rival = oldRival;
            match.scoreHome = oldScoreHome;
            match.scoreAway = oldScoreAway;
            match.events = oldEvents;

            window.jbToast('Error al guardar cambios: ' + error.message, 'error');
        } finally {
            window.jbLoading.hide();
        }
    };
};

