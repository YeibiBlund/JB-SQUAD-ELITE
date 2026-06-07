-- --------------------------------------------------------------------------------------
-- ACTIVACION DEL BORRADO HISTORICO EN SUPABASE (ROW LEVEL SECURITY)
-- --------------------------------------------------------------------------------------
-- Si tu app falla al intentar borrar en las pantallas, es porque Supabase bloquea los DELETE 
-- por defecto para evitar borrados accidentales de los historiales.
--
-- Ejecuta este código en el botón "SQL EDITOR" de tu panel de Supabase.

-- 1. Aseguramos que los managers del equipo pueden eliminar polls históricas:
DROP POLICY IF EXISTS "Managers pueden eliminar polls" ON availability_polls;
CREATE POLICY "Managers pueden eliminar polls" ON availability_polls
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM memberships 
    WHERE memberships.user_id = auth.uid() 
    AND memberships.team_id = availability_polls.team_id 
    AND memberships.role = 'manager'
  )
);

-- 2. Aseguramos que alguien puede borrar los votos de un poll:
DROP POLICY IF EXISTS "Managers pueden vaciar votos" ON availability_votes;
CREATE POLICY "Managers pueden vaciar votos" ON availability_votes
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM availability_polls ap
    JOIN memberships m ON m.team_id = ap.team_id
    WHERE ap.id = availability_votes.poll_id
    AND m.user_id = auth.uid()
    AND m.role = 'manager'
  )
);

-- (Opcional, en caso de haber un error por políticas faltantes)
-- ¡Listo! Una vez ejecutado, vuelve a la App y pulsa el botón borrar de nuevo.
