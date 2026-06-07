-- Ejecutar esto en el SQL Editor de Supabase
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS poll_id uuid REFERENCES public.availability_polls(id),
ADD COLUMN IF NOT EXISTS lineup jsonb DEFAULT '[]'::jsonb;
