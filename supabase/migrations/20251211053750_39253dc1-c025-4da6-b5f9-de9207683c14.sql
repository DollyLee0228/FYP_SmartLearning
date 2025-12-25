-- Create table to track content usage/views
CREATE TABLE public.content_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.admin_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_content_usage_content_id ON public.content_usage(content_id);
CREATE INDEX idx_content_usage_user_id ON public.content_usage(user_id);

-- Enable RLS
ALTER TABLE public.content_usage ENABLE ROW LEVEL SECURITY;

-- Users can insert their own usage records
CREATE POLICY "Users can insert their own usage"
ON public.content_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own usage
CREATE POLICY "Users can view their own usage"
ON public.content_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all usage
CREATE POLICY "Admins can view all usage"
ON public.content_usage
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));