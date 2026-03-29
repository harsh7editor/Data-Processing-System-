import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, FileJson, FileType, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { ProcessedData, DataRow, DataColumn } from '@/types/data';

interface DataUploadProps {
  onFileLoad: (data: ProcessedData, info: { name: string; size: number; type: string }) => void;
  isLoading: boolean;
}

interface ParseResult {
  data: DataRow[];
  meta: {
    fields?: string[];
  };
}

interface ParseError {
  message: string;
}

export function DataUpload({ onFileLoad, isLoading }: DataUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type
    };

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results: ParseResult) => {
          const rows = results.data as DataRow[];
          const columns = results.meta.fields?.map((field: string) => ({
            key: field,
            name: field,
            type: 'unknown' as DataColumn['type']
          })) || [];
          onFileLoad({ columns, rows }, fileInfo);
        },
        error: (error: ParseError) => {
          toast.error(`Error parsing CSV: ${error.message}`);
        }
      });
    } else if (extension === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          const rows = Array.isArray(json) ? json : [json];
          const columns = rows.length > 0 ? Object.keys(rows[0]).map(key => ({
            key,
            name: key,
            type: 'unknown' as DataColumn['type']
          })) : [];
          onFileLoad({ columns, rows }, fileInfo);
        } catch {
          toast.error('Error parsing JSON file');
        }
      };
      reader.readAsText(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(firstSheet) as DataRow[];
          const columns = rows.length > 0 ? Object.keys(rows[0]).map(key => ({
            key,
            name: key,
            type: 'unknown' as DataColumn['type']
          })) : [];
          onFileLoad({ columns, rows }, fileInfo);
        } catch {
          toast.error('Error parsing Excel file');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error('Unsupported file format. Please use CSV, JSON, or Excel.');
    }
  }, [onFileLoad]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  return (
    <Card className={`border-2 border-dashed transition-all duration-200 ${
      isDragging 
        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
    }`}>
      <CardContent className="p-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            {isLoading ? (
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            ) : (
              <Upload className="w-10 h-10 text-white" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Drop your file here
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              or click to browse from your computer
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">CSV</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <FileJson className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">JSON</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <FileType className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Excel</span>
            </div>
          </div>
          
          <input
            type="file"
            accept=".csv,.json,.xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button 
              variant="outline" 
              size="lg" 
              className="cursor-pointer"
              asChild
            >
              <span>Browse Files</span>
            </Button>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
