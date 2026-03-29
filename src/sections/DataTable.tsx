import { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Search, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DataRow, DataColumn } from '@/types/data';

interface DataTableProps {
  data: DataRow[];
  columns: DataColumn[];
  originalRowCount: number;
}

export function DataTable({ data, columns, originalRowCount }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(row => 
      columns.some(col => {
        const value = row[col.key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerSearch);
      })
    );
  }, [data, columns, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return <ArrowUpDown className="w-3 h-3 text-slate-400" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-blue-600" />
      : <ArrowDown className="w-3 h-3 text-blue-600" />;
  };

  const formatCellValue = (value: unknown, type: string) => {
    if (value === null || value === undefined) return <span className="text-slate-400 italic">null</span>;
    if (type === 'number' && typeof value === 'number') {
      return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
    if (type === 'boolean') return value ? 'true' : 'false';
    return String(value);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Data Preview</CardTitle>
            <Badge variant="secondary">
              {filteredData.length.toLocaleString()} of {originalRowCount.toLocaleString()} rows
            </Badge>
            {filteredData.length !== data.length && (
              <Badge variant="outline" className="text-amber-600">
                Filtered
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search all columns..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 w-full sm:w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <ScrollArea className="w-full">
        <div className="min-w-max">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
              <tr>
                {columns.map((column, index) => (
                  <th 
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
                      index === 0 ? 'sticky left-0 bg-slate-100 dark:bg-slate-800 z-10' : ''
                    }`}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.name}</span>
                      {getSortIcon(column.key)}
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        {column.type}
                      </Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {paginatedData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <td 
                      key={`${rowIndex}-${column.key}`}
                      className={`px-4 py-3 text-sm text-slate-900 dark:text-slate-100 whitespace-nowrap ${
                        colIndex === 0 ? 'sticky left-0 bg-white dark:bg-slate-950 z-10 border-r' : ''
                      }`}
                    >
                      {formatCellValue(row[column.key], column.type)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      {paginatedData.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">No data found</p>
        </div>
      )}
      
      <div className="border-t px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-600 dark:text-slate-400">rows</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
