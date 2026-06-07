// plantilla.js

// --- Renderizado de Jugadores y Tabla ---

window.plantillaFilter = 'official'; // official, friendly, global

function getStatsByFilter(player) {
    if (!player.stats) return { matches: 0, goals: 0, assists: 0, cleanSheets: 0, mvps: 0 };
    if (window.plantillaFilter === 'global') {
        const off = player.stats.official || {};
        const fri = player.stats.friendly || {};
        return {
            matches: (off.matches || 0) + (fri.matches || 0),
            goals: (off.goals || 0) + (fri.goals || 0),
            assists: (off.assists || 0) + (fri.assists || 0),
            cleanSheets: (off.cleanSheets || 0) + (fri.cleanSheets || 0),
            mvps: (off.mvps || 0) + (fri.mvps || 0)
        };
    }
    return player.stats[window.plantillaFilter] || { matches: 0, goals: 0, assists: 0, cleanSheets: 0, mvps: 0 };
}

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

        if (['matches', 'goals', 'assists', 'cleanSheets'].includes(sortConfig.key)) {
            valA = getStatsByFilter(a)[sortConfig.key] || 0;
            valB = getStatsByFilter(b)[sortConfig.key] || 0;
        }

        if (['matches', 'goals', 'assists', 'cleanSheets', 'dorsal'].includes(sortConfig.key)) {
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

    // Setup filtros
    document.querySelectorAll('.stats-filter-container .pill-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.stats-filter-container .pill-tab').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            window.plantillaFilter = e.target.getAttribute('data-filter');
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

    sortedPlayers.forEach((player, index) => {
        const playerRow = document.createElement('div');
        playerRow.className = 'player-table-row row-fade-in';
        playerRow.style.animationDelay = `${index * 0.04}s`;
        playerRow.style.opacity = '0'; // Forzar que no se vean antes de animar
        playerRow.style.cursor = 'pointer';
        playerRow.onclick = (e) => {
            if (e.target.closest('button')) return;
            viewPlayerProfileDetail(player.id);
        };
        const badgeColor = getPositionColorClass(player.primaryPos);
        
        const stats = getStatsByFilter(player);
        const pj = stats.matches || 0;
        const gl = stats.goals || 0;
        const ast = stats.assists || 0;
        const p0 = stats.cleanSheets || 0;

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
                    ${escapeHTML(player.consoleID || '')}
                </span>
            </div>
            <div class="stat-cell cell-center" style="font-size: 0.85rem;" data-label="PJ">${pj}</div>
            <div class="stat-cell cell-center" style="font-size: 0.85rem;" data-label="G">${gl}</div>
            <div class="stat-cell cell-center" style="font-size: 0.85rem;" data-label="A">${ast}</div>
            <div class="stat-cell cell-center" style="font-size: 0.85rem;" data-label="P0">${p0}</div>
            <div style="display: flex; justify-content: flex-end;">
                ${(isAdmin || isSelf) ? `<button class="btn-delete-row" title="Abandonar/Expulsar" onclick="window.confirmDelete('${player.id}')">🗑️</button>` : ''}
            </div>
        `;
        playerList.appendChild(playerRow);
    });
    
    updateSortHeaders();
}
