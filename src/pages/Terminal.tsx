
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Terminal as TerminalIcon, Play, Square, RefreshCw } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [output, setOutput] = useState<string[]>([
    '$ Welcome to Icons PrintFlow Terminal',
    '$ Connected to production environment',
    '$ Type commands below or use the action buttons',
    '',
  ]);
  const [currentInput, setCurrentInput] = useState('');

  const handleCommand = (command: string) => {
    const newOutput = [...output, `$ ${command}`];
    
    // Simulate command responses
    switch (command.toLowerCase().trim()) {
      case 'help':
        newOutput.push('Available commands:');
        newOutput.push('  help     - Show this help message');
        newOutput.push('  status   - Check system status');
        newOutput.push('  logs     - View recent logs');
        newOutput.push('  deploy   - Deploy latest changes');
        newOutput.push('  restart  - Restart services');
        newOutput.push('  clear    - Clear terminal');
        break;
      case 'status':
        newOutput.push('✅ Database: Connected');
        newOutput.push('✅ API Server: Running');
        newOutput.push('✅ Print Queue: Active');
        newOutput.push('✅ Storage: Available (2.3GB used)');
        break;
      case 'logs':
        newOutput.push('[2025-07-06 22:34:48] INFO: User logged in successfully');
        newOutput.push('[2025-07-06 22:34:35] INFO: Dashboard data loaded');
        newOutput.push('[2025-07-06 22:34:20] WARN: High memory usage detected');
        newOutput.push('[2025-07-06 22:34:15] INFO: New print job queued');
        break;
      case 'deploy':
        newOutput.push('🚀 Starting deployment...');
        newOutput.push('📦 Building application...');
        newOutput.push('✅ Build completed successfully');
        newOutput.push('🔄 Updating services...');
        newOutput.push('✅ Deployment completed in 2.3s');
        break;
      case 'restart':
        newOutput.push('🔄 Restarting services...');
        newOutput.push('✅ API Server restarted');
        newOutput.push('✅ Print Queue restarted');
        newOutput.push('✅ All services online');
        break;
      case 'clear':
        setOutput(['$ Terminal cleared', '']);
        setCurrentInput('');
        return;
      default:
        newOutput.push(`Command not found: ${command}`);
        newOutput.push('Type "help" for available commands');
        break;
    }
    
    newOutput.push('');
    setOutput(newOutput);
    setCurrentInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      handleCommand(currentInput.trim());
    }
  };

  useEffect(() => {
    // Simulate connection
    const timer = setTimeout(() => setIsConnected(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Terminal Access</h1>
            <p className="text-gray-600 mt-2">Command line interface for system management</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={isConnected ? "default" : "secondary"} className="bg-green-100 text-green-800">
              {isConnected ? '● Connected' : '○ Connecting...'}
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => handleCommand('status')}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Check Status
          </Button>
          <Button
            variant="outline"
            onClick={() => handleCommand('logs')}
            className="flex items-center gap-2"
          >
            <TerminalIcon className="w-4 h-4" />
            View Logs
          </Button>
          <Button
            variant="outline"
            onClick={() => handleCommand('deploy')}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Deploy
          </Button>
          <Button
            variant="outline"
            onClick={() => handleCommand('restart')}
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Restart
          </Button>
        </div>

        {/* Terminal */}
        <Card className="min-h-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TerminalIcon className="w-5 h-5" />
              System Terminal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-black text-green-400 font-mono text-sm">
              <div
                ref={terminalRef}
                className="p-4 h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600"
              >
                {output.map((line, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
                <div className="flex items-center">
                  <span className="text-green-400">$ </span>
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-transparent border-none outline-none flex-1 ml-1 text-green-400"
                    placeholder="Type a command..."
                    disabled={!isConnected}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">System Commands</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><code className="bg-gray-100 px-1 rounded">status</code> - Check system health</li>
                  <li><code className="bg-gray-100 px-1 rounded">logs</code> - View recent activity</li>
                  <li><code className="bg-gray-100 px-1 rounded">restart</code> - Restart services</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Deployment Commands</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><code className="bg-gray-100 px-1 rounded">deploy</code> - Deploy latest changes</li>
                  <li><code className="bg-gray-100 px-1 rounded">help</code> - Show all commands</li>
                  <li><code className="bg-gray-100 px-1 rounded">clear</code> - Clear terminal</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
