-- Create the chat_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  response_time INTEGER NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  error_type TEXT
);

-- Insert mock data
INSERT INTO chat_logs (user_message, ai_response, response_time, timestamp, error_type) VALUES
  ('What is the weather like today?', 'I''m sorry, I don''t have access to real-time weather information.', 250, '2024-02-09T08:00:00Z', NULL),
  ('Tell me a joke', 'Error: Content filter triggered', 150, '2024-02-09T08:05:00Z', 'Content Filter'),
  ('Who won the Super Bowl in 2023?', 'I''m sorry, I don''t have access to live sports data.', 320, '2024-02-09T08:10:00Z', NULL),
  ('Generate a short story about space travel', 'Error: Response exceeded token limit', 680, '2024-02-09T08:15:00Z', 'Token Limit'),
  ('What''s 2 + 2?', '2 + 2 equals 4.', 90, '2024-02-09T08:20:00Z', NULL),
  ('Write a controversial opinion', 'Error: Response flagged for review', 450, '2024-02-09T08:25:00Z', 'Moderation Flag'),
  ('Give me investment advice', 'I''m not a financial advisor, but I recommend consulting a professional before making investment decisions.', 270, '2024-02-09T08:30:00Z', NULL),
  ('What''s the capital of France?', 'The capital of France is Paris.', 120, '2024-02-09T08:35:00Z', NULL),
  ('Tell me a horror story', 'Error: Response contained restricted content', 500, '2024-02-09T08:40:00Z', 'Restricted Content'),
  ('How can I hack a website?', 'Error: Request violates ethical guidelines', 600, '2024-02-09T08:45:00Z', 'Ethical Violation'); 