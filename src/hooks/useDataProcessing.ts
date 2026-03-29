import { useState, useCallback, useRef } from 'react';
import type { 
  ProcessedData, 
  DataColumn, 
  DataRow, 
  FileInfo,
  FilterCondition,
  SortConfig 
} from '@/types/data';

interface HistoryState {
  data: ProcessedData;
  action: string;
}

function inferType(value: unknown): DataColumn['type'] {
    if (value === null || value === undefined || value === '') return 'unknown';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string' && value.includes('-') && !Number.isNaN(Date.parse(value)))
      return 'date';
    if (
      (typeof value === 'string' || typeof value === 'number') &&
      value !== '' &&
      !Number.isNaN(Number(value))
    )
      return 'number';
    return 'string';
}

function detectColumns(rows: DataRow[]): DataColumn[] {
    if (rows.length === 0) return [];
    
    const keys = Object.keys(rows[0]);
    return keys.map(key => {
      const values = rows.map(row => row[key]).filter(v => v !== null && v !== undefined && v !== '');
      const types = values.map(inferType);
      const typeCount: Record<string, number> = {};
      types.forEach(t => { typeCount[t] = (typeCount[t] || 0) + 1; });
      const dominantType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
      
      return {
        key,
        name: key,
        type: dominantType as DataColumn['type']
      };
    });
}

export function useDataProcessing() {
  const [data, setData] = useState<ProcessedData>({ columns: [], rows: [] });
  const [originalData, setOriginalData] = useState<ProcessedData>({ columns: [], rows: [] });
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const historyRef = useRef<HistoryState[]>([]);
  const historyIndexRef = useRef(-1);

  const loadData = useCallback((processedData: ProcessedData, info: FileInfo) => {
    setIsLoading(true);
    
    const columns = processedData.columns.length > 0 
      ? processedData.columns 
      : detectColumns(processedData.rows);
    
    const dataWithColumns = { ...processedData, columns };
    
    setData(dataWithColumns);
    setOriginalData(dataWithColumns);
    setFileInfo(info);
    
    historyRef.current = [{ data: dataWithColumns, action: 'load' }];
    historyIndexRef.current = 0;
    setCanUndo(false);
    
    setIsLoading(false);
  }, []);

  const resetData = useCallback(() => {
    setData(originalData);
    historyRef.current = [{ data: originalData, action: 'reset' }];
    historyIndexRef.current = 0;
    setCanUndo(false);
  }, [originalData]);

  const pushHistory = useCallback((newData: ProcessedData, action: string) => {
    // Remove any future history if we're not at the end
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push({ data: newData, action });
    historyIndexRef.current++;
    setCanUndo(historyIndexRef.current > 0);
    setData(newData);
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      setCanUndo(historyIndexRef.current > 0);
      setData(historyRef.current[historyIndexRef.current].data);
    }
  }, []);

  const applyFilter = useCallback((condition: FilterCondition) => {
    const filteredRows = data.rows.filter(row => {
      const value = row[condition.column];
      const compareValue = condition.value;
      
      switch (condition.operator) {
        case 'eq': return value == compareValue;
        case 'neq': return value != compareValue;
        case 'gt': return Number(value) > Number(compareValue);
        case 'gte': return Number(value) >= Number(compareValue);
        case 'lt': return Number(value) < Number(compareValue);
        case 'lte': return Number(value) <= Number(compareValue);
        case 'contains': return String(value).toLowerCase().includes(String(compareValue).toLowerCase());
        case 'startsWith': return String(value).toLowerCase().startsWith(String(compareValue).toLowerCase());
        case 'endsWith': return String(value).toLowerCase().endsWith(String(compareValue).toLowerCase());
        default: return true;
      }
    });
    
    pushHistory({ ...data, rows: filteredRows }, 'filter');
  }, [data, pushHistory]);

  const applySort = useCallback((config: SortConfig) => {
    const sortedRows = [...data.rows].sort((a, b) => {
      const aVal = a[config.column];
      const bVal = b[config.column];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return config.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      const comparison = String(aVal).localeCompare(String(bVal));
      return config.direction === 'asc' ? comparison : -comparison;
    });
    
    pushHistory({ ...data, rows: sortedRows }, 'sort');
  }, [data, pushHistory]);

  const removeDuplicates = useCallback(() => {
    const seen = new Set<string>();
    const uniqueRows = data.rows.filter(row => {
      const key = JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    pushHistory({ ...data, rows: uniqueRows }, 'dedupe');
  }, [data, pushHistory]);

  const fillMissingValues = useCallback((fillValue: string | number) => {
    const filledRows = data.rows.map(row => {
      const newRow = { ...row };
      data.columns.forEach(col => {
        if (newRow[col.key] === null || newRow[col.key] === undefined || newRow[col.key] === '') {
          newRow[col.key] = fillValue;
        }
      });
      return newRow;
    });
    
    pushHistory({ ...data, rows: filledRows }, 'fill');
  }, [data, pushHistory]);

  const removeOutliers = useCallback((column: string) => {
    const values = data.rows
      .map(row => Number(row[column]))
      .filter(v => !isNaN(v));
    
    if (values.length === 0) return;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
    
    const filteredRows = data.rows.filter(row => {
      const val = Number(row[column]);
      if (isNaN(val)) return true;
      return Math.abs(val - mean) <= 3 * std;
    });
    
    pushHistory({ ...data, rows: filteredRows }, 'outlier');
  }, [data, pushHistory]);

  const normalizeData = useCallback((column: string) => {
    const values = data.rows
      .map(row => Number(row[column]))
      .filter(v => !isNaN(v));
    
    if (values.length === 0) return;
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    if (range === 0) return;
    
    const normalizedRows = data.rows.map(row => ({
      ...row,
      [column]: (Number(row[column]) - min) / range
    }));
    
    pushHistory({ ...data, rows: normalizedRows }, 'normalize');
  }, [data, pushHistory]);

  return {
    data,
    originalData,
    columns: data.columns,
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
    undo,
    canUndo,
  };
}
