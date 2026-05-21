import { AdMetrics } from '../../../part_2/src/entities';
import { AggregatedMetrics, PerformanceFilters, TopPerformingFilters } from '../types';

export interface AdQueryRepository {
  getPerformance(filters: PerformanceFilters): AggregatedMetrics;
  getTopPerforming(filters: TopPerformingFilters): { rows: AdMetrics[]; total: number };
}
