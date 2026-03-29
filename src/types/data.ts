export interface DataColumn {
  key: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'unknown';
}

export interface DataRow {
  [key: string]: unknown;
}

export interface ProcessedData {
  columns: DataColumn[];
  rows: DataRow[];
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

export interface FilterCondition {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: string | number | boolean | null;
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export interface ColumnStats {
  column: string;
  type: string;
  count: number;
  unique: number;
  missing: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
}
