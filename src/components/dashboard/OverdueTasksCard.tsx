
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface OverdueTask {
  job_name: string;
  due_date: string;
  status: string;
}

interface OverdueTasksCardProps {
  data: OverdueTask[];
  loading: boolean;
}

export default function OverdueTasksCard({ data, loading }: OverdueTasksCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'in_progress': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span>Overdue Tasks</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex space-x-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-green-600 text-center py-4">🎉 No overdue tasks!</p>
        ) : (
          <div className="space-y-3">
            {data.map((task, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-3 py-2">
                <h4 className="font-medium text-gray-900">{task.job_name}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-sm text-red-600">
                    Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
