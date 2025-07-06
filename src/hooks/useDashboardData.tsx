
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useDashboardData() {
  const [totalJobsThisWeek, setTotalJobsThisWeek] = useState(0);
  const [taskStatusData, setTaskStatusData] = useState([
    { status: 'completed', count: 0 },
    { status: 'in_progress', count: 0 },
    { status: 'pending', count: 0 }
  ]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [avgCompletionTime, setAvgCompletionTime] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch total jobs this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: weeklyJobs, error: jobsError } = await supabase
        .from('print_logs')
        .select('id')
        .gte('created_at', weekAgo.toISOString());

      if (!jobsError) {
        setTotalJobsThisWeek(weeklyJobs?.length || 0);
      }

      // Fetch task status data
      const { data: statusData, error: statusError } = await supabase
        .from('print_logs')
        .select('status');

      if (!statusError && statusData) {
        const statusCounts = statusData.reduce((acc: any, item: any) => {
          const status = item.status === 'in_progress' ? 'in_progress' : 
                        item.status === 'completed' ? 'completed' : 'pending';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        setTaskStatusData([
          { status: 'completed', count: statusCounts.completed || 0 },
          { status: 'in_progress', count: statusCounts.in_progress || 0 },
          { status: 'pending', count: statusCounts.pending || 0 }
        ]);
      }

      // Fetch top performers (users with most completed tasks)
      const { data: performers, error: performersError } = await supabase
        .from('print_logs')
        .select(`
          created_by,
          profiles!inner(full_name)
        `)
        .eq('status', 'completed');

      if (!performersError && performers) {
        const performerCounts = performers.reduce((acc: any, item: any) => {
          const userId = item.created_by;
          const userName = item.profiles?.full_name || 'Unknown User';
          if (!acc[userId]) {
            acc[userId] = { full_name: userName, completed_tasks: 0 };
          }
          acc[userId].completed_tasks++;
          return acc;
        }, {});

        const sortedPerformers = Object.values(performerCounts)
          .sort((a: any, b: any) => b.completed_tasks - a.completed_tasks)
          .slice(0, 5);

        setTopPerformers(sortedPerformers);
      }

      // Calculate average completion time
      const { data: completedJobs, error: completionError } = await supabase
        .from('print_logs')
        .select('started_at, completed_at')
        .eq('status', 'completed')
        .not('started_at', 'is', null)
        .not('completed_at', 'is', null);

      if (!completionError && completedJobs && completedJobs.length > 0) {
        const totalTime = completedJobs.reduce((sum: number, job: any) => {
          const start = new Date(job.started_at);
          const end = new Date(job.completed_at);
          return sum + (end.getTime() - start.getTime());
        }, 0);
        
        const avgMs = totalTime / completedJobs.length;
        const avgHours = avgMs / (1000 * 60 * 60);
        setAvgCompletionTime(avgHours);
      }

      // Fetch overdue tasks (projects past due date)
      const today = new Date().toISOString().split('T')[0];
      const { data: overdueProjects, error: overdueError } = await supabase
        .from('projects')
        .select('name, due_date, status')
        .lt('due_date', today)
        .neq('status', 'completed');

      if (!overdueError) {
        setOverdueTasks(overdueProjects?.map(project => ({
          job_name: project.name,
          due_date: project.due_date,
          status: project.status
        })) || []);
      }

      // Fetch recent tasks
      const { data: recentData, error: recentError } = await supabase
        .from('print_logs')
        .select('job_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!recentError) {
        setRecentTasks(recentData || []);
      }

      console.log('✅ Dashboard data loaded successfully');
      
    } catch (error: any) {
      console.error('Dashboard data fetch error:', error);
      toast({
        title: "Error Loading Dashboard",
        description: "Failed to fetch dashboard data. Please try again.",
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
