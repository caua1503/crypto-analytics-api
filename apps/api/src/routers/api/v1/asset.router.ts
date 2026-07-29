import { prisma } from "@repo/shared";
import { hasAcess } from "@repo/shared/core/security";
import { AssetService } from "@repo/shared/services/asset.service";
import {
	Asset,
	AssetCreate,
	AssetExtras,
	AssetExtrasArray,
	AssetPublic,
	AssetPublicResponse,
} from "@repo/shared/types/interfaces/asset.interface";
import { PaginationParams } from "@repo/shared/types/interfaces/common.interface";
import { IdSchema, SymbolSchema } from "@repo/shared/types/schemas/common.schemas";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import type { FastifyInstanceTyped } from "../../../types/common.js";

const assetService = new AssetService(prisma);

export async function assetRoutes(app: FastifyInstanceTyped) {
	app.get(
		"/",
		{
			preHandler: hasAcess({}),
			schema: {
				tags: ["Asset"],
				querystring: PaginationParams,
				response: {
					[StatusCodes.OK]: AssetPublicResponse,
				},
			},
		},
		async (req) => {
			return await assetService.findAll(req.query);
		},
	);

	app.get(
		"/extras",
		{
			preHandler: [],
			schema: {
				tags: ["Asset"],
				querystring: PaginationParams,
				response: {
					[StatusCodes.OK]: z.object({
						assets: AssetExtrasArray,
					}),
				},
			},
		},
		async (req) => {
			return {
				assets: await assetService.findAllWithExtras(req.query),
			};
		},
	);

	app.get(
		"/:symbol",
		{
			schema: {
				tags: ["Asset"],
				params: SymbolSchema,
				response: {
					[StatusCodes.OK]: AssetPublic,
				},
			},
		},
		async (req) => {
			return await assetService.findBySymbol(req.params.symbol);
		},
	);

	app.get(
		"/:symbol/extras",
		{
			schema: {
				tags: ["Asset"],
				params: SymbolSchema,
				response: {
					[StatusCodes.OK]: AssetExtras,
				},
			},
		},
		async (req) => {
			return await assetService.findBySymbolWithExtras(req.params.symbol);
		},
	);

	app.get(
		"/id/:id",
		{
			schema: {
				tags: ["Asset"],
				params: IdSchema,
				response: {
					[StatusCodes.OK]: AssetPublic,
				},
			},
		},
		async (req) => {
			return await assetService.findById(req.params.id);
		},
	);

	app.get(
		"/id/:id/extras",
		{
			schema: {
				tags: ["Asset"],
				params: IdSchema,
				response: {
					[StatusCodes.OK]: AssetExtras,
				},
			},
		},
		async (req) => {
			return await assetService.findByIdWithExtras(req.params.id);
		},
	);

	app.post(
		"/",
		{
			preHandler: hasAcess({ role: ["ADMIN"] }),
			schema: {
				tags: ["Asset"],
				body: AssetCreate,
				response: {
					[StatusCodes.CREATED]: Asset,
				},
			},
		},
		async (req, reply) => {
			reply.code(StatusCodes.CREATED);
			return await assetService.create(req.body);
		},
	);
	app.patch(
		"/id/:id",
		{
			preHandler: hasAcess({ role: ["ADMIN"] }),
			schema: {
				tags: ["Asset"],
				params: IdSchema,
				body: AssetCreate.partial(),
				response: {
					[StatusCodes.CREATED]: Asset,
				},
			},
		},
		async (req) => {
			return await assetService.update(req.params.id, req.body);
		},
	);
	app.delete(
		"/id/:id",
		{
			preHandler: hasAcess({ role: ["ADMIN"] }),
			schema: {
				tags: ["Asset"],
				params: IdSchema,
			},
		},
		async (req) => {
			return await assetService.delete(req.params.id);
		},
	);
}
