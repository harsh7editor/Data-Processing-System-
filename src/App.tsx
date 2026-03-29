import { useState, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  FileText, Download, Filter, 
  BarChart3, Table2, Settings, 
  FileSpreadsheet, FileJson, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DataUpload } from '@/sections/DataUpload';
import { DataTable } from '@/sections/DataTable';
import { DataStats } from '@/sections/DataStats';
import { DataCharts } from '@/sections/DataCharts';
import { ProcessingPanel } from '@/sections/ProcessingPanel';
import { useDataProcessing } from '@/hooks/useDataProcessing';
import { exportToCSV, exportToJSON } from '@/lib/export';
import type { ProcessedData } from '@/types/data';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('table');
  const [showProcessing, setShowProcessing] = useState(false);
  
  const {
    data,
    originalData,
    columns,
    isLoading,
    fileInfo,
    loadData,
    resetData,
    applyFilter,
    applySort,
    removeDuplicates,
    fillMissingValues,
    removeOutliers,
    normalizeData,
    canUndo,
  } = useDataProcessing();

  const hasData = data.rows.length > 0;

  const handleFileLoad = useCallback((processedData: ProcessedData, info: { name: string; size: number; type: string }) => {
    loadData(processedData, info);
    toast.success(`Loaded ${processedData.rows.length.toLocaleString()} rows with ${processedData.columns.length} columns`);
  }, [loadData]);

  const handleExport = useCallback((format: 'csv' | 'json') => {
    if (!hasData) {
      toast.error('No data to export');
      return;
    }
    
    try {
      if (format === 'csv') {
        exportToCSV(data.rows, data.columns, fileInfo?.name || 'data');
      } else {
        exportToJSON(data.rows, fileInfo?.name || 'data');
      }
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed');
    }
  }, [data, fileInfo, hasData]);

  const handleReset = useCallback(() => {
    resetData();
    toast.info('Data reset to original');
  }, [resetData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                  Data Processing System
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Transform • Analyze • Visualize</p>
              </div>
            </div>
            
            {hasData && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {fileInfo?.name}
                </Badge>
                <Badge variant="outline" className="hidden sm:flex">
                  {data.rows.length.toLocaleString()} rows
                </Badge>
                
                <Separator orientation="vertical" className="h-6 mx-2" />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProcessing(!showProcessing)}
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Process</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={!canUndo}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  className="gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden sm:inline">CSV</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('json')}
                  className="gap-2"
                >
                  <FileJson className="w-4 h-4" />
                  <span className="hidden sm:inline">JSON</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasData ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-12">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                Process Your Data with Ease
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Upload CSV, JSON, or Excel files to clean, transform, analyze, and visualize your data in real-time.
              </p>
            </div>
            
            {/* Upload Area */}
            <DataUpload onFileLoad={handleFileLoad} isLoading={isLoading} />
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Filter className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Clean & Filter</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Remove duplicates, handle missing values, filter outliers, and normalize your data.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Analyze & Visualize</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get instant statistics and create beautiful charts to understand your data.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur">
                <CardContent className="p-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Export Anywhere</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Download your processed data in CSV or JSON format for use in other tools.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Processing Panel */}
            {showProcessing && (
              <ProcessingPanel
                columns={columns}
                onFilter={applyFilter}
                onSort={applySort}
                onRemoveDuplicates={() => {
                  removeDuplicates();
                  toast.success('Duplicates removed');
                }}
                onFillMissing={(value) => {
                  fillMissingValues(value);
                  toast.success('Missing values filled');
                }}
                onRemoveOutliers={(column) => {
                  removeOutliers(column);
                  toast.success('Outliers removed');
                }}
                onNormalize={(column) => {
                  normalizeData(column);
                  toast.success('Data normalized');
                }}
                onClose={() => setShowProcessing(false)}
              />
            )}
            
            {/* Data Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                <TabsTrigger value="table" className="gap-2">
                  <Table2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Data Table</span>
                  <span className="sm:hidden">Table</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Statistics</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger value="charts" className="gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Charts</span>
                  <span className="sm:hidden">Charts</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="table" className="space-y-4">
                <DataTable 
                  data={data.rows} 
                  columns={data.columns}
                  originalRowCount={originalData.rows.length}
                />
              </TabsContent>
              
              <TabsContent value="stats" className="space-y-4">
                <DataStats data={data.rows} columns={data.columns} />
              </TabsContent>
              
              <TabsContent value="charts" className="space-y-4">
                <DataCharts data={data.rows} columns={data.columns} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
