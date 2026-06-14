// tacticas.js

// --- Lógica de Tácticas Múltiples ---
window.setupTacticHandlers = function() {
    if (window._hasSetupTactics) return;
    window._hasSetupTactics = true;

    // Ir a Crear Táctica
    btnCreateTactic.addEventListener('click', () => {
        tacticasList.style.display = 'none';
        tacticasInitial.style.display = 'block';
        newTacticNameInput.value = '';
    });

    // Volver a Lista
    btnBackToTacticsList.addEventListener('click', () => {
        handleTacticViewDisplay();
    });

    // Guardar/Volver desde Pizarra
    btnSaveTactic.addEventListener('click', () => {
        state.activeTacticId = null;
        saveTacticsCloud();
        handleTacticViewDisplay();
    });

    if (btnSavePollAlignment) btnSavePollAlignment.addEventListener('click', savePollSnapshot);
    if (mobileBtnSavePollAlignment) mobileBtnSavePollAlignment.addEventListener('click', savePollSnapshot);

    async function savePollSnapshot() {
        if (!state.alignmentMode.active || !state.alignmentMode.currentPollId) return;
        const activeTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
        if (!activeTactic) return;

        window.jbLoading.show('Guardando alineación histórica...');
        try {
            // Sincronizar la táctica con supabase (banquillo)
            await saveTacticsCloud();

            const snapshot = {
                tactic_id: state.activeTacticId,
                formation: activeTactic.formation,
                assignments: activeTactic.assignments
            };
            const { error } = await supabase.from('availability_polls').update({ final_alignment: snapshot }).eq('id', state.alignmentMode.currentPollId);
            if (error) throw error;
            
            // Limpiar modo alineación
            state.alignmentMode.active = false;
            state.alignmentMode.currentPollId = null;
            
            window.jbToast('Jornada archivada con éxito', 'success');
            switchView('jornadas'); // Redirigir a jornadas
        } catch (err) {
            console.error(">>> [ERROR] Falló el guardado del snapshot:", err);
            window.jbToast('Error al guardar registro', 'error');
        }            
        window.jbLoading.hide();
    }


    // Exportar Táctica (v4.8.0)
    btnExportTactic.addEventListener('click', () => {
        exportTimeModal.style.display = 'flex';
    });

    closeExportTime.addEventListener('click', () => {
        exportTimeModal.style.display = 'none';
    });

    // Selector de Fondos de Exportación (v49.5)
    let selectedExportBg = 'img/emerald_pitch.png';
    const bgOptions = document.querySelectorAll('.bg-option');
    bgOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            bgOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedExportBg = opt.getAttribute('data-bg');
        });
    });

    btnConfirmExport.addEventListener('click', () => {
        exportTimeModal.style.display = 'none';
        exportTacticAsImage(selectedExportBg);
    });


    // Exportar Plantilla (v49.4)
    if (btnExportSquad) {
        btnExportSquad.addEventListener('click', () => {
            exportSquadAsImage();
        });
    }

    // Configurar Zona de Drop para volver al Banquillo Completo
    const rosterPanel = document.getElementById('tactic-roster-panel');
    if (rosterPanel) {
        rosterPanel.addEventListener('dragover', e => {
            const isAdmin = state.user?.role === 'manager' || state.user?.role === 'capitan';
            if (!isAdmin) return;
            e.preventDefault();
            rosterPanel.style.border = "2px dashed #F44336";
        });
        rosterPanel.addEventListener('dragleave', e => {
            rosterPanel.style.border = "none";
        });
        rosterPanel.addEventListener('drop', e => {
            const isAdmin = state.user?.role === 'manager' || state.user?.role === 'capitan';
            if (!isAdmin) return;
            e.preventDefault();
            rosterPanel.style.border = "none";
            if (draggedSourceSlotId) {
                activeSlotId = draggedSourceSlotId;
                assignPlayerToSlot(null);
                draggedSourceSlotId = null;
            }
        });
    }

    // Vaciar Equipo
    const btnEmptyTeam = document.getElementById('btn-empty-team');

    if (btnEmptyTeam) {
        btnEmptyTeam.addEventListener('click', async () => {
            const isAdmin = state.user?.role === 'manager' || state.user?.role === 'capitan';
            if (!isAdmin) {
                window.jbToast('Solo la directiva puede usar esta función.', 'error');
                return;
            }
            const activeTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
            if (activeTactic && Object.keys(activeTactic.assignments || {}).length > 0) {
                const agreed = await window.jbConfirm('¿Seguro que quieres enviar a todos los jugadores del campo de vuelta al banquillo?');
                if (agreed) {
                    activeTactic.assignments = {};
                    saveTacticsCloud();
                    renderPitch();
                }
            }
        });
    }

    // --- HANDLERS CONVOCATORIAS v31.9.0 ---
    btnNewPoll?.addEventListener('click', () => {
        newPollContainer.style.display = 'block';
        btnNewPoll.style.display = 'none';
        // Por defecto, fecha de hoy
        const dateInput = document.getElementById('poll-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    });

    btnCancelPoll?.addEventListener('click', () => {
        newPollContainer.style.display = 'none';
        btnNewPoll.style.display = 'flex';
        
        // Resetear estado de edición por si acaso
        state.editingPollId = null;
        const formTitle = newPollContainer.querySelector('h3');
        if (formTitle) formTitle.textContent = "NUEVA CONVOCATORIA";
        if (btnSavePoll) btnSavePoll.textContent = "CREAR Y COMPARTIR";
        document.getElementById('poll-title').value = '';
    });

    btnSavePoll?.addEventListener('click', async () => {
        // --- SEGURIDAD EXTRA (v49.3) ---
        const role = state.user?.role;
        if (role !== 'manager' && role !== 'capitan') {
            window.jbToast('No tienes permisos para realizar esta acción.', 'error');
            return;
        }

        const title = document.getElementById('poll-title').value.trim();
        const date = document.getElementById('poll-date').value;
        const time = document.getElementById('poll-time').value;
        if (!title) return window.jbToast('Ponle un título al evento', 'warning');
        if (!date) return window.jbToast('Selecciona una fecha', 'warning');

        // --- MODO EDICIÓN (v56.0) ---
        if (state.editingPollId) {
            await updatePoll(state.editingPollId, title, date, time);
            
            // Resetear estado de edición
            state.editingPollId = null;
            const formTitle = newPollContainer.querySelector('h3');
            if (formTitle) formTitle.textContent = "NUEVA CONVOCATORIA";
            btnSavePoll.textContent = "CREAR Y COMPARTIR";
            
            document.getElementById('poll-title').value = '';
            newPollContainer.style.display = 'none';
            btnNewPoll.style.display = 'flex';
            return;
        }

        // --- CONTROL DE CONVOCATORIA ACTIVA (v54.3) ---
        window.jbLoading.show('Comprobando estado...');
        const currentActive = await fetchActivePoll();
        window.jbLoading.hide(); // Ocultamos para que no tape el mensaje de confirmación (v54.4)
        
        if (currentActive) {
            const msg = `⚠️ Ya hay una convocatoria abierta: "${currentActive.title}".\n\n¿Quieres BORRAR la actual y publicar la nueva? (Se perderán los votos actuales).`;
            const confirmReplace = await window.jbConfirm(msg);
            if (!confirmReplace) return;

            window.jbLoading.show('Borrando anterior...');
            // Borrado rápido sin confirmación extra (ya la hemos pedido)
            await supabase.from('sessions').update({ poll_id: null }).eq('poll_id', currentActive.id);
            await supabase.from('availability_votes').delete().eq('poll_id', currentActive.id);
            await supabase.from('availability_polls').delete().eq('id', currentActive.id);
        }

        // --- COMPROBACIÓN DE DUPLICADOS EN LA MISMA FECHA ---
        window.jbLoading.show('Verificando fecha...');
        const startDate = new Date(`${date}T00:00:00`).toISOString();
        const endDate = new Date(`${date}T23:59:59`).toISOString();
        
        const { data: existingPolls, error: fetchErr } = await supabase
            .from('availability_polls')
            .select('id, title, status')
            .eq('team_id', state.team.id)
            .gte('scheduled_time', startDate)
            .lte('scheduled_time', endDate);

        window.jbLoading.hide();

        if (!fetchErr && existingPolls && existingPolls.length > 0) {
            const confirmed = await window.jbConfirm(`Ya existe una convocatoria para esta fecha (${existingPolls[0].title}).\n\n¿Quieres ELIMINARLA y crear esta nueva en su lugar?`);
            if (!confirmed) return;

            window.jbLoading.show('Eliminando anterior...');
            for (const p of existingPolls) {
                await supabase.from('availability_votes').delete().eq('poll_id', p.id);
                await supabase.from('availability_polls').delete().eq('id', p.id);
            }
            window.jbLoading.hide();
        }

        await createPoll(title, date, time);
        
        // Limpiar y ocultar
        document.getElementById('poll-title').value = '';
        newPollContainer.style.display = 'none';
        btnNewPoll.style.display = 'flex';
    });

    // Seleccionar formación para crear
    document.querySelectorAll('.tactic-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const formation = opt.getAttribute('data-formation');
            let tName = newTacticNameInput.value.trim();
            if (!tName) tName = `Táctica ${formation}`;
            
            const newTactic = {
                id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `temp-${Date.now()}`,
                name: tName,
                formation: formation,
                assignments: {},
                customPositions: {}
            };

            state.savedTactics.push(newTactic);
            saveTacticsCloud();
            
            openPitchView(newTactic.id);
        });
    });

    // Handlers para diseño personalizado (v19.2.0 - Con modo edición)
    const btnEditBoard = document.getElementById('btn-edit-board');
    const btnSaveDesign = document.getElementById('btn-save-custom-positions');
    const btnResetDesign = document.getElementById('btn-reset-positions');

    btnEditBoard?.addEventListener('click', () => {
        state.isEditingPositions = true;
        btnEditBoard.style.display = 'none';
        btnSaveDesign.style.display = 'block';
        btnResetDesign.style.display = 'block';
        document.body.classList.add('editing-tactic');
        // Bloqueo visual del banquillo
        document.getElementById('tactic-roster-panel')?.classList.add('locked');
        renderPitch(); // Re-renderizar para aplicar bloqueos de clics
    });

    btnSaveDesign?.addEventListener('click', async () => {
        state.isEditingPositions = false;
        window.jbLoading.show('Guardando diseño...');
        await saveTacticsCloud();
        window.jbLoading.hide();
        window.jbToast('Diseño guardado correctamente', 'success');
        btnEditBoard.style.display = 'block';
        btnSaveDesign.style.display = 'none';
        btnResetDesign.style.display = 'none';
        document.body.classList.remove('editing-tactic');
        document.getElementById('tactic-roster-panel')?.classList.remove('locked');
        renderPitch();
        renderRosterPanel(); 
    });

    btnResetDesign?.addEventListener('click', async () => {
        const activeTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
        if (activeTactic && await window.jbConfirm('¿Restablecer el diseño original de la formación?')) {
            state.isEditingPositions = false;
            activeTactic.customPositions = {};
            await saveTacticsCloud();
            renderPitch();
            btnEditBoard.style.display = 'block';
            btnSaveDesign.style.display = 'none';
            btnResetDesign.style.display = 'none';
            document.body.classList.remove('editing-tactic');
        }
    });

    // ====== HANDLERS MÓVIL CON TOGGLE DE MODO DIBUJO ======
    const mBtnEdit = document.getElementById('mobile-btn-edit-board');
    const mBtnSave = document.getElementById('mobile-btn-save-custom-positions');
    const mBtnReset = document.getElementById('mobile-btn-reset-positions');
    const mBtnExport = document.getElementById('mobile-btn-export-tactic');
    const mBtnSaveTactic = document.getElementById('mobile-btn-save-tactic');

    // Función para alternar entre modo normal y modo dibujo en móvil
    function setMobileDrawMode(editing) {
        if (!mBtnEdit) return;
        if (editing) {
            // Modo edición: mostrar ACEPTAR (✔) y CANCELAR (✗), ocultar el resto
            mBtnEdit.style.display = 'none';
            mBtnExport.style.display = 'none';
            mBtnSaveTactic.style.display = 'none';
            // Reutilizamos mBtnSave como ACEPTAR y mBtnReset como CANCELAR
            mBtnSave.style.display = 'flex';
            mBtnSave.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>ACEPTAR</span>`;
            mBtnReset.style.display = 'flex';
            mBtnReset.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span>CANCELAR</span>`;
        } else {
            // Modo normal: restaurar botones y texto
            mBtnEdit.style.display = 'flex';
            mBtnExport.style.display = 'flex';
            mBtnSaveTactic.style.display = 'flex';
            mBtnSave.style.display = 'none';
            mBtnReset.style.display = 'none';
        }
    }

    // Al pulsar DIBUJO en móvil → activar modo edición
    mBtnEdit?.addEventListener('click', () => {
        btnEditBoard?.click(); // Activar lógica de escritorio (isEditingPositions, renderPitch, etc.)
        setMobileDrawMode(true);
    });

    // ACEPTAR → guardar diseño y volver al modo normal
    mBtnSave?.addEventListener('click', () => {
        btnSaveDesign?.click();
        setMobileDrawMode(false);
    });

    // CANCELAR → restablecer y volver al modo normal
    mBtnReset?.addEventListener('click', () => {
        btnResetDesign?.click();
        setMobileDrawMode(false);
    });

    // EXPORTAR y GUARDAR EQUIPO → delegación directa
    mBtnExport?.addEventListener('click', () => btnExportTactic?.click());
    mBtnSaveTactic?.addEventListener('click', () => btnSaveTactic?.click());
}

window.renderTacticsList = function() {
    savedTacticsList.innerHTML = '';
    
    if (state.savedTactics.length === 0) {
        savedTacticsList.innerHTML = `
            <div class="card-elite" style="text-align: center; opacity: 0.5; padding: 40px;">
                <p>NO TIENES TÁCTICAS GUARDADAS</p>
                <p style="font-size: 0.7rem;">Pulsa Nueva + para crear una</p>
            </div>
        `;
        return;
    }

    // Ordenar alfabéticamente o por ID (más reciente primero)
    const displayTactics = [...state.savedTactics].reverse();

    displayTactics.forEach(tactic => {
        const card = document.createElement('div');
        card.className = 'tactic-card' + (tactic.isActive ? ' active-tactic-card' : '');
        const isAdmin = state.user.role === 'manager' || state.user.role === 'capitan';
        
        card.innerHTML = `
            <div class="tactic-card-info">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <h3 style="color: #fff; font-weight: 800; font-size: 1.1rem; margin: 0;">${tactic.name.toUpperCase()}</h3>
                    ${tactic.isActive ? '<span class="active-badge">ACTIVA</span>' : ''}
                </div>
                <p style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; letter-spacing: 0.5px;">FORMACIÓN: ${tactic.formation}</p>
            </div>
            <div class="tactic-card-actions">
                ${isAdmin && !tactic.isActive ? `<button class="btn-activate-tactic" style="background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 8px 12px; font-size: 0.7rem; border-radius: 6px; cursor: pointer; transition: 0.3s; font-weight: 700;">ACTIVAR</button>` : ''}
                ${isAdmin ? `<button class="btn-action btn-delete-tactic" style="color: #F44336; border-color: rgba(244,67,54,0.3); font-size: 1.2rem;" title="Eliminar">🗑️</button>` : ''}
                <button class="btn-gold btn-open-tactic" style="width: auto; padding: 10px 20px; font-size: 0.8rem; letter-spacing: 1px;">ABRIR</button>
            </div>
        `;
        
        card.querySelector('.btn-open-tactic').onclick = () => openPitchView(tactic.id);
        
        const btnActivate = card.querySelector('.btn-activate-tactic');
        if (btnActivate) {
            btnActivate.onclick = async () => {
                await setActiveTacticInDB(tactic.id);
                renderTacticsList();
                window.jbToast('Táctica marcada como ACTIVA', 'success');
            };
            btnActivate.onmouseover = () => { btnActivate.style.borderColor = 'var(--primary)'; btnActivate.style.color = 'var(--primary)'; };
            btnActivate.onmouseout = () => { btnActivate.style.borderColor = 'rgba(255,255,255,0.1)'; btnActivate.style.color = '#fff'; };
        }

        if (isAdmin) {
            card.querySelector('.btn-delete-tactic').onclick = async (e) => {
                e.stopPropagation();
                const agreed = await window.jbConfirm(`¿Eliminar la táctica ${tactic.name}?`);
                if (agreed) {
                    window.jbLoading.show('Eliminando...');
                    await deleteTacticCloud(tactic.id);
                    state.savedTactics = state.savedTactics.filter(t => t.id !== tactic.id);
                    window.jbLoading.hide();
                    renderTacticsList();
                    window.jbToast('Táctica eliminada correctamente', 'success');
                }
            };
        }

        savedTacticsList.appendChild(card);
    });
}

function syncMobileTopbar(activeTactic) {
    if (window.innerWidth >= 1024) return;
    const mobileTopbar = document.getElementById('mobile-tactic-topbar');
    const mName = document.getElementById('mobile-tactic-name');
    const mFormation = document.getElementById('mobile-tactic-formation');
    if (mobileTopbar) mobileTopbar.style.display = 'flex';
    if (mName && activeTactic) mName.textContent = activeTactic.name.toUpperCase();
    if (mFormation && activeTactic) mFormation.textContent = activeTactic.formation;
}

function openPitchView(tacticId) {
    state.activeTacticId = tacticId;
    tacticasList.style.display = 'none';
    tacticasInitial.style.display = 'none';
    tacticasField.style.display = 'flex';
    
    const activeTactic = state.savedTactics.find(t => t.id === tacticId);
    const isAdmin = state.user.role === 'manager' || state.user.role === 'capitan';

    if (window.innerWidth >= 1024) {
        // En escritorio: mostrar header global
        if (headerTacticInfo) headerTacticInfo.style.display = 'flex';
        const tacticalActions = document.getElementById('tactical-header-actions');
        if (tacticalActions) {
            tacticalActions.style.display = 'flex';
            const btnEditBoard = document.getElementById('btn-edit-board');
            if (btnEditBoard) btnEditBoard.style.display = isAdmin ? 'flex' : 'none';
            
            if (state.alignmentMode.active) {
                if (btnSaveTactic) btnSaveTactic.style.display = 'none';
                if (btnSavePollAlignment) btnSavePollAlignment.style.display = isAdmin ? 'block' : 'none';
            } else {
                if (btnSaveTactic) btnSaveTactic.style.display = isAdmin ? 'flex' : 'none';
                if (btnSavePollAlignment) btnSavePollAlignment.style.display = 'none';
            }
        }
    } else {
        // En móvil: sincronizar barra táctica exclusiva
        const mBtnEdit = document.getElementById('mobile-btn-edit-board');
        const mBtnSave = document.getElementById('mobile-btn-save-custom-positions');
        const mBtnReset = document.getElementById('mobile-btn-reset-positions');
        const mBtnExport = document.getElementById('mobile-btn-export-tactic');
        const mBtnSaveTactic = document.getElementById('mobile-btn-save-tactic');
        const mBtnSavePoll = document.getElementById('mobile-btn-save-poll-alignment');
        
        if (mBtnEdit) mBtnEdit.style.display = isAdmin ? 'flex' : 'none';
        if (mBtnSave) mBtnSave.style.display = 'none';
        if (mBtnReset) mBtnReset.style.display = 'none';
        if (mBtnExport) mBtnExport.style.display = 'flex';
        
        if (state.alignmentMode.active) {
            if (mBtnSaveTactic) mBtnSaveTactic.style.display = 'none';
            if (mBtnSavePoll) mBtnSavePoll.style.display = isAdmin ? 'flex' : 'none';
        } else {
            if (mBtnSaveTactic) mBtnSaveTactic.style.display = isAdmin ? 'flex' : 'none';
            if (mBtnSavePoll) mBtnSavePoll.style.display = 'none';
        }
        
        syncMobileTopbar(activeTactic);
    }

    state.isEditingPositions = false;
    renderPitch();
}

function renderPitch(targetPitch = pitch, forcedTactic = null) {
    // --- VALIDACIÓN DEFENSIVA DE ALINEACIONES MULTI-FORMATO (v65.1) ---
    // Evitamos procesar forcedTactic si es un array plano legacy o carece de formación válida
    let validForcedTactic = forcedTactic;
    if (validForcedTactic && (Array.isArray(validForcedTactic) || !validForcedTactic.formation)) {
        validForcedTactic = null;
    }

    const activeTactic = validForcedTactic || state.savedTactics.find(t => t.id === state.activeTacticId) || state.savedTactics.find(t => t.isActive) || (state.savedTactics.length > 0 ? state.savedTactics[0] : null);
    if (!activeTactic) {
        if (targetPitch === pitch) {
            return handleTacticViewDisplay();
        }
        return;
    }

    if (targetPitch === pitch) {
        document.getElementById('current-formation-label').textContent = activeTactic.name;
        document.getElementById('current-formation-label').nextElementSibling.textContent = activeTactic.formation;
    }
    
    // Limpiamos los slots antiguos pero conservamos las líneas SVG
    Array.from(targetPitch.children).forEach(child => {
        if (!child.classList.contains('pitch-lines')) {
            targetPitch.removeChild(child);
        }
    });

    const formation = FORMATIONS[activeTactic.formation];
    formation.forEach(slot => {
        const slotEl = document.createElement('div');
        slotEl.className = 'tactical-slot';
        
        // Usar coordenadas personalizadas si existen
        const customPos = (activeTactic.customPositions && activeTactic.customPositions[slot.id]) 
            ? activeTactic.customPositions[slot.id] 
            : { x: slot.x, y: slot.y };

        slotEl.style.left = `${customPos.x}%`;
        slotEl.style.top = `${customPos.y}%`;
        slotEl.dataset.slotId = slot.id;

        // --- Lógica de Resaltado Alineación Inteligente (v33.0) ---
        if (state.alignmentMode.active) {
            const assignedPlayerId = activeTactic.assignments ? activeTactic.assignments[slot.id] : null;
            const assignedPlayer = state.players.find(p => p.id === assignedPlayerId);
            
            if (assignedPlayer && assignedPlayer.user_id) {
                const status = state.alignmentMode.voters[assignedPlayer.user_id.toString()];
                if (status === 'yes') slotEl.classList.add('status-si');
                else if (status === 'late') slotEl.classList.add('status-late');
                else slotEl.classList.add('status-off');
            } else if (assignedPlayerId) {
                // Si tiene asignación pero no hay voto (o no es usuario registrado)
                slotEl.classList.add('status-off');
            }
        }



        // --- Lógica de Arrastre de Posiciones (v19.2.0 - Separada por Modos) ---
        if (targetPitch === pitch) {
            let isDragging = false;
            let pitchRect = null;

            slotEl.onpointerdown = (e) => {
                // BLOQUEO: Solo permitir si el modo edición está activo
                if (!state.isEditingPositions) return;

                isDragging = true;
                slotEl.setPointerCapture(e.pointerId);
                slotEl.classList.add('dragging');
                pitchRect = targetPitch.getBoundingClientRect();
            };

            slotEl.onpointermove = (e) => {
                if (!isDragging || !pitchRect) return;
                
                let newX = ((e.clientX - pitchRect.left) / pitchRect.width) * 100;
                let newY = ((e.clientY - pitchRect.top) / pitchRect.height) * 100;

                // Restricciones de campo (límites ELITE)
                newX = Math.max(5, Math.min(95, newX));
                newY = Math.max(5, Math.min(95, newY));

                slotEl.style.left = `${newX}%`;
                slotEl.style.top = `${newY}%`;
                
                // Guardar temporalmente en el objeto de la táctica (sin persistir aún)
                if (!activeTactic.customPositions) activeTactic.customPositions = {};
                activeTactic.customPositions[slot.id] = { x: newX, y: newY };
            };

            slotEl.onpointerup = (e) => {
                isDragging = false;
                slotEl.releasePointerCapture(e.pointerId);
                slotEl.classList.remove('dragging');
            };
        }
        
        const assignedPlayerId = activeTactic.assignments ? activeTactic.assignments[slot.id] : null;
        let player = state.players.find(p => p.id == assignedPlayerId);

        // --- RECONOCER JUGADORES DE PRUEBA EN EL CAMPO (v60.9) ---
        if (!player && assignedPlayerId && typeof assignedPlayerId === 'string' && assignedPlayerId.startsWith('prueba_')) {
            const num = assignedPlayerId.split('_')[1];
            player = {
                id: assignedPlayerId,
                name: `PRUEBA ${num}`,
                dorsal: `P${num}`,
                avatarId: 1,
                photo_url: null,
                primaryPos: 'PRU'
            };
        }

        if (player) {
            const avatar = AVATARS.find(av => {
                const tid = (typeof player.avatarId === 'string') ? parseInt(player.avatarId) : player.avatarId;
                return av.id === (tid || 1);
            });
            slotEl.classList.add('filled');
            
            if (targetPitch === pitch) {
                const isAdmin = state.user?.role === 'manager' || state.user?.role === 'capitan';
                // BLOQUEO: Solo permitir arrastrar jugador si NO estamos editando dibujo y es admin
                slotEl.draggable = isAdmin && !state.isEditingPositions;
                
                if (slotEl.draggable) {
                    slotEl.addEventListener('dragstart', e => {
                        if (!isAdmin) { e.preventDefault(); return; }
                        draggedSourceSlotId = slot.id;
                        e.dataTransfer.setData('text/plain', player.id);
                    });
                }
            }

            const displayName = (player.name || '').toUpperCase();
            const isMobile = window.innerWidth < 1024;
            
            // Valores base según dispositivo
            let fontSize = isMobile ? '0.6rem' : '0.85rem';
            let letterSpacing = '0px';
            let scaleX = 1;

            const nameLength = displayName.length;

            // Lógica de escalado inteligente ELITE v4.7.0
            if (isMobile) {
                if (nameLength >= 15) {
                    fontSize = '0.35rem';
                    letterSpacing = '-1px';
                    scaleX = 0.65;
                } else if (nameLength >= 12) {
                    fontSize = '0.42rem';
                    letterSpacing = '-0.7px';
                    scaleX = 0.7;
                } else if (nameLength >= 10) {
                    fontSize = '0.5rem';
                    letterSpacing = '-0.4px';
                    scaleX = 0.75;
                } else if (nameLength >= 8) {
                    fontSize = '0.55rem';
                    letterSpacing = '-0.2px';
                    scaleX = 0.85;
                }
            } else {
                // Escalado para PC (más conservador)
                if (nameLength >= 15) {
                    fontSize = '0.55rem';
                    scaleX = 0.75;
                } else if (nameLength >= 12) {
                    fontSize = '0.65rem';
                    scaleX = 0.85;
                }
            }





            const photo = player.photo_url;
            const transform = getPlayerTransform(player);

            slotEl.innerHTML = `
                <div class="dorsal-small">${player.dorsal}</div>
                <div class="player-card-img" style="overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    ${photo ? `<img src="${photo}" style="width: 100%; height: 100%; object-fit: cover; object-position: top; transform: ${transform}">` : (avatar ? avatar.svg : '')}
                </div>
                <h4 title="${escapeHTML(player.name)}" style="
                    width: 100%;
                    text-align: center;
                    font-size: ${fontSize};
                    letter-spacing: ${letterSpacing};
                    transform: scaleX(${scaleX});
                    transform-origin: center center;
                    z-index: 10;
                ">${escapeHTML(displayName)}</h4>
                <div class="slot-pos">${slot.pos}</div>
            `;

            // --- Interacción rápida en Partido en Vivo (v56.7 - Two Tap Flow) ---
            const livePitch = document.getElementById('live-football-pitch');
            if (targetPitch === livePitch) {
                slotEl.style.cursor = 'pointer';
                
                // Clases dinámicas para el flujo interactivo
                slotEl.classList.remove('pending-scorer', 'pending-assistant');
                if (pendingScorerId === player.id) {
                    slotEl.classList.add('pending-scorer');
                    slotEl.title = "Cancelar selección de goleador";
                } else if (pendingScorerId) {
                    slotEl.classList.add('pending-assistant');
                    slotEl.title = `Seleccionar a ${displayName} como asistente`;
                } else {
                    slotEl.title = `Registrar gol de ${displayName}`;
                }

                slotEl.onclick = (e) => {
                    e.stopPropagation();
                    handlePitchClick(player.id, displayName);
                };
            }

        } else {
            slotEl.innerHTML = `
                <span class="plus-icon">+</span>
                <div class="slot-pos" style="bottom: -22px; background: rgba(0,0,0,0.5); color: #fff;">${slot.pos}</div>
            `;
        }

        if (targetPitch === pitch) {
            const isAdmin = state.user?.role === 'manager' || state.user?.role === 'capitan';

            slotEl.addEventListener('click', () => {
                if (state.isEditingPositions) return; // BLOQUEO: No abrir modal en edición de dibujo
                if (!isAdmin) return; // BLOQUEO SILENCIOSO: No hace nada
                activeSlotId = slot.id;
                renderPlayerModal(slot.pos);
            });
            
            // Drag and Drop Zone
            slotEl.addEventListener('dragover', e => {
                const isAdmin = state.user?.role === 'manager' || state.user?.role === 'capitan';
                if (!isAdmin) return; // BLOQUEO DROP
                e.preventDefault(); // Permitir drop
                slotEl.classList.add('drag-over');
            });
            slotEl.addEventListener('dragleave', () => slotEl.classList.remove('drag-over'));
            slotEl.addEventListener('drop', e => {
                const isAdmin = state.user?.role === 'manager' || state.user?.role === 'capitan';
                if (!isAdmin) return; // BLOQUEO DROP
                e.preventDefault();
                slotEl.classList.remove('drag-over');
                const playerId = e.dataTransfer.getData('text/plain');
                if (playerId) {
                    handlePlayerAssignmentRequest(playerId, slot.id, slot.pos);
                }
            });
        }

        targetPitch.appendChild(slotEl);
    });
    
    if (targetPitch === pitch) renderRosterPanel();
}

function renderRosterPanel() {
    const rosterGrid = document.getElementById('selector-player-list');
    const rosterTitle = document.getElementById('roster-panel-title');
    
    rosterGrid.innerHTML = '';
    if (rosterTitle) rosterTitle.textContent = 'BANQUILLO';

    const activeTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
    const assignedPlayerIds = Object.values(activeTactic?.assignments || {});
    const isAdmin = state.user?.role === 'manager' || state.user?.role === 'capitan';

    const getPosGroupInfo = (pos) => {
        const p = (pos || '').toUpperCase();
        if (p === 'POR') return { score: 1, label: 'PORTEROS', class: 'pos-gk' };
        if (['DFC', 'LD', 'LI', 'CAD', 'CAI'].includes(p)) return { score: 2, label: 'DEFENSAS', class: 'pos-df' };
        if (['MCD', 'MC', 'MI', 'MD', 'MCO'].includes(p)) return { score: 3, label: 'MEDIOS', class: 'pos-mf' };
        if (['ED', 'EI', 'SD', 'DC'].includes(p)) return { score: 4, label: 'DELANTEROS', class: 'pos-fw' };
        return { score: 5, label: 'OTROS', class: 'pos-mf' };
    };

    // Filtrar y ordenar
    const playersToShow = state.players
        .filter(p => !assignedPlayerIds.includes(p.id.toString()) && !assignedPlayerIds.includes(p.id))
        .sort((a, b) => getPosGroupInfo(a.primaryPos).score - getPosGroupInfo(b.primaryPos).score);

    let currentGroup = '';

    playersToShow.forEach(player => {
        const groupInfo = getPosGroupInfo(player.primaryPos);
        
        // Añadir cabecera de grupo
        if (groupInfo.label !== currentGroup) {
            const header = document.createElement('div');
            header.className = 'roster-group-header';
            header.innerHTML = `<span>${groupInfo.label}</span> <span>${playersToShow.filter(p => getPosGroupInfo(p.primaryPos).label === groupInfo.label).length}</span>`;
            rosterGrid.appendChild(header);
            currentGroup = groupInfo.label;
        }

        const card = document.createElement('div');
        card.className = 'player-roster-card fade-in';
        
        // --- Resaltado Alineación Inteligente v33.1 ---
        if (state.alignmentMode.active && player.user_id) {
            const status = state.alignmentMode.voters[player.user_id.toString()];
            if (status === 'yes') card.classList.add('status-si');
            else if (status === 'late') card.classList.add('status-late');
            else card.classList.add('status-off');
        } else if (state.alignmentMode.active) {
            card.classList.add('status-off');
        }

        card.draggable = true;

        const avatar = AVATARS.find(av => av.id === (player.avatarId || player.avatar_id || 1));
        const photo = player.photo_url;
        const transform = getPlayerTransform(player);

        card.innerHTML = `
            <div class="roster-card-avatar" style="width: 40px; height: 40px; overflow: hidden; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05);">
                ${photo ? `<img src="${photo}" style="width: 100%; height: 100%; object-fit: cover; object-position: top; transform: ${transform}">` : (avatar ? avatar.svg : '')}
            </div>
            <div class="roster-card-pos-badge ${groupInfo.class}">${player.primaryPos}</div>
            <div style="display: flex; flex-direction: column; overflow: hidden;">
                <div class="roster-card-name">${escapeHTML(player.name.toUpperCase())}</div>
                <div class="roster-card-substats">${player.secondaryPos && player.secondaryPos.length ? escapeHTML(player.secondaryPos.join(' • ')) : 'SIN SECUNDARIA'}</div>
            </div>
            <div class="roster-card-rating">${player.dorsal}</div>
        `;

        // Drag Start (v20.2.0 - Solo si no está bloqueado y es directiva)
        card.draggable = isAdmin && !state.isEditingPositions;
        
        card.addEventListener('dragstart', e => {
            if (state.isEditingPositions || !isAdmin) {
                e.preventDefault();
                return;
            }
            e.dataTransfer.setData('text/plain', player.id);
        });

        rosterGrid.appendChild(card);
    });
}

function renderPlayerModal(requiredPos) {
    const modal = document.getElementById('player-modal-overlay');
    const title = document.getElementById('modal-pos-title');
    const list = document.getElementById('modal-player-list');
    
    modal.style.display = 'flex';
    title.textContent = `APTOS PARA: ${requiredPos}`;
    list.innerHTML = '';

    const activeTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
    const assignedPlayerIds = Object.values(activeTactic?.assignments || {});
    
    let sortedPlayers = [...state.players];
    sortedPlayers.sort((a, b) => {
        const aPrimary = a.primaryPos === requiredPos;
        const bPrimary = b.primaryPos === requiredPos;
        const aSec = a.secondaryPos && a.secondaryPos.includes(requiredPos);
        const bSec = b.secondaryPos && b.secondaryPos.includes(requiredPos);
        
        const aScore = aPrimary ? 2 : (aSec ? 1 : 0);
        const bScore = bPrimary ? 2 : (bSec ? 1 : 0);
        return bScore - aScore;
    });

    // Botón especial para vaciar puesto
    const existingId = activeTactic.assignments[activeSlotId];
    if (existingId) {
        const emptyBtn = document.createElement('div');
        emptyBtn.className = 'player-roster-card';
        emptyBtn.style.border = '1px solid #F44336';
        emptyBtn.style.background = 'rgba(244, 67, 54, 0.1)';
        emptyBtn.style.cursor = 'pointer';
        emptyBtn.innerHTML = `<div style="grid-column: 1 / -1; color:#F44336; font-size:0.9rem; font-weight:800; text-align:center; padding:10px;">QUITAR DEL PUESTO</div>`;
        emptyBtn.onclick = () => {
            assignPlayerToSlot(null);
            modal.style.display = 'none';
        };
        list.appendChild(emptyBtn);
    }

    sortedPlayers.forEach(player => {
        const isAssigned = assignedPlayerIds.includes(player.id.toString()) || assignedPlayerIds.includes(player.id);
        if (isAssigned) return;

        const card = document.createElement('div');
        card.className = 'player-roster-card fade-in';
        card.style.cursor = 'pointer';
        
        if (player.primaryPos === requiredPos) card.classList.add('match-primary');
        else if (player.secondaryPos && player.secondaryPos.includes(requiredPos)) card.classList.add('match-secondary');
        else card.classList.add('dimmed');

        const avatar = AVATARS.find(av => av.id === (player.avatarId || player.avatar_id || 1));
        const photo = player.photo_url;
        const transform = getPlayerTransform(player);

        card.innerHTML = `
            <div class="roster-card-avatar" style="width: 30px; height: 30px; margin-right: 10px; overflow: hidden; display: flex; align-items: center; justify-content: center; border-radius: 4px; background: rgba(0,0,0,0.2);">
                ${photo ? `<img src="${photo}" style="width: 100%; height: 100%; object-fit: cover; object-position: top; transform: ${transform}">` : (avatar ? avatar.svg : '')}
            </div>
            <div class="roster-card-pos">${player.primaryPos}</div>
            <div class="roster-card-name">${player.name}</div>
            <div class="roster-card-stats">${player.secondaryPos && player.secondaryPos.length ? player.secondaryPos.join(', ') : '-'}</div>
            <div class="roster-card-rating">${player.dorsal}</div>
        `;

        card.onclick = () => {
            modal.style.display = 'none';
            handlePlayerAssignmentRequest(player.id, activeSlotId, requiredPos);
        };

        list.appendChild(card);
    });

    document.getElementById('close-player-modal').onclick = () => {
        modal.style.display = 'none';
        activeSlotId = null;
    };
}

async function handlePlayerAssignmentRequest(playerId, slotId, requiredPos) {
    const activeTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
    const player = state.players.find(p => p.id == playerId);
    if (!player || !activeTactic) return;

    // 1. Verificar Ocupación
    const existingPlayerId = activeTactic.assignments[slotId];
    if (existingPlayerId && existingPlayerId != playerId) {
        const existingPlayer = state.players.find(p => p.id == existingPlayerId);
        const wantReplace = await window.jbConfirm(`Esta posición ya está ocupada por ${existingPlayer ? existingPlayer.name : 'otro jugador'}.\n¿Quieres sustituirlo por ${player.name}?`);
        if (!wantReplace) return;
    }

    // 2. Verificar Posición Real
    const hasPos = (player.primaryPos === requiredPos) || (player.secondaryPos && player.secondaryPos.includes(requiredPos));
    if (!hasPos && requiredPos) {
        const wantForce = await window.jbConfirm(`${player.name} no tiene ${requiredPos} como posición principal ni secundaria.\n\n¿Seguro que quieres asignarlo aquí?`);
        if (!wantForce) return;
    }

    activeSlotId = slotId;
    assignPlayerToSlot(playerId);
}

async function assignPlayerToSlot(playerId) {
    const activeTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
    if (!activeTactic) return;

    if (playerId) {
        // ELIMINAR DUPLICADOS: Si el jugador YA estaba en otra posición, quitarlo de allí primero
        Object.keys(activeTactic.assignments).forEach(slotKey => {
            if (activeTactic.assignments[slotKey] == playerId) {
                delete activeTactic.assignments[slotKey];
            }
        });

        activeTactic.assignments[activeSlotId] = playerId;
    } else {
        delete activeTactic.assignments[activeSlotId];
    }
    
    await saveTacticsCloud();
    activeSlotId = null; // Reiniciar slot seleccionado
    draggedSourceSlotId = null; // Resetear origen de drag
    renderPitch(); // Re-renderizará el campo y el banquillo actualizado
}


window.confirmDelete = async (id) => {
    const player = state.players.find(p => p.id === id);
    if (!player) return;

    const isManager = state.user.role === 'manager';
    const isSelf = player.user_id === state.user.auth.id;

    if (!isManager && !isSelf) {
        window.jbToast('Solo el Manager o tú mismo podéis realizar esta acción.', 'error');
        return;
    }

    const agreed = await window.jbConfirm(isManager ? `¿DESVINCULAR A ${player.name.toUpperCase()} DEL CLUB?` : '¿QUIERES ABANDONAR EL CLUB?');
    
    if (agreed) {
        // 1. Eliminar membresía (Echar del club)
        const { error: memErr } = await supabase.from('memberships').delete().eq('user_id', player.userId || id).eq('team_id', state.team.id);
        
        if (memErr) { window.jbToast('Error al expulsar: ' + memErr.message, 'error'); return; }

        // 2. Opcionalmente eliminar ficha (Solo si el usuario lo decide, para el MVP lo borramos)
        await supabase.from('players').delete().eq('id', id);

        window.jbToast(isManager ? 'Contrato terminado.' : 'Has abandonado el club.', 'success');
        
        if (!isManager) {
            // If abandoning, we lose team access, re-init session
            state.team = null;
            await handleUserSession(state.user.auth);
        } else {
            await loadTeamData();
            switchView('plantilla');
        }
    }
};

window.kickMemberFromAdmin = async (userId, userName) => {
    if (state.user?.role !== 'manager') return;
    
    const agreed = await window.jbConfirm(`¿ESTÁS SEGURO DE QUE QUIERES EXPULSAR A ${userName.toUpperCase()} DEL CLUB?`);
    if (!agreed) return;

    window.jbLoading.show('Terminando contrato...');
    try {
        // deleteMemberCloud está en js/data.js
        await deleteMemberCloud(userId);
        
        // Limpieza de ficha de jugador si existe
        const player = state.players.find(p => p.user_id === userId);
        if (player) {
            await supabase.from('players').delete().eq('id', player.id);
        }
        
        await loadTeamData(); // Recarga integral
    } catch (err) {
        console.error(">>> [ERROR] Expulsión fallida:", err);
        window.jbToast('Error al expulsar miembro', 'error');
    }
    window.jbLoading.hide();
};

// --- FUNCIÓN AUXILIAR DE RENDERIZADO DE FOTOS (v49.4) ---
async function getBase64Image(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            try {
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
            } catch (e) {
                console.warn("Tainted canvas while converting avatar to base64, using fallback.");
                resolve(null);
            }
        };
        img.onerror = () => {
            console.warn("Error loading avatar image for base64 conversion:", url);
            resolve(null);
        };
        img.src = url;
    });
}

window.renderPlayerPhotoToCanvas = async function renderPlayerPhotoToCanvas(player, width = 150, height = 205, isMatchday = false) {
    return new Promise(async (resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const tempCtx = canvas.getContext('2d');

        const img = new Image();
        img.crossOrigin = "anonymous";
        
        img.onload = () => {
            tempCtx.clearRect(0, 0, canvas.width, canvas.height);
            if (player.photo_url) {
                let drawWidth, drawHeight, offsetX, offsetY;
                const imgRatio = img.width / img.height;
                const canvasRatio = canvas.width / canvas.height;

                if (imgRatio > canvasRatio) {
                    drawHeight = canvas.height;
                    drawWidth = img.width * (canvas.height / img.height);
                    offsetX = (canvas.width - drawWidth) / 2;
                    offsetY = 0;
                } else {
                    drawWidth = canvas.width;
                    drawHeight = img.height * (canvas.width / img.width);
                    offsetX = 0;
                    offsetY = 0;
                }

                const scale = player.photo_scale || 1.0;
                const posXVal = player.photo_x || 0;
                const posYVal = player.photo_y || 0;

                tempCtx.save();
                tempCtx.translate(canvas.width / 2, canvas.height / 2);
                tempCtx.translate(posXVal, posYVal);
                tempCtx.scale(scale, scale);
                tempCtx.translate(-canvas.width / 2, -canvas.height / 2);
                tempCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                tempCtx.restore();
            } else {
                tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            
            try {
                tempCtx.getImageData(0,0,1,1);
                resolve(canvas);
            } catch(e) {
                tempCtx.clearRect(0,0,canvas.width,canvas.height);
                resolve(canvas);
            }
        };

        img.onerror = () => resolve(canvas);

        let targetUrl = player.photo_url;
        if (!targetUrl) {
            const avatar = player.avatar_id ? AVATARS.find(a => a.id === player.avatar_id) : AVATARS[0];
            let svgStr = avatar ? avatar.svg : AVATARS[0].svg;
            if (!svgStr.includes('xmlns=')) svgStr = svgStr.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
            if (!svgStr.includes('width=')) svgStr = svgStr.replace('<svg ', `<svg width="${width}" height="${height}" `);
            targetUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
        }
        
        if (targetUrl.startsWith('data:')) {
            img.src = targetUrl;
        } else {
            const b64 = await getBase64Image(targetUrl);
            if (b64) {
                img.src = b64;
            } else {
                resolve(canvas);
            }
        }
    });
}

async function exportSquadAsImage() {
    const role = (state.user?.role || 'jugador').toLowerCase();
    if (role !== 'manager' && role !== 'capitan') {
        window.jbToast('Acceso denegado: Solo el Manager y los Capitanes pueden exportar la plantilla.', 'error');
        return;
    }

    window.jbLoading.show('Generando imagen de plantilla...');
    
    const teamName = (state.team?.name || 'Mi Club').toUpperCase();
    const crestUrl = state.team?.crest_url || localStorage.getItem(`jb_crest_${state.team?.id}`);
    const twitter = state.team?.socials?.twitter;
    const twitch = state.team?.socials?.twitch;

    const wrapper = document.createElement('div');
    wrapper.className = 'squad-export-wrapper';
    
    wrapper.innerHTML = `
        <div class="squad-export-header">
            <div class="squad-export-logo-container">
                ${crestUrl ? `<img src="${crestUrl}" class="squad-export-crest">` : ''}
                <h1>${teamName}</h1>
            </div>
            <div class="squad-export-socials">
                ${twitter ? `
                    <div class="squad-social-item">
                        <span class="squad-social-icon" style="color: #1DA1F2;">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/></svg>
                        </span>
                        @${twitter.toUpperCase()}
                    </div>
                ` : ''}
                ${twitch ? `
                    <div class="squad-social-item">
                        <span class="squad-social-icon" style="color: #9146FF;">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
                        </span>
                        ${twitch.toUpperCase()}
                    </div>
                ` : ''}
                <div style="font-weight: 800; opacity: 0.3; font-size: 0.7rem; margin-top: 5px;">PLANTILLA OFICIAL</div>
            </div>
        </div>
        <div id="squad-export-content"></div>
    `;

    document.body.appendChild(wrapper);
    const content = wrapper.querySelector('#squad-export-content');

    const categoryMap = {
        'PORTERA': ['POR'],
        'DEFENSA': ['DFC', 'LD', 'LI', 'CAD', 'CAI'],
        'CENTROCAMPISTA': ['MCD', 'MC', 'MI', 'MD', 'MCO'],
        'DELANTERA': ['ED', 'EI', 'SD', 'DC']
    };

    for (const [title, positions] of Object.entries(categoryMap)) {
        const players = state.players.filter(p => positions.includes(p.primaryPos?.toUpperCase() || p.primary_pos?.toUpperCase()));
        if (players.length === 0) continue;

        const groupDiv = document.createElement('div');
        groupDiv.className = 'squad-group';
        groupDiv.innerHTML = `<h2 class="squad-group-title">${title}</h2><div class="squad-cards-grid"></div>`;
        const grid = groupDiv.querySelector('.squad-cards-grid');

        for (const player of players) {
            const card = document.createElement('div');
            card.className = 'squad-export-card';
            card.innerHTML = `
                <div class="squad-card-photo"></div>
                <div class="squad-card-info">
                    <div class="squad-card-name-row">
                        <span class="squad-card-dorsal">${player.dorsal || ''}</span>
                        <span class="squad-card-name">${escapeHTML(player.name)}</span>
                    </div>
                    <span class="squad-card-pos">${player.primaryPos || player.primary_pos}</span>
                </div>
            `;
            
            const photoCanvas = await renderPlayerPhotoToCanvas(player, 180, 240); // Ligeramente más grande para squad
            card.querySelector('.squad-card-photo').appendChild(photoCanvas);
            grid.appendChild(card);
        }
        content.appendChild(groupDiv);
    }

    await new Promise(r => setTimeout(r, 1000));

    try {
        const canvas = await html2canvas(wrapper, {
            useCORS: true,
            scale: 1.5,
            backgroundColor: '#ffffff'
        });

        const link = document.createElement('a');
        link.download = `PLANTILLA_${teamName.replace(/\s+/g, '_')}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
    } catch (err) {
        console.error("Error al exportar plantilla:", err);
        window.jbToast("Error al generar la imagen.", "error");
    } finally {
        document.body.removeChild(wrapper);
        window.jbLoading.hide();
    }
}
