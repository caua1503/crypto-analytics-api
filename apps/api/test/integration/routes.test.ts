import { describe, expect, it } from "bun:test";
import { getApp, setupIntegrationTest } from "./setup.js";

type Method = "GET" | "POST" | "PATCH" | "DELETE";
type RouteCase = {
	method: Method;
	url: string;
	body?: any;
};

const TEST_PUBLIC_ID = "00000000-0000-4000-8000-000000000000";

const registeredRoutes: RouteCase[] = [
	{ method: "GET", url: "/" },
	{ method: "GET", url: "/health" },
	{ method: "POST", url: "/auth/v1/login" },
	{ method: "POST", url: "/auth/v1/register" },
	{ method: "POST", url: "/auth/v1/refresh" },
	{ method: "POST", url: "/api/v1/user/" },
	{ method: "GET", url: "/api/v1/user/:publicId" },
	{ method: "GET", url: "/api/v1/user/:publicId/api-key" },
	{ method: "POST", url: "/api/v1/user/:publicId/api-key" },
	{ method: "GET", url: "/api/v1/assets/" },
	{ method: "GET", url: "/api/v1/assets/extras" },
	{ method: "GET", url: "/api/v1/assets/:symbol" },
	{ method: "GET", url: "/api/v1/assets/:symbol/extras" },
	{ method: "GET", url: "/api/v1/assets/id/:id" },
	{ method: "GET", url: "/api/v1/assets/id/:id/extras" },
	{ method: "POST", url: "/api/v1/assets/" },
	{ method: "PATCH", url: "/api/v1/assets/id/:id" },
	{ method: "DELETE", url: "/api/v1/assets/id/:id" },
	{ method: "GET", url: "/api/v1/criterion/" },
	{ method: "GET", url: "/api/v1/criterion/:id" },
	{ method: "GET", url: "/api/v1/criterion/categories" },
	{ method: "POST", url: "/api/v1/criterion/" },
	{ method: "PATCH", url: "/api/v1/criterion/:id" },
	{ method: "DELETE", url: "/api/v1/criterion/:id" },
	{ method: "GET", url: "/api/v1/dashboard/" },
	{ method: "GET", url: "/api/v1/market/asset/:symbol" },
	{ method: "GET", url: "/api/v1/market/asset/id/:publicId" },
	{ method: "GET", url: "/api/v1/market/:id" },
	{ method: "GET", url: "/api/v1/market/asset/:publicId/latest" },
	{ method: "GET", url: "/api/v1/market/asset/symbol/:symbol/latest" },
	{ method: "POST", url: "/api/v1/market/" },
	{ method: "PATCH", url: "/api/v1/market/:id" },
	{ method: "DELETE", url: "/api/v1/market/:id" },
];

const protectedRoutes: RouteCase[] = [
	{
		method: "POST",
		url: "/api/v1/user/",
		body: {
			email: "admin@example.com",
			password: "password123",
			role: "ADMIN",
		},
	},
	{ method: "GET", url: `/api/v1/user/${TEST_PUBLIC_ID}` },
	{ method: "GET", url: `/api/v1/user/${TEST_PUBLIC_ID}/api-key` },
	{
		method: "POST",
		url: `/api/v1/user/${TEST_PUBLIC_ID}/api-key`,
		body: { name: "default", scopes: [] },
	},
	{ method: "GET", url: "/api/v1/assets/" },
	{ method: "GET", url: "/api/v1/assets/extras" },
	{ method: "GET", url: "/api/v1/assets/BTC" },
	{ method: "GET", url: "/api/v1/assets/BTC/extras" },
	{ method: "GET", url: "/api/v1/assets/id/1" },
	{ method: "GET", url: "/api/v1/assets/id/1/extras" },
	{ method: "POST", url: "/api/v1/assets/", body: { symbol: "BTC", name: "Bitcoin" } },
	{ method: "PATCH", url: "/api/v1/assets/id/1", body: { name: "Bitcoin" } },
	{ method: "DELETE", url: "/api/v1/assets/id/1" },
	{ method: "GET", url: "/api/v1/criterion/" },
	{ method: "GET", url: "/api/v1/criterion/1" },
	{ method: "GET", url: "/api/v1/criterion/categories" },
	{
		method: "POST",
		url: "/api/v1/criterion/",
		body: {
			code: "RSI",
			name: "RSI",
			description: null,
			category: "TECHNICAL",
		},
	},
	{ method: "PATCH", url: "/api/v1/criterion/1", body: { name: "RSI" } },
	{ method: "DELETE", url: "/api/v1/criterion/1" },
	{ method: "GET", url: "/api/v1/market/asset/BTC" },
	{ method: "GET", url: "/api/v1/market/1" },
	{ method: "GET", url: `/api/v1/market/asset/${TEST_PUBLIC_ID}/latest` },
	{ method: "GET", url: "/api/v1/market/asset/symbol/BTC/latest" },
	{
		method: "POST",
		url: "/api/v1/market/",
		body: {
			assetId: 1,
			priceUsd: "1",
			volume24hUsd: "1",
			marketCapUsd: "1",
			btcDominance: "50",
			source: "TEST",
			cachedUntil: new Date(Date.now() + 60_000).toISOString(),
		},
	},
	{ method: "PATCH", url: "/api/v1/market/1", body: { priceUsd: "2" } },
	{ method: "DELETE", url: "/api/v1/market/1" },
];

setupIntegrationTest();

describe("Route registration and protection", () => {
	it.each(registeredRoutes)("$method $url is registered", ({ method, url }) => {
		expect(getApp().hasRoute({ method, url })).toBe(true);
	});

	it.each(protectedRoutes)("requires credentials for $method $url", async ({
		method,
		url,
		body,
	}) => {
		const response = await getApp().inject({ method, url, body });

		expect(response.statusCode).toBe(401);
	});
});
