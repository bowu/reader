/*
  # Add storage path to documents table

  1. Changes
    - Add `storage_path` column to `documents` table
      - Required for storing the path to the PDF file in storage
      - Initially allows NULL values to handle existing rows
      - Then sets a default value for new rows
  
  2. Process
    - Add column as nullable first
    - Set default for new rows
    - Add NOT NULL constraint after handling existing rows
*/

-- Add the column as nullable first
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE documents ADD COLUMN storage_path text;
  END IF;
END $$;

-- Set a default value for any existing rows
UPDATE documents 
SET storage_path = 'legacy/' || id || '.pdf'
WHERE storage_path IS NULL;

-- Now make it NOT NULL and set the default for new rows
ALTER TABLE documents 
  ALTER COLUMN storage_path SET NOT NULL;