import { Router, Request, Response } from 'express';
import { AdQueryRepository } from '../repositories';
import { performanceSchema } from '../schemas';
import { ApiResponse } from '../dtos';
import { AggregatedMetrics } from '../types';

export function createPerformanceRouter(repository: AdQueryRepository): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    const result = performanceSchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten().fieldErrors });
    }

    try {
      const { platform, date_from, date_to, campaign_id } = result.data;

      const metrics = repository.getPerformance({
        platform,
        dateFrom: date_from,
        dateTo: date_to,
        campaignId: campaign_id,
      });

      const response: ApiResponse<AggregatedMetrics> = {
        data: metrics,
        filters_applied: {
          platform: platform ?? null,
          date_from: date_from ?? null,
          date_to: date_to ?? null,
          campaign_id: campaign_id ?? null,
        },
      };

      return res.json(response);
    } catch (error: any) {
      console.error('[/api/performance]', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
