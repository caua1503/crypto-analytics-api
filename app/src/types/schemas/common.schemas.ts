import { z } from "zod";

export const SymbolSchema = z.object({
    symbol: z.string().min(1),
});

export const IdSchema = z.object({
    id: z.coerce.number().int().positive(),
});
