import { Platform } from '../../../part_2/src/types';

export type MetricField = 'ctr' | 'cpc' | 'roas' | 'clicks' | 'revenue';
export type SortOrder = 'asc' | 'desc';

export interface TopPerformingFilters {
  metric: MetricField;
  order: SortOrder;
  limit: number;
  platform?: Platform;
  dateFrom?: string;
  dateTo?: string;
}
