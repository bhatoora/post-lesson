/*
  # Create lessons table

  1. New Tables
    - `lessons`
      - `id` (uuid, primary key)
      - `outline` (text, lesson outline)
      - `title` (text, generated title)
      - `content` (text, generated lesson content)
      - `status` (text, 'generating' or 'generated' or 'error')
      - `error_message` (text, error details if generation fails)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `lessons` table
    - Allow public read/write access (no authentication required)
*/

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outline text NOT NULL,
  title text,
  content text,
  status text NOT NULL DEFAULT 'generating',
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read lessons"
  ON lessons
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create lessons"
  ON lessons
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update lessons"
  ON lessons
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete lessons"
  ON lessons
  FOR DELETE
  TO public
  USING (true);