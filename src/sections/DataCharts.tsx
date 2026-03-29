import { useMemo, useState } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DataRow, DataColumn } from '@/types/data';

interface DataChartsProps {
  data: DataRow[];
  columns: DataColumn[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function DataCharts({ data, columns }: DataChartsProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [xColumn, setXColumn] = useState<string>('');
  const [yColumn, setYColumn] = useState<string>('');

  const numericColumns = useMemo(() => 
    columns.filter(col => col.type === 'number'),
    [columns]
  );

  // Distribution data for bar chart
  const distributionData = useMemo(() => {
    if (!selectedColumn) return [];
    
    const values = data.map(row => row[selectedColumn]).filter(v => v !== null && v !== undefined);
    const counts: Record<string, number> = {};
    
    values.forEach(val => {
      const key = String(val);
      counts[key] = (counts[key] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);
  }, [data, selectedColumn]);

  // Histogram data
  const histogramData = useMemo(() => {
    if (!selectedColumn) return [];
    
    const values = data
      .map(row => Number(row[selectedColumn]))
      .filter(v => !isNaN(v));
    
    if (values.length === 0) return [];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.min(20, Math.ceil(Math.sqrt(values.length)));
    const range = max - min;
    if (range === 0) {
      return [{ name: String(min), value: values.length }];
    }
    const binWidth = range / binCount;

    const bins = Array(binCount).fill(0);
    values.forEach(val => {
      const binIndex = Math.min(Math.floor((val - min) / binWidth), binCount - 1);
      bins[binIndex]++;
    });
    
    return bins.map((count, i) => ({
      name: `${(min + i * binWidth).toFixed(2)} - ${(min + (i + 1) * binWidth).toFixed(2)}`,
      value: count
    }));
  }, [data, selectedColumn]);

  // Scatter data
  const scatterData = useMemo(() => {
    if (!xColumn || !yColumn) return [];
    
    return data
      .map(row => ({
        x: Number(row[xColumn]),
        y: Number(row[yColumn]),
        name: String(row[columns[0]?.key] || '')
      }))
      .filter(d => !isNaN(d.x) && !isNaN(d.y));
  }, [data, xColumn, yColumn, columns]);

  // Pie chart data (top categories)
  const pieData = useMemo(() => {
    if (!selectedColumn) return [];
    
    const values = data.map(row => row[selectedColumn]).filter(v => v !== null && v !== undefined);
    const counts: Record<string, number> = {};
    
    values.forEach(val => {
      const key = String(val);
      counts[key] = (counts[key] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [data, selectedColumn]);

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chart Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Select Column
              </label>
              <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col.key} value={col.key}>
                      {col.name} ({col.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {numericColumns.length >= 2 && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    X-Axis (Scatter)
                  </label>
                  <Select value={xColumn} onValueChange={setXColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="X column" />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map(col => (
                        <SelectItem key={col.key} value={col.key}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Y-Axis (Scatter)
                  </label>
                  <Select value={yColumn} onValueChange={setYColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Y column" />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map(col => (
                        <SelectItem key={col.key} value={col.key}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      {selectedColumn && (
        <Tabs defaultValue="distribution" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="histogram">Histogram</TabsTrigger>
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            {numericColumns.length >= 2 && <TabsTrigger value="scatter">Scatter</TabsTrigger>}
          </TabsList>

          <TabsContent value="distribution">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Value Distribution
                  <Badge variant="secondary">{selectedColumn}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="histogram">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Histogram
                  <Badge variant="secondary">{selectedColumn}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={histogramData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                      <XAxis 
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981" 
                        fill="#10b981"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pie">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Category Distribution
                  <Badge variant="secondary">{selectedColumn}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {numericColumns.length >= 2 && (
            <TabsContent value="scatter">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Scatter Plot
                    <Badge variant="secondary">{xColumn} vs {yColumn}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          name={xColumn}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          name={yColumn}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                        <Scatter 
                          data={scatterData} 
                          fill="#8b5cf6"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}

      {!selectedColumn && (
        <Card className="p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            Select a column above to visualize your data
          </p>
        </Card>
      )}
    </div>
  );
}
