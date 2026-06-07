// matchday.js

// --- LÓGICA DEL CREADOR DE CARTELES MATCHDAY (v57.0) ---

async function initMatchdayCreator() {
    window.jbLoading.show('Cargando equipos...');
    globalTeamsList = await fetchGlobalTeams();
    window.jbLoading.hide();
    renderMatchdayConfig();
    updatePosterPreview();
    
    // Ajustar escala inicial (v60.0)
    setTimeout(() => {
        if (window.resizePosterPreview) window.resizePosterPreview();
    }, 50);
}

// --- FUNCIÓN DE ESCALADO DINÁMICO (v60.0) ---
window.resizePosterPreview = function() {
    const frame = document.getElementById('poster-frame-container');
    const preview = document.getElementById('mini-poster-preview');
    if (!frame || !preview || frame.offsetWidth === 0) return;

    const frameWidth = frame.offsetWidth;
    const scale = frameWidth / 1080;
    preview.style.transform = `scale(${scale})`;
};

window.addEventListener('resize', () => {
    if (state.currentView === 'matchday-creator') {
        window.resizePosterPreview();
    }
});

function renderMatchdayConfig() {
    if (!matchdayMatchesConfig) return;
    matchdayMatchesConfig.innerHTML = '';
    
    // Limitar a 5 partidos (v60.3)
    const canAddMore = matchdayPosterData.matches.length < 5;
    if (btnAddMatchToPoster) {
        btnAddMatchToPoster.style.display = canAddMore ? 'block' : 'none';
    }

    matchdayPosterData.matches.forEach((m, idx) => {
        const row = document.createElement('div');
        row.className = 'matchday-row-config fade-in';
        
        // Selector de Rival
        let rivalOptions = `<option value="manual" ${m.rivalId === 'manual' ? 'selected' : ''}>-- INTRODUCIR MANUAL --</option>`;
        globalTeamsList.forEach(team => {
            rivalOptions += `<option value="${team.id}" ${m.rivalId === team.id ? 'selected' : ''}>${team.name.toUpperCase()}</option>`;
        });

        row.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <label style="font-size: 0.65rem; color: var(--primary); font-weight: 800; letter-spacing: 1px;">EQUIPO RIVAL</label>
                <select class="match-rival-select" data-idx="${idx}" style="width: 100%; cursor: pointer;">
                    ${rivalOptions}
                </select>
                ${m.rivalId === 'manual' ? `
                    <input type="text" class="match-manual-name" data-idx="${idx}" value="${m.rivalName}" 
                           placeholder="Nombre del rival..." 
                           style="margin-top:8px; background: rgba(255,255,255,0.05) !important;">
                ` : ''}
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <label style="font-size: 0.65rem; color: var(--primary); font-weight: 800; letter-spacing: 1px;">HORA PARTIDO</label>
                <input type="time" class="match-time-input" data-idx="${idx}" value="${m.time}" style="cursor: pointer;">
            </div>
            <button class="btn-delete-row" onclick="window.removeMatchFromPoster(${idx})" 
                    style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: rgba(244, 67, 54, 0.1); border: 1px solid rgba(244, 67, 54, 0.2); color: #F44336; font-size: 1.1rem; transition: 0.2s;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;

        // Events
        const select = row.querySelector('.match-rival-select');
        select.onchange = (e) => {
            const val = e.target.value;
            matchdayPosterData.matches[idx].rivalId = val;
            
            if (val !== 'manual') {
                // Buscar el equipo en la lista global (v57.1)
                const team = globalTeamsList.find(t => String(t.id) === String(val));
                if (team) {
                    matchdayPosterData.matches[idx].rivalName = team.name;
                    matchdayPosterData.matches[idx].rivalCrest = team.crest_url || null;
                }
            } else {
                matchdayPosterData.matches[idx].rivalCrest = null;
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
    if (matchdayPosterData.matches.length >= 5) {
        window.jbToast('Máximo 5 partidos por cartel.', 'warning');
        return;
    }
    matchdayPosterData.matches.push({ id: Date.now(), rivalId: 'manual', rivalName: '', rivalCrest: null, time: '23:00' });
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
    
    // Añadir clase de conteo para CSS adaptativo (v60.3)
    const matchesContainer = miniPosterPreview.querySelector('.poster-matches-list');
    if (matchesContainer) {
        matchesContainer.classList.add(`count-${matchdayPosterData.matches.length}`);
    }

    // Actualizar escala tras inyectar contenido (v60.0)
    if (window.resizePosterPreview) window.resizePosterPreview();

    // También actualizar el área de captura real
    const captureArea = document.getElementById('matchday-poster-capture-area');
    if (captureArea) captureArea.innerHTML = html;
    
    // Repetir clase en el área de captura
    const captureMatches = captureArea?.querySelector('.poster-matches-list');
    if (captureMatches) captureMatches.classList.add(`count-${matchdayPosterData.matches.length}`);
}

function generatePosterHTML(base64Map = null) {
    const teamName = (state.team?.name || 'Mi Club').toUpperCase();
    const rawTeamCrest = state.team?.crest_url || neutralCrest;
    // Si hay mapa de Base64 (exportación), usar la versión local; si no (previsualización), usar la URL directa
    const teamCrest = (base64Map && base64Map[rawTeamCrest]) ? base64Map[rawTeamCrest] : rawTeamCrest;
    const twitter = state.team?.socials?.twitter || '';
    const twitch = state.team?.socials?.twitch || '';

    let matchesHtml = '';
    matchdayPosterData.matches.forEach(m => {
        const rawCrestUrl = m.rivalCrest || null;
        const initials = (m.rivalName || 'R').substring(0, 2).toUpperCase();

        let rivalCrestHtml = '';
        if (rawCrestUrl && rawCrestUrl.trim() !== '') {
            // Resolver la URL: Base64 para exportación, directa para previsualización (v57.2)
            const resolvedUrl = (base64Map && base64Map[rawCrestUrl]) ? base64Map[rawCrestUrl] : rawCrestUrl;
            rivalCrestHtml = `<img src="${resolvedUrl}" class="poster-crest-img" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='${neutralCrest}';">`;
        } else {
            rivalCrestHtml = `<div class="poster-generic-crest-elite">${initials}</div>`;
        }

        matchesHtml += `
            <div class="poster-match-card">
                <div class="poster-team-bundle">
                    <div class="poster-crest-container">
                        <img src="${teamCrest}" class="poster-crest-img" referrerpolicy="no-referrer">
                    </div>
                    <div class="poster-team-name">${teamName}</div>
                </div>
                
                <div class="poster-vs-box">
                    <div class="poster-vs-text">VS</div>
                    <div class="poster-time-label">${m.time}</div>
                </div>

                <div class="poster-team-bundle" style="justify-content: flex-end;">
                    <div class="poster-team-name" style="text-align: right;">${(m.rivalName || 'RIVAL').toUpperCase()}</div>
                    <div class="poster-crest-container">
                        ${rivalCrestHtml}
                    </div>
                </div>
            </div>
        `;
    });

    return `
        <div class="poster-header">
            <img src="${teamCrest}" class="poster-main-logo">
            <div class="poster-title">MATCH DAY</div>
        </div>
        
        <div class="poster-matches-list">
            ${matchesHtml}
        </div>

        <div class="poster-footer">
            <div class="poster-footer-social">
                ${twitter ? `<div class="poster-social-item"><span>𝕏</span> @${twitter.toUpperCase()}</div>` : ''}
                ${twitch ? `<div class="poster-social-item"><span>🎮</span> ${twitch.toUpperCase()}</div>` : ''}
            </div>
            <img src="${teamCrest}" class="poster-footer-logo">
        </div>
    `;
}

// Función auxiliar: Convierte una URL de imagen a Base64 (v57.2)
// Usa el proxy de Netlify para evitar CORS con virtualpronetwork.com
async function imageUrlToBase64(url) {
    try {
        // Reescribir URLs de VPN a través del proxy de Netlify (mismo dominio = sin CORS)
        let fetchUrl = url;
        if (url.includes('virtualpronetwork.com')) {
            fetchUrl = url.replace('https://www.virtualpronetwork.com', '/vpn-proxy');
            console.log(`>>> [B64] Proxy Netlify: ${fetchUrl.substring(0, 80)}...`);
        } else {
            console.log(`>>> [B64] Descarga directa: ${url.substring(0, 80)}...`);
        }

        const response = await fetch(fetchUrl);
        if (!response.ok) {
            console.warn(`>>> [B64] Error HTTP ${response.status} para: ${url}`);
            return null;
        }
        const blob = await response.blob();
        console.log(`>>> [B64] ✅ Descargado (${blob.size} bytes). Convirtiendo a Base64...`);
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch (err) {
        console.error(`>>> [B64] ❌ Fallo para ${url}:`, err.message);
        return null;
    }
}

async function exportMatchdayImage() {
    window.jbLoading.show('Preparando imágenes para exportación...');
    
    try {
        // 1. Recopilar todas las URLs únicas de imágenes externas
        const imageUrls = new Set();
        const teamCrest = state.team?.crest_url || null;
        if (teamCrest && teamCrest.startsWith('http')) imageUrls.add(teamCrest);
        
        matchdayPosterData.matches.forEach(m => {
            if (m.rivalCrest && m.rivalCrest.startsWith('http')) {
                imageUrls.add(m.rivalCrest);
            }
        });

        // 2. Pre-convertir TODAS las imágenes a Base64 en paralelo
        const base64Map = {};
        const conversions = [...imageUrls].map(async (url) => {
            const b64 = await imageUrlToBase64(url);
            if (b64) base64Map[url] = b64;
        });
        await Promise.all(conversions);
        console.log(`>>> [EXPORT] ${Object.keys(base64Map).length}/${imageUrls.size} imágenes convertidas a Base64.`);

        // 3. Generar el HTML del cartel con las imágenes ya en Base64
        const exportHtml = generatePosterHTML(base64Map);

        // 4. Inyectar en un contenedor oculto temporal para captura
        let captureArea = document.getElementById('matchday-poster-capture-area');
        if (!captureArea) {
            captureArea = document.createElement('div');
            captureArea.id = 'matchday-poster-capture-area';
            captureArea.className = 'matchday-poster-preview';
            captureArea.style.position = 'fixed';
            captureArea.style.left = '-9999px';
            captureArea.style.top = '0';
            document.body.appendChild(captureArea);
        }
        captureArea.style.position = 'fixed';
        captureArea.style.left = '-9999px';
        captureArea.innerHTML = exportHtml;

        // 5. Esperar a que las imágenes Base64 se rendericen
        const imgs = captureArea.querySelectorAll('img');
        await Promise.all([...imgs].map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        }));
        await new Promise(r => setTimeout(r, 500));

        window.jbLoading.show('Generando imagen HD...');

        // 6. Capturar con html2canvas (sin problemas CORS porque todo es Base64)
        const canvas = await html2canvas(captureArea, {
            scale: 1,
            backgroundColor: '#050505',
            useCORS: false,
            allowTaint: false
        });

        // 7. Descargar
        const link = document.createElement('a');
        link.download = `MATCHDAY_${new Date().toISOString().split('T')[0]}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.92);
        link.click();
        
        window.jbToast('¡Cartel generado con éxito!', 'success');
    } catch (err) {
        console.error("Error al exportar cartel:", err);
        window.jbToast('Error al generar la imagen. Revisa la consola.', 'error');
    } finally {
        window.jbLoading.hide();
    }
}



window.dashboardFilters = {
    scorers: 'official',
    assists: 'official',
    winrate: 'official',
    cleansheets: 'official',
    club: 'global'
};

window.renderHomeDashboard = function() {
    if (state.currentView !== 'home') return;

    // --- Actualizar Badges de Filtro (v58.2) ---
    const updateBadge = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
            el.dataset.mode = val;
            if (val === 'official') el.textContent = 'Oficiales';
            else if (val === 'friendly') el.textContent = 'Amistosos';
            else el.textContent = 'Global';
        }
        
        const mobileEl = document.getElementById(id + '-mobile');
        if (mobileEl) {
            mobileEl.dataset.mode = val;
            if (val === 'official') mobileEl.textContent = 'Oficiales';
            else if (val === 'friendly') mobileEl.textContent = 'Amistosos';
            else mobileEl.textContent = 'Global';
        }
    };
    updateBadge('filter-goals', window.dashboardFilters.scorers);
    updateBadge('filter-assists', window.dashboardFilters.assists);
    updateBadge('filter-winrate', window.dashboardFilters.winrate);
    updateBadge('filter-cleansheets', window.dashboardFilters.cleansheets);
    updateBadge('filter-keepers-desktop', window.dashboardFilters.cleansheets);
    updateBadge('filter-club', window.dashboardFilters.club);
    
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
                <a href="https://x.com/${socials.twitter}" target="_blank" title="Twitter/X" class="social-link-btn social-link-twitter">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    <span>@${socials.twitter}</span>
                </a>
            `;
        }
        if (socials.twitch) {
            socialContainer.innerHTML += `
                <a href="https://twitch.tv/${socials.twitch}" target="_blank" title="Twitch" class="social-link-btn social-link-twitch">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
                    <span>${socials.twitch}</span>
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
            const isFirst = i === 0;
            row.className = `ranking-row-premium ${isFirst ? 'rank-first' : ''}`;
            row.onclick = () => {
                if (window.viewPlayerProfileDetail) window.viewPlayerProfileDetail(s.id);
            };
            
            const posClass = getPositionColorClass(s.primaryPos);
            const rankNumClass = isFirst ? 'rank-number-premium rank-first-num' : 'rank-number-premium';
            const rankDisplay = isFirst ? '👑' : `${i+1}`;
            
            row.innerHTML = `
                <span class="${rankNumClass}">${rankDisplay}</span>
                <div class="rank-avatar-frame">
                    ${s.photo ? `<img src="${s.photo}" style="width:100%; height:100%; object-fit:cover; object-position: top; transform:${s.transform}">` : (s.avatar ? s.avatar.svg : '')}
                </div>
                <div style="flex: 1; display: flex; align-items: center; gap: 8px; overflow: hidden;">
                    <span class="rank-name-text">${escapeHTML(s.name.toUpperCase())}</span>
                    <span class="player-pos-badge ${posClass}" style="font-size: 0.5rem; padding: 1px 4px; border-radius: 3px; min-width: 22px; text-align: center; font-weight: 900;">${s.primaryPos || 'NA'}</span>
                </div>
                <span class="rank-value-display">${s[valueKey]} <small>${valueSuffix}</small></span>
            `;
            container.appendChild(row);
        });
    }

    function renderTopKeepersRow(container, items) {
        if (!container) return;
        container.innerHTML = '';
        if (items.length === 0) {
            container.innerHTML = '<p style="font-size:0.7rem; text-align:center; opacity:0.5;">No hay registros imbatidos.</p>';
            return;
        }
        
        const isDesktop = container.id === 'home-top-keepers-list';
        
        if (isDesktop) {
            items.forEach((s, i) => {
                const row = document.createElement('div');
                const isFirst = i === 0;
                row.className = `ranking-row-premium ranking-keeper-row ${isFirst ? 'rank-first' : ''}`;
                row.style.cssText = 'padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px;';
                row.onclick = () => {
                    if (window.viewPlayerProfileDetail) window.viewPlayerProfileDetail(s.id);
                };
                
                const posClass = getPositionColorClass('POR');
                const rankNumClass = isFirst ? 'rank-number-premium rank-first-num' : 'rank-number-premium';
                const rankDisplay = isFirst ? '👑' : `${i+1}`;
                const csRatio = s.totalMatches > 0 ? Math.round((s.totalCS / s.totalMatches) * 100) : 0;
                
                row.innerHTML = `
                    <!-- Identidad (Izquierda) -->
                    <div style="display: flex; align-items: center; gap: 15px; flex: 1; overflow: hidden;">
                        <span class="${rankNumClass}" style="width: 25px; text-align: center;">${rankDisplay}</span>
                        <div class="rank-avatar-frame" style="width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;">
                            ${s.photo ? `<img src="${s.photo}" style="width:100%; height:100%; object-fit:cover; object-position: top; transform:${s.transform}">` : (s.avatar ? s.avatar.svg : '')}
                        </div>
                        <div style="display: flex; flex-direction: column; overflow: hidden; gap: 2px;">
                            <span class="rank-name-text" style="font-size: 0.85rem; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(s.name.toUpperCase())}</span>
                            <span class="player-pos-badge ${posClass}" style="font-size: 0.5rem; padding: 1px 5px; border-radius: 3px; width: fit-content; font-weight: 900;">POR</span>
                        </div>
                    </div>

                    <!-- Estadísticas e Imbatibilidad Detallada (Derecha) -->
                    <div style="display: flex; align-items: center; gap: 25px; flex-shrink: 0;">
                        
                        <!-- Caja Partidos Jugados -->
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 8px; min-width: 70px;">
                            <span style="font-size: 0.5rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Partidos</span>
                            <span style="font-size: 0.85rem; font-weight: 900; color: #fff;">${s.totalMatches} <small style="font-size: 0.55rem; color: var(--text-muted); font-weight: 800;">PJ</small></span>
                        </div>

                        <!-- Caja Imbatido (Porterías a Cero) -->
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(240, 165, 0, 0.05); border: 1px solid rgba(240, 165, 0, 0.15); padding: 4px 10px; border-radius: 8px; min-width: 70px;">
                            <span style="font-size: 0.5rem; color: rgba(240, 165, 0, 0.8); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Porterías a 0</span>
                            <span style="font-size: 0.85rem; font-weight: 900; color: var(--primary);">🧤 ${s.totalCS}</span>
                        </div>

                        <!-- Caja Efectividad (Porcentaje y barra visual) -->
                        <div style="display: flex; flex-direction: column; align-items: flex-end; min-width: 130px; gap: 4px;">
                            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                                <span style="font-size: 0.5rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Efectividad</span>
                                <span style="font-size: 0.75rem; font-weight: 900; color: #4CAF50;">${csRatio}%</span>
                            </div>
                            <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; border: 1px solid rgba(255,255,255,0.02);">
                                <div style="width: ${csRatio}%; height: 100%; background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%); border-radius: 3px; box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);"></div>
                            </div>
                        </div>

                    </div>
                `;
                container.appendChild(row);
            });
        } else {
            items.forEach((s, i) => {
                const row = document.createElement('div');
                const isFirst = i === 0;
                row.className = `ranking-row-premium ranking-keeper-row ${isFirst ? 'rank-first' : ''}`;
                row.onclick = () => {
                    if (window.viewPlayerProfileDetail) window.viewPlayerProfileDetail(s.id);
                };
                
                const posClass = getPositionColorClass('POR');
                const rankNumClass = isFirst ? 'rank-number-premium rank-first-num' : 'rank-number-premium';
                const rankDisplay = isFirst ? '👑' : `${i+1}`;
                const csRatio = s.totalMatches > 0 ? Math.round((s.totalCS / s.totalMatches) * 100) : 0;
                
                row.innerHTML = `
                    <span class="${rankNumClass}">${rankDisplay}</span>
                    <div class="rank-avatar-frame">
                        ${s.photo ? `<img src="${s.photo}" style="width:100%; height:100%; object-fit:cover; object-position: top; transform:${s.transform}">` : (s.avatar ? s.avatar.svg : '')}
                    </div>
                    <div style="flex: 1; display: flex; align-items: center; gap: 8px; overflow: hidden;">
                        <span class="rank-name-text">${escapeHTML(s.name.toUpperCase())}</span>
                        <span class="player-pos-badge ${posClass}" style="font-size: 0.5rem; padding: 1px 4px; border-radius: 3px; min-width: 22px; text-align: center; font-weight: 900;">POR</span>
                    </div>
                    <div class="keepers-capsule-stat">
                        <span class="keeper-pj-glass-badge">${s.totalMatches} PJ</span>
                        <span class="keeper-cs-glass-badge">🧤 ${s.totalCS} <small style="font-size:0.45rem; opacity:0.8; font-weight:700;">P.0</small></span>
                        <span class="keeper-efficiency-pct" title="Ratio de Imbatibilidad">${csRatio}%</span>
                    </div>
                `;
                container.appendChild(row);
            });
        }
    }

    // --- Mapeador de jugador para rankings ---
    function mapPlayerForRanking(p) {
        return {
            id: p.id,
            name: p.name,
            primaryPos: p.primaryPos || p.primary_pos,
            photo: p.photo_url,
            transform: getPlayerTransform(p),
            avatar: AVATARS.find(av => av.id === (p.avatarID || p.avatar_id || 1))
        };
    }

    // --- 1. TOP GOLEADORES (5) ---
    const filterScorers = window.dashboardFilters?.scorers || 'official';
    const scorers = state.players
        .map(p => {
            let totalGoals = 0;
            if (filterScorers === 'official') totalGoals = p.stats?.official?.goals || 0;
            else if (filterScorers === 'friendly') totalGoals = p.stats?.friendly?.goals || 0;
            else totalGoals = (p.stats?.official?.goals || 0) + (p.stats?.friendly?.goals || 0);
            return { ...mapPlayerForRanking(p), totalGoals };
        })
        .filter(s => s.totalGoals > 0)
        .sort((a, b) => b.totalGoals - a.totalGoals)
        .slice(0, 5);
    renderTopRow(scorersListEl, scorers, 'totalGoals', 'GLS');
    const mobileScorersEl = document.getElementById('mobile-top-scorers-list');
    if (mobileScorersEl) renderTopRow(mobileScorersEl, scorers, 'totalGoals', 'GLS');

    // --- 2. TOP ASISTENTES (5) ---
    const filterAssists = window.dashboardFilters?.assists || 'official';
    const assistants = state.players
        .map(p => {
            let totalAssists = 0;
            if (filterAssists === 'official') totalAssists = p.stats?.official?.assists || 0;
            else if (filterAssists === 'friendly') totalAssists = p.stats?.friendly?.assists || 0;
            else totalAssists = (p.stats?.official?.assists || 0) + (p.stats?.friendly?.assists || 0);
            return { ...mapPlayerForRanking(p), totalAssists };
        })
        .filter(s => s.totalAssists > 0)
        .sort((a, b) => b.totalAssists - a.totalAssists)
        .slice(0, 5);
    renderTopRow(assistsListEl, assistants, 'totalAssists', 'AST');
    const mobileAssistsEl = document.getElementById('mobile-top-assists-list');
    if (mobileAssistsEl) renderTopRow(mobileAssistsEl, assistants, 'totalAssists', 'AST');

    // --- 3. TOP % VICTORIAS INDIVIDUAL (5) ---
    const filterWinrate = window.dashboardFilters?.winrate || 'official';
    const winRaters = state.players
        .map(p => {
            let totalPJ = 0;
            let totalW = 0;
            if (filterWinrate === 'official') {
                totalPJ = p.stats?.official?.matches || 0;
                totalW = p.stats?.official?.wins || 0;
            } else if (filterWinrate === 'friendly') {
                totalPJ = p.stats?.friendly?.matches || 0;
                totalW = p.stats?.friendly?.wins || 0;
            } else {
                totalPJ = (p.stats?.official?.matches || 0) + (p.stats?.friendly?.matches || 0);
                totalW = (p.stats?.official?.wins || 0) + (p.stats?.friendly?.wins || 0);
            }
            const pct = totalPJ > 0 ? ((totalW / totalPJ) * 100) : 0;
            return { ...mapPlayerForRanking(p), winPct: pct.toFixed(1) + '%', winPctNum: pct, totalPJ };
        })
        .filter(s => s.totalPJ > 0)
        .sort((a, b) => b.winPctNum - a.winPctNum)
        .slice(0, 5);
    renderTopRow(winrateListEl, winRaters, 'winPct', '');
    const mobileWinrateEl = document.getElementById('mobile-top-winrate-list');
    if (mobileWinrateEl) renderTopRow(mobileWinrateEl, winRaters, 'winPct', '');

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

    const filterClub = window.dashboardFilters?.club || 'global';
    if (filterClub === 'official') {
        allMatches = allMatches.filter(m => m.type === 'official');
    } else if (filterClub === 'friendly') {
        allMatches = allMatches.filter(m => m.type === 'friendly');
    }

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
            formStreakContainer.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 8px;';
            
            const badgesWrapper = document.createElement('div');
            badgesWrapper.style.cssText = 'display: flex; gap: 8px; justify-content: center; align-items: center;';
            
            const last5 = allMatches.slice(-5);
            last5.forEach((m, idx) => {
                const badge = document.createElement('div');
                
                const progress = idx / 4;
                const opacityVal = 0.5 + (progress * 0.5);
                const scaleVal = 0.85 + (progress * 0.2);
                const isLast = idx === 4;
                
                let bgStyle = '';
                let textSymbol = '';
                let borderHighlight = isLast ? 'border: 1.5px solid rgba(255,255,255,0.7); box-shadow: 0 0 10px rgba(255,255,255,0.25);' : 'border: 1px solid rgba(255,255,255,0.15);';
                
                if (m.scoreHome > m.scoreAway) {
                    textSymbol = 'V';
                    bgStyle = 'linear-gradient(135deg, #2ecc71, #27ae60)';
                } else if (m.scoreHome === m.scoreAway) {
                    textSymbol = 'E';
                    bgStyle = 'linear-gradient(135deg, #f1c40f, #f39c12)';
                } else {
                    textSymbol = 'D';
                    bgStyle = 'linear-gradient(135deg, #e74c3c, #c0392b)';
                }
                
                badge.textContent = textSymbol;
                badge.style.cssText = `
                    width: 25px; 
                    height: 25px; 
                    border-radius: 6px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 0.75rem; 
                    font-weight: 900; 
                    color: ${textSymbol === 'E' ? '#000' : '#fff'}; 
                    background: ${bgStyle}; 
                    opacity: ${opacityVal}; 
                    transform: scale(${scaleVal}); 
                    box-shadow: 0 2px 5px rgba(0,0,0,0.4); 
                    ${borderHighlight}
                    transition: all 0.3s;
                `;
                
                badge.title = `${m.scoreHome} - ${m.scoreAway} (${m.type === 'official' ? 'Oficial' : 'Amistoso'})`;
                badgesWrapper.appendChild(badge);
            });
            
            formStreakContainer.appendChild(badgesWrapper);
            
            const legend = document.createElement('div');
            legend.style.cssText = 'display: flex; justify-content: space-between; width: 145px; font-size: 0.5rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 1px;';
            legend.innerHTML = `
                <span style="opacity: 0.5;">◀ Antiguo</span>
                <span style="color: var(--primary); font-weight: 950; text-shadow: 0 0 5px rgba(240,165,0,0.2);">Reciente ▶</span>
            `;
            formStreakContainer.appendChild(legend);
        }
    }

    // --- 5. TOP PORTERÍAS A 0 (5) ---
    const csListEl = document.getElementById('home-top-cleansheets-list');
    const keepersListEl = document.getElementById('home-top-keepers-list');
    const filterCS = window.dashboardFilters?.cleansheets || 'official';
    
    // 5A. Tabla General (Ahora exclusiva para DFC)
    if (csListEl) {
        const cleansheeters = state.players
            .filter(p => {
                const prim = (p.primary_pos || p.primaryPos || '').toString().toUpperCase().trim();
                if (prim === 'DFC') return true;
                const secVal = p.secondary_pos || p.secondaryPos;
                if (Array.isArray(secVal)) return secVal.map(x => (x || '').toString().toUpperCase().trim()).includes('DFC');
                else if (typeof secVal === 'string') return secVal.toUpperCase().split(',').map(x => x.trim()).includes('DFC');
                return false;
            })
            .map(p => {
                let totalCS = 0;
                if (filterCS === 'official') totalCS = p.stats?.official?.cleanSheets || 0;
                else if (filterCS === 'friendly') totalCS = p.stats?.friendly?.cleanSheets || 0;
                else totalCS = (p.stats?.official?.cleanSheets || 0) + (p.stats?.friendly?.cleanSheets || 0);
                return { ...mapPlayerForRanking(p), totalCS };
            })
            .filter(s => s.totalCS > 0)
            .sort((a, b) => b.totalCS - a.totalCS)
            .slice(0, 5);
        renderTopRow(csListEl, cleansheeters, 'totalCS', 'P.0');
        const mobileCsListEl = document.getElementById('mobile-top-cleansheets-list');
        if (mobileCsListEl) renderTopRow(mobileCsListEl, cleansheeters, 'totalCS', 'P.0');
    }
    
    // 5B. Tabla Exclusiva de Porteros (Solo los que jugaron de portero, calcula PJ de portero y fuerza rol POR)
    if (keepersListEl) {
        const keepersData = state.players
            .filter(p => {
                // Filtrar: solo jugadores que tengan 'POR' como posición primaria o secundaria (v63.2)
                const prim = (p.primary_pos || p.primaryPos || '').toString().toUpperCase().trim();
                if (prim === 'POR') return true;
                
                const secVal = p.secondary_pos || p.secondaryPos;
                if (Array.isArray(secVal)) {
                    return secVal.map(x => (x || '').toString().toUpperCase().trim()).includes('POR');
                } else if (typeof secVal === 'string') {
                    return secVal.toUpperCase().split(',').map(x => x.trim()).includes('POR');
                }
                return false;
            })
            .map(p => {
                let totalCS = 0;
                let totalMatches = 0;
                
                const sessionsToScan = [...(state.sessions || [])];
                if (state.activeSession) {
                    sessionsToScan.push(state.activeSession);
                }
                
                sessionsToScan.forEach(sess => {
                    const matches = sess.matches || [];
                    matches.forEach(match => {
                        const mType = match.type || 'friendly';
                        if (filterCS !== 'global' && mType !== filterCS) return;
                        
                        let wasGK = false;
                        if (sess.lineup && !Array.isArray(sess.lineup) && sess.lineup.assignments) {
                            const gkId = sess.lineup.assignments.GK;
                            if (gkId && gkId.toString() === p.id.toString()) {
                                wasGK = true;
                            }
                        } else {
                            if (p.primaryPos === 'POR') {
                                let played = false;
                                if (match.lineup && Array.isArray(match.lineup)) {
                                    played = match.lineup.map(id => id.toString()).includes(p.id.toString());
                                } else if (sess.lineup && Array.isArray(sess.lineup)) {
                                    played = sess.lineup.map(id => id.toString()).includes(p.id.toString());
                                }
                                if (played) wasGK = true;
                            }
                        }
                        
                        if (wasGK) {
                            totalMatches++;
                            if (match.scoreAway === 0) {
                                totalCS++;
                            }
                        }
                    });
                });
                
                return { ...mapPlayerForRanking(p), totalCS, totalMatches };
            })
            .filter(s => s.totalMatches > 0) // Solo jugadores que jugaron de portero
            .sort((a, b) => {
                if (b.totalCS !== a.totalCS) {
                    return b.totalCS - a.totalCS;
                }
                return b.totalMatches - a.totalMatches; // En caso de empate, ordena por PJ
            })
            .slice(0, 5);
            
        renderTopKeepersRow(keepersListEl, keepersData);
        const mobileKeepersListEl = document.getElementById('mobile-top-keepers-list');
        if (mobileKeepersListEl) renderTopKeepersRow(mobileKeepersListEl, keepersData);
    }
    
    // --- 6. TOP 5 LOGROS ---
    const achievementsListEl = document.getElementById('home-top-achievements-list');
    const mobileAchievementsListEl = document.getElementById('mobile-top-achievements-list');
    
    if (achievementsListEl || mobileAchievementsListEl) {
        if (window.calculatePlayerAchievements) {
            Promise.all(state.players.map(async p => {
                const data = await window.calculatePlayerAchievements(p, state, false);
                const unlocked = data?.unlockedIds || [];
                return { ...mapPlayerForRanking(p), totalAchievements: unlocked.length };
            })).then(results => {
                const topAchievers = results
                    .filter(s => s.totalAchievements > 0)
                    .sort((a, b) => b.totalAchievements - a.totalAchievements)
                    .slice(0, 5);
                renderTopRow(achievementsListEl, topAchievers, 'totalAchievements', '🏆');
                if (mobileAchievementsListEl) renderTopRow(mobileAchievementsListEl, topAchievers, 'totalAchievements', '🏆');
            });
        }
    }

    // Mantener persistencia del sub-tab de porterías a cero (v61.0)
    if (window.activeCleanSheetsTab) {
        window.switchCSTab(window.activeCleanSheetsTab);
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
    
    // --- FIX: Evitar SecurityError en protocolo file:/// ---
    if (window.location.protocol === 'file:' && !bgImage.startsWith('data:')) {
        console.warn("Exportación local detectada. Usando fondo sólido para evitar 'Tainted Canvas'.");
        wrapper.style.backgroundColor = '#1a5928'; // Verde césped
        wrapper.style.backgroundImage = 'none';
    } else {
        wrapper.style.backgroundImage = `url('${bgImage}')`;
    }

    
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
