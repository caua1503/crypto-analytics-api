import { describe, expect, it } from "bun:test";
import {
	createAdminSession,
	getApp,
	RegisteredUser,
	setupIntegrationTest,
	uniqueEmail,
	uniqueSymbol,
	verifyUserEmail,
} from "./setup.js";

setupIntegrationTest();

describe("User and API Key Flow", () => {
	it("runs the functional user and api key flow", async () => {
		const { authorization } = await createAdminSession("user-admin");
		const managedUserEmail = uniqueEmail("managed");
		const managedUserPassword = "password123";

		const createUserResponse = await getApp().inject({
			method: "POST",
			url: "/api/v1/user/",
			headers: { authorization },
			body: {
				email: managedUserEmail,
				password: managedUserPassword,
				role: "TRADER",
			},
		});
		expect(createUserResponse.statusCode).toBe(201);
		const managedUser = createUserResponse.json<RegisteredUser>();
		expect(managedUser).toEqual({
			publicId: expect.any(String),
			email: managedUserEmail,
			role: "TRADER",
			emailVerified: false,
			createdAt: expect.any(String),
		});

		const getUserResponse = await getApp().inject({
			method: "GET",
			url: `/api/v1/user/${managedUser.publicId}`,
			headers: { authorization },
		});
		expect(getUserResponse.statusCode).toBe(200);
		expect(getUserResponse.json()).toEqual(
			expect.objectContaining({
				publicId: managedUser.publicId,
				email: managedUserEmail,
				role: "TRADER",
			}),
		);

		await verifyUserEmail(managedUser.publicId);
		const apiKeyResponse = await getApp().inject({
			method: "POST",
			url: `/api/v1/user/${managedUser.publicId}/api-key`,
			headers: { authorization },
			body: {
				name: "integration-key",
				scopes: [],
				metadata: { suite: "integration" },
			},
		});
		expect(apiKeyResponse.statusCode).toBe(201);
		const { apiKey } = apiKeyResponse.json<{ apiKey: string }>();
		expect(apiKey).toEqual(expect.stringMatching(/^caa_prod_[a-f0-9]{64}$/));

		const listApiKeysResponse = await getApp().inject({
			method: "GET",
			url: `/api/v1/user/${managedUser.publicId}/api-key`,
			headers: { authorization },
		});
		expect(listApiKeysResponse.statusCode).toBe(200);
		expect(listApiKeysResponse.json<{ meta: { total: number }; data: unknown[] }>()).toEqual({
			meta: { total: 1 },
			data: [
				expect.objectContaining({
					publicId: expect.any(String),
					name: "integration-key",
					scopes: [],
				}),
			],
		});

		const apiKeyAssetsResponse = await getApp().inject({
			method: "GET",
			url: "/api/v1/assets/",
			headers: { "x-api-key": apiKey },
		});
		expect(apiKeyAssetsResponse.statusCode).toBe(200);
		expect(apiKeyAssetsResponse.json<{ meta: { total: number }; data: unknown[] }>()).toEqual({
			meta: { total: expect.any(Number) },
			data: expect.any(Array),
		});

		const apiKeyAdminResponse = await getApp().inject({
			method: "POST",
			url: "/api/v1/assets/",
			headers: { "x-api-key": apiKey },
			body: {
				symbol: uniqueSymbol("AK"),
				name: "Api key asset",
			},
		});
		expect(apiKeyAdminResponse.statusCode).toBe(403);

		const apiKeyListingWithApiKeyResponse = await getApp().inject({
			method: "GET",
			url: `/api/v1/user/${managedUser.publicId}/api-key`,
			headers: { "x-api-key": apiKey },
		});
		expect(apiKeyListingWithApiKeyResponse.statusCode).toBe(401);
	});
});
