/*
  # Create storage bucket for PDFs

  1. New Storage Bucket
    - Creates a new public storage bucket named 'pdfs' for storing PDF documents
  
  2. Security
    - Enable RLS on the bucket
    - Add policies for authenticated users to manage their own files
*/

-- Create a new storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', true);

-- Enable RLS
CREATE POLICY "Users can upload PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their PDFs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read their PDFs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);