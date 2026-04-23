// Script de emergencia para limpiar convocatorias duplicadas
// Ejecutar esto desde la consola del navegador para limpiar la DB

async function cleanDuplicatePolls() {
    console.log(">>> Iniciando limpieza de convocatorias...");
    
    // 1. Obtener todas las abiertas
    const { data: openPolls, error } = await supabase
        .from('availability_polls')
        .select('id, title, created_at')
        .eq('status', 'open');

    if (error) {
        console.error("Error al obtener convocatorias:", error);
        return;
    }

    if (openPolls.length <= 1) {
        console.log("No hay duplicados evidentes. Convocatorias abiertas:", openPolls.length);
        return;
    }

    console.log(`Se han encontrado ${openPolls.length} convocatorias abiertas.`, openPolls);

    // 2. Quedarnos solo con la más reciente y cerrar el resto
    const sorted = openPolls.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const mostRecent = sorted[0];
    const toClose = sorted.slice(1);

    console.log("Manteniendo activa:", mostRecent.title, `(${mostRecent.id})`);
    
    for (const poll of toClose) {
        console.log("Cerrando antigua:", poll.title, `(${poll.id})`);
        await supabase
            .from('availability_polls')
            .update({ status: 'closed' })
            .eq('id', poll.id);
    }

    console.log(">>> Limpieza completada. Por favor, recarga la página.");
}

// cleanDuplicatePolls(); // Descomentar para ejecutar
