
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Award } from 'lucide-react';

interface TopPerformer {
  full_name: string;
  completed_tasks: number;
}

interface TopPerformersCardProps {
  data: TopPerformer[];
  loading: boolean;
}

export default function TopPerformersCard({ data, loading }: TopPerformersCardProps) {
  const getIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-gray-400" />;
      case 2: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-xs">{index + 1}</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Staff</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((performer, index) => (
              <div key={performer.full_name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getIcon(index)}
                  <span className="font-medium">{performer.full_name}</span>
                </div>
                <Badge variant="secondary">
                  {performer.completed_tasks} tasks
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
