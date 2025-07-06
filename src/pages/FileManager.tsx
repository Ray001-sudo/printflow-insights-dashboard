
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, File, Image, Folder, Download, Trash2, Search } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: string;
  category: 'image' | 'document' | 'archive' | 'other';
}

export default function FileManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [files] = useState<FileItem[]>([
    { id: '1', name: 'project-logos', type: 'folder', modified: '2025-07-06', category: 'other' },
    { id: '2', name: 'business-card-template.ai', type: 'file', size: 2048000, modified: '2025-07-06', category: 'document' },
    { id: '3', name: 'client-photos.zip', type: 'file', size: 15728640, modified: '2025-07-05', category: 'archive' },
    { id: '4', name: 'logo-draft-v1.png', type: 'file', size: 512000, modified: '2025-07-05', category: 'image' },
    { id: '5', name: 'print-templates', type: 'folder', modified: '2025-07-04', category: 'other' },
    { id: '6', name: 'invoice-template.pdf', type: 'file', size: 128000, modified: '2025-07-04', category: 'document' },
  ]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') return <Folder className="w-8 h-8 text-blue-600" />;
    if (item.category === 'image') return <Image className="w-8 h-8 text-green-600" />;
    return <File className="w-8 h-8 text-gray-600" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'image': return 'bg-green-100 text-green-800';
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'archive': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">File Manager</h1>
            <p className="text-gray-600 mt-2">Manage your project files and assets</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search files and folders..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">2.3 GB</div>
                <div className="text-sm text-gray-600">Storage Used</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* File Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Files & Folders</CardTitle>
            <CardDescription>Browse and manage your files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    {getFileIcon(item)}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm leading-tight">{item.name}</h3>
                    
                    <div className="flex justify-between items-center">
                      {item.type === 'file' && (
                        <Badge variant="secondary" className={getCategoryColor(item.category)}>
                          {item.category}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      {item.size && <div>Size: {formatFileSize(item.size)}</div>}
                      <div>Modified: {new Date(item.modified).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredFiles.length === 0 && (
              <div className="text-center py-12">
                <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                <p className="text-gray-600">Try adjusting your search or upload some files.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
