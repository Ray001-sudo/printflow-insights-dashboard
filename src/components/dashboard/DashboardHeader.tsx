
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, User, Settings } from 'lucide-react';

export default function DashboardHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Icons PrintFlow Manager</h1>
            <p className="text-gray-600">Production Dashboard</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/create-task')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>

            <Button
              onClick={() => navigate('/admin/roles')}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Roles
            </Button>
            
            <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <div className="text-sm">
                <p className="font-medium text-gray-900">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-gray-500">Admin</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
