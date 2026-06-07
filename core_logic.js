// JB-SQUAD ELITE: Lógica de la aplicación
// Especialista en Diseño Premium Mobile-First

// 1. Configuración de Datos y Estado
// 1. Configuración: Cargada desde js/config.js y js/state.js
// El objeto 'state' y 'supabase' ya están disponibles globalmente.


// 1. Constantes Globales (v56.0 - Base64 para evitar roturas de HTML)

// 2. Elementos del DOM
var views = document.querySelectorAll('.view');
var navButtons = document.querySelectorAll('.nav-btn');
var onboarding = document.getElementById('view-auth');
var mainApp = document.getElementById('main-app');

var playerForm = document.getElementById('player-form');
var playerList = document.getElementById('player-list');

var btnGoToAddPlayer = document.getElementById('btn-go-to-add-player');
var btnBackToPlantilla = document.getElementById('btn-back-to-plantilla');

var primaryPosSelect = document.getElementById('primaryPos');
var secondaryPosSelects = document.querySelectorAll('.secondary-pos-select');

// Tacticas Elements
var tacticasList = document.getElementById('tacticas-list-view');
var tacticasInitial = document.getElementById('tacticas-initial-selection');
var tacticasField = document.getElementById('tacticas-field-view');
var headerTacticInfo = document.getElementById('header-tactic-info');
// Jornadas & Partidos Elements
var sessionsList = document.getElementById('sessions-list');
var matchesList = document.getElementById('matches-list');
var sessionMgmtControls = document.getElementById('session-mgmt-controls');
var sessionHistorySummary = document.getElementById('session-history-summary');
var sessionMvpBanner = document.getElementById('session-mvp-banner');
var sessionMvpName = document.getElementById('session-mvp-name');
var sessionFinalizeContainer = document.getElementById('session-finalize-container');
var btnNewSession = document.getElementById('btn-new-session');
var btnAddMatch = document.getElementById('btn-add-match');
var btnBackToSessions = document.getElementById('btn-back-to-sessions');
var btnFinalizeSession = document.getElementById('btn-finalize-session');

// Elementos Convocatorias v31.9.0
var btnNewPoll = document.getElementById('btn-new-poll');
var newPollContainer = document.getElementById('new-poll-form-container');
var btnSavePoll = document.getElementById('btn-save-poll');
var btnCancelPoll = document.getElementById('btn-cancel-poll');
var activePollContainer = document.getElementById('active-poll-container');
var pollHistoryList = document.getElementById('polls-history-list');
var navPollBadge = document.getElementById('nav-poll-badge');


// Live Match Elements
var scoreHomeDisplay = document.getElementById('score-home');
var scoreAwayDisplay = document.getElementById('score-away');
var btnAddGoalHome = document.getElementById('btn-add-goal-home');
var btnSubGoalHome = document.getElementById('btn-sub-goal-home');
var btnAddGoalAway = document.getElementById('btn-add-goal-away');
var btnSubGoalAway = document.getElementById('btn-sub-goal-away');
var eventsContainer = document.getElementById('events-container');
var btnFinishMatch = document.getElementById('btn-finish-match');

// Modals
var matchModal = document.getElementById('match-modal-overlay');
var matchForm = document.getElementById('match-form');
var closeMatchModal = document.getElementById('close-match-modal');

var goalModal = document.getElementById('goal-modal-overlay');
var closeGoalModal = document.getElementById('close-goal-modal');
var btnSaveGoal = document.getElementById('btn-save-goal');
var scorerSelection = document.getElementById('scorer-selection');
var assistantSelection = document.getElementById('assistant-selection');

var btnCreateTactic = document.getElementById('btn-create-tactic');
var btnBackToTacticsList = document.getElementById('btn-back-to-tactics-list');
var btnSaveTactic = document.getElementById('btn-save-tactic');
var btnExportTactic = document.getElementById('btn-export-tactic');
var btnSavePollAlignment = document.getElementById('btn-save-poll-alignment');
var mobileBtnSavePollAlignment = document.getElementById('mobile-btn-save-poll-alignment');
var savedTacticsList = document.getElementById('saved-tactics-list');
var newTacticNameInput = document.getElementById('newTacticName');
var btnExportSquad = document.getElementById('btn-export-squad');

// Modal Exportación (v4.8.0)
var exportTimeModal = document.getElementById('export-time-modal');
var btnConfirmExport = document.getElementById('btn-confirm-export');
var exportMatchTimeInput = document.getElementById('export-match-time');
var closeExportTime = document.getElementById('close-export-time');

// Modal Nueva Jornada
var sessionStartModal = document.getElementById('session-start-modal');
var btnConfirmSessionStart = document.getElementById('btn-confirm-session-start');
var btnChangeSessionTactic = document.getElementById('btn-change-session-tactic');
var closeSessionStart = document.getElementById('close-session-start');
var sessionTacticName = document.getElementById('session-tactic-name');
var scoreTeamName = document.getElementById('score-team-name');
var scoreRivalName = document.getElementById('score-rival-name');

// 2.3 Registro Interactivo (v56.7)
var pendingScorerId = null;
var quickGoalFab = document.getElementById('quick-goal-fab');
var btnQuickNoAssistant = document.getElementById('btn-quick-no-assistant');
var btnQuickCancel = document.getElementById('btn-quick-cancel');
var quickGoalStatus = document.getElementById('quick-goal-status');

var pitch = document.getElementById('football-pitch');
var playerSelector = document.getElementById('player-selector-overlay');
var selectorList = document.getElementById('selector-player-list');

// 2.1 Estado del Calendario (v36.3)
var currentCalendarDate = new Date();
var currentSessionsCalendarDate = new Date(); // v52.0
var currentPollsCalendarDate = new Date();    // v53.0

// 2. Elementos Matchday Creator (v57.0)
var btnCreateMatchdayGraphic = document.getElementById('btn-create-matchday-graphic');
var viewMatchdayCreator = document.getElementById('view-matchday-creator');
var btnBackFromCreator = document.getElementById('btn-back-from-creator');
var matchdayMatchesConfig = document.getElementById('matchday-matches-config');
var btnAddMatchToPoster = document.getElementById('btn-add-match-to-poster');
var btnGeneratePoster = document.getElementById('btn-generate-poster');
var miniPosterPreview = document.getElementById('mini-poster-preview');

var matchdayPosterData = {
    matches: [{ id: Date.now(), rivalId: 'manual', rivalName: '', rivalCrest: null, time: '23:00' }]
};
var globalTeamsList = [];

// Listeners para Navegación del Calendario
var btnCalPrev = document.getElementById('calendar-prev');
var btnCalNext = document.getElementById('calendar-next');

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
var btnSessionsCalPrev = document.getElementById('sessions-calendar-prev');
var btnSessionsCalNext = document.getElementById('sessions-calendar-next');
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
var btnPollsCalPrev = document.getElementById('polls-calendar-prev');
var btnPollsCalNext = document.getElementById('polls-calendar-next');
if (btnPollsCalPrev) {
    btnPollsCalPrev.onclick = () => {
        currentPollsCalendarDate.setMonth(currentPollsCalendarDate.getMonth() - 1);
        renderPollsCalendar();
    };
}
var btnPollsCalNextEl = document.getElementById('polls-calendar-next');
if (btnPollsCalNextEl) {
    btnPollsCalNextEl.onclick = () => {
        currentPollsCalendarDate.setMonth(currentPollsCalendarDate.getMonth() + 1);
        renderPollsCalendar();
    };
}
