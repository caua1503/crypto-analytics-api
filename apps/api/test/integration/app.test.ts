import { describe, expect, it } from "bun:test";
import { getApp, setupIntegrationTest } from "./setup.js";

setupIntegrationTest();

describe("api app", () => {
	it("returns health status", async () => {
		const response = await getApp().inject({
			method: "GET",
			url: "/health",
		});

		expect(response.statusCode).toBe(200);
		const body = response.json() as { message: string };
		expect(body).toEqual({ message: "ok" });
	});

	it("returns the root docs pointer", async () => {
		const response = await getApp().inject({
			method: "GET",
			url: "/",
		});

		expect(response.statusCode).toBe(200);
		const body = response.json() as { message: string };
		expect(body).toEqual({ message: "go to /docs" });
	});
});
