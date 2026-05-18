import { httpErrors } from "@fastify/sensible";
import type { PrismaClientType } from "@repo/shared";
import { buildCacheKey, RedisClient } from "@repo/shared";
import {
	Asset,
	AssetCreate,
	type AssetCreateType,
	AssetExtras,
	AssetExtrasArray,
	type AssetExtrasType,
	AssetPublic,
	AssetPublicResponse,
	type AssetPublicResponseType,
	type AssetPublicType,
	type AssetType,
} from "@repo/shared/types/interfaces/asset.interface";
import {
	PaginationParams,
	type PaginationParamsType,
} from "@repo/shared/types/interfaces/common.interface";

export class AssetService {
	constructor(
		private prisma: PrismaClientType,
		private cache: RedisClient = new RedisClient(),
	) {}

	async findAll(
		pagination: PaginationParamsType = PaginationParams.parse({}),
	): Promise<AssetPublicResponseType> {
		const cacheKey = buildCacheKey("assets:findAll:", pagination);

		const cachedResponse = await this.cache.get_json<AssetPublicResponseType>(
			cacheKey,
			AssetPublicResponse,
		);

		if (cachedResponse) {
			return cachedResponse;
		}
		const { skip, take, order } = pagination;

		const [assets, total] = await Promise.all([
			this.prisma.asset.findMany({
				skip: skip,
				take: take,
				orderBy: { createdAt: order },
			}),
			this.prisma.asset.count(),
		]);

		// console.log(assets);

		if (!assets) {
			throw httpErrors.notFound("Assets not found");
		}

		const data = AssetPublicResponse.parse({
			meta: { total },
			data: assets,
		});

		this.cache.set_json(cacheKey, data).catch(console.error);

		return data;
	}

	async findAllWithExtras(
		pagination: PaginationParamsType = PaginationParams.parse({}),
	): Promise<AssetExtrasType[]> {
		const cacheKey = buildCacheKey("assets:findAllWithExtras:", pagination);

		const cachedAssets = await this.cache.get_json<AssetExtrasType[]>(
			cacheKey,
			AssetExtrasArray,
		);

		if (cachedAssets) {
			return cachedAssets;
		}
		const { skip, take, order } = pagination;

		const assets = await this.prisma.asset.findMany({
			skip: skip,
			take: take,
			orderBy: { createdAt: order },
		});

		const { success, data, error } = AssetExtrasArray.safeParse(assets);

		if (!success) {
			console.error(error);
			throw httpErrors.internalServerError("Invalid assets data");
		}

		this.cache.set_json(cacheKey, data).catch(console.error);

		return data;
	}

	async findById(id: number): Promise<AssetPublicType> {
		const cacheKey = `asset:id:${id}`;
		const cachedAsset = await this.cache.get_json<AssetPublicType>(cacheKey, AssetPublic);

		if (cachedAsset) {
			return cachedAsset;
		}

		const asset = await this.prisma.asset.findUnique({ where: { id } });

		if (!asset) {
			throw httpErrors.notFound("Asset not found");
		}

		const { success, data, error } = AssetPublic.safeParse(asset);

		if (!success) {
			console.error(error);
			throw httpErrors.notFound("Invalid asset data");
		}
		this.cache.set_json(cacheKey, data).catch(console.error);

		return data;
	}

	async findByIdWithExtras(id: number): Promise<AssetExtrasType> {
		const cacheKey = `asset:id:extras:${id}`;
		const cachedAsset = await this.cache.get_json<AssetExtrasType>(cacheKey, AssetExtras);

		if (cachedAsset) {
			return cachedAsset;
		}

		const asset = await this.prisma.asset.findUnique({ where: { id } });

		if (!asset) {
			throw httpErrors.notFound("Asset not found");
		}

		const { success, data, error } = AssetExtras.safeParse(asset);

		if (!success) {
			console.error(error);
			throw httpErrors.notFound("Invalid asset data");
		}

		this.cache.set_json(cacheKey, data).catch(console.error);

		return data;
	}
	async findByPublicId(publicId: string): Promise<AssetType> {
		const cacheKey = `asset:publicId:${publicId}`;
		const cachedAsset = await this.cache.get_json<AssetType>(cacheKey, Asset);

		if (cachedAsset) {
			return cachedAsset;
		}

		const asset = await this.prisma.asset.findUnique({ where: { publicId } });

		if (!asset) {
			throw httpErrors.notFound("Asset not found");
		}

		const { success, data, error } = Asset.safeParse(asset);

		if (!success) {
			console.error(error);
			throw httpErrors.notFound("Invalid asset data");
		}
		this.cache.set_json(cacheKey, data).catch(console.error);

		return data;
	}

	async findBySymbol(symbol: string): Promise<AssetType> {
		const cacheKey = `asset:symbol:${symbol}`;
		const cachedAsset = await this.cache.get_json<AssetType>(cacheKey, Asset);

		if (cachedAsset) {
			return cachedAsset;
		}

		const asset = await this.prisma.asset.findUnique({ where: { symbol } });

		if (!asset) {
			throw httpErrors.notFound("Asset not found");
		}

		const { success, data, error } = Asset.safeParse(asset);

		if (!success) {
			console.error(error);
			throw httpErrors.notFound("Invalid asset data");
		}
		this.cache.set_json(cacheKey, data).catch(console.error);

		return data;
	}

	async findBySymbolWithExtras(symbol: string): Promise<AssetExtrasType> {
		const cacheKey = `asset:symbol:extras:${symbol}`;
		const cachedAsset = await this.cache.get_json<AssetExtrasType>(cacheKey, AssetExtras);

		if (cachedAsset) {
			return cachedAsset;
		}

		const asset = await this.prisma.asset.findUnique({ where: { symbol } });

		if (!asset) {
			throw httpErrors.notFound("Asset not found");
		}
		const { success, data, error } = AssetExtras.safeParse(asset);

		if (!success) {
			console.error(error);
			throw httpErrors.notFound("Invalid asset data");
		}

		this.cache.set_json(cacheKey, data).catch(console.error);

		return data;
	}

	async create(data: AssetCreateType): Promise<AssetType> {
		try {
			const validatedData = AssetCreate.parse(data);

			const asset = await this.prisma.asset.findUnique({
				where: { symbol: validatedData.symbol },
			});

			if (asset) throw httpErrors.conflict("Asset already exists");

			const assetCreated = this.prisma.asset.create({ data: validatedData });
			const cacheKey = `asset:symbol:${validatedData.symbol}`;

			this.cache.set_json(cacheKey, assetCreated).catch(console.error);
			return assetCreated;
		} catch (error) {
			throw httpErrors.badRequest("Invalid asset data");
		}
	}

	async update(id: number, data: Partial<AssetCreateType>): Promise<AssetType> {
		const cacheKey1 = `asset:id:${id}`;
		const cacheKey2 = `asset:id:extras:${id}`;

		const asset = await this.findById(id);

		this.cache.del(cacheKey1).catch(console.error);
		this.cache.del(cacheKey2).catch(console.error);

		this.cache.del(`asset:symbol:${asset.symbol}`).catch(console.error);
		this.cache.del(`asset:symbol:extras:${asset.symbol}`).catch(console.error);

		try {
			const validatedData = AssetCreate.partial().parse(data);
			return this.prisma.asset.update({ where: { id }, data: validatedData });
		} catch (error) {
			throw httpErrors.badRequest("Invalid asset data");
		}
	}

	async delete(id: number): Promise<void> {
		try {
			const asset = await this.findById(id);

			if (!asset) throw httpErrors.notFound("Asset not found");

			await this.prisma.asset.delete({ where: { id } });

			this.cache.del(`asset:id:${id}`).catch(console.error);
			this.cache.del(`asset:id:extras:${id}`).catch(console.error);
			this.cache.del(`asset:symbol:${asset.symbol}`).catch(console.error);
			this.cache.del(`asset:symbol:extras:${asset.symbol}`).catch(console.error);
		} catch (error) {
			throw httpErrors.notFound("Asset not found");
		}
	}
}
