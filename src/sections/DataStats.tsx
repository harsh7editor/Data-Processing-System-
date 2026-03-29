import { useMemo } from 'react';
import { 
  Hash, Type, Calendar, ToggleLeft, AlertCircle,
  TrendingUp, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DataRow, DataColumn } from '@/types/data';

interface DataStatsProps {
  data: DataRow[];
  columns: DataColumn[];
}

interface ColumnStatistics {
  column: string;
  type: string;
  count: number;
  unique: number;
  missing: number;
  missingPercent: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
}

export function DataStats({ data, columns }: DataStatsProps) {
  const stats = useMemo(() => {
    return columns.map(col => {
      const values = data.map(row => row[col.key]);
      const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
      const missing = values.length - nonNullValues.length;
      const missingPercent =
        values.length > 0 ? (missing / values.length) * 100 : 0;
      
      const uniqueValues = new Set(nonNullValues.map(v => String(v)));
      
      const numericValues = nonNullValues
        .map(v => Number(v))
        .filter(v => !isNaN(v));
      
      const stat: ColumnStatistics = {
        column: col.name,
        type: col.type,
        count: values.length,
        unique: uniqueValues.size,
        missing,
        missingPercent
      };
      
      if (numericValues.length > 0) {
        stat.min = Math.min(...numericValues);
        stat.max = Math.max(...numericValues);
        stat.mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        
        const sorted = [...numericValues].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        stat.median = sorted.length % 2 === 0 
          ? (sorted[mid - 1] + sorted[mid]) / 2 
          : sorted[mid];
        
        const variance = numericValues.reduce((sq, n) => sq + Math.pow(n - stat.mean!, 2), 0) / numericValues.length;
        stat.std = Math.sqrt(variance);
      }
      
      return stat;
    });
  }, [data, columns]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'number': return <Hash className="w-4 h-4" />;
      case 'string': return <Type className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'boolean': return <ToggleLeft className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Rows</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{data.length.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Columns</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{columns.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Hash className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Numeric Columns</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {columns.filter(c => c.type === 'number').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Missing Values</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.reduce((acc, s) => acc + s.missing, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Column Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Column Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {stats.map((stat) => (
                <div 
                  key={stat.column}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {getTypeIcon(stat.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{stat.column}</h4>
                        <Badge variant="outline" className="text-xs">{stat.type}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {stat.unique.toLocaleString()} unique values
                      </p>
                    </div>
                  </div>
                  
                  {/* Missing Values Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Missing Values</span>
                      <span className="font-medium">{stat.missing.toLocaleString()} ({stat.missingPercent.toFixed(1)}%)</span>
                    </div>
                    <Progress 
                      value={100 - stat.missingPercent} 
                      className="h-2"
                    />
                  </div>
                  
                  {/* Numeric Statistics */}
                  {stat.type === 'number' && stat.mean !== undefined && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Min</p>
                        <p className="font-medium text-slate-900 dark:text-white">{stat.min?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Max</p>
                        <p className="font-medium text-slate-900 dark:text-white">{stat.max?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Mean</p>
                        <p className="font-medium text-slate-900 dark:text-white">{stat.mean?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Std Dev</p>
                        <p className="font-medium text-slate-900 dark:text-white">{stat.std?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
