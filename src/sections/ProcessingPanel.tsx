import { useState } from 'react';
import { 
  X, Filter, ArrowUpDown, Copy, Replace, 
  TrendingDown, BarChart3, Play, Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DataColumn, FilterCondition, SortConfig } from '@/types/data';

interface ProcessingPanelProps {
  columns: DataColumn[];
  onFilter: (condition: FilterCondition) => void;
  onSort: (config: SortConfig) => void;
  onRemoveDuplicates: () => void;
  onFillMissing: (value: string | number) => void;
  onRemoveOutliers: (column: string) => void;
  onNormalize: (column: string) => void;
  onClose: () => void;
}

export function ProcessingPanel({
  columns,
  onFilter,
  onSort,
  onRemoveDuplicates,
  onFillMissing,
  onRemoveOutliers,
  onNormalize,
  onClose
}: ProcessingPanelProps) {
  const [filterColumn, setFilterColumn] = useState('');
  const [filterOperator, setFilterOperator] = useState<FilterCondition['operator']>('eq');
  const [filterValue, setFilterValue] = useState('');
  
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [fillValue, setFillValue] = useState('');
  const [outlierColumn, setOutlierColumn] = useState('');
  const [normalizeColumn, setNormalizeColumn] = useState('');

  const numericColumns = columns.filter(col => col.type === 'number');

  const handleApplyFilter = () => {
    if (!filterColumn || !filterValue) return;
    onFilter({
      column: filterColumn,
      operator: filterOperator,
      value: filterValue
    });
  };

  const handleApplySort = () => {
    if (!sortColumn) return;
    onSort({
      column: sortColumn,
      direction: sortDirection
    });
  };

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Data Processing</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Transform and clean your dataset
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="filter" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="filter" className="gap-2">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </TabsTrigger>
            <TabsTrigger value="sort" className="gap-2">
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">Sort</span>
            </TabsTrigger>
            <TabsTrigger value="clean" className="gap-2">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clean</span>
            </TabsTrigger>
            <TabsTrigger value="fill" className="gap-2">
              <Replace className="w-4 h-4" />
              <span className="hidden sm:inline">Fill</span>
            </TabsTrigger>
            <TabsTrigger value="transform" className="gap-2">
              <TrendingDown className="w-4 h-4" />
              <span className="hidden sm:inline">Transform</span>
            </TabsTrigger>
          </TabsList>

          {/* Filter Tab */}
          <TabsContent value="filter" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <Label className="mb-2 block">Column</Label>
                <Select value={filterColumn} onValueChange={setFilterColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(col => (
                      <SelectItem key={col.key} value={col.key}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="mb-2 block">Operator</Label>
                <Select value={filterOperator} onValueChange={(v) => setFilterOperator(v as FilterCondition['operator'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eq">Equals (=)</SelectItem>
                    <SelectItem value="neq">Not Equals (≠)</SelectItem>
                    <SelectItem value="gt">Greater Than (&gt;)</SelectItem>
                    <SelectItem value="gte">Greater or Equal (≥)</SelectItem>
                    <SelectItem value="lt">Less Than (&lt;)</SelectItem>
                    <SelectItem value="lte">Less or Equal (≤)</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="startsWith">Starts With</SelectItem>
                    <SelectItem value="endsWith">Ends With</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="mb-2 block">Value</Label>
                <Input
                  placeholder="Enter value..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleApplyFilter}
                  disabled={!filterColumn || !filterValue}
                  className="w-full gap-2"
                >
                  <Play className="w-4 h-4" />
                  Apply Filter
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Sort Tab */}
          <TabsContent value="sort" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="mb-2 block">Sort By</Label>
                <Select value={sortColumn} onValueChange={setSortColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(col => (
                      <SelectItem key={col.key} value={col.key}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="mb-2 block">Direction</Label>
                <Select value={sortDirection} onValueChange={(v) => setSortDirection(v as 'asc' | 'desc')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending (A-Z, 0-9)</SelectItem>
                    <SelectItem value="desc">Descending (Z-A, 9-0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleApplySort}
                  disabled={!sortColumn}
                  className="w-full gap-2"
                >
                  <Play className="w-4 h-4" />
                  Apply Sort
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Clean Tab */}
          <TabsContent value="clean" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Remove Duplicates</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Delete rows with identical values across all columns
                    </p>
                  </div>
                  <Button onClick={onRemoveDuplicates} variant="outline" className="gap-2">
                    <Copy className="w-4 h-4" />
                    Remove
                  </Button>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Remove Outliers</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Remove values beyond 3 standard deviations
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={outlierColumn} onValueChange={setOutlierColumn}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {numericColumns.map(col => (
                          <SelectItem key={col.key} value={col.key}>
                            {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => {
                        if (outlierColumn) {
                          onRemoveOutliers(outlierColumn);
                          setOutlierColumn('');
                        }
                      }}
                      disabled={!outlierColumn}
                      variant="outline"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Fill Tab */}
          <TabsContent value="fill" className="space-y-4">
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold">Fill Missing Values</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Replace null, undefined, or empty values with a specified value
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Input
                    placeholder="Enter fill value..."
                    value={fillValue}
                    onChange={(e) => setFillValue(e.target.value)}
                    className="w-full sm:w-48"
                  />
                  <Button 
                    onClick={() => {
                      if (fillValue) {
                        const numValue = Number(fillValue);
                        onFillMissing(isNaN(numValue) ? fillValue : numValue);
                        setFillValue('');
                      }
                    }}
                    disabled={!fillValue}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Transform Tab */}
          <TabsContent value="transform" className="space-y-4">
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold">Normalize Data</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Scale numeric values to range [0, 1] using min-max normalization
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select value={normalizeColumn} onValueChange={setNormalizeColumn}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Select numeric column" />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map(col => (
                        <SelectItem key={col.key} value={col.key}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => {
                      if (normalizeColumn) {
                        onNormalize(normalizeColumn);
                        setNormalizeColumn('');
                      }
                    }}
                    disabled={!normalizeColumn}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
