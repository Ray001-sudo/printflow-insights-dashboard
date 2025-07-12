
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, DollarSign, FileText, Settings, BarChart3, FolderOpen, Terminal, CreditCard, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardHeader from './dashboard/DashboardHeader';
import StatsCard from './dashboard/StatsCard';
import TaskStatusChart from './dashboard/TaskStatusChart';
import TaskTimelineCard from './dashboard/TaskTimelineCard';
import TopPerformersCard from './dashboard/TopPerformersCard';
import OverdueTasksCard from './dashboard/OverdueTasksCard';
import ExportCard from './dashboard/ExportCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { 
    tasks, 
    projects, 
    invoices, 
    loading, 
    stats,
    taskStatusData,
    overdueTasksCount,
    topPerformers,
    taskTimeline
  } = useDashboardData();

  const quickActions = [
    { title: 'Create Task', description: 'Add a new task to the system', icon: FileText, path: '/create-task', color: 'bg-blue-500' },
    { title: 'Manage Projects', description: 'View and manage all projects', icon: FolderOpen, path: '/projects', color: 'bg-green-500' },
    { title: 'View Analytics', description: 'Check performance metrics', icon: BarChart3, path: '/analytics', color: 'bg-purple-500' },
    { title: 'File Manager', description: 'Manage uploaded files', icon: FolderOpen, path: '/files', color: 'bg-orange-500' },
    { title: 'Terminal', description: 'Access system terminal', icon: Terminal, path: '/terminal', color: 'bg-gray-500' },
    { title: 'Billing', description: 'Manage invoices and payments', icon: CreditCard, path: '/billing', color: 'bg-yellow-500' },
    ...(userRole === 'admin' ? [{ 
      title: 'Staff Management', 
      description: 'Register and manage staff members', 
      icon: UserPlus, 
      path: '/staff', 
      color: 'bg-indigo-500' 
    }] : [])
  ];

  const recentTasks = tasks.slice(0, 5);
  const recentProjects = projects.slice(0, 3);
  const recentInvoices = invoices.slice(0, 3);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <DashboardHeader user={user} />
      
      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          description="Active tasks in system"
          icon={FileText}
          color="text-blue-600"
        />
        <StatsCard
          title="Active Projects"
          value={stats.activeProjects}
          description="Currently running"
          icon={FolderOpen}
          color="text-green-600"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          description="From paid invoices"
          icon={DollarSign}
          color="text-yellow-600"
        />
        <StatsCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          description="Awaiting completion"
          icon={Calendar}
          color="text-red-600"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskStatusChart data={taskStatusData} />
        <TaskTimelineCard data={taskTimeline} />
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPerformersCard data={topPerformers} />
        <OverdueTasksCard count={overdueTasksCount} />
      </div>

      {/* Export Options */}
      <ExportCard />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and navigation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2"
                onClick={() => navigate(action.path)}
              >
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded ${action.color} text-white`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">{action.title}</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">{action.description}</p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{task.job_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                    </p>
                  </div>
                  <Badge variant={task.status === 'completed' ? 'default' : task.status === 'in_progress' ? 'secondary' : 'outline'}>
                    {task.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No recent tasks</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="mr-2 h-5 w-5" />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.client}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={project.status === 'completed' ? 'default' : 'outline'}>
                      {project.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{project.progress}%</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No recent projects</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium text-sm">{invoice.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{invoice.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${invoice.amount}</p>
                    <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'sent' ? 'secondary' : 'outline'}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No recent invoices</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
