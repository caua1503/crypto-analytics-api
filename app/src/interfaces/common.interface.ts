import { z } from 'zod';

export const PaginationParams = z.object({
    skip: z.number().min(1).optional().default(1),
    take: z.number().min(1).max(100).optional().default(10),
});

export type PaginationParamsType = z.infer<typeof PaginationParams>;