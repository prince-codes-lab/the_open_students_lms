-- Clean up any orphaned policies first
DO $$ 
BEGIN
    -- Drop policies if they exist (even if tables don't exist)
    DROP POLICY IF EXISTS "Users can view their own progress" ON lesson_progress;
    DROP POLICY IF EXISTS "Users can update their own progress" ON lesson_progress;
    DROP POLICY IF EXISTS "Users can insert their own progress" ON lesson_progress;
    DROP POLICY IF EXISTS "Anyone can view active lessons" ON course_lessons;
    DROP POLICY IF EXISTS "Anyone can view active modules" ON course_modules;
EXCEPTION
    WHEN undefined_table THEN
        NULL; -- Ignore if table doesn't exist
END $$;

-- Drop tables if they exist (cascade to remove dependencies)
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;

-- Create course_modules table
CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create course_lessons table
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'text', 'quiz')),
    video_url TEXT,
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lesson_progress table
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Create policies with unique names
CREATE POLICY "public_view_modules" 
    ON course_modules FOR SELECT 
    USING (true);

CREATE POLICY "public_view_lessons" 
    ON course_lessons FOR SELECT 
    USING (true);

CREATE POLICY "users_view_own_progress" 
    ON lesson_progress FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_progress" 
    ON lesson_progress FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_progress" 
    ON lesson_progress FOR UPDATE 
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_course_modules_updated_at
    BEFORE UPDATE ON course_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at
    BEFORE UPDATE ON course_lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
    BEFORE UPDATE ON lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
