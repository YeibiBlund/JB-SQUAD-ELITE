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
                // Crear el perfil
                await supabase.from('profiles').insert({ id: data.user.id, full_name: username });
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

            const { error: mErr } = await supabase.from('memberships').insert({
                user_id: state.user.auth.id,
                team_id: team.id,
                role: 'manager'
            });

            if (mErr) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Fundar Ahora';
                window.jbToast('Error al asignar rol: ' + mErr.message, 'error');
                return;
            }

            // Sincronizar ficha del creador (v48.0 fix)
            const { data: existingPlayer } = await supabase.from('players').select('id').eq('user_id', state.user.auth.id).maybeSingle();
            if (existingPlayer) {
                await supabase.from('players').update({ team_id: team.id }).eq('user_id', state.user.auth.id);
            } else {
                const username = state.user.auth.user_metadata?.full_name || state.user.auth.email.split('@')[0];
                await supabase.from('players').insert({
                    user_id: state.user.auth.id,
                    team_id: team.id,
                    name: username
                });
            }

            window.jbToast(`¡Club ${teamName} fundado con éxito!`, 'success');
            await handleUserSession(state.user.auth);
        };
    }

    const joinTeamForm = document.getElementById('join-team-form');
    if (joinTeamForm) {
        joinTeamForm.onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button');
            const searchQuery = document.getElementById('search-team-name').value.trim();
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Buscando...';

            const { data: teams, error } = await supabase.from('teams').select('*').ilike('name', searchQuery);

            if (error || !teams.length) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Buscar y Solicitar';
                window.jbToast('No se ha encontrado ningún club.', 'error');
                return;
            }

            const targetTeam = teams[0];
            if (await window.jbConfirm(`¿Quieres enviar una solicitud de fichaje a ${targetTeam.name.toUpperCase()}?`)) {
                const { error } = await sendTeamRequest(targetTeam.id);

                if (error) {
                    window.jbToast(error, 'error');
                } else {
                    window.jbToast(`¡Solicitud enviada! Espera a que el Manager te acepte.`, 'success', 5000);
                    // Opcional: podrías mostrar un estado de "Pendiente" aquí
                }
            }
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Buscar y Solicitar';
        };
    }

    const handleLogout = async () => {
        if (await window.jbConfirm("¿Cerrar sesión?")) supabase.auth.signOut();
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

        // Sincronizar datos y preparar UI (v47.4 - Siempre inicializar)
        if (membership) window.state.team = membership.teams;
        await loadTeamData();

        if (membership || playerCard) {
            switchAuthView('main');
            if (window.updateJoinRequestsBadge) window.updateJoinRequestsBadge();
            
            // Redirección Inteligente (v47.2 - Soporte Sin Club)
            setTimeout(() => {
                if (window.state.userPlayer) {
                    window.viewPlayerProfileDetail(window.state.userPlayer.id); 
                } else {
                    window.switchView('add-player');
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

    const { data: teams, error } = await supabase.from('teams').select('*').order('created_at', { ascending: false }).limit(20);

    if (error || !teams || teams.length === 0) {
        listContainer.innerHTML = `<p style="text-align:center; padding:20px;">No hay clubes disponibles.</p>`;
        return;
    }

    renderClubBrowser(teams);
}

/**
 * Renderiza la lista de clubes disponibles.
 */
function renderClubBrowser(teams) {
    const listContainer = document.getElementById('available-clubs-list');
    listContainer.innerHTML = '';

    teams.forEach(team => {
        const card = document.createElement('div');
        card.className = 'card-elite';
        card.style.cssText = `padding: 15px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;`;
        card.innerHTML = `<div><h4>${escapeHTML(team.name)}</h4></div><button class="join-btn btn-gold">UNIRSE</button>`;

        card.querySelector('.join-btn').onclick = async () => {
            if (await window.jbConfirm(`¿Enviar solicitud a ${team.name}?`)) {
                const { error } = await sendTeamRequest(team.id);
                if (error) window.jbToast(error, 'error');
                else {
                    window.jbToast(`¡Solicitud enviada! Ahora crea tu ficha.`, 'success');
                    // Redirigir al editor de ficha inmediatamente
                    switchAuthView('main');
                    window.switchView('add-player');
                }
            }
        };
        listContainer.appendChild(card);
    });
}
