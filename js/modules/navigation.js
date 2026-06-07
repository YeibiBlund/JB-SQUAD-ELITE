// navigation.js

// --- Lógica de Vistas ---
// Lógica de Vistas (checkLoginState removido)

window.switchView = function(viewId) {
    // Cancelar interactividad de goles si cambiamos de vista (v56.7)
    if (typeof cancelQuickGoal === 'function') cancelQuickGoal();

    // Bloqueo de seguridad: Solo el Manager accede a gestión de equipo
    if (viewId === 'mi-equipo' && state.user?.role !== 'manager') {
        window.jbToast('Acceso denegado: Solo el Manager puede gestionar el club.', 'error');
        viewId = 'home';
    }

    // Bloqueo de seguridad: Solo el Master Admin accede al panel global (v59.0)
    if (viewId === 'admin' && !state.user?.profile?.is_admin) {
        window.jbToast('Acceso restringido: Solo el Master Admin puede entrar aquí.', 'error');
        viewId = 'home';
    }

    // --- RESTRICCIONES SIN CLUB (v47.2) ---
    const teamRestrictedViews = ['plantilla', 'tacticas', 'jornadas', 'convocatorias', 'mi-equipo'];
    if (!state.team && teamRestrictedViews.includes(viewId)) {
        window.jbToast('⏳ Esta sección se desbloqueará cuando seas aceptado en un club.', 'info');
        viewId = 'home';
    }

    // Ocultar todas las vistas (v57.0)
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active-view');
        v.style.display = 'none';
    });

    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
        targetView.classList.add('active-view');
        
        // Layout específico por tipo de vista
        if (viewId === 'tacticas' || viewId === 'matchday-creator') {
            targetView.style.display = 'flex';
        } else {
            targetView.style.display = 'block';
        }
        
        // Asegurar visibilidad del contenedor principal
        const mainApp = document.getElementById('main-app');
        if (mainApp) {
            mainApp.style.setProperty('display', 'flex', 'important');
        }
    }

    // Manejo específico de la vista de creador de Matchday (v57.0)
    if (viewId === 'matchday-creator') {
        if (typeof initMatchdayCreator === 'function') initMatchdayCreator();
        // Asegurar escalado inicial (v60.0)
        setTimeout(() => {
            if (window.resizePosterPreview) window.resizePosterPreview();
        }, 100);
    }

    if (viewId !== 'tacticas') {
        if (headerTacticInfo) headerTacticInfo.style.display = 'none';
        const tacticalActions = document.getElementById('tactical-header-actions');
        if (tacticalActions) tacticalActions.style.display = 'none';

        // Limpieza del estado de "Modificar Dibujo"
        state.isEditingPositions = false;
        document.body.classList.remove('editing-tactic');
        document.getElementById('tactic-roster-panel')?.classList.remove('locked');
        
        // Restablecer visibilidad botones escritorio
        const btnEditBoard = document.getElementById('btn-edit-board');
        const btnSaveDesign = document.getElementById('btn-save-custom-positions');
        const btnResetDesign = document.getElementById('btn-reset-positions');
        if (btnEditBoard) btnEditBoard.style.display = (state.user?.role === 'manager' || state.user?.role === 'capitan') ? 'flex' : 'none';
        if (btnSaveDesign) btnSaveDesign.style.display = 'none';
        if (btnResetDesign) btnResetDesign.style.display = 'none';
    }

    if (viewId === 'tacticas') {
        handleTacticViewDisplay();
    } else if (viewId === 'jornadas') {
        if (typeof window.renderSessions === 'function') window.renderSessions();
        else if (typeof renderSessions === 'function') renderSessions();
    } else if (viewId === 'mi-equipo') {
        renderMiEquipoView();
    } else if (viewId === 'convocatorias') {
        renderAvailabilityPanel();
    } else if (viewId === 'home') {
        if (window.renderHomeDashboard) {
            window.renderHomeDashboard();
            setTimeout(() => {
                const scroller = document.querySelector('.mobile-rankings-nav-scroll');
                if (scroller) window.updateScrollArrows(scroller);
            }, 50);
        }
    } else if (viewId === 'admin') {
        window.renderAdminDashboard();
    } else if (viewId === 'cartas-squad') {
        renderCardsView();
    } else if (viewId === 'mercado') {
        // Redirigir a la vista de selección de club del auth container
        switchAuthView('team-select');
        if (typeof fetchAvailableClubs === 'function') fetchAvailableClubs();
        return; // Salimos para no ejecutar la lógica de main-app
    }

    // Actualizar estado del Nav Bar
    navButtons.forEach(btn => {
        if (btn.getAttribute('data-view') === viewId) {
            btn.classList.add('active');
            btn.classList.add('active-nav'); // Nuevo: Para el sidebar de escritorio
        } else {
            btn.classList.remove('active');
            btn.classList.remove('active-nav');
        }
    });
    
    state.currentView = viewId;
    window.scrollTo(0, 0);

    // Actualizar notificaciones en el navbar en cada cambio de vista
    renderAvailabilityBanner();
    if (window.updateJoinRequestsBadge) window.updateJoinRequestsBadge();
}

function handleTacticViewDisplay() {
    // Al entrar en la vista principal de Tácticas, mostramos siempre la lista
    tacticasList.style.display = 'block';
    tacticasInitial.style.display = 'none';
    tacticasField.style.display = 'none';
    const tacticalActions = document.getElementById('tactical-header-actions');
    if (tacticalActions) tacticalActions.style.display = 'none';
    
    if (headerTacticInfo) headerTacticInfo.style.display = 'none';
    if (btnSaveTactic) btnSaveTactic.style.display = 'none';
    renderTacticsList();
}

function updateLiveMatchUI() {
    if (!currentMatch) return;
    
    const typeLabel = document.getElementById('match-type-label');
    const rivalLabel = document.getElementById('rival-name-display');
    if (typeLabel) typeLabel.textContent = currentMatch.type === 'official' ? 'PARTIDO OFICIAL' : 'PARTIDO AMISTOSO';
    if (rivalLabel) rivalLabel.textContent = currentMatch.rival.toUpperCase();

    // Fallback SVG (v55.6) - Ahora definido en el scope superior de setupSessionHandlers

    const myTeamName = (state.team && state.team.name) ? state.team.name : 'MI CLUB';
    const myTeamCrest = (state.team && state.team.crest_url) ? state.team.crest_url : neutralCrest;
    const rivalName = currentMatch.rival || 'RIVAL';
    const rivalCrest = currentMatch.rivalCrest || neutralCrest;

    const nameA = document.getElementById('score-team-name-a');
    const nameB = document.getElementById('score-team-name-b');
    const crestA = document.getElementById('score-team-crest-a');
    const crestB = document.getElementById('score-team-crest-b');

    // Botones de GOL (v55.0)
    const btnGoalHomeLabel = document.querySelector('#btn-add-goal-home span:last-child');
    const btnGoalAwayLabel = document.querySelector('#btn-add-goal-away span');

    // Función para manejar error de carga de imagen
    const handleImageError = (img) => {
        img.onerror = null;
        img.src = neutralCrest;
    };

    // JB-SQUAD siempre a la izquierda (Local) vs Rival (Visitante)
    if (nameA) nameA.textContent = myTeamName.toUpperCase();
    if (crestA) {
        crestA.src = myTeamCrest;
        crestA.onerror = () => handleImageError(crestA);
    }
    if (nameB) nameB.textContent = rivalName.toUpperCase();
    if (crestB) {
        crestB.src = rivalCrest;
        crestB.onerror = () => handleImageError(crestB);
    }
    if (btnGoalHomeLabel) btnGoalHomeLabel.textContent = 'GOL ' + myTeamName.substring(0,6).toUpperCase();
    if (btnGoalAwayLabel) btnGoalAwayLabel.textContent = '+ GOL ' + rivalName.substring(0,6).toUpperCase();

    scoreHomeDisplay.textContent = currentMatch.scoreHome;
    scoreAwayDisplay.textContent = currentMatch.scoreAway;

    const eventsContainer = document.getElementById('events-container');
    if (eventsContainer) {
        eventsContainer.innerHTML = '';
        // Solo mostramos los eventos de nuestro equipo (side === 'home')
        const homeEvents = currentMatch.events.filter(ev => ev.side === 'home');
        if (homeEvents.length === 0) {
            eventsContainer.innerHTML = `
                <div class="events-empty-state">
                    <div class="events-empty-icon">⚽</div>
                    <span>Sin eventos aún</span>
                </div>`;
        } else {
            homeEvents.forEach((ev) => {
                // Índice real para poder eliminar el evento correcto
                const realIdx = currentMatch.events.findIndex(e => e === ev);
                const p = document.createElement('div');
                p.className = 'event-item fade-in';

                const scorer = getPlayerNameById(ev.scorerId);
                const assistant = ev.assistantId ? getPlayerNameById(ev.assistantId) : null;

                // Goleador izquierda | Asistente derecha
                p.innerHTML = `
                    <div class="event-scorer-side">
                        <span class="event-ball-icon">⚽</span>
                        <span class="event-scorer-name">${scorer}</span>
                    </div>
                    <div class="event-right-side">
                        ${assistant
                            ? `<div class="event-assist-block">
                                    <span class="event-assist-icon">🅰️</span>
                                    <span class="event-assist-name">${assistant}</span>
                               </div>`
                            : ''
                        }
                        <button class="event-remove-btn" onclick="window.removeMatchEvent(${realIdx})" title="Eliminar evento">×</button>
                    </div>
                `;
                eventsContainer.appendChild(p);
            });
        }
    }
}

window.updateTeamHeader = function() {
    const teamNameLabel = document.getElementById('display-team-name');
    const userWelcome = document.getElementById('display-username'); // O el ID que corresponda
    const userNameHeader = document.getElementById('display-user-name');
    const teamCrestHeader = document.getElementById('header-crest-container');
    
    if (state.team) {
        if (teamNameLabel) teamNameLabel.textContent = state.team.name.toUpperCase();
        
        // Renderizar Escudo en Cabecera Global
        if (teamCrestHeader) {
            const crestSource = state.team.crest_url || localStorage.getItem(`jb_crest_${state.team.id}`);
            if (crestSource) {
                teamCrestHeader.innerHTML = `<img src="${crestSource}" alt="Escudo">`;
            } else {
                teamCrestHeader.innerHTML = '<span>🛡️</span>';
            }
        }
    }
    
    if (state.user && state.user.profile) {
        const fullName = state.user.profile.full_name || 'Usuario Elite';
        if (userNameHeader) userNameHeader.textContent = fullName.toUpperCase();
        if (userWelcome) userWelcome.textContent = fullName.split(' ')[0] || 'Capitán';
    }

    const statsPlayers = document.getElementById('stats-total-players');
    if (statsPlayers) statsPlayers.textContent = state.players.length;
}

// --- Configuración de Navegación ---
window.updateNavVisibility = function() {
    const hasTeam = !!state.team;
    
    // Selectores
    const btnHome = document.querySelector('.nav-btn[data-view="home"]');
    const btnPlantilla = document.querySelector('.nav-btn[data-view="plantilla"]');
    const btnJornadas = document.querySelector('.nav-btn[data-view="jornadas"]');
    const btnConvocatorias = document.querySelector('.nav-btn[data-view="convocatorias"]');
    const btnTacticas = document.querySelector('.nav-btn[data-view="tacticas"]');
    const btnMercado = document.getElementById('nav-btn-mercado');

    const displayStyle = window.innerWidth > 768 ? 'flex' : 'flex'; // En nav-btn se usa flex por defecto

    if (!hasTeam) {
        if (btnHome) btnHome.style.display = 'none';
        if (btnPlantilla) btnPlantilla.style.display = 'none';
        if (btnJornadas) btnJornadas.style.display = 'none';
        if (btnConvocatorias) btnConvocatorias.style.display = 'none';
        if (btnTacticas) btnTacticas.style.display = 'none';
        if (btnMercado) btnMercado.style.display = 'flex';
    } else {
        if (btnHome) btnHome.style.display = 'flex';
        if (btnPlantilla) btnPlantilla.style.display = 'flex';
        if (btnJornadas) btnJornadas.style.display = 'flex';
        if (btnConvocatorias) btnConvocatorias.style.display = 'flex';
        if (btnTacticas) btnTacticas.style.display = 'flex';
        if (btnMercado) btnMercado.style.display = 'none';
    }
};

window.setupNavigation = function() {
    if (window._hasSetupNavigation) return;
    window._hasSetupNavigation = true;

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            
            // RESET: Si navegamos manualmente desde el menú, limpiamos el modo alineación de convocatoria
            if (view === 'tacticas') state.alignmentMode.active = false;

            // Corrección: Si pulsamos "Mi Perfil", debemos forzar que se cargue MI jugador
            // y no el último que hayamos consultado en la plantilla.
            if (view === 'my-profile' && state.userPlayer) {
                viewPlayerProfileDetail(state.userPlayer.id);
            } else {
                switchView(view);
            }
        });
    });

    // Botones especiales de transición


    const btnTeamMgmtShortcut = document.getElementById('btn-mgmt-team-shortcut');
    if (btnTeamMgmtShortcut) {
        btnTeamMgmtShortcut.addEventListener('click', () => switchView('mi-equipo'));
    }

    const btnBackToProfile = document.getElementById('btn-back-to-profile');
    if (btnBackToProfile) {
        btnBackToProfile.addEventListener('click', () => switchView('my-profile'));
    }

    if (btnGoToAddPlayer) {
        btnGoToAddPlayer.addEventListener('click', () => {
            if (state.userPlayer) {
                viewPlayerProfileDetail(state.userPlayer.id);
            } else {
                switchView('add-player');
            }
        });
    }

    if (btnBackToPlantilla) {
        btnBackToPlantilla.addEventListener('click', () => switchView('plantilla'));
    }

    const btnViewCards = document.getElementById('btn-view-cards');
    if (btnViewCards) {
        btnViewCards.addEventListener('click', () => switchView('cartas-squad'));
    }

    const btnBackFromCards = document.getElementById('btn-back-from-cards');
    if (btnBackFromCards) {
        btnBackFromCards.addEventListener('click', () => switchView('plantilla'));
    }

    // Lógica de colapso para la barra de navegación
    const mainNav = document.getElementById('main-nav');
    const navToggle = document.getElementById('nav-toggle-handle');
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('collapsed');
        });
    }

    // Botón para abrir el creador de Matchday (v57.0)
    if (btnCreateMatchdayGraphic) {
        btnCreateMatchdayGraphic.onclick = () => switchView('matchday-creator');
    }
    if (btnBackFromCreator) {
        btnBackFromCreator.onclick = () => switchView('jornadas');
    }
    if (btnAddMatchToPoster) {
        btnAddMatchToPoster.onclick = addMatchToPoster;
    }
    if (btnGeneratePoster) {
        btnGeneratePoster.onclick = exportMatchdayImage;
    }

    // Event Listeners para Filtros del Dashboard (v58.2) - Pulsadores Cíclicos
    const cycleFilter = (key) => {
        const modes = ['official', 'friendly', 'global'];
        const current = window.dashboardFilters[key] || 'official';
        const nextIndex = (modes.indexOf(current) + 1) % modes.length;
        window.dashboardFilters[key] = modes[nextIndex];
        window.renderHomeDashboard();
    };

    const filterGoals = document.getElementById('filter-goals');
    if (filterGoals) filterGoals.onclick = () => cycleFilter('scorers');
    const filterGoalsM = document.getElementById('filter-goals-mobile');
    if (filterGoalsM) filterGoalsM.onclick = () => cycleFilter('scorers');

    const filterAssists = document.getElementById('filter-assists');
    if (filterAssists) filterAssists.onclick = () => cycleFilter('assists');
    const filterAssistsM = document.getElementById('filter-assists-mobile');
    if (filterAssistsM) filterAssistsM.onclick = () => cycleFilter('assists');

    const filterWinrate = document.getElementById('filter-winrate');
    if (filterWinrate) filterWinrate.onclick = () => cycleFilter('winrate');
    const filterWinrateM = document.getElementById('filter-winrate-mobile');
    if (filterWinrateM) filterWinrateM.onclick = () => cycleFilter('winrate');

    const filterCleanSheets = document.getElementById('filter-cleansheets');
    if (filterCleanSheets) filterCleanSheets.onclick = () => cycleFilter('cleansheets');
    const filterCleanSheetsM = document.getElementById('filter-cleansheets-mobile');
    if (filterCleanSheetsM) filterCleanSheetsM.onclick = () => cycleFilter('cleansheets');
    const filterKeepersD = document.getElementById('filter-keepers-desktop');
    if (filterKeepersD) filterKeepersD.onclick = () => cycleFilter('cleansheets');

    const filterClub = document.getElementById('filter-club');
    if (filterClub) filterClub.onclick = () => cycleFilter('club');
}

// Lógica de flechas para las pestañas de móvil
window.updateScrollArrows = function(el) {
    if (!el || !el.parentElement) return;
    
    // Si el elemento está oculto o no tiene ancho, no podemos calcular su scroll
    // así que no modificamos la visibilidad de las flechas.
    if (el.clientWidth === 0) return;

    const wrapper = el.parentElement;
    const leftArrow = wrapper.querySelector('.left-arrow');
    const rightArrow = wrapper.querySelector('.right-arrow');
    
    if (leftArrow) {
        if (el.scrollLeft <= 0) {
            leftArrow.style.display = 'none';
        } else {
            leftArrow.style.display = 'flex';
        }
    }
    
    if (rightArrow) {
        // Añadimos un pequeño margen por problemas de redondeo
        if (Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth - 1) {
            rightArrow.style.display = 'none';
        } else {
            rightArrow.style.display = 'flex';
        }
    }
};

// Disparar las flechas inicialmente y al cambiar tamaño
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const scroller = document.querySelector('.mobile-rankings-nav-scroll');
        if (scroller) window.updateScrollArrows(scroller);
    }, 500);
});

window.addEventListener('resize', () => {
    const scroller = document.querySelector('.mobile-rankings-nav-scroll');
    if (scroller) window.updateScrollArrows(scroller);
});
