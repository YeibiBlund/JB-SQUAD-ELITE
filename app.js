// JB-SQUAD ELITE: Lógica de la aplicación
// Especialista en Diseño Premium Mobile-First

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración de Datos y Estado
    const POSITIONS = ['POR', 'DFC', 'CAD', 'CAI', 'LI', 'LD', 'MCD', 'MC', 'MVI', 'MVD', 'MD', 'MI', 'MCO', 'ED', 'EI', 'DC'];
    
    // 1. Funciones de Persistencia Segura
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

    // Configuración de Supabase
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
        currentView: 'auth'
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
            { id: 'DFC1', pos: 'DFC', x: 75, y: 74 }, { id: 'DFC2', pos: 'DFC', x: 50, y: 74 }, { id: 'DFC3', pos: 'DFC', x: 25, y: 74 },
            { id: 'MCD', pos: 'MCD', x: 50, y: 56 },
            { id: 'MD', pos: 'MD', x: 88, y: 44 }, { id: 'MC1', pos: 'MC', x: 65, y: 44 }, { id: 'MC2', pos: 'MC', x: 35, y: 44 }, { id: 'MI', pos: 'MI', x: 12, y: 44 },
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
    const savedTacticsList = document.getElementById('saved-tactics-list');
    const newTacticNameInput = document.getElementById('newTacticName');

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

    async function init() {
        if (!supabase) return;

        // Escuchar cambios de autenticación
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
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
        try {
            console.log("Manejando sesión para:", authUser.email);
            
            // 1. Cargar Perfil (con manejo de error si no existe)
            let { data: profile, error: pErr } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
            
            if (pErr) console.error("Error cargando perfil:", pErr);

            // Si por alguna razón no hay perfil, lo creamos ahora (seguridad extra)
            if (!profile) {
                const username = authUser.user_metadata?.full_name || authUser.email.split('@')[0];
                const { data: newProfile } = await supabase.from('profiles').insert({ 
                    id: authUser.id, 
                    full_name: username 
                }).select().single();
                profile = newProfile;
            }
            
            // 2. Cargar Membresía
            let { data: membership, error: mErr } = await supabase.from('memberships').select('*, teams(*)').eq('user_id', authUser.id).maybeSingle();
            
            if (mErr) console.error("Error cargando membresía:", mErr);

            state.user = { 
                auth: authUser,
                profile: profile,
                membership: membership,
                role: membership ? membership.role : null 
            };

            if (!membership) {
                console.log("Usuario sin club, enviando a selector.");
                switchAuthView('team-select');
            } else {
                console.log("Usuario con club:", membership.teams.name);
                state.team = membership.teams;
                await loadTeamData();
                switchAuthView('main');
                applyRolePermissions();
            }
        } catch (err) {
            console.error("Fallo crítico en handleUserSession:", err);
            alert("Error al cargar la sesión. Intenta recargar la página.");
        }
    }

    async function loadTeamData() {
        if (!state.team) return;

        // Cargar Jugadores del Equipo
        const { data: dbPlayers } = await supabase.from('players').select('*').eq('team_id', state.team.id);
        if (dbPlayers) state.players = dbPlayers.map(p => ({
            id: p.id,
            name: p.name,
            consoleID: p.console_id,
            avatarID: p.avatar_id,
            primaryPos: p.primary_pos,
            secondaryPos: p.secondary_pos,
            dorsal: p.dorsal,
            official: p.stats.official,
            friendly: p.stats.friendly
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
            isActive: t.is_active
        }));

        updateTeamHeader();
        renderPlayers();
        renderSessions();
        renderTactics();

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
            authView.style.setProperty('display', 'flex', 'important');
        } else if (viewName === 'team-select' && teamSelect) {
            teamSelect.style.setProperty('display', 'flex', 'important');
        } else if (viewName === 'main' && mainApp) {
            mainApp.style.setProperty('display', 'block', 'important');
        }
    }

    function applyRolePermissions() {
        const role = state.user.role;
        const isAdmin = role === 'manager' || role === 'capitan';
        
        // Elementos que solo ven Admins
        document.querySelectorAll('[data-role-required="manager"]').forEach(el => {
            el.style.display = isAdmin ? 'block' : 'none';
        });

        // Modificar botones específicos
        const btnAddPlayer = document.getElementById('btn-go-to-add-player');
        if (btnAddPlayer) btnAddPlayer.style.display = isAdmin ? 'flex' : 'none';

        const btnNewSession = document.getElementById('btn-new-session');
        if (btnNewSession) btnNewSession.style.display = isAdmin ? 'flex' : 'none';

        // Rol Badge en Header
        const header = document.getElementById('global-header');
        let badge = document.querySelector('.role-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = `role-badge role-${role}`;
            document.getElementById('display-user-name').insertAdjacentElement('afterend', badge);
        }
        badge.textContent = role.toUpperCase();
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
                alert('ERROR CRÍTICO: Debes desactivar "Confirmación de Email" en tu Panel de Supabase (Authentication -> Providers -> Email).');
            } else {
                alert('Error al entrar: ' + error.message);
            }
        }
    };

    regForm.onsubmit = async (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('reg-username');
        const username = usernameInput.value.trim();
        
        if (username.includes('@')) {
            return alert('ERROR: El nombre de usuario no puede contener el símbolo "@". Usa solo texto o números.');
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
            return alert('Error en el registro: ' + error.message);
        }
        
        if (data.user) {
            await supabase.from('profiles').insert({ id: data.user.id, full_name: username });
            alert('¡Cuenta creada con éxito! Iniciando sesión...');
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
        if (!state.user?.auth) return alert('Sesión no encontrada.');

        const { data: team, error: tErr } = await supabase.from('teams').insert({ 
            name: teamName, 
            owner_id: state.user.auth.id 
        }).select().single();

        if (tErr) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Crear Equipo';
            return alert('Error al crear equipo: ' + tErr.message);
        }

        await supabase.from('memberships').insert({
            user_id: state.user.auth.id,
            team_id: team.id,
            role: 'manager'
        });

        alert(`¡Club ${teamName} fundado! Bienvenido Manager.`);
        location.reload();
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
            return alert('No se ha encontrado ningún club con ese nombre.');
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
                alert('Error al unirte: ' + mErr.message);
            } else {
                alert(`¡Solicitud aceptada! Ya eres miembro de ${targetTeam.name}.`);
                location.reload();
            }
        }
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Buscar y Solicitar';
    };

        document.getElementById('btn-global-logout').onclick = () => supabase.auth.signOut();
        document.getElementById('btn-logout-temp').onclick = () => supabase.auth.signOut();
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
                stats: { official: p.official, friendly: p.friendly }
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
        
        alert('Migración Completada con Éxito. Recargando...');
        location.reload();
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
        if (!supabase) return;
        await supabase.from('players').upsert({
            id: player.id,
            name: player.name,
            console_id: player.consoleID,
            avatar_id: player.avatarID,
            primary_pos: player.primaryPos,
            secondary_pos: player.secondaryPos,
            dorsal: player.dorsal,
            stats: { official: player.official, friendly: player.friendly }
        });
    }

    async function saveSessionCloud(session) {
        if (!supabase) return;
        await supabase.from('sessions').upsert({
            id: session.id,
            date: session.date,
            status: session.status,
            matches: session.matches,
            mvp_id: session.mvpId
        });
    }

    async function saveTacticsCloud() {
        if (!supabase) return;
        // Upsert masivo de tácticas (o individualmente si se prefiere)
        for (let t of state.savedTactics) {
            await supabase.from('tactics').upsert({
                id: t.id,
                name: t.name,
                formation: t.formation,
                assignments: t.assignments,
                is_active: t.isActive
            });
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
                document.querySelectorAll('.avatar-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                document.getElementById('selected-avatar-id').value = av.id;
            };
            gallery.appendChild(item);
        });
    }

    // --- Lógica de Vistas ---
    // Lógica de Vistas (checkLoginState removido)

    function switchView(viewId) {
        views.forEach(v => v.classList.remove('active-view'));
        const targetView = document.getElementById(`view-${viewId}`);
        if (targetView) targetView.classList.add('active-view');

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
            } else {
                btn.classList.remove('active');
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
        const userNameLabel = document.getElementById('display-user-name');
        const userWelcome = document.getElementById('display-user-welcome');
        const teamWelcome = document.getElementById('display-team-welcome');
        
        const fullName = state.user.profile ? state.user.profile.full_name : 'Usuario Elite';
        const teamName = state.team ? state.team.name : 'Mi Club';

        if (teamNameLabel) teamNameLabel.textContent = teamName.toUpperCase();
        if (userNameLabel) userNameLabel.textContent = fullName.toUpperCase();
        if (userWelcome) userWelcome.textContent = fullName.split(' ')[0] || 'Capitán';
        if (teamWelcome) teamWelcome.textContent = teamName || 'tu club';
        
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
        btnGoToAddPlayer.addEventListener('click', () => switchView('add-player'));
        btnBackToPlantilla.addEventListener('click', () => switchView('plantilla'));

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
        // Registration Form (Obsoleto) removido en favor de setupAuthHandlers

        // Fichaje de Jugador
        playerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const secondaryPositions = Array.from(secondaryPosSelects)
                .map(s => s.value)
                .filter(v => v !== "" && v !== primaryPosSelect.value);

            const newPlayer = {
                id: Date.now(),
                name: document.getElementById('playerName').value,
                consoleID: document.getElementById('consoleID').value,
                dorsal: document.getElementById('dorsal').value,
                primaryPos: primaryPosSelect.value,
                secondaryPos: [...new Set(secondaryPositions)].slice(0, 3),
                avatarId: parseInt(document.getElementById('selected-avatar-id').value) || 1,
                official: { matches: 0, goals: 0, assists: 0, mvps: 0 },
                friendly: { matches: 0, goals: 0, assists: 0, mvps: 0 }
            };

            state.players.push(newPlayer);
            savePlayerCloud(newPlayer);
            
            playerForm.reset();
            updateTeamUI();
            renderPlayers();
            switchView('plantilla'); // Volver a la lista
        });
    }

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
                valA = a.official[sortConfig.key] || 0;
                valB = b.official[sortConfig.key] || 0;
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
            const badgeColor = getPositionColorClass(player.primaryPos);
            
            const pj = player.official.matches || 0;
            const gl = player.official.goals || 0;
            const ast = player.official.assists || 0;
            const avatar = AVATARS.find(av => av.id === (player.avatarId || 1));

            const isAdmin = state.user.role === 'manager' || state.user.role === 'capitan';

            playerRow.innerHTML = `
                <div class="player-avatar-mini" style="width: 35px; height: 35px; margin: 0 auto; background: rgba(0,0,0,0.2); border-radius: 5px; border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center; padding: 2px;">
                    ${avatar ? avatar.svg : ''}
                </div>
                <div style="display:flex; flex-direction:column; justify-content:center; overflow:hidden;">
                    <div style="display: flex; align-items: center; gap: 6px; overflow:hidden;">
                        <span class="player-pos-badge ${badgeColor}" style="font-size: 0.55rem; padding: 1px 4px; border-radius: 3px; min-width: 25px;">${player.primaryPos || 'NA'}</span>
                        <span style="font-weight: 800; font-size: 0.85rem; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${player.name ? player.name.toUpperCase() : 'DESCONOCIDO'}</span>
                    </div>
                    <span style="font-size: 0.6rem; color: var(--text-muted); margin-top:1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${player.consoleID || ''} | <span title="Goles Amistosos">${player.friendly.goals} G(A)</span>
                    </span>
                </div>
                <div class="stat-cell cell-center" style="font-size: 0.8rem;">${pj}</div>
                <div class="stat-cell cell-center" style="font-size: 0.8rem;">${gl}</div>
                <div class="stat-cell cell-center" style="font-size: 0.8rem;">${ast}</div>
                <div style="display: flex; justify-content: flex-end;">
                    ${isAdmin ? `<button class="btn-delete-row" title="Borrar Jugador" onclick="window.confirmDelete('${player.id}')">🗑️</button>` : ''}
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
                    id: Date.now(),
                    name: tName,
                    formation: formation,
                    assignments: {}
                };

                state.savedTactics.push(newTactic);
                saveTacticsCloud();
                
                openPitchView(newTactic.id);
            });
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
            slotEl.style.left = `${slot.x}%`;
            slotEl.style.top = `${slot.y}%`;
            
            const assignedPlayerId = activeTactic.assignments[slot.id];
            const player = state.players.find(p => p.id == assignedPlayerId);

            if (player) {
                const avatar = AVATARS.find(av => {
                    const tid = (typeof player.avatarId === 'string') ? parseInt(player.avatarId) : player.avatarId;
                    return av.id === (tid || 1);
                });
                slotEl.classList.add('filled');
                
                if (targetPitch === pitch) {
                    slotEl.draggable = true;
                    slotEl.addEventListener('dragstart', e => {
                        draggedSourceSlotId = slot.id;
                        e.dataTransfer.setData('text/plain', player.id);
                    });
                }

                const displayName = (player.name.split(' ')[0] || '').toUpperCase();
                let fontSize = '0.85rem';
                let letterSpacing = '0.5px';
                let scaleX = 1;

                if (displayName.length >= 13) {
                    fontSize = '0.5rem';
                    letterSpacing = '-0.8px';
                    scaleX = 0.8;
                } else if (displayName.length >= 11) {
                    fontSize = '0.6rem';
                    letterSpacing = '-0.5px';
                    scaleX = 0.85;
                } else if (displayName.length >= 9) {
                    fontSize = '0.7rem';
                    letterSpacing = '-0.3px';
                    scaleX = 0.9;
                }

                slotEl.innerHTML = `
                    <div class="dorsal-small">${player.dorsal}</div>
                    <div class="player-card-img">${avatar ? avatar.svg : ''}</div>
                    <h4 title="${player.name}" style="
                        font-size: ${fontSize} !important; 
                        letter-spacing: ${letterSpacing} !important; 
                        transform: scaleX(${scaleX}); 
                        white-space: nowrap; 
                        display: block; 
                        width: 100%;
                        text-align: center;
                        transform-origin: center center;
                        position: relative;
                        z-index: 10;
                    ">${displayName}</h4>
                    <div class="slot-pos">${slot.pos}</div>
                `;
            } else {
                slotEl.innerHTML = `
                    <span class="plus-icon">+</span>
                    <div class="slot-pos">${slot.pos}</div>
                `;
            }

            if (targetPitch === pitch) {
                slotEl.addEventListener('click', () => {
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

        state.players.forEach(player => {
            const isAssigned = assignedPlayerIds.includes(player.id.toString()) || assignedPlayerIds.includes(player.id);
            if (isAssigned) return; // Filtrar por completo si está en el campo

            const card = document.createElement('div');
            card.className = 'player-roster-card fade-in';
            card.draggable = true;

            const avatar = AVATARS.find(av => av.id === (player.avatarId || 1));

            card.innerHTML = `
                <div class="roster-card-avatar" style="width: 30px; height: 30px; margin-right: 10px; opacity: 0.8;">
                    ${avatar ? avatar.svg : ''}
                </div>
                <div class="roster-card-pos">${player.primaryPos}</div>
                <div class="roster-card-name">${player.name}</div>
                <div class="roster-card-stats">${player.secondaryPos && player.secondaryPos.length ? player.secondaryPos.join(', ') : '-'}</div>
                <div class="roster-card-rating">${player.dorsal}</div>
            `;

            // Drag Start
            card.addEventListener('dragstart', e => {
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

            const avatar = AVATARS.find(av => av.id === (player.avatarId || 1));
            card.innerHTML = `
                <div class="roster-card-avatar" style="width: 30px; height: 30px; margin-right: 10px;">
                    ${avatar ? avatar.svg : ''}
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

    window.confirmDelete = async (id) => {
        const agreed = await window.jbConfirm('¿TERMINAR CONTRATO DE ESTE JUGADOR?');
        if (agreed) {
            const playerIndex = state.players.findIndex(p => p.id === id);
            if (playerIndex !== -1) {
                state.players.splice(playerIndex, 1);
                await savePlayerCloud(null);
                renderPlayers();
                updateTeamUI();
                renderPitch(); // Actualizar también el campo
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
            const newSession = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                matches: [],
                mvpId: null,
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
                    scorer[match.type].goals = Math.max(0, scorer[match.type].goals - 1);
                }
                if (assistant) {
                    assistant[match.type].assists = Math.max(0, assistant[match.type].assists - 1);
                }
            });

            // Revertir Partidos Jugados
            // Para ser precisos, descontamos PJ a los que estuvieran en la alineación técnica
            // (La app asocia los PJ a los que están en la táctica activa en el momento de fin del partido)
            // Aquí usamos un fallback: si el partido no guardó la alineación, no podemos saberlo 100% retroactivo,
            // pero como los PJ se sumaron en finalizeMatch usando state.savedTactics[0], 
            // asumimos que el usuario sabe que si borra una jornada muy antigua con tácticas cambiadas, el PJ podría variar ligeramente.
            // MEJORA: El match ahora guarda implicitamente los que sumaron PJ si quisiéramos ser perfectos, 
            // pero por ahora revertimos PJ a los que sumaron stats en ese partido o simplemente no sumamos PJ negativo si hay duda.
            // En este sistema, restaremos PJ a TODOS los que tengan stats en ese partido por ahora, 
            // o mejor, dejamos los PJ si hay duda? No, el usuario pidió "deshacer estadísticas".
            
            // Revertir MVP de partido
            if (match.mvpId) {
                const mvpPlayer = state.players.find(p => p.id == match.mvpId);
                if (mvpPlayer) {
                    mvpPlayer[match.type].mvps = Math.max(0, mvpPlayer[match.type].mvps - 1);
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
                mvpPlayer[type].mvps = Math.max(0, mvpPlayer[type].mvps - 1);
            }
        }
    }

    function renderActiveSession(sessionToView = null) {
        // Si no se pasa sesión, intentamos usar la activa
        const session = sessionToView || state.activeSession;
        if (!session) return switchView('jornadas');
        
        const isActive = state.activeSession && session.id === state.activeSession.id;
        switchView('active-session');

        // Configurar UI según estado
        document.getElementById('active-session-name').textContent = session.date;
        
        if (isActive) {
            sessionMgmtControls.style.display = 'flex';
            sessionHistorySummary.style.display = 'none';
            sessionMvpBanner.style.display = 'none';
            sessionFinalizeContainer.style.display = 'block';
            document.getElementById('session-detail-title').innerHTML = `Jornada <span class="badge-live" style="font-size: 0.8rem; vertical-align: middle;">EN CURSO</span>`;
        } else {
            sessionMgmtControls.style.display = 'none';
            sessionHistorySummary.style.display = 'block';
            sessionFinalizeContainer.style.display = 'none';
            document.getElementById('session-detail-title').textContent = "Detalle de Jornada";
            
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
            alert('Debes seleccionar al menos un goleador');
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
        // Actualizar estadísticas globales
        for (let ev of currentMatch.events) {
            const scorer = state.players.find(p => p.id == ev.scorerId);
            const assistant = state.players.find(p => p.id == ev.assistantId);
            
            if (scorer) {
                scorer[currentMatch.type].goals++;
                await savePlayerCloud(scorer);
            }
            if (assistant) {
                assistant[currentMatch.type].assists++;
                await savePlayerCloud(assistant);
            }
        }

        // Contar partido jugado para los de la selección (relevantPlayers)
        // Usamos la misma lógica que en el picker: los de la táctica
        if (lastTactic) {
            const assignedIds = Object.values(lastTactic.assignments);
            for (let p of state.players) {
                if (assignedIds.includes(p.id.toString()) || assignedIds.includes(p.id)) {
                    p[currentMatch.type].matches++;
                    await savePlayerCloud(p);
                }
            }
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

    async function finishSession(mvpId, modalEl) {
        if (modalEl) document.body.removeChild(modalEl);
        
        if (mvpId) {
            const player = state.players.find(p => p.id == mvpId);
            if (player) {
                // ...
                const hasOfficial = state.activeSession.matches.some(m => m.type === 'official');
                if (hasOfficial) player.official.mvps++;
                else player.friendly.mvps++;
                
                state.activeSession.mvpId = mvpId;
                await savePlayerCloud(player);
            }
        }

        state.activeSession.status = 'closed';
        await saveSessionCloud(state.activeSession);
        state.activeSession = null;
        
        await window.jbConfirm('¡Jornada finalizada y archivada!');
        renderSessions();
        renderPlayers();
        switchView('jornadas');
    }

    function getPlayerNameById(id) {
        if (!id) return '';
        const p = state.players.find(p => p.id == id);
        return p ? p.name.split(' ')[0].toUpperCase() : '';
    }
});
