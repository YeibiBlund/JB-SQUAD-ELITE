// JB-SQUAD ELITE: Lógica de la aplicación
// Especialista en Diseño Premium Mobile-First

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración de Datos y Estado
    const POSITIONS = ['POR', 'DFC', 'CAD', 'CAI', 'LI', 'LD', 'MCD', 'MC', 'MVI', 'MVD', 'MD', 'MI', 'MCO', 'ED', 'EI', 'DC'];
    
    // 1. Funciones de Persistencia Segura e Higienización
    function escapeHTML(str) {
        if (!str) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return str.toString().replace(/[&<>"']/g, m => map[m]);
    }

    function getSafeStorage(key, defaultValue) {
        const item = localStorage.getItem(key);
        if (!item) return defaultValue;
        try {
            return JSON.parse(item);
        } catch (e) {
            // Manejo de datos antiguos (strings planos)
            return item || defaultValue;
        }
    }

    // Configuración de Supabase (Fuera para evitar re-inicializaciones)
    const SUPABASE_URL = 'https://drzwawwlpsunprtfbytu.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_dJK1GrVDtroLy4zqHUwdfQ_QRIVCmi3';
    const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

    let state = {
        user: null,         // { profile, membership, role }
        team: null,         // Datos del equipo actual
        players: [],
        savedTactics: [],
        sessions: [],
        activeSession: null,
        activeTacticId: null,
        currentView: 'auth',
        isEditingPositions: false // Nuevo: Estado para bloquear/desbloquear diseño dinámico
    };

    const FORMATIONS = {
        '4-4-2': [
            { id: 'GK', pos: 'POR', x: 50, y: 92 },
            { id: 'LD', pos: 'LD', x: 85, y: 70 }, { id: 'DFC1', pos: 'DFC', x: 62, y: 70 }, { id: 'DFC2', pos: 'DFC', x: 38, y: 70 }, { id: 'LI', pos: 'LI', x: 15, y: 70 },
            { id: 'MD', pos: 'MD', x: 85, y: 44 }, { id: 'MC1', pos: 'MC', x: 62, y: 44 }, { id: 'MC2', pos: 'MC', x: 38, y: 44 }, { id: 'MI', pos: 'MI', x: 15, y: 44 },
            { id: 'DC1', pos: 'DC', x: 62, y: 18 }, { id: 'DC2', pos: 'DC', x: 38, y: 18 }
        ],
        '4-2-3-1': [
            { id: 'GK', pos: 'POR', x: 50, y: 92 },
            { id: 'LD', pos: 'LD', x: 85, y: 72 }, { id: 'DFC1', pos: 'DFC', x: 62, y: 72 }, { id: 'DFC2', pos: 'DFC', x: 38, y: 72 }, { id: 'LI', pos: 'LI', x: 15, y: 72 },
            { id: 'MCD1', pos: 'MCD', x: 65, y: 55 }, { id: 'MCD2', pos: 'MCD', x: 35, y: 55 },
            { id: 'MD', pos: 'MD', x: 85, y: 36 }, { id: 'MCO', pos: 'MCO', x: 50, y: 36 }, { id: 'MI', pos: 'MI', x: 15, y: 36 },
            { id: 'DC', pos: 'DC', x: 50, y: 16 }
        ],
        '3-5-2': [
            { id: 'GK', pos: 'POR', x: 50, y: 92 },
            { id: 'DFC1', pos: 'DFC', x: 75, y: 68 }, { id: 'DFC2', pos: 'DFC', x: 50, y: 68 }, { id: 'DFC3', pos: 'DFC', x: 25, y: 68 },
            { id: 'MCD1', pos: 'MCD', x: 68, y: 51 }, { id: 'MCD2', pos: 'MCD', x: 32, y: 51 },
            { id: 'MD', pos: 'MD', x: 90, y: 34 }, { id: 'MC', pos: 'MC', x: 50, y: 36 }, { id: 'MI', pos: 'MI', x: 10, y: 34 },
            { id: 'DC1', pos: 'DC', x: 62, y: 15 }, { id: 'DC2', pos: 'DC', x: 38, y: 15 }
        ],
        '3-4-1-2': [
            { id: 'GK', pos: 'POR', x: 50, y: 92 },
            { id: 'DFC1', pos: 'DFC', x: 75, y: 72 }, { id: 'DFC2', pos: 'DFC', x: 50, y: 72 }, { id: 'DFC3', pos: 'DFC', x: 25, y: 72 },
            { id: 'MD', pos: 'MD', x: 88, y: 51 }, { id: 'MC1', pos: 'MC', x: 62, y: 51 }, { id: 'MC2', pos: 'MC', x: 38, y: 51 }, { id: 'MI', pos: 'MI', x: 12, y: 51 },
            { id: 'MCO', pos: 'MCO', x: 50, y: 32 },
            { id: 'DC1', pos: 'DC', x: 62, y: 14 }, { id: 'DC2', pos: 'DC', x: 38, y: 14 }
        ],
        '3-1-4-2': [
            { id: 'GK', pos: 'POR', x: 50, y: 92 },
            { id: 'DFC1', pos: 'DFC', x: 75, y: 78 }, { id: 'DFC2', pos: 'DFC', x: 50, y: 78 }, { id: 'DFC3', pos: 'DFC', x: 25, y: 78 },
            { id: 'MCD', pos: 'MCD', x: 50, y: 62 },
            { id: 'MD', pos: 'MD', x: 90, y: 44 }, { id: 'MC1', pos: 'MC', x: 65, y: 44 }, { id: 'MC2', pos: 'MC', x: 35, y: 44 }, { id: 'MI', pos: 'MI', x: 10, y: 44 },
            { id: 'DC1', pos: 'DC', x: 62, y: 16 }, { id: 'DC2', pos: 'DC', x: 38, y: 16 }
        ]
    };

    const AVATARS = [
        { id: 1, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 20C9.11 20 6.57 18.52 5.12 16.32C5.16 14.04 8.72 12.8 12 12.8C15.26 12.8 18.84 14.04 18.88 16.32C17.43 18.52 14.89 20 12 20Z" fill="#F0A500"/></svg>` },
        { id: 2, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#F0A500"/></svg>` },
        { id: 3, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="#FCA500"/></svg>` },
        { id: 4, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 14C15.3137 14 18 11.3137 18 8C18 4.68629 15.3137 2 12 2C8.68629 2 6 4.68629 6 8C6 11.3137 8.68629 14 12 14Z" fill="#F0A500"/><path d="M12 16C7.99 16 0 18.01 0 22V24H24V22C24 18.01 16.01 16 12 16Z" fill="#F0A500"/></svg>` },
        { id: 5, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM12 8C15.33 8 22 9.67 22 13V18H20V22H18V18H16V22H14V18H10V22H8V18H6V22H4V18H2V13C2 9.67 8.67 8 12 8Z" fill="#F0A500"/></svg>` },
        { id: 6, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C13.1 4 14 4.9 14 6C14 7.1 13.1 8 12 8C10.9 8 10 7.1 10 6C10 4.9 10.9 4 12 4ZM12 20C9.11 20 6.57 18.52 5.12 16.32C5.16 14.04 8.72 12.8 12 12.8C15.26 12.8 18.84 14.04 18.88 16.32C17.43 18.52 14.89 20 12 20Z" fill="#F0A500"/></svg>` },
        { id: 7, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" fill="#F0A500"/><path d="M20 19C20 16.24 16.42 14 12 14C7.58 14 4 16.24 4 19V20H20V19Z" fill="#F0A500"/></svg>` },
        { id: 8, svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 20C9.11 20 6.57 18.52 5.12 16.32C5.16 14.04 8.72 12.8 12 12.8C15.26 12.8 18.84 14.04 18.88 16.32C17.43 18.52 14.89 20 12 20Z" fill="#B8860B"/></svg>` }
    ];

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
    const savedTacticsList = document.getElementById('saved-tactics-list');
    const newTacticNameInput = document.getElementById('newTacticName');

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

    const pitch = document.getElementById('football-pitch');
    const playerSelector = document.getElementById('player-selector-overlay');
    const selectorList = document.getElementById('selector-player-list');

    let activeSlotId = null;
    let draggedSourceSlotId = null;
    let sortConfig = { key: 'primaryPos', desc: false };

    let currentMatch = null; // Objeto para el partido en vivo
    let selectedGoalScorerId = null;
    let selectedAssistantId = null;

    // 3. Inicialización
    init();

    let isHandlingSession = false; 

    async function init() {
        if (!supabase) return;

        console.log(">>> [BOOT v3.0] Iniciando arranque limpio...");
        
        // 1. Obtener sesión actual síncronamente nada más cargar
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            console.log(">>> [BOOT v3.0] Sesión detectada en arranque.");
            await handleUserSession(session.user);
        } else {
            console.log(">>> [BOOT v3.0] Sin sesión. Mostrando login.");
            switchAuthView('auth');
            hideAppLoader();
        }

        // 2. Configurar escuchador solo para CAMBIOS futuros (LOGIN manual / LOGOUT / EXPIRACIÓN)
        supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(">>> [EVENTO AUTH]:", event);
            
            if (event === 'SIGNED_IN' && !state.user) {
                // Solo si no estamos ya procesándolo
                if (session) await handleUserSession(session.user);
            } else if (event === 'SIGNED_OUT') {
                state.user = null;
                state.team = null;
                switchAuthView('auth');
            }
        });

        setupAuthHandlers();
    }

    async function handleUserSession(authUser) {
        if (isHandlingSession) return;
        isHandlingSession = true;

        try {
            // Limpiamos logs para no mostrar emails internos
            const username = authUser.user_metadata?.full_name || authUser.email.split('@')[0];
            console.log(">>> Entrando como:", username.toUpperCase());
            
            // 1. Perfil
            let { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
            
            if (!profile) {
                const { data: newProfile, error: insErr } = await supabase.from('profiles').insert({ 
                    id: authUser.id, 
                    full_name: username 
                }).select().maybeSingle();
                
                if (insErr && insErr.code === '23505') {
                    let { data: retryProfile } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
                    profile = retryProfile;
                } else {
                    profile = newProfile;
                }
            }
            
            // 2. Membresía
            let { data: membership } = await supabase.from('memberships').select('*, teams(*)').eq('user_id', authUser.id).maybeSingle();
            
            state.user = { 
                auth: authUser,
                profile: profile,
                membership: membership,
                role: membership ? membership.role : null 
            };

            if (membership) {
                console.log(">>> [BOOT] Equipo detectado. Sincronizando datos del club...");
                state.team = membership.teams;
                state.user.role = membership.role;
                switchAuthView('main'); // <--- CRÍTICO: Oculta el login y muestra la app
                await loadTeamData();
            } else {
                console.log(">>> [BOOT] Usuario sin club. Redirigiendo a Selección de Equipo...");
                switchAuthView('team-select');
                await fetchAvailableClubs(); 
                hideAppLoader();
            }
        } catch (err) {
            console.error(">>> Error de sesión:", err);
        } finally {
            // No resetear inmediatamente para evitar bucles de carga
            setTimeout(() => { isHandlingSession = false; }, 2000);
        }
    }

    async function fetchAvailableClubs() {
        const listContainer = document.getElementById('available-clubs-list');
        if (!listContainer) return;

        console.log(">>> Cargando explorador de clubes...");
        const { data: teams, error } = await supabase.from('teams').select('*').order('created_at', { ascending: false }).limit(20);

        if (error) {
            console.error(">>> Error cargando clubes:", error);
            listContainer.innerHTML = `<p style="color: #ff4d4d; font-size: 0.8rem; text-align: center;">Error: ${error.message}</p>`;
            return;
        }

        if (!teams || teams.length === 0) {
            listContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 20px;">No hay clubes registrados aún.</p>`;
            return;
        }

        renderClubBrowser(teams);
    }

    function renderClubBrowser(teams) {
        const listContainer = document.getElementById('available-clubs-list');
        listContainer.innerHTML = '';

        teams.forEach(team => {
            const card = document.createElement('div');
            card.className = 'card-elite';
            card.style.cssText = `padding: 15px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; margin-bottom: 8px;`;
            card.innerHTML = `<div><h4 style="margin-bottom: 4px; font-size: 0.95rem; color: #fff;">${escapeHTML(team.name)}</h4><p style="font-size: 0.7rem; color: var(--text-muted);">Fundado el ${new Date(team.created_at).toLocaleDateString()}</p></div><button class="join-btn btn-gold" style="padding: 8px 16px; font-size: 0.75rem; min-width: 80px;">UNIRSE</button>`;

            const joinBtn = card.querySelector('.join-btn');
            joinBtn.onclick = async () => {
                const confirmed = await window.jbConfirm(`¿Quieres solicitar unirte al club ${team.name.toUpperCase()}?`);
                if (confirmed) {
                    joinBtn.disabled = true;
                    joinBtn.textContent = '...';
                    const { error: mErr } = await supabase.from('memberships').insert({ user_id: state.user.auth.id, team_id: team.id, role: 'jugador' });
                    if (mErr) {
                        window.jbToast('Error al unirse: ' + mErr.message, 'error');
                        joinBtn.disabled = false;
                        joinBtn.textContent = 'UNIRSE';
                    } else {
                        window.jbToast(`¡Bienvenido a ${team.name}!`, 'success');
                        await handleUserSession(state.user.auth);
                    }
                }
            };
            listContainer.appendChild(card);
        });
    }

    function hideAppLoader() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.classList.add('loader-hidden');
            // Eliminar del DOM tras la transición para liberar memoria
            setTimeout(() => loader.remove(), 1000);
        }
    }

    async function loadTeamData() {
        console.log(">>> [BOOT v4.3.0] Iniciando sincronización élite...");
        if (!state.team) return;

        // Cargar Jugadores del Equipo
        const { data: dbPlayers } = await supabase.from('players').select('*').eq('team_id', state.team.id);
        if (dbPlayers) state.players = dbPlayers.map(p => ({
            id: p.id,
            user_id: p.user_id, // Sincronizado
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
            stats: p.stats // Ahora stats es el objeto completo de la DB
        }));

        // Cargar Sesiones
        const { data: dbSessions } = await supabase.from('sessions').select('*').eq('team_id', state.team.id);
        if (dbSessions) {
            state.sessions = dbSessions.filter(s => s.status === 'closed').map(s => ({
                id: s.id,
                date: s.date,
                status: s.status,
                mvpId: s.mvp_id,
                matches: s.matches
            }));
            const active = dbSessions.find(s => s.status === 'active');
            state.activeSession = active ? {
                id: active.id,
                date: active.date,
                status: active.status,
                mvpId: active.mvp_id,
                matches: active.matches
            } : null;
        }

        // Cargar Tácticas
        const { data: dbTactics } = await supabase.from('tactics').select('*').eq('team_id', state.team.id);
        if (dbTactics) state.savedTactics = dbTactics.map(t => ({
            id: t.id,
            name: t.name,
            formation: t.formation,
            assignments: t.assignments,
            customPositions: t.custom_positions || {},
            isActive: t.is_active
        }));

        // Detectar mi ficha (AUTOGESTIÓN)
        state.userPlayer = state.players.find(p => p.user_id === state.user.auth.id);
        
        if (state.userPlayer) {
            // Auto-rellenar formulario si ya existe ficha
            document.getElementById('playerName').value = state.userPlayer.name || '';
            document.getElementById('consoleID').value = state.userPlayer.consoleID || '';
            document.getElementById('dorsal').value = state.userPlayer.dorsal || '';
            
            // Cargar preferencias de diseño si existen
            if (state.userPlayer.photo_scale) {
                const scaleEl = document.getElementById('photoScale');
                const xEl = document.getElementById('photoX');
                const yEl = document.getElementById('photoY');
                
                if (scaleEl) {
                    scaleEl.value = state.userPlayer.photo_scale;
                    document.getElementById('photo-scale-value').textContent = state.userPlayer.photo_scale.toFixed(2);
                }
                if (xEl) {
                    xEl.value = state.userPlayer.photo_x || 0;
                    document.getElementById('photo-x-value').textContent = state.userPlayer.photo_x || 0;
                }
                if (yEl) {
                    yEl.value = state.userPlayer.photo_y || 0;
                    document.getElementById('photo-y-value').textContent = state.userPlayer.photo_y || 0;
                }
            }
        }
        
        updateTeamHeader();
        applyRolePermissions(); // Restaurado: Aplica visibilidad de botones según rol
        renderPlayers();
        renderSessions();
        renderTacticsList();
        renderHomeDashboard();

        // Inicializar componentes UI
        populatePositionSelects();
        renderAvatarGallery();
        setupNavigation();
        setupFormHandlers();
        setupTacticHandlers();
        setupSessionHandlers();
        setupTableSorting();
        
        // Setup Eventos Globales
        setupEventListeners();

        // Redirección Inteligente (v22.2.0)
        setTimeout(() => {
            if (state.userPlayer) {
                switchView('home'); // Prioridad al Dashboard para usuarios registrados
                renderMyProfile(state.userPlayer); 
            } else {
                switchView('add-player'); // Flujo de bienvenida para nuevos registros
                console.log(">>> Usuario sin ficha. Mostrando editor...");
                const alertMsg = document.createElement('div');
                alertMsg.className = 'card-elite fade-in shadow-premium';
                alertMsg.style.cssText = 'position:fixed; top:20px; right:20px; z-index:9999; padding:15px; border:1px solid var(--primary); background: rgba(0,0,0,0.9);';
                alertMsg.innerHTML = '<p style="font-size:0.8rem; font-weight:800; color:var(--primary);">⚠️ CREA TU FICHA PARA JUGAR</p>';
                document.body.appendChild(alertMsg);
                setTimeout(() => alertMsg.remove(), 5000);
            }
            console.log(">>> [BOOT v4.3.0] Aterrizaje final ejecutado. Ocultando loader...");
            hideAppLoader();
        }, 300); // Un poco más de margen para asegurar renderizado suave
    }

    function switchAuthView(viewName) {
        const authView = document.getElementById('view-auth');
        const teamSelect = document.getElementById('view-team-select');
        const mainApp = document.getElementById('main-app');

        // Reset all views to hidden
        if (authView) authView.style.setProperty('display', 'none', 'important');
        if (teamSelect) teamSelect.style.setProperty('display', 'none', 'important');
        if (mainApp) mainApp.style.setProperty('display', 'none', 'important');

        // Show the target view
        if (viewName === 'auth' && authView) {
            console.log("Mostrando Auth View");
            authView.style.setProperty('display', 'flex', 'important');
        } else if (viewName === 'team-select' && teamSelect) {
            console.log("Mostrando Team Select View");
            teamSelect.style.setProperty('display', 'flex', 'important');
        } else if (viewName === 'main' && mainApp) {
            console.log("Mostrando Main App View");
            mainApp.style.setProperty('display', 'block', 'important');
        }
    }

    function applyRolePermissions() {
        const role = state.user.role || 'jugador';
        const isAdmin = role === 'manager' || role === 'capitan';
        
        // Elementos que solo ven Admins (Manager/Capitán)
        document.querySelectorAll('[data-role-required="manager"]').forEach(el => {
            el.style.display = isAdmin ? 'block' : 'none';
        });

        // Asegurar visibilidad de botones de acción específicos (usando variables globales de scope)
        if (btnNewSession) btnNewSession.style.display = isAdmin ? 'flex' : 'none';
        if (btnAddMatch) btnAddMatch.style.display = isAdmin ? 'block' : 'none';
        if (sessionFinalizeContainer) sessionFinalizeContainer.style.display = isAdmin ? 'block' : 'none';

        // Botón "Mi Ficha" — visible para TODOS (Manager también juega)
        const btnAddPlayer = document.getElementById('btn-go-to-add-player');
        if (btnAddPlayer) {
            btnAddPlayer.style.display = 'flex';
            const spanEl = btnAddPlayer.querySelector('span');
            if (spanEl) {
                spanEl.textContent = state.userPlayer ? 'EDITAR FICHA' : 'MI FICHA';
            }
        }



        // Rol Badge removido del top header. Sekarang se maneja en el Dashboard de forma limpia.
    }

    function setupAuthHandlers() {
        const loginForm = document.getElementById('login-form');
        const regForm = document.getElementById('register-form');
        const tabs = document.querySelectorAll('.auth-tab');

        tabs.forEach(tab => {
            tab.onclick = () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                if (tab.dataset.tab === 'login') {
                    loginForm.style.display = 'block';
                    regForm.style.display = 'none';
                } else {
                    loginForm.style.display = 'none';
                    regForm.style.display = 'block';
                }
            };
        });

    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Entrando...';

        const username = document.getElementById('login-username').value.trim();
        const pass = document.getElementById('login-password').value;
        const email = `${username.toLowerCase()}@jb.club`;
        
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        
        if (error) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            if (error.message.includes('Email not confirmed')) {
                window.jbToast('Debes desactivar "Confirmación de Email" en tu Panel de Supabase (Authentication -> Providers -> Email).', 'error', 6000);
            } else {
                window.jbToast('Error al entrar: ' + error.message, 'error');
            }
        }
    };

    regForm.onsubmit = async (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('reg-username');
        const username = usernameInput.value.trim();
        
        if (username.includes('@')) {
            window.jbToast('El nombre de usuario no puede contener el símbolo "@". Usa solo texto o números.', 'error');
            return;
        }

        const submitBtn = regForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creando Cuenta...';

        const pass = document.getElementById('reg-password').value;
        const email = `${username.toLowerCase()}@jb.club`;
        
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password: pass,
            options: { data: { full_name: username } }
        });

        if (error) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            window.jbToast('Error en el registro: ' + error.message, 'error');
            return;
        }
        
        if (data.user) {
            await supabase.from('profiles').insert({ id: data.user.id, full_name: username });
            window.jbToast('¡Cuenta creada con éxito! Iniciando sesión...', 'success');
            // Tras registrarse, el login es automático por Supabase, 
            // así que onAuthStateChange se encargará del resto.
        }
    };

    document.getElementById('create-team-form').onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Fundando Club...';

        const teamName = document.getElementById('new-team-name').value.trim();
        if (!state.user?.auth) { window.jbToast('Sesión no encontrada.', 'error'); return; }

        const { data: team, error: tErr } = await supabase.from('teams').insert({ 
            name: teamName, 
            owner_id: state.user.auth.id 
        }).select().single();

        if (tErr) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Fundar Ahora';
            window.jbToast('Error al crear equipo: ' + tErr.message, 'error');
            return;
        }

        console.log(">>> Equipo creado, insertando membresía MANAGER...");
        const { error: mErr } = await supabase.from('memberships').insert({
            user_id: state.user.auth.id,
            team_id: team.id,
            role: 'manager'
        });

        if (mErr) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Fundar Ahora';
            window.jbToast('Error al asignar rol de Manager: ' + mErr.message, 'error');
            return;
        }

        window.jbToast(`¡Club ${teamName} fundado con éxito! Bienvenido, Manager.`, 'success');
        await handleUserSession(state.user.auth);
    };

    document.getElementById('join-team-form').onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button');
        const searchQuery = document.getElementById('search-team-name').value.trim();
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Buscando...';

        // 1. Buscar equipo por nombre (case-insensitive)
        const { data: teams, error } = await supabase.from('teams')
            .select('*')
            .ilike('name', searchQuery);

        if (error || !teams.length) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Buscar y Solicitar';
            window.jbToast('No se ha encontrado ningún club con ese nombre.', 'error');
            return;
        }

        const targetTeam = teams[0];
        const confirmJoin = await window.jbConfirm(`¿Quieres unirte a ${targetTeam.name.toUpperCase()}?`);
        
        if (confirmJoin) {
            const { error: mErr } = await supabase.from('memberships').insert({
                user_id: state.user.auth.id,
                team_id: targetTeam.id,
                role: 'jugador' // Por defecto entra como jugador
            });

            if (mErr) {
                window.jbToast('Error al unirte: ' + mErr.message, 'error');
            } else {
                window.jbToast(`¡Solicitud aceptada! Ya eres miembro de ${targetTeam.name}.`, 'success');
                await handleUserSession(state.user.auth);
            }
        }
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Buscar y Solicitar';
    };

        const handleLogout = async () => {
            const ok = await window.jbConfirm("¿Estás seguro de que deseas cerrar la sesión actual?");
            if (ok) supabase.auth.signOut();
        };

        document.getElementById('btn-global-logout').onclick = handleLogout;
        document.getElementById('btn-logout-temp').onclick = handleLogout;
    }

    async function migrateToCloud() {
        showLoadingState(true);
        const localP = JSON.parse(localStorage.getItem('jb_players')) || [];
        const localS = JSON.parse(localStorage.getItem('jb_sessions')) || [];
        const localA = JSON.parse(localStorage.getItem('jb_active_session')) || [];
        const localT = JSON.parse(localStorage.getItem('jb_tactics')) || [];
        
        // Subir Jugadores
        for(let p of localP) {
            await supabase.from('players').upsert({
                id: p.id.toString().length < 20 ? undefined : p.id, // Supabase prefiere UUID, si es viejo lo dejamos que genere uno o lo ignoramos
                name: p.name,
                console_id: p.consoleID,
                avatar_id: p.avatarID,
                primary_pos: p.primaryPos,
                secondary_pos: p.secondaryPos,
                dorsal: p.dorsal,
                stats: { official: p.stats?.official || p.official, friendly: p.stats?.friendly || p.friendly }
            });
        }
        
        // Subir Sesiones
        const sessionsToMigrate = [...localS];
        if (localA && localA.id) sessionsToMigrate.push(localA);
        
        for(let s of sessionsToMigrate) {
            await supabase.from('sessions').upsert({
                date: s.date,
                status: s.status || 'closed',
                matches: s.matches,
                mvp_id: s.mvpId
            });
        }
        
        window.jbToast('Migración Completada con Éxito.', 'success');
        await loadTeamData();
    }

    async function saveTacticsCloud() {
        if (!supabase) return;
        
        // Preparar datos para upsert (v19.0.0 incluye custom_positions)
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

    async function saveTeamCloud() {
        if (!supabase) return;
        await supabase.from('team_config').upsert({
            id: 1,
            name: state.team.name,
            manager_name: state.team.manager
        });
    }

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

            let result;
            if (typeof player.id === 'string' && player.id.includes('-')) {
                // UPDATE Directo: Menos propenso a recursión en RLS que upsert
                result = await supabase.from('players').update(payload).eq('id', player.id).select();
            } else {
                // INSERT Directo
                result = await supabase.from('players').insert(payload).select();
            }

            if (result.error) throw result.error;
            if (result.data && result.data[0]) player.id = result.data[0].id;
        } catch (err) {
            console.error(">>> [ERROR] savePlayerCloud:", err.message);
        }
    }

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

            let result;
            if (typeof session.id === 'string' && session.id.includes('-')) {
                result = await supabase.from('sessions').update(payload).eq('id', session.id).select();
            } else {
                result = await supabase.from('sessions').insert(payload).select();
            }

            if (result.error) throw result.error;
            if (result.data && result.data[0]) {
                const newUuid = result.data[0].id;
                session.id = newUuid;
                if (state.activeSession && (state.activeSession === session || state.activeSession.date === session.date)) {
                    state.activeSession.id = newUuid;
                }
            }
        } catch (err) {
            console.error(">>> [ERROR] saveSessionCloud:", err.message);
        }
    }

    async function saveTacticsCloud() {
        if (!supabase || !state.team) return;
        
        for (let t of state.savedTactics) {
            // Asegurar que el ID sea un string (UUID) para evitar el error 400
            const payload = {
                team_id: state.team.id,
                name: t.name,
                formation: t.formation,
                assignments: t.assignments || {},
                custom_positions: t.customPositions || {},
                is_active: t.isActive || false
            };

            // Solo incluimos el ID si es un UUID válido (no un timestamp de Date.now())
            if (typeof t.id === 'string' && t.id.length > 15) {
                payload.id = t.id;
            }

            const { data, error } = await supabase.from('tactics').upsert(payload).select();
            
            if (error) {
                console.error("Error al guardar táctica:", error);
            } else if (data && data.length > 0 && typeof t.id !== 'string') {
                // Si era una táctica nueva, actualizamos el ID local con el generado por el servidor
                t.id = data[0].id;
            }
        }
    }


    async function deleteSessionCloud(sessionId) {
        if (!supabase) return;
        await supabase.from('sessions').delete().eq('id', sessionId);
    }

    function setupEventListeners() {
        // Mover los listeners aquí
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.onclick = () => switchView(btn.dataset.view);
        });
    }

    function renderAvatarGallery() {
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

    function switchView(viewId) {
        views.forEach(v => v.classList.remove('active-view'));
        const targetView = document.getElementById(`view-${viewId}`);
        if (targetView) {
            targetView.classList.add('active-view');
            // Asegurar que si es el contenedor principal, se muestre sobre el !important del CSS inicial
            const mainApp = document.getElementById('main-app');
            if (mainApp) mainApp.style.setProperty('display', 'flex', 'important');
        }

        if (viewId === 'tacticas') {
            handleTacticViewDisplay();
        } else if (viewId === 'jornadas') {
            renderSessions();
        } else {
            if (headerTacticInfo) headerTacticInfo.style.display = 'none';
            if (btnSaveTactic) btnSaveTactic.style.display = 'none';
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
    }

    function handleTacticViewDisplay() {
        // Al entrar en la vista principal de Tácticas, mostramos siempre la lista
        tacticasList.style.display = 'block';
        tacticasInitial.style.display = 'none';
        tacticasField.style.display = 'none';
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

        scoreHomeDisplay.textContent = currentMatch.scoreHome;
        scoreAwayDisplay.textContent = currentMatch.scoreAway;
        
        // Actualizar nombres completos en el marcador
        const teamNameText = (state.team && state.team.name) ? state.team.name : 'MI CLUB';
        const rivalNameText = currentMatch.rival || 'RIVAL';
        
        if (scoreTeamName) scoreTeamName.textContent = teamNameText.toUpperCase();
        if (scoreRivalName) scoreRivalName.textContent = rivalNameText.toUpperCase();

        // Label del botón de gol dinámico (usamos iniciales aquí para que quepa bien en el botón)
        const initials = teamNameText.length > 3 ? teamNameText.substring(0, 3).toUpperCase() : teamNameText.toUpperCase();
        const goalBtnLabel = document.getElementById('goal-btn-team-name');
        if (goalBtnLabel) {
            goalBtnLabel.textContent = 'GOL ' + initials;
        }

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

    function updateTeamHeader() {
        const teamNameLabel = document.getElementById('display-team-name');
        const userWelcome = document.getElementById('display-user-welcome');
        
        const fullName = state.user.profile ? state.user.profile.full_name : 'Usuario Elite';
        const teamName = state.team ? state.team.name : 'Mi Club';

        if (teamNameLabel) teamNameLabel.textContent = teamName.toUpperCase();
        if (userWelcome) userWelcome.textContent = fullName.split(' ')[0] || 'Capitán';
        
        const statsPlayers = document.getElementById('stats-total-players');
        if (statsPlayers) statsPlayers.textContent = state.players.length;
    }

    // --- Configuración de Navegación ---
    function setupNavigation() {
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                switchView(view);
            });
        });

        // Botones especiales de transición
        const btnEditMyFicha = document.getElementById('btn-edit-my-ficha');
        if (btnEditMyFicha) {
            btnEditMyFicha.addEventListener('click', () => {
                if (state.userPlayer) {
                    populatePlayerForm(state.userPlayer);
                    switchView('add-player');
                }
            });
        }

        const btnBackToProfile = document.getElementById('btn-back-to-profile');
        if (btnBackToProfile) {
            btnBackToProfile.addEventListener('click', () => switchView('my-profile'));
        }

        if (btnGoToAddPlayer) {
            btnGoToAddPlayer.addEventListener('click', () => {
                if (state.userPlayer) {
                    switchView('my-profile');
                    renderMyProfile(state.userPlayer);
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
    }

    // --- Lógica de Formularios ---
    function populatePositionSelects() {
        const createOptions = (select) => {
            POSITIONS.forEach(pos => {
                const opt = document.createElement('option');
                opt.value = pos;
                opt.textContent = pos;
                select.appendChild(opt);
            });
        };
        populatePositionSelects.done = true;
        createOptions(primaryPosSelect);
        secondaryPosSelects.forEach(s => createOptions(s));
    }

    function setupFormHandlers() {
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

            const newPlayer = {
                user_id: state.user.auth.id,
                team_id: state.team.id,
                name: document.getElementById('playerName').value,
                console_id: document.getElementById('consoleID').value,
                dorsal: document.getElementById('dorsal').value,
                primary_pos: primaryPosSelect.value,
                secondary_pos: [...new Set(secondaryPositions)].slice(0, 3),
                photo_url: currentPhotoBase64 || (state.userPlayer ? state.userPlayer.photo_url : null),
                photo_scale: parseFloat(document.getElementById('photoScale')?.value || 1.0),
                photo_x: parseInt(document.getElementById('photoX')?.value || 0),
                photo_y: parseInt(document.getElementById('photoY')?.value || 0),
                avatar_id: parseInt(document.getElementById('selected-avatar-id').value) || 1,
                stats: state.userPlayer ? state.userPlayer.stats : { 
                    official: { matches: 0, goals: 0, assists: 0, mvps: 0 },
                    friendly: { matches: 0, goals: 0, assists: 0, mvps: 0 }
                }
            };

            // Si ya existe ficha, incluir el ID para actualizar (upsert)
            if (state.userPlayer) {
                newPlayer.id = state.userPlayer.id;
            }

            const { error: insErr } = await supabase.from('players').upsert(newPlayer);
            
            if (insErr) {
                window.jbToast('Error al guardar ficha: ' + insErr.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirmar Ficha';
                window.jbLoading.hide();
                return;
            }

            window.jbLoading.hide();
            window.jbToast('¡Ficha actualizada con éxito!', 'success');
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

    let currentPhotoBase64 = null; // Variable temporal para la carga

    // --- Renderizado de Jugadores y Tabla ---
    function getPositionColorClass(pos) {
        if (!pos) return 'pos-gk'; // default
        const p = pos.toUpperCase();
        if (p === 'POR') return 'pos-gk';
        if (['DFC', 'LI', 'LD', 'CAD', 'CAI'].includes(p)) return 'pos-def';
        if (['MCD', 'MC', 'MCO', 'MI', 'MD', 'MVI', 'MVD'].includes(p)) return 'pos-mid';
        if (['DC', 'ED', 'EI', 'SD', 'EXT'].includes(p)) return 'pos-fwd';
        return 'pos-gk';
    }

    function sortPlayersData(playersArray) {
        const positionOrder = ['POR', 'DFC', 'LD', 'LI', 'CAD', 'CAI', 'MCD', 'MC', 'MVI', 'MVD', 'MCO', 'EI', 'ED', 'DC'];

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

    function setupTableSorting() {
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

    function renderPlayers() {
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
                showPlayerProfile(player.id);
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
    function setupTacticHandlers() {
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

        // Exportar Táctica (v4.8.0)
        btnExportTactic.addEventListener('click', () => {
            exportTimeModal.style.display = 'flex';
        });

        closeExportTime.addEventListener('click', () => {
            exportTimeModal.style.display = 'none';
        });

        btnConfirmExport.addEventListener('click', () => {
            exportTimeModal.style.display = 'none';
            exportTacticAsImage();
        });

        // Configurar Zona de Drop para volver al Banquillo Completo
        const rosterPanel = document.getElementById('tactic-roster-panel');
        if (rosterPanel) {
            rosterPanel.addEventListener('dragover', e => {
                e.preventDefault();
                rosterPanel.style.border = "2px dashed #F44336";
            });
            rosterPanel.addEventListener('dragleave', e => {
                rosterPanel.style.border = "none";
            });
            rosterPanel.addEventListener('drop', e => {
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
    }

    function renderTacticsList() {
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

        // Ordenar alfabéticamente o por ID (más reciente último, preferimos más reciente primero)
        const displayTactics = [...state.savedTactics].reverse();

        displayTactics.forEach(tactic => {
            const card = document.createElement('div');
            card.className = 'tactic-card';
            const isAdmin = state.user.role === 'manager' || state.user.role === 'capitan';
            
            card.innerHTML = `
                <div style="flex: 1;">
                    <h3 style="color: #fff; font-weight: 800; font-size: 0.9rem;">${tactic.name.toUpperCase()}</h3>
                    <p style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">FORMACIÓN: ${tactic.formation}</p>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    ${isAdmin ? `<button class="btn-action btn-delete-tactic" style="color: #F44336; border-color: rgba(244,67,54,0.3);" title="Eliminar">🗑️</button>` : ''}
                    <button class="btn-gold btn-open-tactic" style="width: auto; padding: 8px 15px; font-size: 0.75rem; letter-spacing: 1px;">ABRIR</button>
                </div>
            `;
            
            card.querySelector('.btn-open-tactic').onclick = () => openPitchView(tactic.id);
            
            if (isAdmin) {
                card.querySelector('.btn-delete-tactic').onclick = async (e) => {
                    e.stopPropagation();
                    const agreed = await window.jbConfirm(`¿Eliminar la táctica ${tactic.name}?`);
                    if (agreed) {
                        state.savedTactics = state.savedTactics.filter(t => t.id !== tactic.id);
                        await saveTacticsCloud();
                        renderTacticsList();
                    }
                };
            }

            savedTacticsList.appendChild(card);
        });
    }

    function openPitchView(tacticId) {
        state.activeTacticId = tacticId;
        tacticasList.style.display = 'none';
        tacticasInitial.style.display = 'none';
        tacticasField.style.display = 'flex';
        
        if (headerTacticInfo) headerTacticInfo.style.display = 'flex';
        if (btnSaveTactic) btnSaveTactic.style.display = 'block';
        if (btnExportTactic) btnExportTactic.style.display = 'block';

        // Mostrar botón de editar pizarra (solo para managers/capitanes)
        const btnEditBoard = document.getElementById('btn-edit-board');
        const isAdmin = state.user.role === 'manager' || state.user.role === 'capitan';
        if (btnEditBoard) btnEditBoard.style.display = isAdmin ? 'block' : 'none';
        state.isEditingPositions = false; // Resetear modo al entrar
        
        renderPitch();
    }

    function renderPitch(targetPitch = pitch) {
        const activeTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
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

            // BLOQUEO DE GESTIÓN: Si estamos editando posiciones, desactivar clics de cambio de jugador
            slotEl.onclick = (e) => {
                if (state.isEditingPositions) {
                    e.stopPropagation();
                    return;
                }
                renderPlayerModal(slot.pos);
            };

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
                    // BLOQUEO: Solo permitir arrastrar jugador si NO estamos editando dibujo
                    slotEl.draggable = !state.isEditingPositions;
                    
                    if (slotEl.draggable) {
                        slotEl.addEventListener('dragstart', e => {
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

            } else {
                slotEl.innerHTML = `
                    <span class="plus-icon">+</span>
                    <div class="slot-pos" style="bottom: -22px; background: rgba(0,0,0,0.5); color: #fff;">${slot.pos}</div>
                `;
            }

            if (targetPitch === pitch) {
                slotEl.addEventListener('click', () => {
                    if (state.isEditingPositions) return; // BLOQUEO: No abrir modal en edición de dibujo
                    activeSlotId = slot.id;
                    renderPlayerModal(slot.pos);
                });
                
                // Drag and Drop Zone
                slotEl.addEventListener('dragover', e => {
                    e.preventDefault(); // Permitir drop
                    slotEl.classList.add('drag-over');
                });
                slotEl.addEventListener('dragleave', () => slotEl.classList.remove('drag-over'));
                slotEl.addEventListener('drop', e => {
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

            // Drag Start (v20.2.0 - Solo si no está bloqueado)
            card.draggable = !state.isEditingPositions;
            
            card.addEventListener('dragstart', e => {
                if (state.isEditingPositions) {
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

    // --- Funciones Globales ---
    window.jbConfirm = (message) => {
        return new Promise((resolve) => {
            const dialog = document.getElementById('jb-global-dialog');
            const msgEl = document.getElementById('jb-dialog-message');
            const btnConfirm = document.getElementById('jb-dialog-btn-confirm');
            const btnCancel = document.getElementById('jb-dialog-btn-cancel');

            msgEl.innerText = message;
            dialog.style.display = 'flex';

            const closeDialog = (result) => {
                dialog.style.display = 'none';
                btnConfirm.onclick = null;
                btnCancel.onclick = null;
                resolve(result);
            };

            btnConfirm.onclick = () => closeDialog(true);
            btnCancel.onclick = () => closeDialog(false);
        });
    };

    // --- SISTEMA DE TOASTS PREMIUM (v21.0.0) ---
    // Tipos: 'success', 'error', 'info'
    window.jbToast = (message, type = 'info', duration = 3500) => {
        const container = document.getElementById('jb-toast-container');
        if (!container) return;

        const icons = { success: '✅', error: '❌', info: '💡' };
        const titles = { success: 'ÉXITO', error: 'ERROR', info: 'INFO' };

        const toast = document.createElement('div');
        toast.className = `jb-toast toast-${type}`;
        toast.innerHTML = `
            <div class="jb-toast-icon">${icons[type] || icons.info}</div>
            <div class="jb-toast-body">
                <div class="jb-toast-title">${titles[type] || titles.info}</div>
                <div class="jb-toast-message">${escapeHTML(message)}</div>
            </div>
            <div class="jb-toast-progress" style="animation-duration: ${duration}ms;"></div>
        `;

        // Clic para cerrar manualmente
        toast.onclick = () => dismissToast(toast);

        container.appendChild(toast);

        // Auto-dismiss
        const timer = setTimeout(() => dismissToast(toast), duration);
        toast._timer = timer;
    };

    function dismissToast(toast) {
        if (toast._dismissed) return;
        toast._dismissed = true;
        clearTimeout(toast._timer);
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 400);
    }

    // --- jbAlert: Reemplazo del alert() nativo (v21.0.0) ---
    // Usa el mismo diálogo global pero oculta el botón cancelar
    window.jbAlert = (message) => {
        return new Promise((resolve) => {
            const dialog = document.getElementById('jb-global-dialog');
            const msgEl = document.getElementById('jb-dialog-message');
            const btnConfirm = document.getElementById('jb-dialog-btn-confirm');
            const btnCancel = document.getElementById('jb-dialog-btn-cancel');

            msgEl.innerText = message;
            btnCancel.style.display = 'none';
            btnConfirm.textContent = 'ACEPTAR';
            dialog.style.display = 'flex';

            const closeDialog = () => {
                dialog.style.display = 'none';
                btnCancel.style.display = '';
                btnConfirm.textContent = 'CONFIRMAR';
                btnConfirm.onclick = null;
                resolve();
            };

            btnConfirm.onclick = () => closeDialog();
        });
    };

    // --- LOADING OVERLAY (v21.0.0) ---
    let loadingTimeout = null;
    window.jbLoading = {
        show: (text = 'Sincronizando...') => {
            const overlay = document.getElementById('jb-loading-overlay');
            if (!overlay) return;
            const textEl = overlay.querySelector('.jb-loading-text');
            if (textEl) textEl.textContent = text;
            overlay.classList.add('active');
            // Safety timeout: ocultar tras 15s por si la operación falla silenciosamente
            clearTimeout(loadingTimeout);
            loadingTimeout = setTimeout(() => window.jbLoading.hide(), 15000);
        },
        hide: () => {
            clearTimeout(loadingTimeout);
            const overlay = document.getElementById('jb-loading-overlay');
            if (overlay) overlay.classList.remove('active');
        }
    };

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

    // --- LÓGICA DE JORNADAS Y PARTIDOS ---
    function setupSessionHandlers() {
        btnNewSession.addEventListener('click', () => {
            const activeTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
            if (sessionTacticName) {
                sessionTacticName.textContent = activeTactic ? activeTactic.name.toUpperCase() : 'SIN TÁCTICA ACTIVA';
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

        btnConfirmSessionStart.addEventListener('click', () => {
            sessionStartModal.style.display = 'none';
            const selectedType = document.querySelector('input[name="sessionType"]:checked')?.value || 'friendly';
            
            const newSession = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                matches: [],
                mvpId: null,
                type: selectedType,
                status: 'active'
            };
            state.sessions.push(newSession);
            state.activeSession = newSession;
            saveSessionCloud(newSession);
            renderActiveSession();
            switchView('active-session');
        });

        btnBackToSessions.addEventListener('click', () => {
            renderSessions();
            switchView('jornadas');
        });

        btnAddMatch.addEventListener('click', () => {
            matchModal.style.display = 'flex';
        });

        closeMatchModal.onclick = () => matchModal.style.display = 'none';

        matchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const rival = document.getElementById('rivalName').value;
            const type = document.getElementById('matchType').value;
            
            startLiveMatch(rival, type);
            matchModal.style.display = 'none';
            matchForm.reset();
        });

        // Controles de partido en vivo
        btnAddGoalHome.addEventListener('click', () => openGoalModal());
        btnSubGoalHome.addEventListener('click', () => {
            const lastHomeGoalIndex = [...currentMatch.events].reverse().findIndex(e => e.side === 'home');
            if (lastHomeGoalIndex !== -1) {
                const actualIndex = currentMatch.events.length - 1 - lastHomeGoalIndex;
                currentMatch.events.splice(actualIndex, 1);
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
    }

    function renderSessions() {
        sessionsList.innerHTML = '';
        if (state.sessions.length === 0 && !state.activeSession) {
            sessionsList.innerHTML = `
                <div class="card-elite" style="text-align:center; opacity:0.5; padding: 40px; background: transparent; border: 2px dashed rgba(255,255,255,0.05);">
                    <p style="font-size: 2.5rem; margin-bottom: 10px;">🛡️</p>
                    <p style="font-weight: 800; letter-spacing: 2px;">ARCHIVO VACÍO</p>
                    <p style="font-size: 0.7rem; color: var(--text-muted);">AÚN NO HAS COMPLETADO NINGUNA JORNADA</p>
                </div>`;
            return;
        }

        const allSessions = [...state.sessions];
        if (state.activeSession) {
            if (!allSessions.find(s => s.id === state.activeSession.id)) {
                allSessions.push(state.activeSession);
            }
        }

        allSessions.sort((a, b) => b.id - a.id).forEach(session => {
            const card = document.createElement('div');
            const isActive = state.activeSession && session.id === state.activeSession.id;
            
            const wins = session.matches.filter(m => m.scoreHome > m.scoreAway).length;
            const draws = session.matches.filter(m => m.scoreHome === m.scoreAway).length;
            const losses = session.matches.filter(m => m.scoreHome < m.scoreAway).length;
            
            // Determinar tendencia para el color lateral
            let trendClass = 'draw-trend';
            if (wins > losses) trendClass = 'win-trend';
            else if (losses > wins) trendClass = 'loss-trend';

            card.className = `session-card fade-in ${trendClass} ${isActive ? 'active' : ''}`;
            
            const isAdmin = state.user.role === 'manager' || state.user.role === 'capitan';
            
            card.innerHTML = `
                <div style="flex: 1;">
                    <p style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">
                        ${session.date} ${isActive ? '<span class="badge-live">LIVE</span>' : ''}
                    </p>
                    <div style="display: flex; align-items: baseline; gap: 10px; margin-top: 8px;">
                        <span class="session-stat-value stat-v">${wins}V</span>
                        <span style="color: rgba(255,255,255,0.1); font-weight: 900;">|</span>
                        <span class="session-stat-value stat-e">${draws}E</span>
                        <span style="color: rgba(255,255,255,0.1); font-weight: 900;">|</span>
                        <span class="session-stat-value stat-d">${losses}D</span>
                    </div>
                    <p style="font-size: 0.65rem; color: var(--primary); margin-top: 5px; font-weight: 700; opacity: 0.8;">
                        ${session.matches.length} PARTIDOS REGISTRADOS
                    </p>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    ${session.mvpId ? `<div style="text-align: right;"><p style="font-size: 0.55rem; color: var(--text-muted); text-transform: uppercase;">MVP</p><p style="color: var(--primary); font-weight: 900; font-size: 0.75rem;">${getPlayerNameById(session.mvpId)}</p></div>` : ''}
                    ${isAdmin ? `<button class="btn-delete-session" title="Eliminar Jornada">🗑️</button>` : ''}
                </div>
            `;
            
            // Evitar que el clic en borrar abra el detalle
            if (isAdmin) {
                card.querySelector('.btn-delete-session').onclick = (e) => {
                    e.stopPropagation();
                    handleDeleteSession(session);
                };
            }

            card.onclick = () => renderActiveSession(session);
            sessionsList.appendChild(card);
        });
    }

    async function handleDeleteSession(session) {
        const confirmMsg = session.id === (state.activeSession ? state.activeSession.id : -1) 
            ? '¿Quieres eliminar la jornada actual en curso?'
            : `¿Eliminar la jornada del ${session.date}? Esto revertirá TODAS las estadísticas asociadas.`;
            
        const ok = await window.jbConfirm(confirmMsg);
        if (ok) {
            revertSessionStats(session);
            
            if (state.activeSession && session.id === state.activeSession.id) {
                state.activeSession = null;
                localStorage.removeItem('jb_active_session');
                // En Supabase borramos la sesión
                deleteSessionCloud(session.id);
            } else {
                state.sessions = state.sessions.filter(s => s.id !== session.id);
                deleteSessionCloud(session.id);
            }
            
            // Sincronizar todos los jugadores afectados por la reversión
            for (let p of state.players) {
                await savePlayerCloud(p);
            }
            renderSessions();
            renderPlayers();
            switchView('jornadas');
        }
    }

    function revertSessionStats(session) {
        session.matches.forEach(match => {
            // Revertir Goles y Asistencias
            match.events.forEach(ev => {
                const scorer = state.players.find(p => p.id == ev.scorerId);
                const assistant = state.players.find(p => p.id == ev.assistantId);
                
                if (scorer) {
                    scorer.stats[match.type].goals = Math.max(0, scorer.stats[match.type].goals - 1);
                }
                if (assistant) {
                    assistant.stats[match.type].assists = Math.max(0, assistant.stats[match.type].assists - 1);
                }
            });

            // Revertir Partidos Jugados
            // Para ser precisos, descontamos PJ a los que estuvieran en la alineación técnica
            // (La app asocia los PJ a los que están en la táctica activa en el momento de fin del partido)
            // Aquí usamos un fallback: si el partido no guardó la alineación, no podemos saberlo 100% retroactivo,
            // pero como los PJ se sumaron en finalizeMatch usando state.savedTactics[0], 
            // asumimos que el usuario sabe que si borra una jornada muy antigua con tácticas cambiadas, el PJ podría variar ligeramente.
            // MEJORA: El match ahora guarda implicitamente los que sumaron PJ si quisiéramos ser perfectos, 
            // pero por ahora revertimos PJ a los que sumaron stats en ese partido por ahora, 
            // o mejor, dejamos los PJ si hay duda? No, el usuario pidió "deshacer estadísticas".
            
            // Revertir MVP de partido
            if (match.mvpId) {
                const mvpPlayer = state.players.find(p => p.id == match.mvpId);
                if (mvpPlayer) {
                    mvpPlayer.stats[match.type].mvps = Math.max(0, mvpPlayer.stats[match.type].mvps - 1);
                }
            }
        });

        // Revertir MVP de jornada (legacy o si existiera)
        if (session.mvpId) {
            const mvpPlayer = state.players.find(p => p.id == session.mvpId);
            if (mvpPlayer) {
                // Determinar si fue oficial o friendly (lógica original de finalizeSession)
                const hasOfficial = session.matches.some(m => m.type === 'official');
                const type = hasOfficial ? 'official' : 'friendly';
                mvpPlayer.stats[type].mvps = Math.max(0, mvpPlayer.stats[type].mvps - 1);
            }
        }
    }

    function renderActiveSession(sessionToView = null) {
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

            card.innerHTML = `
                <div class="match-card-main">
                    <div>
                        <span class="${typeClass}">${match.type.toUpperCase()}</span>
                        <h4 style="margin-top:5px;">vs ${match.rival.toUpperCase()}</h4>
                    </div>
                    <div class="result">${match.scoreHome} - ${match.scoreAway}</div>
                </div>
                ${eventsHTML}
            `;
            matchesList.appendChild(card);
        });
    }

    function startLiveMatch(rival, type) {
        currentMatch = {
            id: Date.now(),
            rival: rival,
            type: type,
            scoreHome: 0,
            scoreAway: 0,
            events: []
        };
        updateLiveMatchUI();
        switchView('match-live');
        
        // Renderizar la táctica en el mini-pitch del partido
        const livePitch = document.getElementById('live-football-pitch');
        if (livePitch) {
            // Usar la primera táctica guardada si no hay una activa
            if (!state.activeTacticId && state.savedTactics.length > 0) {
                state.activeTacticId = state.savedTactics[0].id;
            }
            renderPitch(livePitch);
        }
    }

    window.removeMatchEvent = (index) => {
        currentMatch.events.splice(index, 1);
        currentMatch.scoreHome = currentMatch.events.filter(e => e.side === 'home').length;
        currentMatch.scoreAway = currentMatch.events.filter(e => e.side === 'away').length;
        updateLiveMatchUI();
    };

    function openGoalModal() {
        goalModal.style.display = 'flex';
        selectedGoalScorerId = null;
        selectedAssistantId = null;
        renderGoalSelection();
    }

    function renderGoalSelection() {
        scorerSelection.innerHTML = '';
        assistantSelection.innerHTML = '';

        // Filtro Sugerido: Solo jugadores asignados en la táctica activa
        // Si no hay táctica activa o slots, mostrar todos los jugadores como fallback
        let relevantPlayers = state.players;
        
        // Intentar buscar táctica "útil" (la última guardada o similar si no hay activa)
        const lastTactic = state.savedTactics[0]; 
        if (lastTactic) {
            const assignedIds = Object.values(lastTactic.assignments);
            if (assignedIds.length > 0) {
                relevantPlayers = state.players.filter(p => assignedIds.includes(p.id.toString()) || assignedIds.includes(p.id));
            }
        }

        relevantPlayers.forEach(player => {
            // Scorer
            const sItem = createPlayerSelectItem(player);
            sItem.onclick = () => {
                document.querySelectorAll('#scorer-selection .player-select-item').forEach(el => el.classList.remove('selected'));
                sItem.classList.add('selected');
                selectedGoalScorerId = player.id;
            };
            scorerSelection.appendChild(sItem);

            // Assistant
            const aItem = createPlayerSelectItem(player);
            aItem.onclick = () => {
                document.querySelectorAll('#assistant-selection .player-select-item').forEach(el => el.classList.remove('selected'));
                aItem.classList.add('selected');
                selectedAssistantId = player.id;
            };
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
            side: 'home' // Por simplicidad, el modal es para goles propios
        });
        currentMatch.scoreHome++;
        goalModal.style.display = 'none';
        updateLiveMatchUI();
    }

    async function finalizeMatch() {
        if (!state.activeSession) return;
        const mType = state.activeSession.type === 'official' ? 'official' : 'friendly';
        currentMatch.type = mType; // Asegurar consistencia

        const initStats = (p) => {
            if (!p.stats) p.stats = { official: { goals: 0, assists: 0, matches: 0 }, friendly: { goals: 0, assists: 0, matches: 0 } };
            if (!p.stats.official) p.stats.official = { goals: 0, assists: 0, matches: 0 };
            if (!p.stats.friendly) p.stats.friendly = { goals: 0, assists: 0, matches: 0 };
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

        // 2. Procesar PJ (Partidos Jugados)
        const lastTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
        if (lastTactic) {
            const assignedIds = Object.values(lastTactic.assignments).map(id => id.toString());
            for (let p of state.players) {
                if (assignedIds.includes(p.id.toString())) {
                    initStats(p);
                    p.stats[mType].matches++;
                    playersToSave.add(p);
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
                    mvpPlayer.mvp_count = (mvpPlayer.mvp_count || 0) + 1;
                    await savePlayerCloud(mvpPlayer);
                }
            }
            
            await saveSessionCloud(state.activeSession);
            state.activeSession = null;
            localStorage.removeItem('jb_active_session');
        }
        
        renderSessions();
        renderPlayers();
        switchView('jornadas');
    }

    function getPlayerNameById(id) {
        if (!id) return '';
        const p = state.players.find(p => p.id == id);
        return p ? p.name.split(' ')[0].toUpperCase() : '';
    }

    // --- FUNCIONES DE PERFIL ELITE ---

    function getPlayerTransform(player) {
        if (!player) return 'scale(1)';
        const s = player.photo_scale || 1.0;
        const x = player.photo_x || 0;
        const y = player.photo_y || 0;
        return `translate(${x}px, ${y}px) scale(${s})`;
    }

    function updatePlayerPreview() {
        const previewContainer = document.getElementById('live-player-preview');
        if (!previewContainer) return;
        if (state.userPlayer) renderPlayerStats(state.userPlayer);

        const name = document.getElementById('playerName').value || 'TU NOMBRE';
        const dorsal = document.getElementById('dorsal').value || '00';
        const pos = document.getElementById('primaryPos').value || '??';
        
        const transform = getPlayerTransform({
            photo_scale: parseFloat(document.getElementById('photoScale')?.value || 1.0),
            photo_x: parseInt(document.getElementById('photoX')?.value || 0),
            photo_y: parseInt(document.getElementById('photoY')?.value || 0)
        });
        
        // Prioridad: Foto recién subida > Foto guardada > Avatar
        const photo = currentPhotoBase64 || (state.userPlayer ? state.userPlayer.photo_url : null);
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

    function renderMyProfile(player) {
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
    }

    function populatePlayerForm(player) {
        if (!player) return;
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

        const off = stats.official || { goals: 0, assists: 0, matches: 0 };
        const fri = stats.friendly || { goals: 0, assists: 0, matches: 0 };

        tbody.innerHTML = `
            <tr class="row-official">
                <td><span class="stat-category-tag tag-off">OFICIAL</span></td>
                <td>${off.matches || 0}</td>
                <td>${off.goals || 0}</td>
                <td>${off.assists || 0}</td>
                <td>-</td>
            </tr>
            <tr class="row-friendly">
                <td><span class="stat-category-tag tag-fri">AMISTOSO</span></td>
                <td>${fri.matches || 0}</td>
                <td>${fri.goals || 0}</td>
                <td>${fri.assists || 0}</td>
                <td>-</td>
            </tr>
        `;

        const totalPJ = (off.matches || 0) + (fri.matches || 0);
        const totalG = (off.goals || 0) + (fri.goals || 0);
        const totalA = (off.assists || 0) + (fri.assists || 0);

        tfooter.innerHTML = `
            <td>TOTAL TEMPORADA</td>
            <td>${totalPJ}</td>
            <td>${totalG}</td>
            <td>${totalA}</td>
            <td style="color:var(--primary); font-weight:900;">⭐ ${mvp}</td>
        `;
    }

    function showPlayerProfile(id) {
        const player = state.players.find(p => p.id === id || p.id == id);
        if (!player) return;

        const avatar = AVATARS.find(av => av.id === (player.avatarID || player.avatar_id || 1));
        const modal = document.getElementById('profile-modal');
        const content = document.getElementById('profile-modal-content');
        const statsBox = document.getElementById('profile-modal-stats');

        const photo = player.photo_url;
        const transform = getPlayerTransform(player);

        content.innerHTML = `
            <div class="player-card-fut large" style="margin: 0 auto; box-shadow: 0 0 40px var(--primary-glow);">
                <div class="dorsal-large">${player.dorsal || '00'}</div>
                <div class="pos-large">${player.primaryPos || '??'}</div>
                <div class="player-img-large">
                    ${photo ? `<img src="${photo}" style="transform: ${transform}; object-position: top;">` : (avatar ? avatar.svg : '')}
                </div>
                <div class="name-banner-large">
                    <h2 style="font-size: ${(player.name || '').length > 10 ? '1.1rem' : '1.5rem'}">${escapeHTML((player.name || 'SIN NOMBRE').toUpperCase())}</h2>
                </div>
            </div>
        `;

        const s = player.stats?.official || { matches: 0, goals: 0, assists: 0 };
        statsBox.innerHTML = `
            <div class="modal-stat-box"><label>PARTIDOS</label><span>${s.matches}</span></div>
            <div class="modal-stat-box"><label>GOLES</label><span>${s.goals}</span></div>
            <div class="modal-stat-box"><label>ASISTS</label><span>${s.assists}</span></div>
        `;

        modal.style.display = 'flex';
    }

    function renderHomeDashboard() {
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
        const displayUser = document.getElementById('display-user-welcome');
        const displayRole = document.getElementById('display-user-role');

        if (totalPlayersEl) totalPlayersEl.textContent = state.players.length;
        if (totalSessionsEl) totalSessionsEl.textContent = state.sessions.length;
        
        const username = state.user?.profile?.full_name || state.user?.profile?.username || 'JUGADOR';
        const role = state.user?.role || 'JUGADOR';

        if (displayUser) displayUser.textContent = username.toUpperCase();
        if (displayRole) displayRole.textContent = role.toUpperCase();

        // --- 1. TOP GOLEADORES ---
        if (scorersListEl) {
            scorersListEl.innerHTML = '';
            const scorers = state.players
                .map(p => ({
                    name: p.name,
                    photo: p.photo_url,
                    transform: getPlayerTransform(p),
                    avatar: AVATARS.find(av => av.id === (p.avatarID || p.avatar_id || 1)),
                    totalGoals: (p.stats?.official?.goals || 0) + (p.stats?.friendly?.goals || 0)
                }))
                .filter(s => s.totalGoals > 0)
                .sort((a, b) => b.totalGoals - a.totalGoals)
                .slice(0, 3);

            if (scorers.length === 0) {
                scorersListEl.innerHTML = '<p style="font-size:0.7rem; text-align:center; opacity:0.5;">No hay datos registrados.</p>';
            } else {
                scorers.forEach((s, i) => {
                    const row = document.createElement('div');
                    row.className = 'card-elite';
                    row.style.cssText = 'padding: 8px 12px; margin: 0; display: flex; align-items: center; gap: 12px; border-color: rgba(240,165,0,0.1); border-radius: 8px;';
                    row.innerHTML = `
                        <span style="font-size: 0.8rem; font-weight: 900; color: var(--primary); width: 15px;">${i+1}</span>
                        <div style="width: 25px; height: 25px; background: rgba(0,0,0,0.2); border-radius: 4px; padding: 2px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                            ${s.photo ? `<img src="${s.photo}" style="width:100%; height:100%; object-fit:cover; object-position: top; transform:${s.transform}">` : (s.avatar ? s.avatar.svg : '')}
                        </div>
                        <span style="font-size: 0.75rem; font-weight: 800; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(s.name.toUpperCase())}</span>
                        <span style="font-size: 0.75rem; font-weight: 900; color: var(--primary);">${s.totalGoals} <small style="font-size:0.5rem;">GLS</small></span>
                    `;
                    scorersListEl.appendChild(row);
                });
            }
        }

        // --- 2. TOP ASISTENTES ---
        if (assistsListEl) {
            assistsListEl.innerHTML = '';
            const assistants = state.players
                .map(p => ({
                    name: p.name,
                    photo: p.photo_url,
                    transform: getPlayerTransform(p),
                    avatar: AVATARS.find(av => av.id === (p.avatarID || p.avatar_id || 1)),
                    totalAssists: (p.stats?.official?.assists || 0) + (p.stats?.friendly?.assists || 0)
                }))
                .filter(s => s.totalAssists > 0)
                .sort((a, b) => b.totalAssists - a.totalAssists)
                .slice(0, 3);

            if (assistants.length === 0) {
                assistsListEl.innerHTML = '<p style="font-size:0.7rem; text-align:center; opacity:0.5;">No hay datos registrados.</p>';
            } else {
                assistants.forEach((s, i) => {
                    const row = document.createElement('div');
                    row.className = 'card-elite';
                    row.style.cssText = 'padding: 8px 12px; margin: 0; display: flex; align-items: center; gap: 12px; border-color: rgba(240,165,0,0.1); border-radius: 8px;';
                    row.innerHTML = `
                        <span style="font-size: 0.8rem; font-weight: 900; color: var(--primary); width: 15px;">${i+1}</span>
                        <div style="width: 25px; height: 25px; background: rgba(0,0,0,0.2); border-radius: 4px; padding: 2px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                            ${s.photo ? `<img src="${s.photo}" style="width:100%; height:100%; object-fit:cover; object-position: top; transform:${s.transform}">` : (s.avatar ? s.avatar.svg : '')}
                        </div>
                        <span style="font-size: 0.75rem; font-weight: 800; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(s.name.toUpperCase())}</span>
                        <span style="font-size: 0.75rem; font-weight: 900; color: var(--primary);">${s.totalAssists} <small style="font-size:0.5rem;">AST</small></span>
                    `;
                    assistsListEl.appendChild(row);
                });
            }
        }

        // --- 3. RECOPILAR PARTIDOS PARA RATIO Y RACHA ---
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
    async function exportTacticAsImage() {
        const activeTactic = state.savedTactics.find(t => t.id === state.activeTacticId);
        if (!activeTactic) return;

        const teamNameText = (state.team ? state.team.name : 'Mi Club').toUpperCase();
        const matchTimeText = exportMatchTimeInput.value || '23:00';
        
        // 1. Crear el contenedor Off-screen
        const wrapper = document.createElement('div');
        wrapper.className = 'export-matchday-wrapper';
        
        wrapper.innerHTML = `
            <div class="export-broadcast-container">
                <div class="export-scorebug-banner">
                    <div class="scorebug-left">
                        <h1 class="scorebug-team-name">${escapeHTML(teamNameText)}</h1>
                        <div class="scorebug-subline">JB-SQUAD <span style="color: var(--primary);">ELITE UNIT</span></div>
                    </div>
                    <div class="scorebug-right">
                        <div class="scorebug-matchday">MATCHDAY • ${escapeHTML(matchTimeText)}</div>
                        <div class="scorebug-formation">LINEUP: ${escapeHTML(activeTactic.formation)}</div>
                    </div>
                </div>
                <div class="export-pitch-area">
                    <!-- El campo se clonará aquí -->
                </div>
            </div>
        `;
        
        document.body.appendChild(wrapper);
        const pitchAreaElement = wrapper.querySelector('.export-pitch-area');
        
        // 2. Clonar el campo y renderizarlo
        const pitchClone = pitch.cloneNode(true);
        pitchClone.id = 'pitch-clone-export';
        
        // Limpieza de UI en el clon (v20.3.0)
        pitchClone.querySelectorAll('.slot-control-panel, .btn-delete-slot, #btn-modify-drawing').forEach(el => el.remove());
        
        // Quitar estilos de control si los hubiera y forzar centrado
        pitchClone.style.transform = 'none';
        pitchClone.style.margin = '0 auto';
        
        pitchAreaElement.appendChild(pitchClone);
        
        // Forzamos un delay suficiente para asegurar renderizado del fondo y fuentes (v20.4.0)
        await new Promise(r => setTimeout(r, 500));

        try {
            const canvas = await html2canvas(wrapper, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#050505',
                scale: 2, // Alta calidad
                logging: false
            });

            // 3. Descargar
            const link = document.createElement('a');
            link.download = `MATCHDAY_${teamNameText.replace(/\s+/g, '_')}_${matchTimeText.replace(':', 'h')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
        } catch (err) {
            console.error("Error al exportar:", err);
            window.jbConfirm("Error al generar la imagen. Por favor, inténtalo de nuevo.");
        } finally {
            // 4. Limpieza
            document.body.removeChild(wrapper);
        }
    }

});
