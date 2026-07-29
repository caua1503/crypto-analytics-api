import { describe, expect, it } from "bun:test";
import {
	getApp,
	login,
	registerUser,
	setupIntegrationTest,
	uniqueEmail,
	uniqueSymbol,
} from "./setup.js";

setupIntegrationTest();

describe("Auth checks", () => {
	it("rejects invalid login payload", async () => {
		const response = await getApp().inject({
			method: "POST",
			url: "/auth/v1/login",
			body: {},
		});

		expect(response.statusCode).toBe(400);
	});

	it("rejects invalid register payload", async () => {
		const response = await getApp().inject({
			method: "POST",
			url: "/auth/v1/register",
			body: {
				email: "invalid",
				password: "short",
			},
		});

		expect(response.statusCode).toBe(400);
	});

	it("rejects invalid refresh token", async () => {
		const response = await getApp().inject({
			method: "POST",
			url: "/auth/v1/refresh",
			body: { refreshToken: "invalid-token" },
		});

		expect(response.statusCode).toBe(401);
	});

	it("keeps admin-only resources forbidden for authenticated free users", async () => {
		const { email, password } = await registerUser(uniqueEmail("free"));
		const { authorization } = await login(email, password);

		const response = await getApp().inject({
			method: "POST",
			url: "/api/v1/assets/",
			headers: { authorization },
			body: {
				symbol: uniqueSymbol("FR"),
				name: "Free asset",
			},
		});

		expect(response.statusCode).toBe(403);
	});
});
