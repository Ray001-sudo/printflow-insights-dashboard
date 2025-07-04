
-- Drop the existing users table since we're replacing it with profiles
DROP TABLE IF EXISTS public.users CASCADE;

-- Create profiles table to replace users table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update user roles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Update the handle_new_user function to work with profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        NEW.email,
        'staff'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update tasks table foreign keys to reference profiles instead of users
ALTER TABLE public.tasks 
DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey,
DROP CONSTRAINT IF EXISTS tasks_assigned_by_fkey;

ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_assigned_by_fkey 
FOREIGN KEY (assigned_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Update task policies to use profiles table
DROP POLICY IF EXISTS "Admin can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Staff can view assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admin can manage all tasks" ON public.tasks;

CREATE POLICY "Admin can view all tasks" ON public.tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Staff can view assigned tasks" ON public.tasks
    FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Admin can manage all tasks" ON public.tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Insert sample admin user (update this with a real email you want to be admin)
INSERT INTO public.profiles (id, full_name, email, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Admin User', 'admin@printflow.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Update existing task sample data to reference profiles
UPDATE public.tasks SET 
    assigned_to = '550e8400-e29b-41d4-a716-446655440001',
    assigned_by = '550e8400-e29b-41d4-a716-446655440000'
WHERE assigned_to IS NOT NULL;
