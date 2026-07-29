import { describe, expect, it } from "bun:test";
import {
	createAdminSession,
	expectAuthTokens,
	getApp,
	setupIntegrationTest,
	uniqueRunId,
	uniqueSymbol,
} from "./setup.js";

setupIntegrationTest();

describe("Admin Flow", () => {
	it("runs the functional admin flow across auth, assets, criterions, and market snapshots", async () => {
		const { tokens, authorization } = await createAdminSession("admin");
		expect(tokens.expiresIn).toBe(15 * 60);

		const refreshResponse = await getApp().inject({
			method: "POST",
			url: "/auth/v1/refresh",
			body: { refreshToken: tokens.refreshToken },
		});
		expect(refreshResponse.statusCode).toBe(200);
		const refreshedTokens = expectAuthTokens(refreshResponse.json());
		expect(refreshedTokens.refreshToken).not.toBe(tokens.refreshToken);

		const symbol = uniqueSymbol("TF");
		const assetResponse = await getApp().inject({
			method: "POST",
			url: "/api/v1/assets/",
			headers: { authorization },
			body: {
				symbol,
				name: "testcoin",
			},
		});
		expect(assetResponse.statusCode).toBe(201);
		const asset = assetResponse.json<{
			id: number;
			publicId: string;
			symbol: string;
			name: string;
			createdAt: string;
		}>();
		expect(asset).toEqual({
			id: expect.any(Number),
			publicId: expect.any(String),
			symbol,
			name: "Testcoin",
			createdAt: expect.any(String),
		});

		const assetsResponse = await getApp().inject({
			method: "GET",
			url: "/api/v1/assets/",
			headers: { authorization },
		});
		expect(assetsResponse.statusCode).toBe(200);
		const assets = assetsResponse.json<{
			meta: { total: number };
			data: Array<{ publicId: string; symbol: string; name: string }>;
		}>();
		expect(assets.meta.total).toBeGreaterThanOrEqual(1);
		expect(assets.data).toContainEqual(
			expect.objectContaining({
				publicId: asset.publicId,
				symbol,
				name: "Testcoin",
			}),
		);

		const assetBySymbolResponse = await getApp().inject({
			method: "GET",
			url: `/api/v1/assets/${symbol}`,
			headers: { authorization },
		});
		expect(assetBySymbolResponse.statusCode).toBe(200);
		expect(assetBySymbolResponse.json()).toEqual(
			expect.objectContaining({ publicId: asset.publicId, symbol }),
		);

		const criterionCode = `CRIT_${uniqueRunId.replace(/\\W/g, "_").toUpperCase()}`.slice(0, 32);
		const criterionResponse = await getApp().inject({
			method: "POST",
			url: "/api/v1/criterion/",
			headers: { authorization },
			body: {
				code: criterionCode,
				name: "Functional Criterion",
				description: null,
				category: "TECHNICAL",
			},
		});
		expect(criterionResponse.statusCode).toBe(201);
		const criterion = criterionResponse.json<{
			id: number;
			code: string;
			name: string;
			description: string | null;
			category: string;
		}>();
		expect(criterion).toEqual({
			id: expect.any(Number),
			code: criterionCode,
			name: "Functional Criterion",
			description: null,
			category: "TECHNICAL",
		});

		const criterionsResponse = await getApp().inject({
			method: "GET",
			url: "/api/v1/criterion/",
			headers: { authorization },
		});
		expect(criterionsResponse.statusCode).toBe(200);
		expect(criterionsResponse.json<{ criterions: unknown[] }>()).toEqual({
			criterions: expect.arrayContaining([expect.objectContaining({ id: criterion.id })]),
		});

		const criterionByIdResponse = await getApp().inject({
			method: "GET",
			url: `/api/v1/criterion/${criterion.id}`,
			headers: { authorization },
		});
		expect(criterionByIdResponse.statusCode).toBe(200);
		expect(criterionByIdResponse.json<{ criterion: unknown }>()).toEqual({
			criterion: expect.objectContaining({
				id: criterion.id,
				code: criterionCode,
			}),
		});

		const marketPayload = {
			assetId: asset.id,
			priceUsd: "123.45",
			volume24hUsd: "456789.12",
			marketCapUsd: "9876543.21",
			open: "120.00",
			high: "130.00",
			low: "119.00",
			close: "123.45",
			btcDominance: "51.25",
			fearGreed: 64,
			source: "TEST",
			cachedUntil: new Date(Date.now() + 60_000).toISOString(),
		};
		const marketResponse = await getApp().inject({
			method: "POST",
			url: "/api/v1/market/",
			headers: { authorization },
			body: marketPayload,
		});
		expect(marketResponse.statusCode).toBe(201);
		const marketSnapshot = marketResponse.json<{
			id: number;
			assetId: number;
			priceUsd: string;
			volume24hUsd: string;
			marketCapUsd: string;
			btcDominance: string;
			source: string;
		}>();
		expect(marketSnapshot).toEqual(
			expect.objectContaining({
				id: expect.any(Number),
				assetId: asset.id,
				priceUsd: "123.45",
				volume24hUsd: "456789.12",
				marketCapUsd: "9876543.21",
				btcDominance: "51.25",
				source: "TEST",
			}),
		);

		const marketByIdResponse = await getApp().inject({
			method: "GET",
			url: `/api/v1/market/${marketSnapshot.id}`,
			headers: { authorization },
		});
		expect(marketByIdResponse.statusCode).toBe(200);
		expect(marketByIdResponse.json()).toEqual(
			expect.objectContaining({
				id: marketSnapshot.id,
				assetId: asset.id,
				priceUsd: "123.45",
			}),
		);

		const latestBySymbolResponse = await getApp().inject({
			method: "GET",
			url: `/api/v1/market/asset/symbol/${symbol}/latest`,
			headers: { authorization },
		});
		expect(latestBySymbolResponse.statusCode).toBe(200);
		expect(latestBySymbolResponse.json()).toEqual(
			expect.objectContaining({
				id: marketSnapshot.id,
				assetId: asset.id,
				priceUsd: "123.45",
			}),
		);
	});
});
