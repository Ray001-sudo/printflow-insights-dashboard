
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Shield, User } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';
import { Skeleton } from '@/components/ui/skeleton';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function AdminRoles() {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching profiles:', error);
          toast({
            title: "Error",
            description: "Failed to load user profiles.",
            variant: "destructive",
          });
        } else {
          setProfiles(data || []);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && userRole === 'admin') {
      fetchProfiles();
    }
  }, [user, userRole, toast]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated or not admin
  if (!user || userRole !== 'admin') {
    return <AccessDenied />;
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    if (userId === user.id && newRole !== 'admin') {
      toast({
        title: "Error",
        description: "You cannot remove your own admin privileges.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingRole(userId);

    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === userId ? { ...profile, role: newRole } : profile
      ));

      toast({
        title: "Success",
        description: `User role updated to ${newRole}.`,
      });

    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role.",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">User Role Management</h1>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Manage User Roles
            </CardTitle>
            <CardDescription>
              View and update user roles. Only admin users can access the manager dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found.
              </div>
            ) : (
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        profile.role === 'admin' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {profile.role === 'admin' ? (
                          <Shield className="w-5 h-5 text-red-600" />
                        ) : (
                          <User className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{profile.full_name}</p>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                        <p className="text-xs text-gray-400">
                          Joined {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        profile.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {profile.role}
                      </span>
                      
                      <Select
                        value={profile.role}
                        onValueChange={(newRole) => updateUserRole(profile.id, newRole)}
                        disabled={updatingRole === profile.id}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {updatingRole === profile.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
