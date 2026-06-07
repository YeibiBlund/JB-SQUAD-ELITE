// perfil.js

// --- VARIABLES DE ESTADO PARA FOTOS (v47.4) ---
var currentPhotoBase64 = null; // Para previsualización rápida
var selectedPhotoFile = null;  // Para subida real a Storage

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
            window.location.reload();
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
        if (el.id === 'btn-new-poll' || el.id === 'btn-mgmt-team-shortcut' || el.classList.contains('btn-gold') || el.classList.contains('nav-btn')) {
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
            twitter: document.getElementById('twitterHandle')?.value.replace(/^(?:https?:\/\/)?(?:www\.)?(?:x\.com\/|twitter\.com\/)/i, '').replace('@', '').trim() || null,
            twitch: document.getElementById('twitchHandle')?.value.replace(/^(?:https?:\/\/)?(?:www\.)?twitch\.tv\//i, '').replace('@', '').trim() || null,
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
    // Mostrar/Ocultar botón de Master Panel si soy admin (v59.1)
    const btnMaster = document.getElementById('btn-master-panel');
    if (btnMaster) {
        const isMasterAdmin = state.user?.profile?.is_admin === true;
        btnMaster.style.display = isMasterAdmin ? 'flex' : 'none';
    }

    // Mostrar/Ocultar botón de Abandonar Club
    const abandonContainer = document.getElementById('profile-abandon-container');
    if (abandonContainer) {
        const isSelf = state.userPlayer && state.userPlayer.id === player.id;
        // Solo mostrar si es el propio perfil y tiene un equipo activo
        if (isSelf && state.team) {
            abandonContainer.style.display = 'block';
        } else {
            abandonContainer.style.display = 'none';
        }
    }

    switchView('my-profile');
}

// Lógica de Abandonar Club
const btnAbandonClub = document.getElementById('btn-abandon-club');
if (btnAbandonClub) {
    btnAbandonClub.addEventListener('click', async () => {
        if (!state.user || !state.team) return;

        // VERIFICACIÓN DE MIEMBROS DEL CLUB
        window.jbLoading.show('Verificando estado del club...');
        const { count, error: countErr } = await supabase.from('memberships').select('id', { count: 'exact', head: true }).eq('team_id', state.team.id);
        window.jbLoading.hide();

        if (countErr) {
            window.jbToast('Error al verificar miembros', 'error');
            return;
        }

        if (count === 1) {
            // Está solo, independientemente de su rol, el club se disolverá
            const confirmDelete = await window.jbConfirm('Eres el último miembro del club. Al abandonar, el club y todo su historial serán eliminados para siempre. ¿Estás seguro?');
            if (!confirmDelete) return;

            window.jbLoading.show('Disolviendo club...');
            try {
                if (state.userPlayer) {
                    await supabase.from('players').update({ 
                        team_id: null,
                        stats: { official: { matches: 0, goals: 0, assists: 0, mvps: 0 }, friendly: { matches: 0, goals: 0, assists: 0, mvps: 0 } }
                    }).eq('id', state.userPlayer.id);
                }
                
                const { error: teamErr } = await supabase.from('teams').delete().eq('id', state.team.id);
                if (teamErr) throw teamErr;

                window.location.reload();
            } catch (e) {
                console.error("Error al disolver:", e);
                window.jbToast('Error al disolver club: ' + e.message, 'error');
                window.jbLoading.hide();
            }
            return;
        }

        // Si hay más jugadores y es mánager, se bloquea la salida
        if (state.user.role === 'manager') {
            window.jbToast('No puedes abandonar el club mientras haya otros jugadores. Cede el puesto de mánager a otro compañero en la pestaña Mi Equipo antes de salir.', 'error', 5000);
            return; // Bloqueado, no puede salir
        }

        // FLUJO NORMAL PARA JUGADORES Y CAPITANES
        const confirmed = await window.jbConfirm('¿Seguro que quieres abandonar tu club actual? (Te convertirás en Agente Libre y perderás tu puesto actual).');
        if (!confirmed) return;

        window.jbLoading.show('Abandonando club...');
        try {
                // 1. Eliminar membresía (se asume que existe)
                const { error: memErr } = await supabase.from('memberships')
                    .delete()
                    .eq('user_id', state.user.auth.id)
                    .eq('team_id', state.team.id);
                if (memErr) throw memErr;

                // 2. Duplicar ficha para Leyenda Huérfana y resetear la actual
                if (state.userPlayer) {
                    // a) Crear la leyenda huérfana para el club mapeando correctamente a DB
                    const ghostPlayer = {
                        user_id: null,
                        team_id: state.team.id,
                        name: state.userPlayer.name + ' (Ex)',
                        console_id: state.userPlayer.consoleID,
                        avatar_id: state.userPlayer.avatarID,
                        primary_pos: state.userPlayer.primaryPos,
                        secondary_pos: state.userPlayer.secondaryPos,
                        dorsal: state.userPlayer.dorsal,
                        photo_url: state.userPlayer.photo_url,
                        photo_scale: state.userPlayer.photo_scale,
                        photo_x: state.userPlayer.photo_x,
                        photo_y: state.userPlayer.photo_y,
                        stats: { ...state.userPlayer.stats, original_user_id: state.user.auth.id },
                        always_available: state.userPlayer.alwaysAvailable,
                        twitter: state.userPlayer.twitter,
                        twitch: state.userPlayer.twitch
                    };

                    const { error: ghostErr } = await supabase.from('players').insert(ghostPlayer);
                    if (ghostErr) throw ghostErr;

                    // b) Resetear la ficha actual del jugador (Agente Libre)
                    const { error: playErr } = await supabase.from('players')
                        .update({ 
                            team_id: null,
                            stats: { 
                                official: { matches: 0, goals: 0, assists: 0, mvps: 0 },
                                friendly: { matches: 0, goals: 0, assists: 0, mvps: 0 }
                            }
                        })
                        .eq('id', state.userPlayer.id);
                    if (playErr) throw playErr;
                }

                // 3. Forzar recarga completa para entrar como agente libre
                window.location.reload();
            } catch (err) {
                console.error(err);
                window.jbToast('Error al abandonar club: ' + err.message, 'error');
                window.jbLoading.hide();
            }
    });
}

async function renderPlayerProfileDetail(player) {
    if (!player) return;
    const profileCard = document.getElementById('my-profile-card');
    // Ocultar redes sociales si no hay
    const socialLinksContainer = document.getElementById('profile-social-links');
    if (socialLinksContainer) {
        socialLinksContainer.innerHTML = ''; // Limpiar anteriores
        let hasSocials = false;

        if (player.twitter) {
            hasSocials = true;
            socialLinksContainer.innerHTML += `
                <a href="https://twitter.com/${player.twitter}" target="_blank" class="social-btn twitter" style="display: flex; align-items: center; gap: 5px; background: rgba(29, 161, 242, 0.1); color: #1da1f2; padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; text-decoration: none; border: 1px solid rgba(29, 161, 242, 0.3); transition: all 0.2s;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    @${player.twitter}
                </a>
            `;
        }
        if (player.twitch) {
            hasSocials = true;
            socialLinksContainer.innerHTML += `
                <a href="https://twitch.tv/${player.twitch}" target="_blank" class="social-btn twitch" style="display: flex; align-items: center; gap: 5px; background: rgba(145, 70, 255, 0.1); color: #9146ff; padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; text-decoration: none; border: 1px solid rgba(145, 70, 255, 0.3); transition: all 0.2s;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
                    ${player.twitch}
                </a>
            `;
        }
        
        socialLinksContainer.style.display = hasSocials ? 'flex' : 'none';
    }

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

    // --- RENDERIZADO DE LOGROS (v67.0) ---
    if (window.calculatePlayerAchievements && window.getHydratedAchievements) {
        const topContainer = document.getElementById('profile-top-achievements');
        const modalContainer = document.getElementById('achievements-catalog-container');
        
        // Calcular logros dinámicamente
        const result = await window.calculatePlayerAchievements(player, window.state);
        // Si result es un array (por caché o v vieja), adaptarlo. Si es el nuevo objeto, destructurarlo
        const unlockedIds = result.unlockedIds || result;
        const ctx = result.ctx || null;
        
        const hydratedAchs = window.getHydratedAchievements(unlockedIds, player, ctx);
        
        if (topContainer) {
            // Filtrar solo los desbloqueados, ordenar por peso (rareza) desc, tomar top 4
            const top4 = hydratedAchs
                .filter(a => a.unlocked)
                .sort((a, b) => b.weight - a.weight)
                .slice(0, 4);

            topContainer.innerHTML = '';
            
            if (top4.length === 0) {
                topContainer.innerHTML = `<p style="font-size: 0.65rem; color: var(--text-muted); opacity: 0.5; margin: 0; padding: 10px 0; font-style: italic;">Aún no ha desbloqueado ningún logro.</p>`;
            } else {
                top4.forEach(ach => {
                    const badge = document.createElement('div');
                    badge.className = `mini-ach-card tier-${ach.tier}`;
                    badge.style.cursor = 'pointer'; // Indicador visual de click
                    
                    // Asignación directa del evento para evitar problemas de comillas con JSON
                    badge.onclick = () => window.openAchievementDetailModal(ach.id, ach.progressData || null);
                    
                    badge.innerHTML = `
                        <div class="mini-ach-icon">${ach.iconSvg}</div>
                        <div class="mini-ach-info">
                            <h4 class="mini-ach-title">${ach.title}</h4>
                            <p class="mini-ach-desc" title="${ach.desc}">${ach.desc}</p>
                        </div>
                    `;
                    topContainer.appendChild(badge);
                });
            }
        }

        // --- RENDERIZADO DE RACHAS ACTIVAS (ESTADO DE FORMA) ---
        const streaksContainer = document.getElementById('profile-active-streaks');
        const streaksParent = document.getElementById('profile-active-streaks-container');
        
        if (streaksContainer && streaksParent && ctx) {
            streaksContainer.innerHTML = '';
            let hasStreaks = false;

            // 1. Racha de Goles
            if (ctx.currentSessionGoalStreak >= 2) {
                hasStreaks = true;
                let title = ctx.currentSessionGoalStreak >= 4 ? 'On Fire 🔥' : 'En Racha';
                let desc = `Marcando gol en ${ctx.currentSessionGoalStreak} jornadas seguidas.`;
                streaksContainer.innerHTML += `
                    <div class="active-streak-badge">
                        <div class="streak-icon"><i class="fa-solid fa-futbol"></i></div>
                        <div class="streak-info">
                            <h4 class="streak-title">${title}</h4>
                            <p class="streak-desc">${desc}</p>
                        </div>
                    </div>
                `;
            }

            // 2. Racha de Asistencias
            if (ctx.currentSessionAssistStreak >= 2) {
                hasStreaks = true;
                let title = ctx.currentSessionAssistStreak >= 4 ? 'Playmaker Supremo 🎯' : 'El Surtidor';
                let desc = `Dando asistencia en ${ctx.currentSessionAssistStreak} jornadas seguidas.`;
                streaksContainer.innerHTML += `
                    <div class="active-streak-badge assist">
                        <div class="streak-icon"><i class="fa-solid fa-shoe-prints"></i></div>
                        <div class="streak-info">
                            <h4 class="streak-title">${title}</h4>
                            <p class="streak-desc">${desc}</p>
                        </div>
                    </div>
                `;
            }

            // 3. Racha de Porterías a cero (Imbatibilidad)
            if (ctx.currentSessionCSStreak >= 2) {
                hasStreaks = true;
                let title = ctx.currentSessionCSStreak >= 4 ? 'Muro Infranqueable 🧱' : 'Cerrojo Echado';
                let desc = `Imbatido en ${ctx.currentSessionCSStreak} jornadas seguidas.`;
                streaksContainer.innerHTML += `
                    <div class="active-streak-badge shield">
                        <div class="streak-icon"><i class="fa-solid fa-shield-halved"></i></div>
                        <div class="streak-info">
                            <h4 class="streak-title">${title}</h4>
                            <p class="streak-desc">${desc}</p>
                        </div>
                    </div>
                `;
            }
            // 4. Racha de Convocatorias
            if (ctx.currentConsecutiveYes >= 3) {
                hasStreaks = true;
                let title = 'Comprometido';
                if (ctx.currentConsecutiveYes >= 5) title = 'Fijo en el 11 📅';
                if (ctx.currentConsecutiveYes >= 10) title = 'Soldado Incondicional 🎖️';
                let desc = `Votando SÍ a ${ctx.currentConsecutiveYes} convocatorias seguidas.`;
                streaksContainer.innerHTML += `
                    <div class="active-streak-badge attendance">
                        <div class="streak-icon"><i class="fa-solid fa-calendar-check"></i></div>
                        <div class="streak-info">
                            <h4 class="streak-title">${title}</h4>
                            <p class="streak-desc">${desc}</p>
                        </div>
                    </div>
                `;
            }

            streaksParent.style.display = hasStreaks ? 'block' : 'none';
        }

        // Preparar la función global para abrir la vitrina
        window.openAchievementsModal = function() {
            if (!modalContainer) return;
            
            const unlockedList = hydratedAchs.filter(a => a.unlocked).sort((a, b) => b.weight - a.weight);
            const lockedList = hydratedAchs.filter(a => !a.unlocked).sort((a, b) => b.weight - a.weight);

            let html = '';

            const renderSection = (title, achs, isLockedSection) => {
                if (achs.length === 0) return '';
                
                let secHtml = `
                    <div class="ach-section" style="margin-bottom: 20px;">
                        <h3 style="font-size: 1rem; color: #fff; margin-bottom: 15px; border-left: 3px solid ${isLockedSection ? 'var(--text-muted)' : 'var(--primary)'}; padding-left: 10px;">${title} (${achs.length})</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                `;
                
                achs.forEach(ach => {
                    const lockedClass = ach.unlocked ? '' : 'locked';
                    const iconColor = ach.unlocked ? 'var(--primary)' : 'rgba(255,255,255,0.2)';
                    
                    let progressHtml = '';
                    if (ach.progressData && !ach.unlocked) {
                        const pct = Math.min(100, Math.round((ach.progressData.cur / ach.progressData.max) * 100));
                        progressHtml = `
                            <div style="margin-top: 8px;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.55rem; color: var(--text-muted); margin-bottom: 3px; font-weight: 800;">
                                    <span>PROGRESO</span>
                                    <span>${ach.progressData.cur}/${ach.progressData.max}</span>
                                </div>
                                <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
                                    <div style="width: ${pct}%; height: 100%; background: var(--text-muted); transition: width 0.3s;"></div>
                                </div>
                            </div>
                        `;
                    }
                    
                    secHtml += `
                        <div class="ach-card ${lockedClass} tier-${ach.tier}" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; display: flex; gap: 15px; align-items: center; transition: all 0.3s;">
                            <div class="ach-card-icon" style="flex-shrink: 0; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); border: 1px solid ${iconColor};">
                                ${ach.unlocked ? ach.iconSvg : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'}
                            </div>
                            <div style="flex-grow: 1;">
                                <h4 style="margin: 0 0 4px 0; font-size: 0.85rem; color: ${ach.unlocked ? '#fff' : 'var(--text-muted)'}; font-weight: 800;">${ach.title}</h4>
                                <p style="margin: 0; font-size: 0.65rem; color: var(--text-muted); line-height: 1.4;">${ach.desc}</p>
                                ${progressHtml}
                            </div>
                        </div>
                    `;
                });
                
                secHtml += `</div></div>`;
                return secHtml;
            };

            html += renderSection('LOGROS OBTENIDOS', unlockedList, false);
            html += renderSection('LOGROS DISPONIBLES', lockedList, true);
            
            modalContainer.innerHTML = html;
            document.getElementById('modal-achievements').style.display = 'flex';
        };
    }
    
    // Cargar Calendario (v36.3) - Seguridad de Privacidad
    const attendanceContainer = document.getElementById('profile-attendance-container');
    const isAdmin = state.user?.role === 'manager' || state.user?.role === 'capitan';
    const isSelf = player.user_id === state.user?.auth?.id;

    if (attendanceContainer) {
        if (isAdmin || isSelf) {
            attendanceContainer.style.display = 'block';
            state.viewingPlayerForCalendar = player;
            currentCalendarDate = new Date(); // Resetear al mes actual al abrir nuevo perfil

            // --- SECCIÓN SIEMPRE DISPONIBLE (v58.0) ---
            let alwaysAvailableHTML = '';
            if (isSelf) {
                alwaysAvailableHTML = `
                    <div class="always-available-wrapper fade-in">
                        <div class="always-available-info">
                            <span class="always-available-label">SIEMPRE DISPONIBLE</span>
                            <span class="always-available-desc">Votarás "SÍ" automáticamente en cada convocatoria.</span>
                        </div>
                        <label class="jb-switch">
                            <input type="checkbox" ${player.alwaysAvailable ? 'checked' : ''} onchange="window.toggleAlwaysAvailable(this.checked)">
                            <span class="jb-slider"></span>
                        </label>
                    </div>
                `;
            } else if (isAdmin && player.alwaysAvailable) {
                alwaysAvailableHTML = `
                    <div class="always-available-wrapper fade-in" style="background: rgba(76, 175, 80, 0.05); border-color: rgba(76, 175, 80, 0.1);">
                        <div class="always-available-info">
                            <span class="always-available-label" style="color: var(--success);">AUTO-ASISTENCIA ACTIVA</span>
                            <span class="always-available-desc">Este jugador tiene activado el voto automático.</span>
                        </div>
                        <div class="always-available-status-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>ACTIVO</span>
                        </div>
                    </div>
                `;
            }

            attendanceContainer.innerHTML = `
                ${alwaysAvailableHTML}
                <div class="attendance-dual-layout">
                    <div class="attendance-cal-column">
                        <div class="calendar-header">
                            <h2 class="calendar-title">HISTORIAL <span class="gradient-text">ASISTENCIA</span></h2>
                            <div class="calendar-nav">
                                <button class="btn-cal-nav" id="prev-month" title="Mes Anterior">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                </button>
                                <span id="calendar-month-label" class="calendar-month-label">MES AÑO</span>
                                <button class="btn-cal-nav" id="next-month" title="Mes Siguiente">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                </button>
                            </div>
                        </div>
                        <div class="calendar-grid-header">
                            <div>LU</div><div>MA</div><div>MI</div><div>JU</div><div>VI</div><div>SÁ</div><div>DO</div>
                        </div>
                        <div id="calendar-days-grid" class="calendar-days-grid"></div>
                        <div class="calendar-legend" style="margin-top: 20px; display: flex; gap: 15px; font-size: 0.6rem; opacity: 0.4; justify-content: center;">
                            <div style="display:flex; align-items:center; gap:5px;"><span style="width:8px; height:8px; background:var(--success); border-radius:50%;"></span> DISPONIBLE</div>
                            <div style="display:flex; align-items:center; gap:5px;"><span style="width:8px; height:8px; background:var(--primary); border-radius:50%;"></span> TARDE</div>
                            <div style="display:flex; align-items:center; gap:5px;"><span style="width:8px; height:8px; background:var(--error); border-radius:50%;"></span> AUSENTE</div>
                        </div>
                    </div>
                    <div id="calendar-details-list" class="attendance-stats-column">
                        <!-- Inyectado por JS -->
                    </div>
                </div>
            `;

            // Re-vincular botones del calendario (v58.0)
            document.getElementById('prev-month').onclick = () => {
                currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
                window.renderPlayerCalendar(player);
            };
            document.getElementById('next-month').onclick = () => {
                currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
                window.renderPlayerCalendar(player);
            };

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
    
    // Redes Sociales
    document.getElementById('twitterHandle').value = player.twitter || '';
    document.getElementById('twitchHandle').value = player.twitch || '';

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
            <td>${off.cleanSheets || 0}</td>
            <td style="font-weight: 800;">${offWinRate}</td>
            <td>-</td>
        </tr>
        <tr class="row-friendly">
            <td><span class="stat-category-tag tag-fri">AMISTOSO</span></td>
            <td>${fri.matches || 0}</td>
            <td>${fri.goals || 0}</td>
            <td>${fri.assists || 0}</td>
            <td>${fri.cleanSheets || 0}</td>
            <td style="font-weight: 800;">${friWinRate}</td>
            <td>-</td>
        </tr>
    `;

    const totalPJ = (off.matches || 0) + (fri.matches || 0);
    const totalG = (off.goals || 0) + (fri.goals || 0);
    const totalA = (off.assists || 0) + (fri.assists || 0);
    const totalCS = (off.cleanSheets || 0) + (fri.cleanSheets || 0);
    const totalW = (off.wins || 0) + (fri.wins || 0);
    const totalWinRate = canViewWinRate ? calcWinRate(totalPJ, totalW) : '<span title="Confidencial">🔒</span>';

    tfooter.innerHTML = `
        <td>TOTAL TEMPORADA</td>
        <td>${totalPJ}</td>
        <td>${totalG}</td>
        <td>${totalA}</td>
        <td>${totalCS}</td>
        <td style="font-weight: 800; color: var(--primary);">${totalWinRate}</td>
        <td style="color:var(--primary); font-weight:900;">⭐ ${mvp}</td>
    `;
}
