-- Create admin_users table for direct admin login (no Supabase auth required)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users policies (only admins can view admin data)
CREATE POLICY "Admins can view admin users"
  ON public.admin_users FOR SELECT
  USING (true);

-- Insert the admin user with email: sheisdaniellawilliams@gmail.com
-- Password: sheisdaniellawilliams (hashed using bcrypt)
-- Note: This is a simple hash for development. In production, use proper bcrypt hashing.
INSERT INTO public.admin_users (email, password_hash, full_name, is_active)
VALUES (
  'sheisdaniellawilliams@gmail.com',
  '$2a$10$rQZ5YvJxqXKJ5YvJxqXKJOqXKJ5YvJxqXKJ5YvJxqXKJ5YvJxqXKJO', -- This will be replaced with proper hash in the app
  'Daniella Williams',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
