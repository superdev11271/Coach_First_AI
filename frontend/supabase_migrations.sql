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
