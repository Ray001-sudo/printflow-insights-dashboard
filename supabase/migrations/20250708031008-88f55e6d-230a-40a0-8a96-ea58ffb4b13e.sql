
-- Create a security definer function to check admin role without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update all table policies to use the new function
-- Projects table policies
DROP POLICY IF EXISTS "Admins full access" ON public.projects;
CREATE POLICY "Admins can manage projects" ON public.projects
FOR ALL USING (public.is_admin());

-- Billing table policies  
DROP POLICY IF EXISTS "Admins full access" ON public.billing;
CREATE POLICY "Admins can manage billing" ON public.billing
FOR ALL USING (public.is_admin());

-- Print logs table policies
DROP POLICY IF EXISTS "Admins full access" ON public.print_logs;
CREATE POLICY "Admins can manage print_logs" ON public.print_logs
FOR ALL USING (public.is_admin());

-- Metrics table policies
DROP POLICY IF EXISTS "Admins full access" ON public.metrics;
CREATE POLICY "Admins can manage metrics" ON public.metrics
FOR ALL USING (public.is_admin());

-- Cron jobs table policies
DROP POLICY IF EXISTS "Admins full access" ON public.cron_jobs;
CREATE POLICY "Admins can manage cron_jobs" ON public.cron_jobs
FOR ALL USING (public.is_admin());

-- Webhooks table policies
DROP POLICY IF EXISTS "Admins full access" ON public.webhooks;
CREATE POLICY "Admins can manage webhooks" ON public.webhooks
FOR ALL USING (public.is_admin());
