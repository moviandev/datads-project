import { z } from 'zod';

export const topPerformingSchema = z.object({
  metric: z.enum(['ctr', 'cpc', 'roas', 'clicks', 'revenue']),
  order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  platform: z.enum(['facebook', 'google', 'tiktok']).optional(),
  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date_from must be YYYY-MM-DD')
    .optional(),
  date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date_to must be YYYY-MM-DD')
    .optional(),
});

export type TopPerformingQuery = z.infer<typeof topPerformingSchema>;
