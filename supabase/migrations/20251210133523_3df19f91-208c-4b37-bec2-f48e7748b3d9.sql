-- Create storage bucket for admin content uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('admin-content', 'admin-content', true);

-- Create policy for admin to upload files
CREATE POLICY "Admins can upload content files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'admin-content' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Create policy for admin to update files
CREATE POLICY "Admins can update content files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'admin-content' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Create policy for admin to delete files
CREATE POLICY "Admins can delete content files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'admin-content' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Create policy for public to read files
CREATE POLICY "Anyone can view content files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'admin-content');