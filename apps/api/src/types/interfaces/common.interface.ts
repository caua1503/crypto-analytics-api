import { z } from "zod";

export const PaginationParams = z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),

    orderBy: z.string().optional(),
    order: z.enum(["asc", "desc"]).default("asc"),

    skip: z.coerce.number().min(0).optional().default(0),
    take: z.coerce.number().min(1).max(100).optional().default(10),
});

export type PaginationParamsType = z.infer<typeof PaginationParams>;
