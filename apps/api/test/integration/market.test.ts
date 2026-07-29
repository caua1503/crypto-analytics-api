import { describe, expect, it } from "bun:test";
import { getApp, setupIntegrationTest } from "./setup.js";

setupIntegrationTest();

describe("Market checks", () => {
	it("validates public market snapshot public id params", async () => {
		const response = await getApp().inject({
			method: "GET",
			url: "/api/v1/market/asset/id/not-a-uuid",
		});

		expect(response.statusCode).toBe(400);
	});
});
