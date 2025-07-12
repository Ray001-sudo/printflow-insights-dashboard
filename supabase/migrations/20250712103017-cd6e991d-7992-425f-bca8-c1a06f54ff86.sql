
-- First, let's check if the tasks table exists and create it if needed
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy for tasks - allow authenticated users to create tasks
CREATE POLICY "Allow authenticated users to insert tasks" 
ON public.tasks 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = assigned_by);

-- Create SELECT policy for tasks - allow users to view tasks they created or are assigned to
CREATE POLICY "Allow users to view their tasks" 
ON public.tasks 
FOR SELECT 
TO authenticated 
USING (auth.uid() = assigned_by OR auth.uid() = assigned_to OR public.is_admin());

-- Create UPDATE policy for tasks
CREATE POLICY "Allow users to update their tasks" 
ON public.tasks 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = assigned_by OR auth.uid() = assigned_to OR public.is_admin());

-- Create DELETE policy for tasks
CREATE POLICY "Allow users to delete their tasks" 
ON public.tasks 
FOR DELETE 
TO authenticated 
USING (auth.uid() = assigned_by OR public.is_admin());

-- Fix billing table INSERT policy
DROP POLICY IF EXISTS "Allow authenticated users to insert billing" ON public.billing;
CREATE POLICY "Allow authenticated users to insert billing" 
ON public.billing 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

-- Fix projects table INSERT policy  
DROP POLICY IF EXISTS "Allow authenticated users to insert projects" ON public.projects;
CREATE POLICY "Allow authenticated users to insert projects" 
ON public.projects 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);
