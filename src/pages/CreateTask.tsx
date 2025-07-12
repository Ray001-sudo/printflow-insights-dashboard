import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Upload } from 'lucide-react';
import AccessDenied from '@/components/AccessDenied';
import { Skeleton } from '@/components/ui/skeleton';

interface StaffMember {
  id: string;
  full_name: string;
}

export default function CreateTask() {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    jobName: '',
    description: '',
    assignedTo: '',
    dueDate: ''
  });
  
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);

  // Fetch staff members on component mount
  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'staff');

        if (error) {
          console.error('Error fetching staff:', error);
          toast({
            title: "Error",
            description: "Failed to load staff members.",
            variant: "destructive",
          });
        } else {
          setStaffMembers(data || []);
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setIsLoadingStaff(false);
      }
    };

    if (user && userRole === 'admin') {
      fetchStaffMembers();
    }
  }, [user, userRole, toast]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF or image file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File, jobName: string) => {
    const fileName = `${Date.now()}_${jobName.replace(/[^a-zA-Z0-9]/g, '_')}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('tasks_files')
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('tasks_files')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jobName.trim()) {
      toast({
        title: "Validation Error",
        description: "Job name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.assignedTo) {
      toast({
        title: "Validation Error",
        description: "Please select a staff member to assign this task to.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.dueDate) {
      toast({
        title: "Validation Error",
        description: "Due date is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let fileUrl = null;
      
      // Upload file if selected
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile, formData.jobName);
      }

      // Insert task into database with proper assigned_by field
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          job_name: formData.jobName,
          description: formData.description || null,
          assigned_to: formData.assignedTo,
          assigned_by: user.id, // This is the key fix for RLS
          status: 'pending',
          due_date: formData.dueDate,
          file_url: fileUrl
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Task created successfully!",
      });

      // Redirect to dashboard
      navigate('/');

    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Job Task</h1>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>
              Fill out the form below to create a new printing job task and assign it to a staff member.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobName">Job Name *</Label>
                <Input
                  id="jobName"
                  type="text"
                  placeholder="e.g., Business Cards for ABC Corp"
                  value={formData.jobName}
                  onChange={(e) => setFormData({ ...formData, jobName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details about the job requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign to Staff Member *</Label>
                {isLoadingStaff ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select 
                    value={formData.assignedTo} 
                    onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Attach File (Optional)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <Upload className="w-4 h-4 text-gray-400" />
                </div>
                {selectedFile && (
                  <p className="text-sm text-gray-600">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Supported formats: PDF, JPG, PNG, GIF (Max 10MB)
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Creating Task...' : 'Create Task'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
