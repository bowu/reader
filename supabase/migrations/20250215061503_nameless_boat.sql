/*
  # Add storage path to documents table

  1. Changes
    - Add `storage_path` column to `documents` table
      - Required for storing the path to the PDF file in storage
      - Not nullable to ensure every document has a storage path
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE documents ADD COLUMN storage_path text NOT NULL;
  END IF;
END $$;