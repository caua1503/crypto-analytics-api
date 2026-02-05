import { z } from "zod";

export const SymbolSchema = z.object({
    symbol: z.string().toUpperCase().min(1).describe("Symbol parameter"),
});

export const IdSchema = z.object({
    id: z.coerce.number().int().positive().min(1).describe("ID parameter"),
});

export const PublicIdSchema = z.object({
    publicId: z.uuid().describe("Public ID parameter"),
});
