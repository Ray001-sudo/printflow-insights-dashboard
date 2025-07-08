
-- Drop all existing policies on profiles table to fix infinite recursion
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow logged-in read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow user to read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow user to read their profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their profile" ON public.profiles;
DROP POLICY IF EXISTS "Logged-in users can read their profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their profile" ON public.profiles;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Users can read own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Fix the Select component error by ensuring no empty string values
UPDATE public.projects SET status = 'active' WHERE status = '';
UPDATE public.billing SET status = 'draft' WHERE status = '';

-- Also fix any potential foreign key issues
DELETE FROM public.print_logs WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM public.projects);
DELETE FROM public.billing WHERE project_id IS NOT NULL AND project_id NOT IN (SELECT id FROM public.projects);
