// calendario.js

// --- CALENDARIO DE ASISTENCIA ELITE v36.3 ---
window.renderPlayerCalendar = async (player) => {
    const grid = document.getElementById('calendar-days-grid');
    const label = document.getElementById('calendar-month-label');
    if (!grid || !player) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // 1. Mostrar Mes/Año
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    label.textContent = `${monthNames[month]} ${year}`;

    // 2. Limpiar Grid y Mostrar Cargando
    grid.innerHTML = '<div style="grid-column: span 7; padding: 20px; text-align: center; opacity: 0.4; font-size: 0.7rem;">Cargando historial...</div>';

    if (!player.user_id) {
        grid.innerHTML = '<div style="grid-column: span 7; padding: 20px; text-align: center; opacity: 0.4; font-size: 0.7rem;">Este jugador no tiene un Usuario vinculado.</div>';
        return;
    }

    try {
        // 3. Obtener Votos del Jugador con fecha de la encuesta
        const monthStart = new Date(year, month, 1).toISOString();
        const monthEnd = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

        const { data: votes, error } = await supabase
            .from('availability_votes')
            .select(`
                vote,
                availability_polls (
                    scheduled_time,
                    final_alignment
                )
            `)
            .eq('user_id', player.user_id)
            .gte('availability_polls.scheduled_time', monthStart)
            .lte('availability_polls.scheduled_time', monthEnd);


        if (error) throw error;

        // 4. Mapear Votos por Fecha (Solo el primero por día)
        const attendanceMap = new Map();
        let sortedVotes = [];
        if (votes) {
            sortedVotes = votes
                .filter(v => v.availability_polls) 
                .sort((a, b) => 
                    new Date(a.availability_polls.scheduled_time) - new Date(b.availability_polls.scheduled_time)
                );
            
            sortedVotes.forEach(v => {
                const dateStr = new Date(v.availability_polls.scheduled_time).toDateString();
                if (!attendanceMap.has(dateStr)) {
                    attendanceMap.set(dateStr, v.vote);
                }
            });
        }

        // 5. Generar Grid del Calendario
        grid.innerHTML = '';
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const offset = (firstDay === 0) ? 6 : firstDay - 1;

        for (let i = 0; i < offset; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day';
            grid.appendChild(empty);
        }

        const todayStr = new Date().toDateString();
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const dateString = dateObj.toDateString();
            const dayVote = attendanceMap.get(dateString);
            
            const cell = document.createElement('div');
            cell.className = 'calendar-day has-date';
            
            if (dateString === todayStr) cell.classList.add('today');
            if (dayVote) cell.classList.add(`day-${dayVote}`);
            
            cell.textContent = d;
            grid.appendChild(cell);
        }

        // 6. Calcular y Renderizar Totales Mensuales (Solo Desktop)
        const statsList = document.getElementById('calendar-details-list');
        if (statsList) {
            let monthlyYes = 0, monthlyLate = 0, monthlyNo = 0, totalConvocatorias = 0;
            
            // Función auxiliar para comprobar si el jugador está en la alineación
            const isPlayerInLineup = (lineup, playerId) => {
                if (!lineup) return false;
                if (Array.isArray(lineup)) {
                    return lineup.map(id => String(id)).includes(String(playerId));
                } else if (lineup.assignments) {
                    return Object.values(lineup.assignments).map(id => String(id)).includes(String(playerId));
                }
                return false;
            };

            // Recorrer el mapa de asistencia y contar solo los de este mes/año
            attendanceMap.forEach((vote, dateStr) => {
                const d = new Date(dateStr);
                if (d.getFullYear() === year && d.getMonth() === month) {
                    if (vote === 'yes') monthlyYes++;
                    else if (vote === 'late') monthlyLate++;
                    else if (vote === 'no') monthlyNo++;
                    
                    // Comprobar si fue convocado (está en la alineación final)
                    const voteData = sortedVotes.find(v => new Date(v.availability_polls.scheduled_time).toDateString() === dateStr);
                    if (voteData && voteData.availability_polls && isPlayerInLineup(voteData.availability_polls.final_alignment, player.id)) {
                        totalConvocatorias++;
                    }
                }
            });

            statsList.innerHTML = `
                <h3 style="font-size: 0.8rem; letter-spacing: 1px; margin-bottom: 20px; color: var(--primary);">RESUMEN <span style="color:#fff;">${monthNames[month].toUpperCase()}</span></h3>
                <div class="month-stat-card">
                    <span class="label">Disponibles (SÍ)</span>
                    <span class="value" style="color: var(--success);">${monthlyYes}</span>
                </div>
                <div class="month-stat-card">
                    <span class="label">Llegaron Tarde</span>
                    <span class="value" style="color: var(--primary);">${monthlyLate}</span>
                </div>
                <div class="month-stat-card">
                    <span class="label">Ausentes (NO)</span>
                    <span class="value" style="color: var(--error);">${monthlyNo}</span>
                </div>
                
                <div class="month-stat-card" style="margin-top: 15px; background: linear-gradient(90deg, rgba(240, 165, 0, 0.1) 0%, rgba(255,255,255,0.02) 100%); border-left: 3px solid var(--primary); border-top: 1px solid rgba(255,255,255,0.05); padding: 12px 15px;">
                    <span class="label" style="color: #fff; font-weight: 800; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 1px;">Veces Convocado</span>
                    <span class="value" style="color: var(--primary); font-size: 1.4rem; text-shadow: 0 0 10px rgba(240,165,0,0.4);">${totalConvocatorias}</span>
                </div>
            `;
        }

    } catch (err) {
        console.error(">>> [CALENDARIO] Error:", err);
        grid.innerHTML = '<div style="grid-column: span 7; padding: 20px; text-align: center; color: var(--error);">Error al cargar historial</div>';
    }
};
