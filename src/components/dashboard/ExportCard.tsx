
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table } from 'lucide-react';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';

interface ExportData {
  totalJobs: number;
  statusBreakdown: { status: string; count: number }[];
  topPerformers: { full_name: string; completed_tasks: number }[];
  overdueCount: number;
}

interface ExportCardProps {
  data: ExportData;
  loading: boolean;
}

export default function ExportCard({ data, loading }: ExportCardProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const csvData = [
    ['Metric', 'Value'],
    ['Total Jobs This Week', data.totalJobs],
    ['', ''],
    ['Status Breakdown', ''],
    ...data.statusBreakdown.map(item => [item.status.replace('_', ' '), item.count]),
    ['', ''],
    ['Top Performers', ''],
    ...data.topPerformers.map(item => [item.full_name, `${item.completed_tasks} tasks`]),
    ['', ''],
    ['Overdue Tasks', data.overdueCount],
  ];

  const generatePDF = () => {
    setIsGeneratingPDF(true);
    
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    // Header
    doc.setFontSize(20);
    doc.text('Icons PrintFlow Manager', 20, 20);
    doc.setFontSize(16);
    doc.text('Weekly Dashboard Report', 20, 30);
    doc.setFontSize(12);
    doc.text(`Generated on: ${date}`, 20, 40);
    
    let yPosition = 60;
    
    // Total Jobs
    doc.setFontSize(14);
    doc.text('Summary', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Total Jobs This Week: ${data.totalJobs}`, 30, yPosition);
    doc.text(`Overdue Tasks: ${data.overdueCount}`, 30, yPosition + 10);
    yPosition += 30;
    
    // Status Breakdown
    doc.setFontSize(14);
    doc.text('Task Status Breakdown', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    data.statusBreakdown.forEach(item => {
      doc.text(`${item.status.replace('_', ' ')}: ${item.count}`, 30, yPosition);
      yPosition += 8;
    });
    yPosition += 10;
    
    // Top Performers
    doc.setFontSize(14);
    doc.text('Top Performing Staff', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    data.topPerformers.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.full_name}: ${item.completed_tasks} tasks`, 30, yPosition);
      yPosition += 8;
    });
    
    doc.save(`printflow-report-${date}.pdf`);
    setIsGeneratingPDF(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Export Reports</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Export current dashboard data for weekly reviews and reporting.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <CSVLink
              data={csvData}
              filename={`printflow-report-${new Date().toISOString().split('T')[0]}.csv`}
              className="flex-1"
            >
              <Button variant="outline" className="w-full" disabled={loading}>
                <Table className="w-4 h-4 mr-2" />
                Export as CSV
              </Button>
            </CSVLink>
            
            <Button
              variant="outline"
              className="flex-1"
              onClick={generatePDF}
              disabled={loading || isGeneratingPDF}
            >
              <FileText className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? 'Generating...' : 'Export as PDF'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
