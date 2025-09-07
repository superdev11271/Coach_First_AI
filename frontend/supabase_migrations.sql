-- Create videolinks table
CREATE TABLE IF NOT EXISTS videolinks (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videolinks_status ON videolinks(status);
CREATE INDEX IF NOT EXISTS idx_videolinks_created_at ON videolinks(created_at);

-- Add RLS (Row Level Security) if needed
-- ALTER TABLE videolinks ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (uncomment if using RLS)
-- CREATE POLICY "Users can view their own video links" ON videolinks
--   FOR ALL USING (auth.uid() IS NOT NULL);

-- Create policy for inserting (uncomment if using RLS)
-- CREATE POLICY "Users can insert video links" ON videolinks
--   FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy for updating (uncomment if using RLS)
-- CREATE POLICY "Users can update their own video links" ON videolinks
--   FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create policy for deleting (uncomment if using RLS)
-- CREATE POLICY "Users can delete their own video links" ON videolinks
--   FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create flagged_answers table
CREATE TABLE IF NOT EXISTS flagged_answers (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  status TEXT DEFAULT 'not_processed',
  document_ids BIGINT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flagged_answers_status ON flagged_answers(status);
CREATE INDEX IF NOT EXISTS idx_flagged_answers_created_at ON flagged_answers(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- Create function to get flagged answer with documents
CREATE OR REPLACE FUNCTION get_flagged_answer(flagged_id bigint)
RETURNS jsonb
LANGUAGE sql
AS $$
  SELECT jsonb_build_object(
    'id', fa.id,
    'question', fa.question,
    'answer', fa.answer,
    'status', fa.status,
    'created_at', fa.created_at,
    'documents', COALESCE(
        json_agg(
          jsonb_build_object(
            'id', d.id,
            'content', d.content
          )
        ) FILTER (WHERE d.id IS NOT NULL), '[]'::json
    )
  )
  FROM flagged_answers fa
  LEFT JOIN LATERAL unnest(fa.document_ids) AS doc_id ON true
  LEFT JOIN documents d ON d.id = doc_id
  WHERE fa.id = flagged_id
  GROUP BY fa.id, fa.question, fa.answer, fa.status, fa.created_at;
$$;
