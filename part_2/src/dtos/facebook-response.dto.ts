import { FacebookInsight } from './facebook-insight.dto';

export interface FacebookResponse {
  data: FacebookInsight[];
  paging?: { next?: string };
}
