export interface QueryResult {
  success: boolean;
  query?: string;
  sql?: string;
  results?: any[];
  rowCount?: number;
  error?: string;
  details?: any[];
}

export interface MetricsData {
  days_with_data: number;
  total_spend: number;
  total_clicks: number;
  total_impressions: number;
  total_conversions: number;
  overall_cac: number;
  overall_cpc: number;
  overall_ctr: number;
  overall_cvr: number;
}

export interface MetricsResponse {
  success: boolean;
  period: string;
  metrics: MetricsData;
  error?: string;
}

export interface SchemaField {
  name: string;
  type: string;
  mode: string;
  description: string;
}

export interface SchemaResponse {
  success: boolean;
  table: string;
  schema: SchemaField[];
  error?: string;
}

export type QueryMode = 'nl' | 'sql' | 'metrics';

export interface ExampleQuery {
  title: string;
  query: string;
  description?: string;
}