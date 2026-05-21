import { Router, Request, Response } from 'express';
import { AdQueryRepository } from '../repositories';
import { topPerformingSchema } from '../schemas';
import { PaginatedApiResponse } from '../dtos';
import { AdMetrics } from '../../../part_2/src/entities';

export function createTopPerformingRouter(repository: AdQueryRepository): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    const result = topPerformingSchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten().fieldErrors });
    }

    try {
      const { metric, order, limit, platform, date_from, date_to } = result.data;

      const { rows, total } = repository.getTopPerforming({
        metric,
        order,
        limit,
        platform,
        dateFrom: date_from,
        dateTo: date_to,
      });

      const response: PaginatedApiResponse<AdMetrics> = {
        data: rows,
        pagination: {
          limit,
          total,
        },
      };

      return res.json(response);
    } catch (error: any) {
      console.error('[/api/top-performing]', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
