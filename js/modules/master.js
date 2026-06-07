// master.js

// --- PANEL DE ADMINISTRACIÓN GLOBAL (v59.0) ---
var btnMasterPanel = document.getElementById('btn-master-panel');
var btnBackFromAdmin = document.getElementById('btn-back-from-admin');

if (btnMasterPanel) {
    btnMasterPanel.addEventListener('click', () => switchView('admin'));
}
if (btnBackFromAdmin) {
    btnBackFromAdmin.addEventListener('click', () => switchView('my-profile'));
}

var activeSlotId = null;
var draggedSourceSlotId = null;
var sortConfig = { key: 'primaryPos', desc: false };

var currentMatch = null; // Objeto para el partido en vivo
var selectedGoalScorerId = null;
var selectedAssistantId = null;

// Listeners for Elite Tabs (Mi Equipo)
// Listeners for Elite Tabs (Mi Equipo)
var teamTabs = document.querySelectorAll('#team-view-tabs .elite-tab-btn');
var teamPanels = ['team-roster-panel', 'team-requests-panel', 'team-settings-panel', 'team-global-panel', 'team-attendance-panel'];
var isGlobalUnlocked = false; // Estado de desbloqueo de la sección Ligas (v57.2)

teamTabs.forEach(btn => {
    btn.addEventListener('click', () => {
        teamTabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        
        // --- PROTECCIÓN SECCIÓN LIGAS (v57.2) ---
        if (targetId === 'team-global-panel' && !isGlobalUnlocked) {
            // Volvemos a la pestaña anterior visualmente hasta que se desbloquee
            btn.classList.remove('active');
            const prevBtn = Array.from(teamTabs).find(t => t.getAttribute('data-target') === 'team-roster-panel');
            if (prevBtn) prevBtn.classList.add('active');
            
            unlockGlobalMgmt();
            return;
        }

        // Ocultar todos los paneles y mostrar el seleccionado
        teamPanels.forEach(pid => {
            const panel = document.getElementById(pid);
            if (panel) panel.style.display = pid === targetId ? 'block' : 'none';
        });

        // Si entramos en ajustes, cargar datos actuales en el formulario (v49.0)
        if (targetId === 'team-settings-panel' && typeof window.loadTeamSettingsIntoForm === 'function') {
            window.loadTeamSettingsIntoForm();
        }
        
        // Si entramos en Ligas y está desbloqueado, cargar datos (v57.2)
        if (targetId === 'team-global-panel' && isGlobalUnlocked) {
            renderGlobalMgmt();
        }

        // Si entramos en Asistencia (v61.0)
        if (targetId === 'team-attendance-panel') {
            renderAttendancePanel();
        }
    });
});
