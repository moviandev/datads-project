import { AdRecord } from '../entities';

export interface AdRepository {
  upsert(records: AdRecord[]): { inserted: number; updated: number };
}
