
-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- Create users table for the application
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role app_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Admin can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can view themselves" ON public.users
    FOR SELECT USING (id = auth.uid());

-- Create policies for tasks table
CREATE POLICY "Admin can view all tasks" ON public.tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Staff can view assigned tasks" ON public.tasks
    FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Admin can manage all tasks" ON public.tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        NEW.email,
        'staff'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for testing
INSERT INTO public.users (id, full_name, email, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Admin User', 'admin@printflow.com', 'admin'),
    ('550e8400-e29b-41d4-a716-446655440001', 'John Smith', 'john@printflow.com', 'staff'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Sarah Johnson', 'sarah@printflow.com', 'staff'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Mike Chen', 'mike@printflow.com', 'staff'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Emma Davis', 'emma@printflow.com', 'staff');

-- Insert sample tasks for testing
INSERT INTO public.tasks (job_name, assigned_to, assigned_by, status, start_time, end_time, due_date, created_at) VALUES
    ('Business Cards - ABC Corp', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'completed', now() - INTERVAL '3 days', now() - INTERVAL '2 days', now() + INTERVAL '1 day', now() - INTERVAL '5 days'),
    ('Brochure Design - XYZ Ltd', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'in_progress', now() - INTERVAL '1 day', NULL, now() + INTERVAL '2 days', now() - INTERVAL '3 days'),
    ('Poster Printing - Event Co', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'pending', NULL, NULL, now() + INTERVAL '3 days', now() - INTERVAL '2 days'),
    ('Logo Design - Startup Inc', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'completed', now() - INTERVAL '6 days', now() - INTERVAL '4 days', now() - INTERVAL '1 day', now() - INTERVAL '7 days'),
    ('Flyer Campaign - Restaurant', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'overdue', now() - INTERVAL '5 days', NULL, now() - INTERVAL '2 days', now() - INTERVAL '8 days'),
    ('Magazine Layout - Publisher', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'in_progress', now() - INTERVAL '2 days', NULL, now() + INTERVAL '5 days', now() - INTERVAL '4 days'),
    ('Banner Design - Trade Show', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'completed', now() - INTERVAL '7 days', now() - INTERVAL '5 days', now() - INTERVAL '3 days', now() - INTERVAL '9 days'),
    ('Catalog Design - Retailer', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'pending', NULL, NULL, now() + INTERVAL '7 days', now() - INTERVAL '1 day');
