import { AdRecord, AdMetrics } from '../entities';

const safeDivide = (numerator: number, denominator: number): number =>
  denominator === 0 ? 0 : numerator / denominator;

const round = (value: number): number => Math.round(value * 10000) / 10000;

export const computeMetrics = (record: AdRecord): AdMetrics => ({
  ...record,
  ctr: round(safeDivide(record.clicks, record.impressions)),
  cpc: round(safeDivide(record.spend, record.clicks)),
  roas: round(safeDivide(record.revenue, record.spend)),
});
