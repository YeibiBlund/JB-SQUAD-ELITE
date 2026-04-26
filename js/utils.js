/**
 * JB-SQUAD ELITE: Utilidades Globales
 * Funciones auxiliares para higienización, UI y cálculos.
 */

/**
 * Escapa caracteres HTML para prevenir XSS.
 * @param {string} str 
 * @returns {string}
 */
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

/**
 * Obtiene datos de localStorage con fallback seguro.
 * @param {string} key 
 * @param {any} defaultValue 
 * @returns {any}
 */
function getSafeStorage(key, defaultValue) {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    try {
        return JSON.parse(item);
    } catch (e) {
        return item || defaultValue;
    }
}

/**
 * Devuelve la clase CSS correspondiente a la posición del jugador.
 * @param {string} pos 
 * @returns {string}
 */
function getPositionColorClass(pos) {
    if (!pos) return 'pos-gk';
    const p = pos.toUpperCase();
    if (p === 'POR') return 'pos-gk';
    if (['DFC', 'LI', 'LD', 'CAD', 'CAI'].includes(p)) return 'pos-def';
    if (['MCD', 'MC', 'MCO', 'MI', 'MD', 'MVI', 'MVD'].includes(p)) return 'pos-mid';
    if (['DC', 'ED', 'EI', 'SD', 'EXT'].includes(p)) return 'pos-fwd';
    return 'pos-gk';
}

/**
 * Calcula el transform CSS para la foto del jugador.
 * @param {Object} player 
 * @returns {string}
 */
function getPlayerTransform(player) {
    if (!player) return 'scale(1)';
    const s = player.photo_scale || 1.0;
    const x = player.photo_x || 0;
    const y = player.photo_y || 0;
    return `translate(${x}px, ${y}px) scale(${s})`;
}

/**
 * Busca el nombre corto de un jugador por su ID.
 * @param {string|number} id 
 * @returns {string}
 */
function getPlayerNameById(id) {
    if (!id || !window.state || !window.state.players) return '';
    const p = window.state.players.find(p => p.id == id);
    return p ? p.name.split(' ')[0].toUpperCase() : '';
}

// --- SISTEMA DE DIÁLOGOS Y NOTIFICACIONES ---

/**
 * Reemplazo de window.confirm nativo.
 */
window.jbConfirm = (message) => {
    return new Promise((resolve) => {
        const dialog = document.getElementById('jb-global-dialog');
        const msgEl = document.getElementById('jb-dialog-message');
        const btnConfirm = document.getElementById('jb-dialog-btn-confirm');
        const btnCancel = document.getElementById('jb-dialog-btn-cancel');

        if (!dialog) return resolve(confirm(message)); // Fallback

        // Auto-ocultar loading si estuviera activo para evitar bloqueos de z-index (v56.9)
        if (window.jbLoading) window.jbLoading.hide();

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

/**
 * Reemplazo de window.alert nativo.
 */
window.jbAlert = (message) => {
    return new Promise((resolve) => {
        const dialog = document.getElementById('jb-global-dialog');
        const msgEl = document.getElementById('jb-dialog-message');
        const btnConfirm = document.getElementById('jb-dialog-btn-confirm');
        const btnCancel = document.getElementById('jb-dialog-btn-cancel');

        if (!dialog) return resolve(alert(message)); // Fallback

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

/**
 * Sistema de Toasts Premium.
 */
window.jbToast = (message, type = 'info', duration = 3500) => {
    const container = document.getElementById('jb-toast-container');
    if (!container) return;

    const icons = { success: '✅', error: '❌', info: '💡', warning: '⚠️' };
    const titles = { success: 'ÉXITO', error: 'ERROR', info: 'INFO', warning: 'AVISO' };

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

    toast.onclick = () => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 400);
    };

    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 400);
        }
    }, duration);
};

/**
 * Gestiona la visibilidad de las capas principales (Auth vs App).
 */
function switchAuthView(viewName) {
    const authView = document.getElementById('view-auth');
    const teamSelect = document.getElementById('view-team-select');
    const mainApp = document.getElementById('main-app');

    if (authView) authView.style.setProperty('display', 'none', 'important');
    if (teamSelect) teamSelect.style.setProperty('display', 'none', 'important');
    if (mainApp) mainApp.style.setProperty('display', 'none', 'important');

    if (viewName === 'auth' && authView) {
        authView.style.setProperty('display', 'flex', 'important');
    } else if (viewName === 'team-select' && teamSelect) {
        teamSelect.style.setProperty('display', 'flex', 'important');
    } else if (viewName === 'main' && mainApp) {
        mainApp.style.setProperty('display', 'block', 'important');
    }
}

/**
 * Oculta el loader inicial de la aplicación.
 */
function hideAppLoader() {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.classList.add('loader-hidden');
        setTimeout(() => loader.remove(), 1000);
    }
}

/**
 * Overlay de carga global.
 */
let loadingTimeout = null;
window.jbLoading = {
    show: (text = 'Sincronizando...') => {
        const overlay = document.getElementById('jb-loading-overlay');
        if (!overlay) return;
        const textEl = overlay.querySelector('.jb-loading-text');
        if (textEl) textEl.textContent = text;
        overlay.classList.add('active');
        clearTimeout(loadingTimeout);
        loadingTimeout = setTimeout(() => window.jbLoading.hide(), 15000);
    },
    hide: () => {
        clearTimeout(loadingTimeout);
        const overlay = document.getElementById('jb-loading-overlay');
        if (overlay) overlay.classList.remove('active');
    }
};
