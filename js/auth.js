/**
 * JB-SQUAD ELITE: Gestión de Autenticación y Sesiones
 */

let isHandlingSession = false;

/**
 * Inicializa los manejadores de eventos para el login y registro.
 */
function setupAuthHandlers() {
    if (window._hasSetupAuth) return;
    window._hasSetupAuth = true;

    // Modal de Información para Fundar Club
    window.showFoundingInfo = async () => {
        const message = `Para fundar tu propio club y acceder a las herramientas de Manager, necesitas un Código de Fundación Elite.\n\nEste código es exclusivo y proporcionado por la administración. Si crees que tu club tiene lo necesario, contáctanos en Twitter.`;
        // Utilizamos un jbAlert custom, o una ventana modal personalizada, o un confirm modificado.
        // Como jbAlert no soporta HTML por defecto, crearemos un confirm que redirija, 
        // o si queremos poner un enlace clickeable, lo abrimos al aceptar.
        const go = await window.jbConfirm(`${message}\n\n¿Ir al perfil oficial de Twitter (@Yeibi_clubespro) para solicitar un código?`);
        if (go) {
            window.open('https://twitter.com/Yeibi_clubespro', '_blank');
        }
    };

    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const tabs = document.querySelectorAll('.auth-tab');

    if (tabs) {
        tabs.forEach(tab => {
            tab.onclick = () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                if (tab.dataset.tab === 'login') {
                    if (loginForm) loginForm.style.display = 'block';
                    if (regForm) regForm.style.display = 'none';
                } else {
                    if (loginForm) loginForm.style.display = 'none';
                    if (regForm) regForm.style.display = 'block';
                }
            };
        });
    }

    if (loginForm) {
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
                    window.jbToast('Debes desactivar "Confirmación de Email" en Supabase.', 'error', 6000);
                } else {
                    window.jbToast('Error al entrar: ' + error.message, 'error');
                }
            }
        };
    }

    if (regForm) {
        regForm.onsubmit = async (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('reg-username');
            const username = usernameInput.value.trim();
            
            if (username.includes('@')) {
                window.jbToast('El nombre de usuario no puede contener "@".', 'error');
                return;
            }

            const pass = document.getElementById('reg-password').value;
            const inviteCode = document.getElementById('reg-invite-code').value.trim().toUpperCase();

            const submitBtn = regForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Verificando Invitación...';

            // 1. Validar Código de Invitación en Supabase (Sistema Privado)
            const { data: invData, error: invErr } = await supabase
                .from('invitations')
                .select('*')
                .eq('code', inviteCode)
                .single();

            if (invErr || !invData) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                window.jbToast('Código de invitación no válido o inexistente.', 'error');
                return;
            }

            if (invData.used_count >= invData.max_uses) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                window.jbToast('Este código de invitación ya ha agotado todos sus usos.', 'error');
                return;
            }

            submitBtn.textContent = 'Creando Cuenta...';
            const email = `${username.toLowerCase()}@jb.club`;
            
            const { data, error } = await supabase.auth.signUp({ 
                email, 
                password: pass,
                options: { data: { full_name: username, invite_code: inviteCode } }
            });

            if (error) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                window.jbToast('Error en el registro: ' + error.message, 'error');
                return;
            }
            
            if (data.user) {
                // Registrar el uso de la invitación sumando +1 al contador
                await supabase.from('invitations').update({ used_count: invData.used_count + 1 }).eq('id', invData.id);
                // Crear el perfil con rastro del código (v59.0)
                await supabase.from('profiles').insert({ 
                    id: data.user.id, 
                    full_name: username,
                    invite_code_used: inviteCode
                });
                window.jbToast('¡Cuenta creada! Iniciando sesión...', 'success');
            }
        };
    }

    const createTeamForm = document.getElementById('create-team-form');
    if (createTeamForm) {
        createTeamForm.onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Verificando Código...';

            const teamName = document.getElementById('new-team-name').value.trim();
            const code = document.getElementById('founding-code').value.trim().toUpperCase();
            
            if (!state.user?.auth) { window.jbToast('Sesión no encontrada.', 'error'); return; }

            try {
                // 1. Validar Código de Fundación en tabla 'invitations'
                const { data: invData, error: invErr } = await supabase
                    .from('invitations')
                    .select('*')
                    .eq('code', code)
                    .eq('type', 'founding')
                    .single();

                if (invErr || !invData) {
                    throw new Error('Código de fundación no válido o inexistente.');
                }

                if (invData.used_count >= invData.max_uses) {
                    throw new Error('Este código de fundación ya ha sido utilizado.');
                }

                // 2. Escudo de Perfil (Garantizar que existe en public.profiles antes de memberships)
                console.log(">>> [AUTH] Verificando perfil para ID:", state.user.auth.id);
                let { data: profile, error: pCheckErr } = await supabase.from('profiles').select('id').eq('id', state.user.auth.id).maybeSingle();
                
                if (!profile) {
                    console.log(">>> [AUTH] Perfil no encontrado, creando...");
                    const fallbackName = state.user.auth.user_metadata?.full_name || state.user.auth.email.split('@')[0];
                    const { error: pInsErr } = await supabase.from('profiles').insert({ 
                        id: state.user.auth.id, 
                        full_name: fallbackName
                    });
                    if (pInsErr) throw new Error('No se pudo crear el perfil base: ' + pInsErr.message);
                    
                    // Pequeña espera para asegurar consistencia en BD
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                submitBtn.textContent = 'Fundando Club...';

                // 3. Crear el Equipo
                const { data: team, error: tErr } = await supabase.from('teams').insert({ 
                    name: teamName, 
                    owner_id: state.user.auth.id 
                }).select().single();

                if (tErr) throw new Error('Error al crear equipo: ' + tErr.message);

                // 4. Asignar Rol de Manager
                const { error: mErr } = await supabase.from('memberships').insert({
                    user_id: state.user.auth.id,
                    team_id: team.id,
                    role: 'manager'
                });
                if (mErr) throw new Error('Error al asignar rol: ' + mErr.message);

                // 5. Crear Ficha de Jugador
                const username = state.user.auth.user_metadata?.full_name || state.user.auth.email.split('@')[0];
                const { error: pErr } = await supabase.from('players').insert({
                    user_id: state.user.auth.id,
                    team_id: team.id,
                    name: username
                });
                if (pErr) throw new Error('Error al crear ficha: ' + pErr.message);

                // 6. Marcar código como usado
                await supabase.from('invitations')
                    .update({ used_count: invData.used_count + 1 })
                    .eq('id', invData.id);

                window.jbToast(`¡Club ${teamName} fundado con éxito!`, 'success');
                
                // 7. ENTRAR AL CLUB (Reiniciar sesión para cargar el nuevo estado y cambiar de vista)
                if (window.handleUserSession) {
                    await window.handleUserSession(state.user.auth);
                } else {
                    window.location.reload();
                }

            } catch (err) {
                console.error(">>> [ERROR] Fundar Club:", err);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Fundar Ahora';
                window.jbToast(err.message, 'error');
            }
        };
    }

    const searchFilter = document.getElementById('search-team-filter');
    if (searchFilter) {
        searchFilter.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#available-clubs-list .player-table-row');
            rows.forEach(row => {
                const teamName = row.querySelector('h4').textContent.toLowerCase();
                row.style.display = teamName.includes(val) ? 'grid' : 'none';
            });
        });
    }

    const handleLogout = async () => {
        if (await window.jbConfirm("¿Cerrar sesión?")) {
            await supabase.auth.signOut();
            window.location.reload();
        }
    };

    const logoutBtns = ['btn-global-logout', 'btn-profile-logout', 'btn-logout-temp'];
    logoutBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.onclick = handleLogout;
    });
}

/**
 * Gestiona la carga de datos una vez el usuario está autenticado.
 */
async function handleUserSession(authUser) {
    if (isHandlingSession) return;
    isHandlingSession = true;

    try {
        const username = authUser.user_metadata?.full_name || authUser.email.split('@')[0];
        console.log(">>> Entrando como:", username.toUpperCase());
        
        // 1. Cargar perfil con campo is_admin
        let { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
        
        if (!profile) {
            const { data: newProfile } = await supabase.from('profiles').insert({ 
                id: authUser.id, 
                full_name: username 
            }).select().maybeSingle();
            profile = newProfile;
        }
        
        let { data: membership } = await supabase.from('memberships').select('*, teams(*)').eq('user_id', authUser.id).maybeSingle();
        let { data: playerCard } = await supabase.from('players').select('*').eq('user_id', authUser.id).maybeSingle();
        
        window.state.user = { 
            auth: authUser,
            profile: profile,
            membership: membership,
            role: membership ? membership.role : null 
        };

        // 2. Registro de Login (Anti-spam de 30 min)
        if (profile) {
            const lastLoginStr = localStorage.getItem(`jb_last_login_${profile.id}`);
            const now = Date.now();
            const thirtyMinutes = 30 * 60 * 1000;

            if (!lastLoginStr || (now - parseInt(lastLoginStr)) > thirtyMinutes) {
                console.log(">>> [LOG] Registrando inicio de sesión...");
                await supabase.from('login_logs').insert({ user_id: profile.id });
                localStorage.setItem(`jb_last_login_${profile.id}`, now.toString());
            }
        }

        // Sincronizar datos y preparar UI
        if (membership) window.state.team = membership.teams;
        else window.state.team = null; // Ensure null if left club

        await loadTeamData();
        
        if (window.updateNavVisibility) window.updateNavVisibility();

        if (membership || playerCard) {
            switchAuthView('main');
            if (window.updateJoinRequestsBadge) window.updateJoinRequestsBadge();
            
            // Redirección Inteligente (v47.2 - Soporte Sin Club)
            setTimeout(() => {
                if (window.state.userPlayer) {
                    if (typeof window.viewPlayerProfileDetail === 'function') {
                        window.viewPlayerProfileDetail(window.state.userPlayer.id);
                    } else {
                        // Fallback: ir directo al home si el módulo de perfil no cargó aún
                        if (typeof window.switchView === 'function') window.switchView('home');
                    }
                } else {
                    if (typeof window.switchView === 'function') window.switchView('add-player');
                    window.jbToast('💡 Crea tu ficha de jugador para empezar.', 'info');
                }
                hideAppLoader();
            }, 300);
        } else {
            // Usuario totalmente nuevo (Sin club y sin ficha)
            switchAuthView('team-select');
            await fetchAvailableClubs(); 
            hideAppLoader();
        }
    } catch (err) {
        console.error(">>> Error de sesión:", err);
    } finally {
        setTimeout(() => { isHandlingSession = false; }, 2000);
    }
}

/**
 * Busca clubes disponibles para nuevos usuarios.
 */
async function fetchAvailableClubs() {
    const listContainer = document.getElementById('available-clubs-list');
    if (!listContainer) return;

    // 1. Pedimos los equipos
    const { data: teams, error } = await supabase.from('teams').select('*');

    if (error || !teams || teams.length === 0) {
        listContainer.innerHTML = `<p style="text-align:center; padding:20px;">No hay clubes disponibles.</p>`;
        return;
    }

    // 1.5 Buscar si el usuario ya tiene una solicitud pendiente
    const { data: myReqs } = await supabase.from('team_requests')
        .select('id, team_id, teams(name)')
        .eq('user_id', state.user.auth.id);
    const pendingRequest = (myReqs && myReqs.length > 0) ? myReqs[0] : null;

    // 2. Pedimos las membresías vinculadas a estos equipos para saber los miembros y el mánager
    const teamIds = teams.map(t => t.id);
    const { data: memberships } = await supabase.from('memberships').select('team_id, role, profiles(full_name)').in('team_id', teamIds);

    // Procesar datos para la tabla extendida
    teams.forEach(t => {
        const teamMembers = memberships ? memberships.filter(m => m.team_id === t.id) : [];
        t.memberCount = teamMembers.length;
        const manager = teamMembers.find(m => m.role === 'manager');
        t.managerName = (manager && manager.profiles) ? manager.profiles.full_name : 'N/D';
    });

    // Ordenar de mayor a menor número de miembros
    teams.sort((a, b) => b.memberCount - a.memberCount);

    // Quedarse con el Top 5
    const topTeams = teams.slice(0, 5);

    renderClubBrowser(topTeams, pendingRequest);
}

/**
 * Renderiza la lista de clubes disponibles.
 */
window.cancelMyRequest = async function(reqId) {
    if (!await window.jbConfirm("¿Seguro que quieres cancelar tu solicitud de unión?")) return;
    window.jbLoading.show('Cancelando solicitud...');
    const { error } = await supabase.from('team_requests').delete().eq('id', reqId);
    window.jbLoading.hide();
    if (error) {
        window.jbToast('Error al cancelar: ' + error.message, 'error');
    } else {
        window.jbToast('Solicitud cancelada', 'success');
        fetchAvailableClubs(); // Recargar mercado
    }
};

function renderClubBrowser(teams, pendingRequest = null) {
    const listContainer = document.getElementById('available-clubs-list');
    listContainer.innerHTML = '';

    // BANNER DE SOLICITUD PENDIENTE
    if (pendingRequest) {
        const reqBanner = document.createElement('div');
        reqBanner.style.background = 'linear-gradient(90deg, rgba(240, 165, 0, 0.15) 0%, rgba(20, 20, 20, 0.8) 100%)';
        reqBanner.style.border = '1px solid rgba(240, 165, 0, 0.3)';
        reqBanner.style.borderLeft = '4px solid var(--primary)';
        reqBanner.style.borderRadius = '8px';
        reqBanner.style.padding = '15px 20px';
        reqBanner.style.marginBottom = '20px';
        reqBanner.style.display = 'flex';
        reqBanner.style.justifyContent = 'space-between';
        reqBanner.style.alignItems = 'center';
        
        const teamName = pendingRequest.teams ? pendingRequest.teams.name : 'un club';
        reqBanner.innerHTML = `
            <div>
                <h4 style="margin: 0; font-size: 0.9rem; color: var(--primary); text-transform: uppercase;">⏳ Solicitud en curso</h4>
                <p style="margin: 5px 0 0 0; font-size: 0.8rem; color: #ccc;">Has solicitado unirte a <strong>${escapeHTML(teamName)}</strong>.</p>
            </div>
            <button onclick="window.cancelMyRequest('${pendingRequest.id}')" class="btn-detail" style="border-color: rgba(255,68,68,0.4); color: #ff4444; padding: 8px 15px; font-size: 0.75rem;">
                CANCELAR SOLICITUD
            </button>
        `;
        listContainer.appendChild(reqBanner);
    }

    // Contenedor de la tabla premium
    const tableContainer = document.createElement('div');
    tableContainer.style.background = 'rgba(20, 20, 20, 0.4)';
    tableContainer.style.borderRadius = '12px';
    tableContainer.style.border = '1px solid rgba(255,255,255,0.05)';
    tableContainer.style.overflow = 'hidden';
    tableContainer.style.marginTop = '15px';

    // Cabecera de la tabla
    const tableHeader = document.createElement('div');
    tableHeader.className = 'directory-table-grid';
    tableHeader.style.padding = '15px 20px';
    tableHeader.style.background = 'rgba(255,255,255,0.02)';
    tableHeader.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
    tableHeader.style.fontSize = '0.65rem';
    tableHeader.style.fontWeight = '800';
    tableHeader.style.color = 'var(--text-muted)';
    tableHeader.style.textTransform = 'uppercase';
    tableHeader.style.letterSpacing = '0.5px';
    tableHeader.innerHTML = `
        <div style="display: flex; align-items: center;">CLUB</div>
        <div class="hide-on-mobile" style="text-align: center;">MIEMBROS</div>
        <div class="hide-on-mobile" style="text-align: center;">MÁNAGER</div>
        <div class="hide-on-mobile" style="text-align: center;">FUNDACIÓN</div>
        <div style="text-align: right;">ACCIÓN</div>
    `;
    tableContainer.appendChild(tableHeader);

    const tableBody = document.createElement('div');

    teams.forEach((team, index) => {
        const row = document.createElement('div');
        row.className = 'directory-table-grid directory-table-row';
        row.style.padding = '12px 20px';
        row.style.alignItems = 'center';
        if (index !== teams.length - 1) {
            row.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
        }
        
        const logoSrc = team.crest_url || 'img/logo.png';
        const creationYear = team.created_at ? new Date(team.created_at).getFullYear() : '2024';

        row.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
                <div style="width: 32px; height: 32px; flex-shrink: 0; background: rgba(0,0,0,0.3); border-radius: 5px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); padding: 2px;">
                    <img src="${logoSrc}" alt="Escudo" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
                <h4 class="team-name-dir" style="margin: 0; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${escapeHTML(team.name)}</h4>
            </div>
            <div class="hide-on-mobile" style="text-align: center; color: var(--primary); font-weight: 800; font-size: 0.9rem;">
                ${team.memberCount}&nbsp;<span style="font-size:0.7rem; color:var(--text-muted); font-weight:600;">JUG</span>
            </div>
            <div class="hide-on-mobile" style="text-align: center; font-size: 0.8rem; color: #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${escapeHTML(team.managerName)}
            </div>
            <div class="hide-on-mobile" style="text-align: center; font-size: 0.85rem; color: var(--text-muted); font-weight: 700;">
                ${creationYear}
            </div>
            <div style="text-align: right;">
                <button class="join-btn btn-silver-premium" title="${pendingRequest ? 'Ya tienes una solicitud activa' : 'Solicitar Unirse'}" ${pendingRequest ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : 'style="width: 36px; height: 36px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; transition: 0.3s; cursor: pointer; border: 1px solid rgba(255,255,255,0.2); background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(20,20,20,0.9) 100%); color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);" onmouseover="this.style.background=\'rgba(255,255,255,0.15)\'; this.style.borderColor=\'#fff\'; this.style.transform=\'scale(1.05)\';" onmouseout="this.style.background=\'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(20,20,20,0.9) 100%)\'; this.style.borderColor=\'rgba(255,255,255,0.2)\'; this.style.transform=\'scale(1)\';"'}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                </button>
            </div>
        `;

        if (!pendingRequest) {
            row.querySelector('.join-btn').onclick = async () => {
                if (await window.jbConfirm(`¿Enviar solicitud a ${team.name}?`)) {
                    window.jbLoading.show('Enviando solicitud...');
                    const { error } = await sendTeamRequest(team.id);
                    window.jbLoading.hide();
                    if (error) window.jbToast(error, 'error');
                    else {
                        window.jbToast(`¡Solicitud enviada!`, 'success');
                        fetchAvailableClubs(); // Recargar para mostrar banner
                    }
                }
            };
        }
        tableBody.appendChild(row);
    });

    tableContainer.appendChild(tableBody);
    listContainer.appendChild(tableContainer);
}
