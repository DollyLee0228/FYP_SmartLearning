-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for admin content
CREATE TABLE public.admin_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lesson', 'quiz', 'video')),
  level TEXT NOT NULL DEFAULT 'A1',
  category TEXT NOT NULL DEFAULT 'Grammar',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  youtube_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_content ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all content"
ON public.admin_content
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Everyone can view published content
CREATE POLICY "Anyone can view published content"
ON public.admin_content
FOR SELECT
USING (status = 'published');

-- Create trigger for updated_at
CREATE TRIGGER update_admin_content_updated_at
BEFORE UPDATE ON public.admin_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();