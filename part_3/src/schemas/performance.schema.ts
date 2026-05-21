import { z } from 'zod';

export const performanceSchema = z
  .object({
    platform: z.enum(['facebook', 'google', 'tiktok']).optional(),
    date_from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'date_from must be YYYY-MM-DD')
      .optional(),
    date_to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'date_to must be YYYY-MM-DD')
      .optional(),
    campaign_id: z.string().optional(),
  })
  .refine((data) => !data.date_from || !data.date_to || data.date_from <= data.date_to, {
    message: 'date_from must be before date_to',
  });

export type PerformanceQuery = z.infer<typeof performanceSchema>;
