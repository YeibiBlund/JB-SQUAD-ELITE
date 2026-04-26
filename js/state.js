/**
 * JB-SQUAD ELITE: Estado Global y Configuración de Supabase
 */

// Configuración de Supabase
const SUPABASE_URL = 'https://drzwawwlpsunprtfbytu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_dJK1GrVDtroLy4zqHUwdfQ_QRIVCmi3';
// Inicialización del cliente (se adjunta a window para acceso global sin colisiones de const)
window.supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Estado Global de la Aplicación
window.state = {
    user: null,         // { auth, profile, membership, role }
    team: null,         // Datos del equipo actual
    players: [],
    savedTactics: [],
    sessions: [],
    activeSession: null,
    activePoll: null, 
    activeTacticId: null,
    currentView: 'auth',
    isEditingPositions: false, 
    editingPlayer: null,
    editingPollId: null,
    // Contexto de alineación inteligente
    alignmentMode: {
        active: false,
        voters: {}, // userId -> status ('yes', 'no', 'late')
        currentPollId: null 
    },
    historyCache: {},    // Caché para el historial de convocatorias { key: [data] }
    // Cachés de rendimiento (v49.5)
    bannerCache: { data: null, timestamp: 0 },
    requestsBadgeCache: { count: 0, timestamp: 0 }
};


