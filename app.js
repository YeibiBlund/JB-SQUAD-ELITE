// JB-SQUAD ELITE: Lógica de la aplicación
// Especialista en Diseño Premium Mobile-First

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración de Datos y Estado
    // 1. Configuración: Cargada desde js/config.js y js/state.js
    // El objeto 'state' y 'supabase' ya están disponibles globalmente.


    // 1. Constantes Globales (v56.0 - Base64 para evitar roturas de HTML)
    const neutralCrest = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2YwYTUwMCI+PHBhdGggZD0iTTEyIDlMMyA1djZjMCA1LjU1IDMuODQgMTAuNzQgOSAxMiA1LjE2LTEuMjYgOS02LjQ1IDktMTJWNWwtOS00em0wIDEwLjk5aDdjLS41MyA0LjEyLTMuMjggNy43OS03IDguOTRWMTJINVY2LjNsNy0zLjExdjguOHoiLz48L3N2Zz4=`;

    // 2. Elementos del DOM
    const views = document.querySelectorAll('.view');
    const navButtons = document.querySelectorAll('.nav-btn');
    const onboarding = document.getElementById('view-auth');
    const mainApp = document.getElementById('main-app');
    
    const playerForm = document.getElementById('player-form');
    const playerList = document.getElementById('player-list');
    
    const btnGoToAddPlayer = document.getElementById('btn-go-to-add-player');
    const btnBackToPlantilla = document.getElementById('btn-back-to-plantilla');

    const primaryPosSelect = document.getElementById('primaryPos');
    const secondaryPosSelects = document.querySelectorAll('.secondary-pos-select');

    // Tacticas Elements
    const tacticasList = document.getElementById('tacticas-list-view');
    const tacticasInitial = document.getElementById('tacticas-initial-selection');
    const tacticasField = document.getElementById('tacticas-field-view');
    const headerTacticInfo = document.getElementById('header-tactic-info');
    // Jornadas & Partidos Elements
    const sessionsList = document.getElementById('sessions-list');
    const matchesList = document.getElementById('matches-list');
    const sessionMgmtControls = document.getElementById('session-mgmt-controls');
    const sessionHistorySummary = document.getElementById('session-history-summary');
    const sessionMvpBanner = document.getElementById('session-mvp-banner');
    const sessionMvpName = document.getElementById('session-mvp-name');
    const sessionFinalizeContainer = document.getElementById('session-finalize-container');
    const btnNewSession = document.getElementById('btn-new-session');
    const btnAddMatch = document.getElementById('btn-add-match');
    const btnBackToSessions = document.getElementById('btn-back-to-sessions');
    const btnFinalizeSession = document.getElementById('btn-finalize-session');

    // Elementos Convocatorias v31.9.0
    const btnNewPoll = document.getElementById('btn-new-poll');
    const newPollContainer = document.getElementById('new-poll-form-container');
    const btnSavePoll = document.getElementById('btn-save-poll');
    const btnCancelPoll = document.getElementById('btn-cancel-poll');
    const activePollContainer = document.getElementById('active-poll-container');
    const pollHistoryList = document.getElementById('polls-history-list');
    const navPollBadge = document.getElementById('nav-poll-badge');

    
    // Live Match Elements
    const scoreHomeDisplay = document.getElementById('score-home');
    const scoreAwayDisplay = document.getElementById('score-away');
    const btnAddGoalHome = document.getElementById('btn-add-goal-home');
    const btnSubGoalHome = document.getElementById('btn-sub-goal-home');
    const btnAddGoalAway = document.getElementById('btn-add-goal-away');
    const btnSubGoalAway = document.getElementById('btn-sub-goal-away');
    const eventsContainer = document.getElementById('events-container');
    const btnFinishMatch = document.getElementById('btn-finish-match');
    
    // Modals
    const matchModal = document.getElementById('match-modal-overlay');
    const matchForm = document.getElementById('match-form');
    const closeMatchModal = document.getElementById('close-match-modal');
    
    const goalModal = document.getElementById('goal-modal-overlay');
    const closeGoalModal = document.getElementById('close-goal-modal');
    const btnSaveGoal = document.getElementById('btn-save-goal');
    const scorerSelection = document.getElementById('scorer-selection');
    const assistantSelection = document.getElementById('assistant-selection');

    const btnCreateTactic = document.getElementById('btn-create-tactic');
    const btnBackToTacticsList = document.getElementById('btn-back-to-tactics-list');
    const btnSaveTactic = document.getElementById('btn-save-tactic');
    const btnExportTactic = document.getElementById('btn-export-tactic');
    const btnSavePollAlignment = document.getElementById('btn-save-poll-alignment');
    const mobileBtnSavePollAlignment = document.getElementById('mobile-btn-save-poll-alignment');
    const savedTacticsList = document.getElementById('saved-tactics-list');
    const newTacticNameInput = document.getElementById('newTacticName');
    const btnExportSquad = document.getElementById('btn-export-squad');

    // Modal Exportación (v4.8.0)
    const exportTimeModal = document.getElementById('export-time-modal');
    const btnConfirmExport = document.getElementById('btn-confirm-export');
    const exportMatchTimeInput = document.getElementById('export-match-time');
    const closeExportTime = document.getElementById('close-export-time');

    // Modal Nueva Jornada
    const sessionStartModal = document.getElementById('session-start-modal');
    const btnConfirmSessionStart = document.getElementById('btn-confirm-session-start');
    const btnChangeSessionTactic = document.getElementById('btn-change-session-tactic');
    const closeSessionStart = document.getElementById('close-session-start');
    const sessionTacticName = document.getElementById('session-tactic-name');
    const scoreTeamName = document.getElementById('score-team-name');
    const scoreRivalName = document.getElementById('score-rival-name');

    // 2.3 Registro Interactivo (v56.7)
    let pendingScorerId = null;
    const quickGoalFab = document.getElementById('quick-goal-fab');
    const btnQuickNoAssistant = document.getElementById('btn-quick-no-assistant');
    const btnQuickCancel = document.getElementById('btn-quick-cancel');
    const quickGoalStatus = document.getElementById('quick-goal-status');

    const pitch = document.getElementById('football-pitch');
    const playerSelector = document.getElementById('player-selector-overlay');
    const selectorList = document.getElementById('selector-player-list');

    // 2.1 Estado del Calendario (v36.3)
    let currentCalendarDate = new Date();
    let currentSessionsCalendarDate = new Date(); // v52.0
    let currentPollsCalendarDate = new Date();    // v53.0
    
    // 2. Elementos Matchday Creator (v57.0)
    const btnCreateMatchdayGraphic = document.getElementById('btn-create-matchday-graphic');
    const viewMatchdayCreator = document.getElementById('view-matchday-creator');
    const btnBackFromCreator = document.getElementById('btn-back-from-creator');
    const matchdayMatchesConfig = document.getElementById('matchday-matches-config');
    const btnAddMatchToPoster = document.getElementById('btn-add-match-to-poster');
    const btnGeneratePoster = document.getElementById('btn-generate-poster');
    const miniPosterPreview = document.getElementById('mini-poster-preview');

    let matchdayPosterData = {
        matches: [{ id: Date.now(), rivalId: 'manual', rivalName: '', time: '23:00' }]
    };
    let globalTeamsList = [];

    // Listeners para Navegación del Calendario
    const btnCalPrev = document.getElementById('calendar-prev');
    const btnCalNext = document.getElementById('calendar-next');
    
    if (btnCalPrev) {
        btnCalPrev.onclick = () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            if (state.viewingPlayerForCalendar) {
                window.renderPlayerCalendar(state.viewingPlayerForCalendar);
            }
        };
    }
    if (btnCalNext) {
        btnCalNext.onclick = () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            if (state.viewingPlayerForCalendar) {
                window.renderPlayerCalendar(state.viewingPlayerForCalendar);
            }
        };
    }

    // Listeners para Navegación del Calendario de Jornadas (v52.0)
    const btnSessionsCalPrev = document.getElementById('sessions-calendar-prev');
    const btnSessionsCalNext = document.getElementById('sessions-calendar-next');
    if (btnSessionsCalPrev) {
        btnSessionsCalPrev.onclick = () => {
            currentSessionsCalendarDate.setMonth(currentSessionsCalendarDate.getMonth() - 1);
            window.renderSessionsCalendar();
        };
    }
    if (btnSessionsCalNext) {
        btnSessionsCalNext.onclick = () => {
            currentSessionsCalendarDate.setMonth(currentSessionsCalendarDate.getMonth() + 1);
            window.renderSessionsCalendar();
        };
    }

    // Listeners para Navegación del Calendario de Convocatorias (v53.0)
    const btnPollsCalPrev = document.getElementById('polls-calendar-prev');
    const btnPollsCalNext = document.getElementById('polls-calendar-next');
    if (btnPollsCalPrev) {
        btnPollsCalPrev.onclick = () => {
            currentPollsCalendarDate.setMonth(currentPollsCalendarDate.getMonth() - 1);
            renderPollsCalendar();
        };
    }
    if (btnPollsCalNext) {
        btnPollsCalNext.onclick = () => {
            currentPollsCalendarDate.setMonth(currentPollsCalendarDate.getMonth() + 1);
            renderPollsCalendar();
        };
    }

    let activeSlotId = null;
    let draggedSourceSlotId = null;
    let sortConfig = { key: 'primaryPos', desc: false };

    let currentMatch = null; // Objeto para el partido en vivo
    let selectedGoalScorerId = null;
    let selectedAssistantId = null;

    // Listeners for Elite Tabs (Mi Equipo)
    // Listeners for Elite Tabs (Mi Equipo)
    const teamTabs = document.querySelectorAll('#team-view-tabs .elite-tab-btn');
    const teamPanels = ['team-roster-panel', 'team-requests-panel', 'team-settings-panel'];
    
    teamTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            teamTabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            
            // Ocultar todos los paneles y mostrar el seleccionado
            teamPanels.forEach(pid => {
                const panel = document.getElementById(pid);
                if (panel) panel.style.display = pid === targetId ? 'block' : 'none';
            });

            // Si entramos en ajustes, cargar datos actuales en el formulario (v49.0)
            if (targetId === 'team-settings-panel' && typeof window.loadTeamSettingsIntoForm === 'function') {
                window.loadTeamSettingsIntoForm();
            }
        });
    });

    // --- VARIABLES DE ESTADO PARA FOTOS (v47.4) ---
    let currentPhotoBase64 = null; // Para previsualización rápida
    let selectedPhotoFile = null;  // Para subida real a Storage

    // 3. Inicialización (Estado migrado a js/state.js)
    init();

    async function init() {
        if (!supabase) return;
        console.log(">>> [BOOT v3.0] Iniciando arranque...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            await handleUserSession(session.user);
        } else {
            switchAuthView('auth');
            hideAppLoader();
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && !state.user) {
                if (session) await handleUserSession(session.user);
            } else if (event === 'SIGNED_OUT') {
                state.user = null;
                state.team = null;
                switchAuthView('auth');
            }
        });

        setupAuthHandlers();
    }



    window.updateTeamHeader = function() {
        const teamNameEl = document.getElementById('display-team-name');
        const userNameEl = document.getElementById('display-user-name');
        if (teamNameEl) {
            teamNameEl.textContent = state.team ? state.team.name.toUpperCase() : 'SIN EQUIPO';
        }
        if (userNameEl) {
            const username = state.user?.profile?.full_name || state.user?.profile?.username || 'JUGADOR';
            userNameEl.textContent = username.toUpperCase();
        }
    }

    window.applyRolePermissions = function() {
        if (!state.user) return;
        
        const role = (state.user.role || 'jugador').toLowerCase();
        const isAdmin = role === 'manager' || role === 'capitan';
        
        // --- RESTRICCIONES SIN CLUB (v47.2) ---
        const hasTeam = !!state.team;
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            const view = btn.dataset.view;
            // Solo dejamos "home" (Dashboard) y "my-profile" visibles sin club
            const isAllowedWithoutTeam = view === 'home' || view === 'my-profile';
            if (!hasTeam && !isAllowedWithoutTeam) {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'flex';
            }
        });

        // Elementos con roles requeridos
        document.querySelectorAll('[data-role-required]').forEach(el => {
            const requiredRoles = el.getAttribute('data-role-required').toLowerCase().split(',');
            const hasPermission = hasTeam && requiredRoles.includes(role);
            
            let displayType = 'block';
            if (el.id === 'btn-new-poll' || el.id === 'btn-mgmt-team-shortcut' || el.classList.contains('btn-gold')) {
                displayType = 'flex';
            }
            el.style.display = hasPermission ? displayType : 'none';
        });

        // Botón "Mi Ficha" — SIEMPRE visible
        const btnAddPlayer = document.getElementById('btn-go-to-add-player');
        if (btnAddPlayer) {
            btnAddPlayer.style.display = 'flex';
            const spanEl = btnAddPlayer.querySelector('span');
            if (spanEl) {
                spanEl.textContent = state.userPlayer ? 'EDITAR FICHA' : 'MI FICHA';
            }
        }
    }



    window.setupEventListeners = function() {
        // Mover los listeners aquí
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.onclick = () => switchView(btn.dataset.view);
        });
    }

    window.renderAvatarGallery = function() {
        const gallery = document.getElementById('avatar-gallery');
        if (!gallery) return;
        gallery.innerHTML = '';
        AVATARS.forEach(av => {
            const item = document.createElement('div');
            item.className = 'avatar-item' + (av.id === 1 ? ' selected' : '');
            item.innerHTML = av.svg;
            item.onclick = () => {
                document.querySelectorAll('.avatar-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                document.getElementById('selected-avatar-id').value = av.id;
                updatePlayerPreview(); // Actualización en vivo
            };
            gallery.appendChild(item);
        });
    }

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

        // --- RESTRICCIONES SIN CLUB (v47.2) ---
        const teamRestrictedViews = ['plantilla', 'tacticas', 'jornadas', 'convocatorias', 'mi-equipo'];
        if (!state.team && teamRestrictedViews.includes(viewId)) {
            window.jbToast('⏳ Esta sección se desbloqueará cuando seas aceptado en un club.', 'info');
            viewId = 'home';
        }

        views.forEach(v => v.classList.remove('active-view'));
        const targetView = document.getElementById(`view-${viewId}`);
        if (targetView) {
            targetView.classList.add('active-view');
            // Asegurar que si es el contenedor principal, se muestre sobre el !important del CSS inicial
            const mainApp = document.getElementById('main-app');
            if (mainApp) mainApp.style.setProperty('display', 'flex', 'important');
        }

        // Manejo específico de la vista de creador de Matchday (v57.0)
        if (viewId === 'matchday-creator') {
            if (typeof initMatchdayCreator === 'function') initMatchdayCreator();
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
            if (window.renderHomeDashboard) window.renderHomeDashboard();
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

        if (currentMatch.matchCondition === 'visitor') {
            // Somos Visitantes -> Rival (A) vs Nosotros (B)
            if (nameA) nameA.textContent = rivalName.toUpperCase();
            if (crestA) {
                crestA.src = rivalCrest;
                crestA.onerror = () => handleImageError(crestA);
            }
            if (nameB) nameB.textContent = myTeamName.toUpperCase();
            if (crestB) {
                crestB.src = myTeamCrest;
                crestB.onerror = () => handleImageError(crestB);
            }
            if (btnGoalHomeLabel) btnGoalHomeLabel.textContent = 'GOL ' + rivalName.substring(0,6).toUpperCase();
            if (btnGoalAwayLabel) btnGoalAwayLabel.textContent = '+ GOL ' + myTeamName.substring(0,6).toUpperCase();
        } else {
            // Somos Locales -> Nosotros (A) vs Rival (B)
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
        }

        scoreHomeDisplay.textContent = currentMatch.scoreHome;
        scoreAwayDisplay.textContent = currentMatch.scoreAway;

        const eventsContainer = document.getElementById('events-container');
        if (eventsContainer) {
            eventsContainer.innerHTML = '';
            currentMatch.events.forEach((ev, idx) => {
                const p = document.createElement('div');
                p.className = 'event-item fade-in';
                p.style.display = 'flex';
                p.style.justifyContent = 'space-between';
                p.style.marginBottom = '6px';
                p.style.padding = '4px 8px';
                p.style.background = 'rgba(255,255,255,0.03)';
                p.style.borderRadius = '4px';
                
                const scorer = getPlayerNameById(ev.scorerId);
                const assistant = getPlayerNameById(ev.assistantId);
                
                p.innerHTML = `
                    <span>⚽ <b>${scorer}</b>${assistant ? ' <span style="opacity:0.6; font-size:0.7rem;">(Asist: ' + assistant + ')</span>' : ''}</span>
                    <span style="opacity:0.5; font-size:0.7rem; cursor:pointer;" onclick="window.removeMatchEvent(${idx})">🗑️</span>
                `;
                eventsContainer.appendChild(p);
            });
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
    }

    // --- Lógica de Formularios ---
    window.populatePositionSelects = function() {
        const createOptions = (select) => {
            select.innerHTML = ''; // Limpiar antes de poblar (v47.4)
            POSITIONS.forEach(pos => {
                const opt = document.createElement('option');
                opt.value = pos;
                opt.textContent = pos;
                select.appendChild(opt);
            });
        };
        populatePositionSelects.done = true;
        if (primaryPosSelect) createOptions(primaryPosSelect);
        secondaryPosSelects.forEach(s => createOptions(s));
    }

    window.setupFormHandlers = function() {
        if (window._hasSetupForms) return;
        window._hasSetupForms = true;

        // Registro del Club
        // Fichaje de Jugador (Autogestión)
        playerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = e.target.querySelector('button');
            const playerName = document.getElementById('playerName').value.trim();
            const consoleID = document.getElementById('consoleID').value.trim();

            // Validación Proactiva Anti-XSS (v18.1.0)
            const xssPattern = /<[^>]*>?/gm;
            if (xssPattern.test(playerName) || xssPattern.test(consoleID)) {
                window.jbToast('Se han detectado caracteres no permitidos. Limpia los campos e inténtalo de nuevo.', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Guardando Ficha...';
            window.jbLoading.show('Guardando ficha...');

            const secondaryPositions = Array.from(secondaryPosSelects)
                .map(s => s.value)
                .filter(v => v !== "" && v !== primaryPosSelect.value);

            const targetPlayer = state.editingPlayer || state.userPlayer;
            const currentUserId = state.user.auth.id;
            let finalPhotoUrl = targetPlayer ? targetPlayer.photo_url : null;

            // --- LÓGICA DE SUBIDA A STORAGE (v47.4) ---
            if (selectedPhotoFile) {
                try {
                    console.log(">>> [STORAGE] Iniciando subida para archivo:", selectedPhotoFile.name);
                    submitBtn.textContent = 'Comprimiendo foto...';
                    const compressedBlob = await compressImage(selectedPhotoFile);
                    console.log(">>> [STORAGE] Foto comprimida. Tamaño:", (compressedBlob.size / 1024).toFixed(2), "KB");
                    
                    submitBtn.textContent = 'Subiendo foto...';
                    // IMPORTANTE: El nombre del archivo debe ser el ID del jugador, no el de quien edita
                    const playerFileName = targetPlayer ? targetPlayer.user_id : currentUserId;
                    const filePath = `players/${playerFileName}.jpg`;
                    
                    console.log(">>> [STORAGE] Subiendo a path:", filePath);
                    
                    // Subir archivo (sobrescribir si existe)
                    const { error: uploadErr } = await supabase.storage
                        .from('player_photos')
                        .upload(filePath, compressedBlob, {
                            contentType: 'image/jpeg',
                            upsert: true
                        });

                    if (uploadErr) {
                        console.error(">>> [STORAGE UPLOAD ERROR]:", uploadErr);
                        throw uploadErr;
                    }

                    // Obtener URL Pública
                    const { data: { publicUrl } } = supabase.storage
                        .from('player_photos')
                        .getPublicUrl(filePath);
                    
                    finalPhotoUrl = `${publicUrl}?t=${Date.now()}`; // Cache bust
                    console.log(">>> [STORAGE] Subida exitosa. URL:", finalPhotoUrl);
                    
                    // Resetear para evitar resubidas accidentales
                    selectedPhotoFile = null;
                } catch (err) {
                    console.error(">>> [STORAGE CATCH ERROR]:", err);
                    window.jbToast('Error al subir foto: ' + err.message, 'error');
                }
            }

            const newPlayer = {
                user_id: targetPlayer ? (targetPlayer.user_id || targetPlayer.id) : currentUserId,
                team_id: state.team ? state.team.id : null,
                name: document.getElementById('playerName').value,
                console_id: document.getElementById('consoleID').value,
                dorsal: document.getElementById('dorsal').value,
                primary_pos: primaryPosSelect.value,
                secondary_pos: [...new Set(secondaryPositions)].slice(0, 3),
                photo_url: finalPhotoUrl,
                photo_scale: parseFloat(document.getElementById('photoScale')?.value || 1.0),
                photo_x: parseInt(document.getElementById('photoX')?.value || 0),
                photo_y: parseInt(document.getElementById('photoY')?.value || 0),
                avatar_id: parseInt(document.getElementById('selected-avatar-id').value) || 1,
                stats: targetPlayer ? targetPlayer.stats : { 
                    official: { matches: 0, goals: 0, assists: 0, mvps: 0 },
                    friendly: { matches: 0, goals: 0, assists: 0, mvps: 0 }
                }
            };

            // Si estamos editando una ficha existente, incluir el ID
            if (targetPlayer && targetPlayer.id) {
                newPlayer.id = targetPlayer.id;
            }

            const { error: insErr } = await supabase
                .from('players')
                .upsert(newPlayer, { onConflict: 'user_id' });
            
            if (insErr) {
                window.jbToast('Error al guardar ficha: ' + insErr.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirmar Ficha';
                window.jbLoading.hide();
                return;
            }

            window.jbLoading.hide();
            window.jbToast('¡Ficha actualizada con éxito!', 'success');
            submitBtn.disabled = false;
            submitBtn.textContent = 'CONFIRMAR FICHA';
            await loadTeamData();
            switchView('my-profile');
        });

        // Listeners para Foto y Escalado/Posición
        const photoInput = document.getElementById('playerPhoto');
        const scaleInput = document.getElementById('photoScale');
        const xInput = document.getElementById('photoX');
        const yInput = document.getElementById('photoY');

        if (photoInput) {
            photoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    selectedPhotoFile = file; // Guardar archivo real (v47.4)
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        currentPhotoBase64 = event.target.result;
                        updatePlayerPreview();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        [scaleInput, xInput, yInput].forEach(input => {
            if (input) {
                input.addEventListener('input', (e) => {
                    const id = e.target.id;
                    const val = e.target.value;
                    if (id === 'photoScale') document.getElementById('photo-scale-value').textContent = parseFloat(val).toFixed(2);
                    else if (id === 'photoX') document.getElementById('photo-x-value').textContent = val;
                    else if (id === 'photoY') document.getElementById('photo-y-value').textContent = val;
                    updatePlayerPreview();
                });
            }
        });

        // Listeners para Previsualización en Vivo
        ['playerName', 'dorsal', 'primaryPos'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', updatePlayerPreview);
        });
    }

    /**
     * Comprime una imagen usando Canvas para ahorrar ancho de banda.
     */
    async function compressImage(file, maxWidth = 800) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/jpeg', 0.7); // 70% calidad
                };
            };
        });
    }

    // --- Renderizado de Jugadores y Tabla ---

    function sortPlayersData(playersArray) {
        const positionOrder = ['POR', 'DFC', 'LD', 'CAD', 'LI', 'CAI', 'MCD', 'MC', 'MVI', 'MVD', 'MD', 'MI', 'MCO', 'EI', 'ED', 'DC'];

        return playersArray.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            
            if (sortConfig.key === 'primaryPos') {
                const indexA = positionOrder.indexOf(valA?.toUpperCase());
                const indexB = positionOrder.indexOf(valB?.toUpperCase());
                
                const rankA = indexA === -1 ? 999 : indexA;
                const rankB = indexB === -1 ? 999 : indexB;
                
                return sortConfig.desc ? (rankB - rankA) : (rankA - rankB);
            }

            // Mapear claves de stats a la nueva estructura oficial
            if (['matches', 'goals', 'assists', 'mvps'].includes(sortConfig.key)) {
                valA = a.stats.official[sortConfig.key] || 0;
                valB = b.stats.official[sortConfig.key] || 0;
            }

            if (['matches', 'goals', 'assists', 'dorsal', 'mvps'].includes(sortConfig.key)) {
                valA = parseInt(valA) || 0;
                valB = parseInt(valB) || 0;
            } else {
                valA = (valA || '').toString().toLowerCase();
                valB = (valB || '').toString().toLowerCase();
            }
            
            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortConfig.desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
            }
            return sortConfig.desc ? (valB - valA) : (valA - valB);
        });
    }

    window.setupTableSorting = function() {
        if (window._hasSetupSorting) return;
        window._hasSetupSorting = true;

        document.querySelectorAll('.th-sortable').forEach(th => {
            th.addEventListener('click', () => {
                const key = th.getAttribute('data-sort');
                if (sortConfig.key === key) {
                    sortConfig.desc = !sortConfig.desc;
                } else {
                    sortConfig.key = key;
                    sortConfig.desc = false;
                }
                renderPlayers();
            });
        });
    }

    function updateSortHeaders() {
        document.querySelectorAll('.th-sortable').forEach(th => {
            let originalText = th.innerText.replace(' ▲', '').replace(' ▼', '');
            if (th.getAttribute('data-sort') === sortConfig.key) {
                originalText += sortConfig.desc ? ' ▼' : ' ▲';
            }
            th.innerText = originalText;
        });
    }

    window.renderPlayers = function() {
        playerList.innerHTML = '';
        
        if (state.players.length === 0) {
            playerList.innerHTML = `
                <div class="card-elite" style="text-align: center; opacity: 0.5; padding: 40px; border:none; background:transparent;">
                    <p style="font-size: 2rem; margin-bottom: 10px;">📉</p>
                    <p>TU TABLA DE PLANTILLA ESTÁ VACÍA</p>
                    <p style="font-size: 0.7rem;">COMIENZA A FICHAR AHORA</p>
                </div>
            `;
            return;
        }

        const sortedPlayers = sortPlayersData([...state.players]);

        sortedPlayers.forEach(player => {
            const playerRow = document.createElement('div');
            playerRow.className = 'player-table-row fade-in';
            playerRow.style.cursor = 'pointer';
            playerRow.onclick = (e) => {
                // No abrir perfil si se pulsa el botón de borrar
                if (e.target.closest('button')) return;
                viewPlayerProfileDetail(player.id);
            };
            const badgeColor = getPositionColorClass(player.primaryPos);
            
            const pj = player.stats?.official?.matches || 0;
            const gl = player.stats?.official?.goals || 0;
            const ast = player.stats?.official?.assists || 0;
            const avatar = AVATARS.find(av => av.id === (player.avatarId || player.avatar_id || 1));
            const photo = player.photo_url;
            const transform = getPlayerTransform(player);

            const isAdmin = state.user.role === 'manager' || state.user.role === 'capitan';
            const isSelf = player.user_id === state.user.auth.id;

            playerRow.innerHTML = `
                <div class="player-avatar-mini" style="width: 35px; height: 35px; margin: 0 auto; background: rgba(0,0,0,0.2); border-radius: 5px; border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center; padding: 2px; overflow: hidden;">
                    ${photo ? `<img src="${photo}" style="width:100%; height:100%; object-fit:cover; object-position: top; transform:${transform}">` : (avatar ? avatar.svg : '')}
                </div>
                <div style="display:flex; flex-direction:column; justify-content:center; overflow:hidden;">
                    <div style="display: flex; align-items: center; gap: 6px; overflow:hidden;">
                        <span class="player-pos-badge ${badgeColor}" style="font-size: 0.55rem; padding: 1px 4px; border-radius: 3px; min-width: 25px;">${player.primaryPos || 'NA'}</span>
                        <span style="font-weight: 800; font-size: 0.85rem; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${player.name ? escapeHTML(player.name.toUpperCase()) : 'DESCONOCIDO'}</span>
                    </div>
                    <span style="font-size: 0.6rem; color: var(--text-muted); margin-top:1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${escapeHTML(player.consoleID || '')} | <span title="Goles Amistosos">${player.stats?.friendly?.goals || 0} G(A)</span>
                    </span>
                </div>
                <div class="stat-cell cell-center" style="font-size: 0.8rem;">${pj}</div>
                <div class="stat-cell cell-center" style="font-size: 0.8rem;">${gl}</div>
                <div class="stat-cell cell-center" style="font-size: 0.8rem;">${ast}</div>
                <div style="display: flex; justify-content: flex-end;">
                    ${(isAdmin || isSelf) ? `<button class="btn-delete-row" title="Abandonar/Expulsar" onclick="window.confirmDelete('${player.id}')">🗑️</button>` : ''}
                </div>
            `;
            playerList.appendChild(playerRow);
        });
        
        updateSortHeaders();
    }

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
        const activeTactic = forcedTactic || state.savedTactics.find(t => t.id === state.activeTacticId);
        if (!activeTactic) return handleTacticViewDisplay();

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
            
            const assignedPlayerId = activeTactic.assignments[slot.id];
            const player = state.players.find(p => p.id == assignedPlayerId);

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

    // --- LÓGICA DE JORNADAS Y PARTIDOS ---
    window.setupSessionHandlers = function() {
        if (window._hasSetupSession) return;
        window._hasSetupSession = true;
        
        let lastFetchedPolls = []; 
        let globalLeagues = [];
        let globalTeams = [];
        let currentMatchCondition = 'local'; // local o visitor

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
            currentMatchCondition = 'local';
            if (btnSetLocal) btnSetLocal.classList.add('active');
            if (btnSetVisitor) btnSetVisitor.classList.remove('active');
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

        if (rivalSelect) {
            rivalSelect.onchange = () => {
                manualRivalContainer.style.display = rivalSelect.value === 'manual' ? 'block' : 'none';
            };
        }

        if (btnSetLocal) {
            btnSetLocal.onclick = () => {
                currentMatchCondition = 'local';
                btnSetLocal.classList.add('active');
                btnSetVisitor.classList.remove('active');
            };
        }
        if (btnSetVisitor) {
            btnSetVisitor.onclick = () => {
                currentMatchCondition = 'visitor';
                btnSetVisitor.classList.add('active');
                btnSetLocal.classList.remove('active');
            };
        }

        closeMatchModal.onclick = () => matchModal.style.display = 'none';

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
            window.startLiveMatch(rivalName, type, rivalCrest, currentMatchCondition);
            
            matchModal.style.display = 'none';
            matchForm.reset();
        });

        // Controles de partido en vivo (v55.0 - Dinámicos)
        btnAddGoalHome.addEventListener('click', () => {
            const isClub = currentMatch.matchCondition === 'local';
            if (isClub) openGoalModal('home');
            else {
                currentMatch.scoreHome++;
                updateLiveMatchUI();
            }
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
            const isClub = currentMatch.matchCondition === 'visitor';
            if (isClub) openGoalModal('away');
            else {
                currentMatch.scoreAway++;
                updateLiveMatchUI();
            }
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
                            official: { goals: 0, assists: 0, matches: 0, wins: 0, mvps: 0 },
                            friendly: { goals: 0, assists: 0, matches: 0, wins: 0, mvps: 0 }
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
                
                daySessions.forEach(s => {
                    const wins = s.matches.filter(m => m.scoreHome > m.scoreAway).length;
                    const losses = s.matches.filter(m => m.scoreHome < m.scoreAway).length;
                    totalWins += wins;
                    totalLosses += losses;
                });
                
                cell.classList.add('day-played');
                if (totalWins > totalLosses) cell.classList.add('day-win');
                else if (totalLosses > totalWins) cell.classList.add('day-loss');
                else cell.classList.add('day-draw');
                
                cell.onclick = () => window.renderSessionDayDetails(dateString, daySessions);
            }
            
            cell.innerHTML = `<span class="calendar-day-number">${d}</span>`;
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

    window.renderSessionDayDetails = function(dateString, sessions) {
        const details = document.getElementById('sessions-day-details');
        const label = document.getElementById('selected-day-label');
        const container = document.getElementById('sessions-day-matches-list');
        if (!details || !label || !container) return;

        details.style.display = 'block';
        
        // Formatear fecha para el label
        const dateObj = new Date(dateString);
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();
        const formattedDate = `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
        
        label.textContent = `PARTIDOS DEL ${formattedDate}`;
        container.innerHTML = '';

        sessions.forEach(session => {
            const sessionCard = document.createElement('div');
            sessionCard.className = 'card-elite';
            sessionCard.style.padding = '20px';
            sessionCard.style.background = 'rgba(255,255,255,0.02)';
            sessionCard.style.border = '1px solid rgba(255,255,255,0.05)';
            
            const isActive = state.activeSession && session.id === state.activeSession.id;
            
            let matchesHtml = session.matches.map(m => {
                const homeGoals = m.events ? m.events.filter(e => e.side === 'home') : [];
                const awayGoals = m.events ? m.events.filter(e => e.side === 'away') : [];

                return `
                    <div class="match-detail-item" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding: 15px 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-weight: 800; color: var(--primary); font-size: 0.7rem; width: 35%;">${state.team.name.toUpperCase()}</span>
                            <div style="font-size: 1.1rem; font-weight: 900; letter-spacing: 3px; width: 30%; text-align: center;">
                                ${m.scoreHome} - ${m.scoreAway}
                            </div>
                            <span style="font-weight: 800; color: var(--error); font-size: 0.7rem; width: 35%; text-align: right;">${m.rival.toUpperCase()}</span>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 10px;">
                            ${homeGoals.length > 0 ? homeGoals.map(g => `
                                <div style="font-size: 0.65rem; display: flex; align-items: center; gap: 8px;">
                                    <span style="color: var(--primary); font-size: 0.8rem;">⚽</span>
                                    <span style="font-weight: 700;">${window.getPlayerNameById(g.scorerId)}</span>
                                    ${g.assistantId ? `<span style="opacity: 0.5;">(Asist: ${window.getPlayerNameById(g.assistantId)})</span>` : ''}
                                </div>
                            `).join('') : ''}
                        </div>
                    </div>
                `;
            }).join('');

            if (session.matches.length === 0) {
                matchesHtml = '<p style="text-align: center; opacity: 0.4; font-size: 0.7rem; padding: 20px;">No hay partidos registrados.</p>';
            }

            const isAdmin = state.user.role === 'manager' || state.user.role === 'capitan';

            sessionCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div>
                        <span class="badge" style="background: ${session.type === 'official' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}; color: ${session.type === 'official' ? '#000' : '#fff'}; font-size: 0.55rem; padding: 2px 8px; border-radius: 4px; font-weight: 900;">
                            ${session.type === 'official' ? 'OFICIAL' : 'AMISTOSO'}
                        </span>
                        ${isActive ? '<span class="badge-live" style="margin-left: 5px;">LIVE</span>' : ''}
                    </div>
                    ${isAdmin ? `<button class="btn-delete-session-icon" style="background: transparent; border: none; cursor: pointer; opacity: 0.5; transition: 0.3s;" title="Eliminar Jornada">🗑️</button>` : ''}
                </div>
                <div class="matches-container">
                    ${matchesHtml}
                </div>
                ${session.mvpId ? `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.55rem; color: var(--text-muted); letter-spacing: 1px; font-weight: 800;">MVP</span>
                        <span style="color: var(--primary); font-weight: 900; font-size: 0.75rem;">${window.getPlayerNameById(session.mvpId)}</span>
                    </div>
                ` : ''}
                <button class="btn-view-details" style="width: 100%; margin-top: 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; cursor: pointer; transition: 0.3s;">
                    ${isActive ? 'CONTINUAR JORNADA' : 'VER RESUMEN COMPLETO'}
                </button>
            `;

            if (isAdmin) {
                const btnDel = sessionCard.querySelector('.btn-delete-session-icon');
                btnDel.onmouseover = () => btnDel.style.opacity = '1';
                btnDel.onmouseout = () => btnDel.style.opacity = '0.5';
                btnDel.onclick = (e) => {
                    e.stopPropagation();
                    window.handleDeleteSession(session);
                };
            }

            const btnView = sessionCard.querySelector('.btn-view-details');
            btnView.onmouseover = () => {
                btnView.style.background = 'var(--primary)';
                btnView.style.color = '#000';
            };
            btnView.onmouseout = () => {
                btnView.style.background = 'rgba(255,255,255,0.05)';
                btnView.style.color = '#fff';
            };
            btnView.onclick = () => {
                if (isActive) window.resumeActiveSession();
                else window.renderActiveSession(session);
            };

            container.appendChild(sessionCard);
        });

        // Scroll suave hasta los detalles
        details.scrollIntoView({ behavior: 'smooth' });
    }

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
                for (let playerId of match.lineup) {
                    const player = state.players.find(p => p.id.toString() === playerId.toString());
                    if (player && player.stats?.[mType]) {
                        player.stats[mType].matches = Math.max(0, player.stats[mType].matches - 1);
                        if (isWin) {
                            player.stats[mType].wins = Math.max(0, (player.stats[mType].wins || 0) - 1);
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

            const isVisitor = match.matchCondition === 'visitor';
            const myTeamName = (state.team && state.team.name) ? state.team.name : 'MI CLUB';
            const myTeamCrest = (state.team && state.team.crest_url) ? state.team.crest_url : neutralCrest;
            const rivalName = match.rival || 'RIVAL';
            const rivalCrest = match.rivalCrest || neutralCrest;

            const nameLocal = isVisitor ? rivalName : myTeamName;
            const crestLocal = isVisitor ? rivalCrest : myTeamCrest;
            const nameVisitor = isVisitor ? myTeamName : rivalName;
            const crestVisitor = isVisitor ? myTeamCrest : rivalCrest;

            card.innerHTML = `
                <div class="match-card-main" style="display: flex; flex-direction: column; gap: 12px; padding: 10px 0;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 5px;">
                        <span class="${typeClass}" style="font-size: 0.5rem; letter-spacing: 1px;">${match.type.toUpperCase()}</span>
                    </div>
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                        <!-- LOCAL -->
                        <div style="flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 10px; text-align: right;">
                            <span style="font-size: 0.75rem; font-weight: 800; color: ${isVisitor ? 'var(--primary)' : '#fff'};">${nameLocal.toUpperCase()}</span>
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
                            <span style="font-size: 0.75rem; font-weight: 800; color: ${!isVisitor ? 'var(--primary)' : '#fff'};">${nameVisitor.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                ${eventsHTML}
            `;
            matchesList.appendChild(card);
        });
    }

    window.startLiveMatch = function(rival, type, rivalCrest = null, matchCondition = 'local') {
        currentMatch = {
            id: Date.now(),
            rival: rival,
            rivalCrest: rivalCrest, // v55.0
            matchCondition: matchCondition, // local o visitor
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

    let selectedGoalSide = 'home'; // v55.0

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
            if (!p.stats) p.stats = { official: { goals: 0, assists: 0, matches: 0, wins: 0 }, friendly: { goals: 0, assists: 0, matches: 0, wins: 0 } };
            if (!p.stats.official) p.stats.official = { goals: 0, assists: 0, matches: 0, wins: 0 };
            if (!p.stats.friendly) p.stats.friendly = { goals: 0, assists: 0, matches: 0, wins: 0 };

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
                    playersToSave.add(p);
                    console.log(`>>> [STATS] PJ sumado a: ${p.name}`);
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
        
        renderSessions();
        renderPlayers();
        switchView('jornadas');
    }


    // --- FUNCIONES DE PERFIL ELITE ---


    function updatePlayerPreview() {
        const previewContainer = document.getElementById('live-player-preview');
        if (!previewContainer) return;
        
        const targetPlayerForStats = state.editingPlayer || state.userPlayer;
        if (targetPlayerForStats) renderPlayerStats(targetPlayerForStats);

        const name = document.getElementById('playerName').value || 'TU NOMBRE';
        const dorsal = document.getElementById('dorsal').value || '00';
        const pos = document.getElementById('primaryPos').value || '??';
        
        const transform = getPlayerTransform({
            photo_scale: parseFloat(document.getElementById('photoScale')?.value || 1.0),
            photo_x: parseInt(document.getElementById('photoX')?.value || 0),
            photo_y: parseInt(document.getElementById('photoY')?.value || 0)
        });
        
        // Prioridad: Foto recién subida > Foto del jugador en edición > Avatar
        const targetPlayer = state.editingPlayer || state.userPlayer;
        const photo = currentPhotoBase64 || (targetPlayer ? targetPlayer.photo_url : null);
        const avatarId = parseInt(document.getElementById('selected-avatar-id').value) || 1;
        const avatar = AVATARS.find(av => av.id === avatarId);

        previewContainer.className = 'player-card-fut large pulse-border';
        previewContainer.innerHTML = `
            <div class="dorsal-large">${dorsal}</div>
            <div class="pos-large">${pos}</div>
            <div class="player-img-large">
                ${photo ? `<img src="${photo}" style="transform: ${transform}; object-position: top;">` : (avatar ? avatar.svg : '')}
            </div>
            <div class="name-banner-large">
                <h2 style="font-size: ${name.length > 10 ? '1.1rem' : '1.5rem'}">${name.toUpperCase()}</h2>
            </div>
        `;
    }

    window.viewPlayerProfileDetail = function(playerId) {
        const player = state.players.find(p => p.id === playerId);
        if (!player) return;

        // Actualizar título dinámico
        const titleEl = document.getElementById('profile-header-title');
        if (titleEl) {
            const isMe = state.userPlayer && state.userPlayer.id === player.id;
            titleEl.innerHTML = isMe ? `Mi <span class="gradient-text">Perfil Elite</span>` : `Perfil | <span class="gradient-text">${escapeHTML(player.name.toUpperCase())}</span>`;
        }

        // Control de permisos para el botón Editar
        const btnEdit = document.getElementById('btn-edit-my-ficha');
        if (btnEdit) {
            // Solo manager puede editar otros perfiles. El dueño también puede editar el suyo.
            const isAdmin = state.user.role === 'manager';
            const isSelf = state.userPlayer && state.userPlayer.id === player.id;
            
            if (isAdmin || isSelf) {
                btnEdit.style.display = 'block';
                // Asegurarnos de que el botón de editar sepa qué jugador editar
                btnEdit.onclick = () => {
                    populatePlayerForm(player);
                    switchView('add-player');
                };
            } else {
                btnEdit.style.display = 'none';
            }
        }

        renderPlayerProfileDetail(player);
        switchView('my-profile');
    }

    function renderPlayerProfileDetail(player) {
        if (!player) return;
        const profileCard = document.getElementById('my-profile-card');
        const profileConsoleId = document.getElementById('profile-console-id');
        const secondaryPosContainer = document.getElementById('profile-secondary-pos');

        if (profileConsoleId) profileConsoleId.textContent = (player.consoleID || player.console_id || '-').toUpperCase();
        
        // Renderizar Tarjeta
        if (profileCard) {
            const avatar = AVATARS.find(av => av.id === (player.avatarID || player.avatar_id || 1));
            const photo = player.photo_url;
            const transform = getPlayerTransform(player);
            const name = player.name || 'SIN NOMBRE';

            profileCard.innerHTML = `
                <div class="dorsal-large">${player.dorsal || '00'}</div>
                <div class="pos-large">${player.primaryPos || '??'}</div>
                <div class="player-img-large">
                    ${photo ? `<img src="${photo}" style="transform: ${transform}; object-position: top;">` : (avatar ? avatar.svg : '')}
                </div>
                <div class="name-banner-large">
                    <h2 style="font-size: ${(player.name || '').length > 10 ? '1.1rem' : '1.5rem'}">${escapeHTML((player.name || 'JUGADOR').toUpperCase())}</h2>
                </div>
            `;
        }

        // Renderizar Posiciones Secundarias
        if (secondaryPosContainer) {
            secondaryPosContainer.innerHTML = '';
            const secondaries = player.secondaryPos || player.secondary_pos || [];
            if (secondaries.length === 0) {
                secondaryPosContainer.innerHTML = '<p style="font-size:0.7rem; opacity:0.5;">SIN POSICIONES ADICIONALES</p>';
            } else {
                secondaries.forEach(pos => {
                    const badge = document.createElement('span');
                    badge.className = 'secondary-pos-badge active';
                    badge.textContent = pos;
                    secondaryPosContainer.appendChild(badge);
                });
            }
        }

        renderPlayerStats(player);
        
        // Cargar Calendario (v36.3) - Seguridad de Privacidad
        const attendanceContainer = document.getElementById('profile-attendance-container');
        const isAdmin = state.user?.role === 'manager' || state.user?.role === 'capitan';
        const isSelf = player.user_id === state.user?.auth?.id;

        if (attendanceContainer) {
            if (isAdmin || isSelf) {
                attendanceContainer.style.display = 'block';
                state.viewingPlayerForCalendar = player;
                currentCalendarDate = new Date(); // Resetear al mes actual al abrir nuevo perfil
                window.renderPlayerCalendar(player);
            } else {
                attendanceContainer.style.display = 'none';
            }
        }
    }

    function populatePlayerForm(player) {
        if (!player) {
            state.editingPlayer = null;
            currentPhotoBase64 = null;
            return;
        }
        
        // Establecer estado de edición
        state.editingPlayer = player;
        currentPhotoBase64 = null; // Resetear carga temporal al abrir ficha nueva
        
        document.getElementById('playerName').value = player.name || '';
        document.getElementById('consoleID').value = player.consoleID || player.console_id || '';
        document.getElementById('dorsal').value = player.dorsal || '';
        document.getElementById('primaryPos').value = (player.primaryPos || player.primary_pos || '');
        document.getElementById('selected-avatar-id').value = player.avatarID || player.avatar_id || 1;
        document.getElementById('photoScale').value = player.photo_scale || 1.0;
        document.getElementById('photo-scale-value').textContent = (player.photo_scale || 1.0).toFixed(2);
        
        const photoX = document.getElementById('photoX');
        const photoY = document.getElementById('photoY');
        if (photoX) {
            photoX.value = player.photo_x || 0;
            document.getElementById('photo-x-value').textContent = player.photo_x || 0;
        }
        if (photoY) {
            photoY.value = player.photo_y || 0;
            document.getElementById('photo-y-value').textContent = player.photo_y || 0;
        }
        
        // Posiciones secundarias
        const secondaries = player.secondaryPos || player.secondary_pos || [];
        secondaryPosSelects.forEach((select, i) => {
            select.value = secondaries[i] || '';
        });

        // Disparar preview
        updatePlayerPreview();
    }

    function renderPlayerStats(player) {
        const tbody = document.getElementById('profile-stats-body');
        const tfooter = document.getElementById('profile-stats-footer');
        if (!tbody || !player) return;

        const stats = player.stats || {
            official: { goals: 0, assists: 0, matches: 0 },
            friendly: { goals: 0, assists: 0, matches: 0 }
        };
        const mvp = player.mvp_count || 0;

        const off = stats.official || { goals: 0, assists: 0, matches: 0, wins: 0 };
        const fri = stats.friendly || { goals: 0, assists: 0, matches: 0, wins: 0 };

        // Lógica de privacidad: ¿Puede ver el porcentaje de victorias?
        const isManagerOrCap = state.user && (state.user.role === 'manager' || state.user.role === 'capitan');
        const isSelf = state.user && player.user_id === state.user.auth.id;
        const canViewWinRate = isManagerOrCap || isSelf;

        const calcWinRate = (matches, wins) => {
            if (!matches || matches === 0) return '0.0%';
            return ((wins || 0) / matches * 100).toFixed(1) + '%';
        };

        const offWinRate = canViewWinRate ? calcWinRate(off.matches, off.wins) : '<span title="Confidencial">🔒</span>';
        const friWinRate = canViewWinRate ? calcWinRate(fri.matches, fri.wins) : '<span title="Confidencial">🔒</span>';

        tbody.innerHTML = `
            <tr class="row-official">
                <td><span class="stat-category-tag tag-off">OFICIAL</span></td>
                <td>${off.matches || 0}</td>
                <td>${off.goals || 0}</td>
                <td>${off.assists || 0}</td>
                <td style="font-weight: 800;">${offWinRate}</td>
                <td>-</td>
            </tr>
            <tr class="row-friendly">
                <td><span class="stat-category-tag tag-fri">AMISTOSO</span></td>
                <td>${fri.matches || 0}</td>
                <td>${fri.goals || 0}</td>
                <td>${fri.assists || 0}</td>
                <td style="font-weight: 800;">${friWinRate}</td>
                <td>-</td>
            </tr>
        `;

        const totalPJ = (off.matches || 0) + (fri.matches || 0);
        const totalG = (off.goals || 0) + (fri.goals || 0);
        const totalA = (off.assists || 0) + (fri.assists || 0);
        const totalW = (off.wins || 0) + (fri.wins || 0);
        const totalWinRate = canViewWinRate ? calcWinRate(totalPJ, totalW) : '<span title="Confidencial">🔒</span>';

        tfooter.innerHTML = `
            <td>TOTAL TEMPORADA</td>
            <td>${totalPJ}</td>
            <td>${totalG}</td>
            <td>${totalA}</td>
            <td style="font-weight: 800; color: var(--primary);">${totalWinRate}</td>
            <td style="color:var(--primary); font-weight:900;">⭐ ${mvp}</td>
        `;
    }

    // --- LÓGICA DEL CREADOR DE CARTELES MATCHDAY (v57.0) ---

    async function initMatchdayCreator() {
        window.jbLoading.show('Cargando equipos...');
        globalTeamsList = await fetchGlobalTeams();
        window.jbLoading.hide();
        renderMatchdayConfig();
        updatePosterPreview();
    }

    function renderMatchdayConfig() {
        if (!matchdayMatchesConfig) return;
        matchdayMatchesConfig.innerHTML = '';
        
        matchdayPosterData.matches.forEach((m, idx) => {
            const row = document.createElement('div');
            row.className = 'matchday-row-config fade-in';
            
            // Selector de Rival
            let rivalOptions = `<option value="manual" ${m.rivalId === 'manual' ? 'selected' : ''}>-- INTRODUCIR MANUAL --</option>`;
            globalTeamsList.forEach(team => {
                rivalOptions += `<option value="${team.id}" ${m.rivalId === team.id ? 'selected' : ''}>${team.name.toUpperCase()}</option>`;
            });

            row.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <label style="font-size: 0.6rem; opacity: 0.6;">RIVAL</label>
                    <select class="match-rival-select" data-idx="${idx}" style="width: 100%;">
                        ${rivalOptions}
                    </select>
                    ${m.rivalId === 'manual' ? `<input type="text" class="match-manual-name" data-idx="${idx}" value="${m.rivalName}" placeholder="Nombre del rival..." style="margin-top:5px;">` : ''}
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <label style="font-size: 0.6rem; opacity: 0.6;">HORA</label>
                    <input type="time" class="match-time-input" data-idx="${idx}" value="${m.time}">
                </div>
                <button class="btn-delete-row" onclick="window.removeMatchFromPoster(${idx})" style="margin-bottom: 5px;">🗑️</button>
            `;

            // Events
            const select = row.querySelector('.match-rival-select');
            select.onchange = (e) => {
                matchdayPosterData.matches[idx].rivalId = e.target.value;
                if (e.target.value !== 'manual') {
                    const team = globalTeamsList.find(t => t.id === e.target.value);
                    matchdayPosterData.matches[idx].rivalName = team ? team.name : '';
                }
                renderMatchdayConfig();
                updatePosterPreview();
            };

            const nameInput = row.querySelector('.match-manual-name');
            if (nameInput) {
                nameInput.oninput = (e) => {
                    matchdayPosterData.matches[idx].rivalName = e.target.value;
                    updatePosterPreview();
                };
            }

            const timeInput = row.querySelector('.match-time-input');
            timeInput.oninput = (e) => {
                matchdayPosterData.matches[idx].time = e.target.value;
                updatePosterPreview();
            };

            matchdayMatchesConfig.appendChild(row);
        });
    }

    function addMatchToPoster() {
        if (matchdayPosterData.matches.length >= 3) {
            window.jbToast('Máximo 3 partidos por cartel.', 'warning');
            return;
        }
        matchdayPosterData.matches.push({ id: Date.now(), rivalId: 'manual', rivalName: '', time: '23:00' });
        renderMatchdayConfig();
        updatePosterPreview();
    }

    window.removeMatchFromPoster = function(idx) {
        if (matchdayPosterData.matches.length <= 1) {
            window.jbToast('Debe haber al menos un partido.', 'info');
            return;
        }
        matchdayPosterData.matches.splice(idx, 1);
        renderMatchdayConfig();
        updatePosterPreview();
    };

    function updatePosterPreview() {
        if (!miniPosterPreview) return;
        
        // Generar el HTML del cartel
        const html = generatePosterHTML();
        miniPosterPreview.innerHTML = html;
        
        // También actualizar el área de captura real
        const captureArea = document.getElementById('matchday-poster-capture-area');
        if (captureArea) captureArea.innerHTML = html;
    }

    function generatePosterHTML() {
        const teamName = (state.team?.name || 'Mi Club').toUpperCase();
        const teamCrest = state.team?.crest_url || neutralCrest;
        const twitter = state.team?.socials?.twitter || '';
        const twitch = state.team?.socials?.twitch || '';

        let matchesHtml = '';
        matchdayPosterData.matches.forEach(m => {
            let rivalCrestHtml = '';
            if (m.rivalId === 'manual') {
                const initials = (m.rivalName || 'R').substring(0, 2).toUpperCase();
                rivalCrestHtml = `<div class="poster-generic-crest-elite">${initials}</div>`;
            } else {
                const team = globalTeamsList.find(t => t.id === m.rivalId);
                const crest = team?.crest_url || neutralCrest;
                rivalCrestHtml = `<img src="${crest}" class="poster-crest-img" crossOrigin="anonymous">`;
            }

            matchesHtml += `
                <div class="poster-match-card">
                    <div class="poster-team-bundle">
                        <div class="poster-crest-container">
                            <img src="${teamCrest}" class="poster-crest-img" crossOrigin="anonymous">
                        </div>
                        <div class="poster-team-name">${teamName}</div>
                    </div>
                    
                    <div class="poster-vs-box">
                        <div class="poster-time-label">${m.time}</div>
                        <div class="poster-vs-text">VS</div>
                    </div>

                    <div class="poster-team-bundle">
                        <div class="poster-crest-container">
                            ${rivalCrestHtml}
                        </div>
                        <div class="poster-team-name">${(m.rivalName || 'RIVAL').toUpperCase()}</div>
                    </div>
                </div>
            `;
        });

        return `
            <div class="poster-header">
                <div class="poster-title">MATCHDAY</div>
                <div class="poster-subtitle">ESTA NOCHE</div>
            </div>
            
            <div class="poster-matches-list">
                ${matchesHtml}
            </div>

            <div class="poster-footer">
                <div class="poster-footer-club">JB-SQUAD ELITE SYSTEM</div>
                <div class="poster-footer-social">
                    ${twitter ? `<div class="poster-social-item"><span>𝕏</span> @${twitter.toUpperCase()}</div>` : ''}
                    ${twitch ? `<div class="poster-social-item"><span>🎮</span> ${twitch.toUpperCase()}</div>` : ''}
                </div>
            </div>
        `;
    }

    async function exportMatchdayImage() {
        window.jbLoading.show('Generando imagen...');
        
        // Asegurar que el área de captura esté actualizada
        updatePosterPreview();
        
        const captureArea = document.getElementById('matchday-poster-capture-area');
        
        try {
            // Esperar un poco para asegurar carga de imágenes
            await new Promise(r => setTimeout(r, 1000));
            
            const canvas = await html2canvas(captureArea, {
                useCORS: true,
                allowTaint: true,
                scale: 1, // 1080x1350 es suficiente
                backgroundColor: '#050505'
            });

            const link = document.createElement('a');
            link.download = `MATCHDAY_${new Date().toISOString().split('T')[0]}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
            
            window.jbToast('¡Cartel generado con éxito!', 'success');
        } catch (err) {
            console.error("Error al exportar cartel:", err);
            window.jbToast('Error al generar la imagen.', 'error');
        } finally {
            window.jbLoading.hide();
        }
    }



    window.renderHomeDashboard = function() {
        if (state.currentView !== 'home') return;
        
        const totalPlayersEl = document.getElementById('stats-total-players');
        const totalSessionsEl = document.getElementById('stats-total-sessions');
        const assistsListEl = document.getElementById('home-top-assists-list');
        const winRatioText = document.getElementById('win-ratio-text');
        const winRatioWVal = document.getElementById('win-ratio-w-val');
        const winRatioDVal = document.getElementById('win-ratio-d-val');
        const winRatioLVal = document.getElementById('win-ratio-l-val');
        const winRatioBarW = document.getElementById('win-ratio-bar-w');
        const winRatioBarD = document.getElementById('win-ratio-bar-d');
        const winRatioBarL = document.getElementById('win-ratio-bar-l');
        const formStreakContainer = document.getElementById('form-streak-container');
        
        const scorersListEl = document.getElementById('home-top-scorers-list');
        const winrateListEl = document.getElementById('home-top-winrate-list');
        const displayUser = document.getElementById('display-user-welcome');
        const displayRole = document.getElementById('display-user-role');

        if (totalPlayersEl) totalPlayersEl.textContent = state.players.length;
        if (totalSessionsEl) totalSessionsEl.textContent = state.sessions.length;
        
        const username = state.user?.profile?.full_name || state.user?.profile?.username || 'JUGADOR';
        const role = state.user?.role || 'JUGADOR';

        if (displayUser) displayUser.textContent = username.toUpperCase();
        if (displayRole) displayRole.textContent = role.toUpperCase();

        // --- Inyección de Redes Sociales en Dashboard (v49.2) ---
        const socialContainer = document.getElementById('home-social-links');
        if (socialContainer && state.team) {
            socialContainer.innerHTML = '';
            const socials = state.team.socials || {};
            
            if (socials.twitter) {
                socialContainer.innerHTML += `
                    <a href="https://x.com/${socials.twitter}" target="_blank" title="Twitter/X" style="color: #1DA1F2; transition: 0.3s; display: flex; align-items: center; background: rgba(29, 161, 242, 0.1); padding: 8px; border-radius: 8px; border: 1px solid rgba(29, 161, 242, 0.2);" onmouseover="this.style.background='rgba(29, 161, 242, 0.2)'" onmouseout="this.style.background='rgba(29, 161, 242, 0.1)'">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        <span style="font-size: 0.7rem; margin-left: 8px; font-weight: 800;">@${socials.twitter}</span>
                    </a>
                `;
            }
            if (socials.twitch) {
                socialContainer.innerHTML += `
                    <a href="https://twitch.tv/${socials.twitch}" target="_blank" title="Twitch" style="color: #9146FF; transition: 0.3s; display: flex; align-items: center; background: rgba(145, 70, 255, 0.1); padding: 8px; border-radius: 8px; border: 1px solid rgba(145, 70, 255, 0.2);" onmouseover="this.style.background='rgba(145, 70, 255, 0.2)'" onmouseout="this.style.background='rgba(145, 70, 255, 0.1)'">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
                        <span style="font-size: 0.7rem; margin-left: 8px; font-weight: 800;">${socials.twitch}</span>
                    </a>
                `;
            }
        }

        // --- Helper para renderizar filas de ranking ---
        function renderTopRow(container, items, valueKey, valueSuffix) {
            if (!container) return;
            container.innerHTML = '';
            if (items.length === 0) {
                container.innerHTML = '<p style="font-size:0.7rem; text-align:center; opacity:0.5;">No hay datos registrados.</p>';
                return;
            }
            items.forEach((s, i) => {
                const row = document.createElement('div');
                row.className = 'card-elite';
                row.style.cssText = 'padding: 8px 12px; margin: 0; display: flex; align-items: center; gap: 12px; border-color: rgba(240,165,0,0.1); border-radius: 8px; cursor: pointer; transition: transform 0.2s;';
                row.onmouseover = () => row.style.transform = 'translateX(5px)';
                row.onmouseout = () => row.style.transform = 'translateX(0)';
                row.onclick = () => {
                    if (window.viewPlayerProfileDetail) window.viewPlayerProfileDetail(s.id);
                };
                row.innerHTML = `
                    <span style="font-size: 0.8rem; font-weight: 900; color: var(--primary); width: 15px;">${i+1}</span>
                    <div style="width: 25px; height: 25px; background: rgba(0,0,0,0.2); border-radius: 4px; padding: 2px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                        ${s.photo ? `<img src="${s.photo}" style="width:100%; height:100%; object-fit:cover; object-position: top; transform:${s.transform}">` : (s.avatar ? s.avatar.svg : '')}
                    </div>
                    <span style="font-size: 0.75rem; font-weight: 800; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(s.name.toUpperCase())}</span>
                    <span style="font-size: 0.75rem; font-weight: 900; color: var(--primary);">${s[valueKey]} <small style="font-size:0.5rem;">${valueSuffix}</small></span>
                `;
                container.appendChild(row);
            });
        }

        // --- Mapeador de jugador para rankings ---
        function mapPlayerForRanking(p) {
            return {
                id: p.id,
                name: p.name,
                photo: p.photo_url,
                transform: getPlayerTransform(p),
                avatar: AVATARS.find(av => av.id === (p.avatarID || p.avatar_id || 1))
            };
        }

        // --- 1. TOP GOLEADORES (5) ---
        const scorers = state.players
            .map(p => ({ ...mapPlayerForRanking(p), totalGoals: (p.stats?.official?.goals || 0) + (p.stats?.friendly?.goals || 0) }))
            .filter(s => s.totalGoals > 0)
            .sort((a, b) => b.totalGoals - a.totalGoals)
            .slice(0, 5);
        renderTopRow(scorersListEl, scorers, 'totalGoals', 'GLS');

        // --- 2. TOP ASISTENTES (5) ---
        const assistants = state.players
            .map(p => ({ ...mapPlayerForRanking(p), totalAssists: (p.stats?.official?.assists || 0) + (p.stats?.friendly?.assists || 0) }))
            .filter(s => s.totalAssists > 0)
            .sort((a, b) => b.totalAssists - a.totalAssists)
            .slice(0, 5);
        renderTopRow(assistsListEl, assistants, 'totalAssists', 'AST');

        // --- 3. TOP % VICTORIAS INDIVIDUAL (5) ---
        const winRaters = state.players
            .map(p => {
                const totalPJ = (p.stats?.official?.matches || 0) + (p.stats?.friendly?.matches || 0);
                const totalW = (p.stats?.official?.wins || 0) + (p.stats?.friendly?.wins || 0);
                const pct = totalPJ > 0 ? ((totalW / totalPJ) * 100) : 0;
                return { ...mapPlayerForRanking(p), winPct: pct.toFixed(1) + '%', winPctNum: pct, totalPJ };
            })
            .filter(s => s.totalPJ > 0)
            .sort((a, b) => b.winPctNum - a.winPctNum)
            .slice(0, 5);
        renderTopRow(winrateListEl, winRaters, 'winPct', '');

        // --- 4. RECOPILAR PARTIDOS PARA RATIO Y RACHA ---
        let allMatches = [];
        const allSessions = [...state.sessions];
        if (state.activeSession) {
            allSessions.push(state.activeSession);
        }
        
        // Ordenamos las sesiones cronológicamente (las más antiguas primero, las nuevas después. IDs suelen ser timestamps)
        allSessions.sort((a, b) => a.id - b.id).forEach(session => {
            if (session.matches && session.matches.length > 0) {
                allMatches = allMatches.concat(session.matches);
            }
        });

        // --- RATIO DE VICTORIAS ---
        let winC = 0, drawC = 0, lossC = 0;
        allMatches.forEach(m => {
            if (m.scoreHome > m.scoreAway) winC++;
            else if (m.scoreHome === m.scoreAway) drawC++;
            else lossC++;
        });

        const totalM = winC + drawC + lossC;
        if (totalM > 0) {
            const winP = Math.round((winC / totalM) * 100);
            const drawP = Math.round((drawC / totalM) * 100);
            const lossP = Math.round((lossC / totalM) * 100);

            if (winRatioText) winRatioText.textContent = `${winP}%`;
            if (winRatioWVal) winRatioWVal.textContent = `${winC} V`;
            if (winRatioDVal) winRatioDVal.textContent = `${drawC} E`;
            if (winRatioLVal) winRatioLVal.textContent = `${lossC} D`;

            if (winRatioBarW) winRatioBarW.style.width = `${winP}%`;
            if (winRatioBarD) winRatioBarD.style.width = `${drawP}%`;
            if (winRatioBarL) winRatioBarL.style.width = `${lossP}%`;
        } else {
            if (winRatioText) winRatioText.textContent = '0%';
        }

        // --- RACHA (ÚLTIMOS 5 PARTIDOS) ---
        if (formStreakContainer) {
            formStreakContainer.innerHTML = '';
            if (totalM === 0) {
                formStreakContainer.innerHTML = '<span style="opacity:0.5; font-size:0.7rem;">Sin datos registrados</span>';
            } else {
                // Tomamos los últimos 5
                const last5 = allMatches.slice(-5);
                last5.forEach(m => {
                    const badge = document.createElement('div');
                    badge.style.cssText = 'width: 25px; height: 25px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 900; color: #000; box-shadow: 0 2px 5px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2);';
                    if (m.scoreHome > m.scoreAway) {
                        badge.textContent = 'V';
                        badge.style.background = '#4CAF50';
                    } else if (m.scoreHome === m.scoreAway) {
                        badge.textContent = 'E';
                        badge.style.background = '#FFC107';
                    } else {
                        badge.textContent = 'D';
                        badge.style.background = '#F44336';
                        badge.style.color = '#fff';
                    }
                    formStreakContainer.appendChild(badge);
                });
            }
        }
    }

    // --- FUNCIÓN DE EXPORTACIÓN ELITE v4.8.0 ---
    async function exportTacticAsImage(bgImage = 'img/emerald_pitch.png') {
        // Validación de Seguridad (v47.4)
        const role = (state.user?.role || 'jugador').toLowerCase();
        if (role !== 'manager' && role !== 'capitan') {
            window.jbToast('Acceso denegado: Solo el Manager y los Capitanes pueden exportar alineaciones.', 'error');
            return;
        }

        const activeTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
        if (!activeTactic) return;

        const teamNameText = (state.team ? state.team.name : 'Mi Club').toUpperCase();
        const matchTimeText = exportMatchTimeInput.value || '23:00';
        
        // 1. Crear el contenedor Off-screen
        const wrapper = document.createElement('div');
        wrapper.className = 'export-matchday-wrapper';
        wrapper.style.backgroundImage = `url('${bgImage}')`;

        
        // Cálculo de tamaño dinámico para el nombre del club (v47.5.1)
        let nameFontSize = '48px';
        if (teamNameText.length > 12) nameFontSize = '38px';
        if (teamNameText.length > 16) nameFontSize = '32px';
        if (teamNameText.length > 20) nameFontSize = '26px';

        wrapper.innerHTML = `
            <div class="export-broadcast-container">
                <div class="export-scorebug-banner">
                    <div class="scorebug-left">
                        ${state.team?.crest_url ? `<img src="${state.team.crest_url}" class="export-team-crest" crossOrigin="anonymous">` : ''}
                        <h1 class="scorebug-team-name" style="font-size: ${nameFontSize} !important;">${escapeHTML(teamNameText)}</h1>
                    </div>
                    <div class="scorebug-divider"></div>
                    <div class="scorebug-right">
                        <div class="scorebug-matchday">MATCHDAY • ${escapeHTML(matchTimeText)}</div>
                        <div class="scorebug-formation">LINEUP: ${escapeHTML(activeTactic.formation)}</div>
                    </div>
                </div>
                <div class="export-pitch-area"></div>
            </div>
        `;
        

        document.body.appendChild(wrapper);
        const pitchAreaElement = wrapper.querySelector('.export-pitch-area');
        
        const pitchExport = document.createElement('div');
        pitchExport.className = 'pitch-container-export';
        
        const formationSlots = FORMATIONS[activeTactic.formation] || [];
        const assignments = activeTactic.assignments || {};
        const customPositions = activeTactic.customPositions || {};

        const slotPromises = formationSlots.map(async slotData => {
            const slotEl = document.createElement('div');
            slotEl.className = 'tactical-slot-export';
            
            // Posicionamiento Intacto por Calc (Priorizar customPositions si existen)
            const posX = customPositions[slotData.id]?.x ?? slotData.x;
            const posY = customPositions[slotData.id]?.y ?? slotData.y;
            slotEl.style.left = `calc(${posX}% - 75px)`;
            slotEl.style.top = `calc(${posY}% - 102.5px)`;
            
            const playerId = assignments[slotData.id];
            const player = playerId ? state.players.find(p => p.id === playerId) : null;
            
            if (player) {
                slotEl.classList.add('filled');
                
                slotEl.innerHTML = `
                    <div class="player-card-img-export"></div>
                    <div class="dorsal-export">${player.dorsal || ''}</div>
                    <h4 class="name-export">${escapeHTML(player.name).toUpperCase()}</h4>
                    <div class="pos-badge-export">${slotData.pos}</div>
                `;
                
                // Inject the heavy-duty pre-rendered Native Canvas
                const photoCanvas = await renderPlayerPhotoToCanvas(player);
                slotEl.querySelector('.player-card-img-export').appendChild(photoCanvas);
                
            } else {
                // Slot vacío
                slotEl.innerHTML = `<div class="empty-pos-label">${slotData.pos}</div>`;
            }
            
            return slotEl;
        });
        
        // Wait for all canvases to bake, then append sequentially
        const renderedSlots = await Promise.all(slotPromises);
        renderedSlots.forEach(el => pitchExport.appendChild(el));
        
        pitchAreaElement.appendChild(pitchExport);
        
        // Forzamos un delay suficiente para asegurar renderizado del fondo y fuentes
        await new Promise(r => setTimeout(r, 1200));

        try {
            const canvas = await html2canvas(wrapper, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#050505',
                scale: 1, // Calidad optimizada (evita archivos gigantes)
                logging: false
            });

            // 3. Descargar
            const link = document.createElement('a');
            const safeTeamName = teamNameText.replace(/\s+/g, '_');
            link.download = `MATCHDAY_${safeTeamName}_${matchTimeText.replace(':', 'h')}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.85); // JPEG con calidad 85%
            link.click();
            
        } catch (err) {
            console.error("Error al exportar:", err);
            window.jbConfirm("Error al generar la imagen. Por favor, inténtalo de nuevo.");
        } finally {
            // 4. Limpieza
            document.body.removeChild(wrapper);
        }
    }

    // --- FUNCIÓN AUXILIAR DE RENDERIZADO DE FOTOS (v49.4) ---
    // Usada por exportTacticAsImage y exportSquadAsImage
    async function renderPlayerPhotoToCanvas(player, width = 150, height = 205) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext('2d');
        
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";

            img.onload = () => {
                if (player.photo_url) {
                    const imgRatio = img.width / img.height;
                    const canvasRatio = canvas.width / canvas.height;
                    let drawWidth, drawHeight, offsetX, offsetY;

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

                    ctx.save();
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    ctx.translate(posXVal, posYVal);
                    ctx.scale(scale, scale);
                    ctx.translate(-canvas.width / 2, -canvas.height / 2);
                    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                    ctx.restore();
                } else {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
                resolve(canvas);
            };

            img.onerror = () => resolve(canvas);

            if (player.photo_url) {
                img.src = player.photo_url;
            } else {
                const avatar = player.avatar_id ? AVATARS.find(a => a.id === player.avatar_id) : AVATARS[0];
                let svgStr = avatar ? avatar.svg : AVATARS[0].svg;
                if (!svgStr.includes('xmlns=')) svgStr = svgStr.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
                if (!svgStr.includes('width=')) svgStr = svgStr.replace('<svg ', `<svg width="${width}" height="${height}" `);
                img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
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
        const msg = action === 'accept' ? '¿Quieres aceptar a este jugador en el club?' : '¿Rechazar esta solicitud?';
        if (!await window.jbConfirm(msg)) return;

        window.jbLoading.show(action === 'accept' ? 'Fichando jugador...' : 'Procesando...');
        
        try {
            if (action === 'accept') {
                await acceptTeamRequest(requestId);
                window.jbToast('¡Jugador fichado con éxito!', 'success');
            } else {
                await rejectTeamRequest(requestId);
                window.jbToast('Solicitud rechazada.', 'info');
            }
            
            // Recargar datos
            await loadTeamData();
            await renderMiEquipoView();
            window.updateJoinRequestsBadge();
        } catch (err) {
            console.error(">>> [ERROR] Acción de solicitud fallida:", err);
            window.jbToast('Error al procesar la solicitud', 'error');
        }
        window.jbLoading.hide();
    }

    // --- EDICIÓN MANUAL DE ESTADÍSTICAS (v50.4) ---
    window.openEditStatsModal = function(playerId) {
        const player = state.players.find(p => p.id == playerId);
        if (!player) return;

        document.getElementById('edit-stats-id').value = playerId;
        document.getElementById('edit-stats-name').textContent = `EDITAR: ${player.name.toUpperCase()}`;
        
        const off = player.stats?.official || { matches: 0, goals: 0, assists: 0, wins: 0 };
        document.getElementById('edit-pj-off').value = off.matches || 0;
        document.getElementById('edit-g-off').value = off.goals || 0;
        document.getElementById('edit-a-off').value = off.assists || 0;
        document.getElementById('edit-w-off').value = off.wins || 0;

        document.getElementById('modal-edit-stats').style.display = 'flex';
    };

    window.closeEditStatsModal = function() {
        document.getElementById('modal-edit-stats').style.display = 'none';
    };

    const formEditStats = document.getElementById('form-edit-stats');
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
    const crestTrigger = document.getElementById('team-crest-trigger');
    const crestInput = document.getElementById('team-crest-input');
    const btnSaveSettings = document.getElementById('btn-save-team-settings');

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
            activePollContainer.innerHTML = `<p style="text-align: center; opacity: 0.5; padding: 40px;">No hay ninguna convocatoria activa.</p>`;
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
                                        <button onclick="window.jbEditPoll('${poll.id}')" class="btn-share-wa-circle" title="Editar Convocatoria" style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); margin-left: 5px;">✍️</button>
                                        <button onclick="window.jbOpenCancelPollModal('${poll.id}')" class="btn-poll-cancel">CANCELAR</button>
                                        <button onclick="window.jbClosePoll('${poll.id}', true)" class="btn-poll-align">CREAR ALINEACIÓN</button>
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
    const originalRenderHomeDashboard = window.renderHomeDashboard || renderHomeDashboard;
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

    // --- CALENDARIO DE ASISTENCIA ELITE v36.3 ---
    window.renderPlayerCalendar = async (player) => {
        const grid = document.getElementById('calendar-days-grid');
        const label = document.getElementById('calendar-month-label');
        if (!grid || !player) return;

        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        
        // 1. Mostrar Mes/Año
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        label.textContent = `${monthNames[month]} ${year}`;

        // 2. Limpiar Grid y Mostrar Cargando
        grid.innerHTML = '<div style="grid-column: span 7; padding: 20px; text-align: center; opacity: 0.4; font-size: 0.7rem;">Cargando historial...</div>';

        if (!player.user_id) {
            grid.innerHTML = '<div style="grid-column: span 7; padding: 20px; text-align: center; opacity: 0.4; font-size: 0.7rem;">Este jugador no tiene un Usuario vinculado.</div>';
            return;
        }

        try {
            // 3. Obtener Votos del Jugador con fecha de la encuesta
            const monthStart = new Date(year, month, 1).toISOString();
            const monthEnd = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

            const { data: votes, error } = await supabase
                .from('availability_votes')
                .select(`
                    vote,
                    availability_polls (
                        scheduled_time
                    )
                `)
                .eq('user_id', player.user_id)
                .gte('availability_polls.scheduled_time', monthStart)
                .lte('availability_polls.scheduled_time', monthEnd);


            if (error) throw error;

            // 4. Mapear Votos por Fecha (Solo el primero por día)
            const attendanceMap = new Map();
            if (votes) {
                const sortedVotes = votes
                    .filter(v => v.availability_polls) 
                    .sort((a, b) => 
                        new Date(a.availability_polls.scheduled_time) - new Date(b.availability_polls.scheduled_time)
                    );
                
                sortedVotes.forEach(v => {
                    const dateStr = new Date(v.availability_polls.scheduled_time).toDateString();
                    if (!attendanceMap.has(dateStr)) {
                        attendanceMap.set(dateStr, v.vote);
                    }
                });
            }

            // 5. Generar Grid del Calendario
            grid.innerHTML = '';
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const offset = (firstDay === 0) ? 6 : firstDay - 1;

            for (let i = 0; i < offset; i++) {
                const empty = document.createElement('div');
                empty.className = 'calendar-day';
                grid.appendChild(empty);
            }

            const todayStr = new Date().toDateString();
            for (let d = 1; d <= daysInMonth; d++) {
                const dateObj = new Date(year, month, d);
                const dateString = dateObj.toDateString();
                const dayVote = attendanceMap.get(dateString);
                
                const cell = document.createElement('div');
                cell.className = 'calendar-day has-date';
                
                if (dateString === todayStr) cell.classList.add('today');
                if (dayVote) cell.classList.add(`day-${dayVote}`);
                
                cell.textContent = d;
                grid.appendChild(cell);
            }

            // 6. Calcular y Renderizar Totales Mensuales (Solo Desktop)
            const statsList = document.getElementById('calendar-details-list');
            if (statsList) {
                let monthlyYes = 0, monthlyLate = 0, monthlyNo = 0;
                
                // Recorrer el mapa de asistencia y contar solo los de este mes/año
                attendanceMap.forEach((vote, dateStr) => {
                    const d = new Date(dateStr);
                    if (d.getFullYear() === year && d.getMonth() === month) {
                        if (vote === 'yes') monthlyYes++;
                        else if (vote === 'late') monthlyLate++;
                        else if (vote === 'no') monthlyNo++;
                    }
                });

                statsList.innerHTML = `
                    <h3 style="font-size: 0.8rem; letter-spacing: 1px; margin-bottom: 20px; color: var(--primary);">RESUMEN <span style="color:#fff;">${monthNames[month].toUpperCase()}</span></h3>
                    <div class="month-stat-card">
                        <span class="label">Disponibles (SÍ)</span>
                        <span class="value" style="color: var(--success);">${monthlyYes}</span>
                    </div>
                    <div class="month-stat-card">
                        <span class="label">Llegaron Tarde</span>
                        <span class="value" style="color: var(--primary);">${monthlyLate}</span>
                    </div>
                    <div class="month-stat-card">
                        <span class="label">Ausentes (NO)</span>
                        <span class="value" style="color: var(--error);">${monthlyNo}</span>
                    </div>
                `;
            }

        } catch (err) {
            console.error(">>> [CALENDARIO] Error:", err);
            grid.innerHTML = '<div style="grid-column: span 7; padding: 20px; text-align: center; color: var(--error);">Error al cargar historial</div>';
        }
    };

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

});
