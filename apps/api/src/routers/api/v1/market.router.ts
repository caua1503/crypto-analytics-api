import { prisma } from "@repo/shared";
import { hasAcess } from "@repo/shared/core/security";
import { MarketSnapshotService } from "@repo/shared/services/market.service";
import { PaginationParams } from "@repo/shared/types/interfaces/common.interface";
import {
	MarketSnapshotCreate,
	MarketSnapshotResponse,
	MarketSnapshotSimpleResponse,
} from "@repo/shared/types/interfaces/market.interface";
import { IdSchema, PublicIdSchema, SymbolSchema } from "@repo/shared/types/schemas/common.schemas";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import type { FastifyInstanceTyped } from "../../../types/common.js";

const marketSnapshotService = new MarketSnapshotService(prisma);

export async function marketRoutes(app: FastifyInstanceTyped) {
	app.get(
		"/asset/:symbol",
		{
			schema: {
				tags: ["Market"],
				params: SymbolSchema,
				querystring: PaginationParams.extend({
					order: z.enum(["asc", "desc"]).default("desc"),
				}),
				response: {
					[StatusCodes.OK]: MarketSnapshotResponse,
				},
			},
		},
		async (req) => {
			return await marketSnapshotService.findAllBySymbol(req.params.symbol, req.query);
		},
	);
	app.get(
		"/asset/id/:publicId",
		{
			config: { public: true },
			schema: {
				tags: ["Market"],
				params: PublicIdSchema,
				querystring: PaginationParams,
				security: [],
				response: {
					[StatusCodes.OK]: MarketSnapshotResponse,
				},
			},
		},
		async (req) => {
			return await marketSnapshotService.findAllByPublicID(req.params.publicId, req.query);
		},
	);
	app.get(
		"/:id",
		{
			schema: {
				tags: ["Market"],
				params: IdSchema,
				response: {
					[StatusCodes.OK]: MarketSnapshotSimpleResponse,
				},
			},
		},
		async (req) => {
			return await marketSnapshotService.findById(req.params.id);
		},
	);
	app.get(
		"/asset/:publicId/latest",
		{
			schema: {
				tags: ["Market"],
				params: PublicIdSchema,
				response: {
					[StatusCodes.OK]: MarketSnapshotSimpleResponse,
				},
			},
		},
		async (req) => {
			return await marketSnapshotService.getLatestSnapshotByPublicId(req.params.publicId);
		},
	);
	app.get(
		"/asset/symbol/:symbol/latest",
		{
			schema: {
				tags: ["Market"],
				params: SymbolSchema,
				response: {
					[StatusCodes.OK]: MarketSnapshotSimpleResponse,
				},
			},
		},
		async (req) => {
			return await marketSnapshotService.getLatestSnapshotBySymbol(req.params.symbol);
		},
	);
	app.post(
		"/",
		{
			preHandler: hasAcess({ role: ["ADMIN"] }),
			schema: {
				tags: ["Market"],
				body: MarketSnapshotCreate,
				response: {
					[StatusCodes.CREATED]: MarketSnapshotSimpleResponse,
				},
			},
		},
		async (req, reply) => {
			reply.code(StatusCodes.CREATED);
			return await marketSnapshotService.create(req.body);
		},
	);
	app.patch(
		"/:id",
		{
			preHandler: hasAcess({ role: ["ADMIN"] }),
			schema: {
				tags: ["Market"],
				params: IdSchema,
				body: MarketSnapshotCreate.partial(),
				response: {
					[StatusCodes.OK]: MarketSnapshotSimpleResponse,
				},
			},
		},
		async (req) => {
			return await marketSnapshotService.update(req.params.id, req.body);
		},
	);
	app.delete(
		"/:id",
		{
			preHandler: hasAcess({ role: ["ADMIN"] }),
			schema: {
				tags: ["Market"],
				params: IdSchema,
			},
		},
		async (req) => {
			return await marketSnapshotService.delete(req.params.id);
		},
	);
}
