import { TiktokItem } from './tiktok-item.dto';

export interface TiktokResponse {
  performance_data: TiktokItem[];
  has_more: boolean;
  offset: number;
}
