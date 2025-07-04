
import DashboardHeader from './dashboard/DashboardHeader';
import StatsCard from './dashboard/StatsCard';
import TaskStatusChart from './dashboard/TaskStatusChart';
import TopPerformersCard from './dashboard/TopPerformersCard';
import OverdueTasksCard from './dashboard/OverdueTasksCard';
import TaskTimelineCard from './dashboard/TaskTimelineCard';
import ExportCard from './dashboard/ExportCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

export default function Dashboard() {
  const {
    totalJobsThisWeek,
    taskStatusData,
    topPerformers,
    avgCompletionTime,
    overdueTasks,
    recentTasks,
    loading
  } = useDashboardData();

  const exportData = {
    totalJobs: totalJobsThisWeek,
    statusBreakdown: taskStatusData,
    topPerformers,
    overdueCount: overdueTasks.length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Jobs This Week"
            value={totalJobsThisWeek}
            icon={<Calendar className="w-6 h-6" />}
            loading={loading}
          />
          
          <StatsCard
            title="Avg Completion Time"
            value={`${avgCompletionTime.toFixed(1)}h`}
            icon={<Clock className="w-6 h-6" />}
            loading={loading}
          />
          
          <StatsCard
            title="Completed Tasks"
            value={taskStatusData.find(s => s.status === 'completed')?.count || 0}
            icon={<CheckCircle className="w-6 h-6" />}
            loading={loading}
          />
          
          <StatsCard
            title="Overdue Tasks"
            value={overdueTasks.length}
            icon={<AlertTriangle className="w-6 h-6" />}
            loading={loading}
          />
        </div>

        {/* Charts and Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TaskStatusChart data={taskStatusData} loading={loading} />
          <TopPerformersCard data={topPerformers} loading={loading} />
        </div>

        {/* Secondary Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <OverdueTasksCard data={overdueTasks} loading={loading} />
          <TaskTimelineCard data={recentTasks} loading={loading} />
          <ExportCard data={exportData} loading={loading} />
        </div>
      </main>
    </div>
  );
}
