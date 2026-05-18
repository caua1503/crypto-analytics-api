import { z } from "zod";
import { Role } from "./user.interface.js";

export const PaginationParams = z.object({
	from: z.coerce.date().optional(),
	to: z.coerce.date().optional(),

	orderBy: z.string().optional(),
	order: z.enum(["asc", "desc"]).default("asc"),

	skip: z.coerce.number().min(0).optional().default(0),
	take: z.coerce.number().min(1).max(100).optional().default(10),
});

export const PaginationUserParams = PaginationParams.extend({
	orderBy: z.enum(["createdAt", "updatedAt", "deletedAt", "autoDeleteAt"]).default("createdAt"),
	deletedAt: z.coerce.date().optional(),
	autoDeleteAt: z.coerce.date().optional(),
	isActive: z.boolean().optional(),
	role: Role.optional(),
	emailVerified: z.boolean().optional(),
}).omit({ from: true, to: true });

export type PaginationParamsType = z.infer<typeof PaginationParams>;
export type PaginationUserParamsType = z.infer<typeof PaginationUserParams>;
