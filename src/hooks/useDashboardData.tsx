
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useDashboardData() {
  const [totalJobsThisWeek, setTotalJobsThisWeek] = useState(0);
  const [taskStatusData, setTaskStatusData] = useState<{ status: string; count: number }[]>([]);
  const [topPerformers, setTopPerformers] = useState<{ full_name: string; completed_tasks: number }[]>([]);
  const [avgCompletionTime, setAvgCompletionTime] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Total jobs this week
      const { data: weeklyJobs, error: weeklyError } = await supabase
        .from('tasks')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (weeklyError) throw weeklyError;
      setTotalJobsThisWeek(weeklyJobs?.length || 0);

      // Task status breakdown
      const { data: statusData, error: statusError } = await supabase
        .from('tasks')
        .select('status');

      if (statusError) throw statusError;
      
      const statusCounts = statusData?.reduce((acc: any, task: any) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {}) || {};

      setTaskStatusData(
        Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count: count as number
        }))
      );

      // Top performers
      const { data: performersData, error: performersError } = await supabase
        .from('tasks')
        .select(`
          assigned_to,
          users!tasks_assigned_to_fkey(full_name)
        `)
        .eq('status', 'completed');

      if (performersError) throw performersError;

      const performerCounts = performersData?.reduce((acc: any, task: any) => {
        const name = task.users?.full_name;
        if (name) {
          acc[name] = (acc[name] || 0) + 1;
        }
        return acc;
      }, {}) || {};

      const sortedPerformers = Object.entries(performerCounts)
        .map(([full_name, completed_tasks]) => ({
          full_name,
          completed_tasks: completed_tasks as number
        }))
        .sort((a, b) => b.completed_tasks - a.completed_tasks)
        .slice(0, 5);

      setTopPerformers(sortedPerformers);

      // Average completion time
      const { data: completedTasks, error: completionError } = await supabase
        .from('tasks')
        .select('start_time, end_time')
        .eq('status', 'completed')
        .not('start_time', 'is', null)
        .not('end_time', 'is', null);

      if (completionError) throw completionError;

      if (completedTasks && completedTasks.length > 0) {
        const totalHours = completedTasks.reduce((acc, task) => {
          const start = new Date(task.start_time);
          const end = new Date(task.end_time);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          return acc + hours;
        }, 0);
        setAvgCompletionTime(totalHours / completedTasks.length);
      }

      // Overdue tasks
      const { data: overdueData, error: overdueError } = await supabase
        .from('tasks')
        .select('job_name, due_date, status')
        .neq('status', 'completed')
        .lt('due_date', new Date().toISOString());

      if (overdueError) throw overdueError;
      setOverdueTasks(overdueData || []);

      // Recent tasks
      const { data: recentData, error: recentError } = await supabase
        .from('tasks')
        .select('job_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;
      setRecentTasks(recentData || []);

    } catch (error: any) {
      console.error('Dashboard data fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    totalJobsThisWeek,
    taskStatusData,
    topPerformers,
    avgCompletionTime,
    overdueTasks,
    recentTasks,
    loading,
    refetch: fetchDashboardData
  };
}
