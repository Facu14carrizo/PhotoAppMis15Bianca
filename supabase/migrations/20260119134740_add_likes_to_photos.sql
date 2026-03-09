-- Agregar columnas para likes
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS liked_by TEXT[] DEFAULT '{}';
