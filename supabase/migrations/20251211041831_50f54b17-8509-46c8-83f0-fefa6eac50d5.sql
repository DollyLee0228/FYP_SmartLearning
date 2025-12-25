-- Add questions and passage columns to admin_content table
ALTER TABLE public.admin_content 
ADD COLUMN IF NOT EXISTS questions text,
ADD COLUMN IF NOT EXISTS passage text;