
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Analytics() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [keyMetrics, setKeyMetrics] = useState({
    monthlyJobs: 0,
    revenue: 0,
    activeClients: 0,
    growthRate: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalyticsData = async () => {
    try {
      // Fetch monthly job data for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: monthlyJobs, error: jobsError } = await supabase
        .from('print_logs')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString());

      if (jobsError) throw jobsError;

      // Process monthly data
      const monthlyMap = new Map();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Initialize last 6 months with 0 jobs and revenue
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = months[date.getMonth()];
        monthlyMap.set(monthKey, { month: monthKey, jobs: 0, revenue: 0 });
      }

      // Count actual jobs per month
      monthlyJobs?.forEach((job: any) => {
        const jobDate = new Date(job.created_at);
        const monthKey = months[jobDate.getMonth()];
        if (monthlyMap.has(monthKey)) {
          const existing = monthlyMap.get(monthKey);
          existing.jobs += 1;
        }
      });

      // Fetch real revenue data for each month
      const { data: revenueData, error: revenueError } = await supabase
        .from('billing')
        .select('amount, created_at')
        .eq('status', 'paid')
        .gte('created_at', sixMonthsAgo.toISOString());

      if (!revenueError && revenueData) {
        revenueData.forEach((bill: any) => {
          const billDate = new Date(bill.created_at);
          const monthKey = months[billDate.getMonth()];
          if (monthlyMap.has(monthKey)) {
            const existing = monthlyMap.get(monthKey);
            existing.revenue += Number(bill.amount);
          }
        });
      }

      setMonthlyData(Array.from(monthlyMap.values()));

      // Fetch current month metrics
      const currentMonth = new Date();
      currentMonth.setDate(1);
      
      const { data: currentJobs, error: currentError } = await supabase
        .from('print_logs')
        .select('id')
        .gte('created_at', currentMonth.toISOString());

      if (currentError) throw currentError;

      // Fetch unique clients count from projects
      const { data: clientsData, error: clientsError } = await supabase
        .from('projects')
        .select('client');

      if (clientsError) throw clientsError;

      const uniqueClients = new Set(clientsData?.map(p => p.client)).size;

      // Fetch real revenue for current month
      const { data: currentRevenue, error: currentRevenueError } = await supabase
        .from('billing')
        .select('amount')
        .eq('status', 'paid')
        .gte('created_at', currentMonth.toISOString());

      const totalCurrentRevenue = currentRevenue?.reduce((sum, bill) => sum + Number(bill.amount), 0) || 0;

      // Calculate growth rate based on previous month
      const previousMonth = new Date();
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      previousMonth.setDate(1);
      
      const { data: previousJobs, error: previousError } = await supabase
        .from('print_logs')
        .select('id')
        .gte('created_at', previousMonth.toISOString())
        .lt('created_at', currentMonth.toISOString());

      const growthRate = previousJobs?.length > 0 
        ? Math.round(((currentJobs?.length || 0) - previousJobs.length) / previousJobs.length * 100)
        : 0;

      setKeyMetrics({
        monthlyJobs: currentJobs?.length || 0,
        revenue: totalCurrentRevenue,
        activeClients: uniqueClients,
        growthRate: growthRate
      });

      // Service distribution based on actual job names
      const { data: allJobs, error: allJobsError } = await supabase
        .from('print_logs')
        .select('job_name');

      if (!allJobsError && allJobs && allJobs.length > 0) {
        const serviceMap = new Map();
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        
        allJobs.forEach((job: any) => {
          const jobName = job.job_name.toLowerCase();
          let category = 'Other';
          
          if (jobName.includes('business card') || jobName.includes('card')) category = 'Business Cards';
          else if (jobName.includes('brochure')) category = 'Brochures';
          else if (jobName.includes('banner')) category = 'Banners';
          else if (jobName.includes('flyer')) category = 'Flyers';
          else if (jobName.includes('poster')) category = 'Posters';
          
          serviceMap.set(category, (serviceMap.get(category) || 0) + 1);
        });

        const total = allJobs.length;
        const serviceArray = Array.from(serviceMap.entries()).map(([name, count], index) => ({
          name,
          value: Math.round((count / total) * 100),
          color: colors[index % colors.length]
        }));

        setServiceData(serviceArray);
      }

    } catch (error: any) {
      console.error('Analytics fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">Loading analytics...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Metrics</h1>
          <p className="text-gray-600 mt-2">Track your business performance and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Jobs</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keyMetrics.monthlyJobs}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${keyMetrics.revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keyMetrics.activeClients}</div>
              <p className="text-xs text-muted-foreground">Unique clients</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {keyMetrics.growthRate > 0 ? '+' : ''}{keyMetrics.growthRate}%
              </div>
              <p className="text-xs text-muted-foreground">Month over month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <CardDescription>Jobs completed over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="jobs" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {serviceData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Service Distribution</CardTitle>
                <CardDescription>Breakdown of services by volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {serviceData.map((entry: any, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue growth over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
