import { afterAll, beforeAll, expect } from "bun:test";
import type { buildApp as buildAppType } from "../../src/app.js";
import { startTestEnvironment, stopTestEnvironment } from "../environment.js";

type TestApp = ReturnType<typeof buildAppType>;
type UserPrismaClient = typeof import("@repo/shared").userPrisma;

export type AuthTokens = {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
};

export type RegisteredUser = {
	publicId: string;
	email: string;
	role: string;
	emailVerified: boolean;
	createdAt: string;
};

export const INTEGRATION_TIMEOUT_MS = 120_000;
export const TEST_PUBLIC_ID = "00000000-0000-4000-8000-000000000000";
export const uniqueRunId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

let app: TestApp | null = null;
let userPrisma: UserPrismaClient | null = null;

export function getApp() {
	if (!app) {
		throw new Error("Test app is not ready");
	}
	return app;
}

export function getUserPrisma() {
	if (!userPrisma) {
		throw new Error("Test user prisma client is not ready");
	}
	return userPrisma;
}

export function uniqueEmail(prefix: string) {
	return `${prefix}-${uniqueRunId}@example.com`;
}

export function uniqueSymbol(prefix: string) {
	return `${prefix}${uniqueRunId.replace(/\\D/g, "").slice(-6)}`.slice(0, 10).toUpperCase();
}

export function expectAuthTokens(body: unknown): AuthTokens {
	expect(body).toEqual({
		accessToken: expect.any(String),
		refreshToken: expect.any(String),
		expiresIn: expect.any(Number),
	});

	return body as AuthTokens;
}

export async function registerUser(email = uniqueEmail("user")) {
	const password = "password123";
	const response = await getApp().inject({
		method: "POST",
		url: "/auth/v1/register",
		body: { email, password },
	});

	expect(response.statusCode).toBe(201);
	const user = response.json<RegisteredUser>();
	expect(user).toEqual({
		publicId: expect.any(String),
		email,
		role: "FREE",
		emailVerified: false,
		createdAt: expect.any(String),
	});

	return { email, password, user };
}

export async function promoteUserToAdmin(publicId: string) {
	await getUserPrisma().user.update({
		where: { publicId },
		data: {
			role: "ADMIN",
			emailVerified: true,
		},
	});
}

export async function verifyUserEmail(publicId: string) {
	await getUserPrisma().user.update({
		where: { publicId },
		data: { emailVerified: true },
	});
}

export async function login(email: string, password: string) {
	const response = await getApp().inject({
		method: "POST",
		url: "/auth/v1/login",
		body: { email, password },
	});

	expect(response.statusCode).toBe(200);
	const tokens = expectAuthTokens(response.json());

	return {
		tokens,
		authorization: `Bearer ${tokens.accessToken}`,
	};
}

export async function createAdminSession(prefix = "admin") {
	const { email, password, user } = await registerUser(uniqueEmail(prefix));
	await promoteUserToAdmin(user.publicId);
	const { tokens, authorization } = await login(email, password);

	return { email, password, user, tokens, authorization };
}

export function setupIntegrationTest() {
	beforeAll(
		async () => {
			await startTestEnvironment();
			const shared = await import("@repo/shared");
			const { buildApp } = await import("../../src/app.js");
			userPrisma = shared.userPrisma;
			app = buildApp();
			await app.ready();
		},
		{ timeout: INTEGRATION_TIMEOUT_MS },
	);

	afterAll(
		async () => {
			await app?.close();
			// await stopTestEnvironment();
		},
		{ timeout: INTEGRATION_TIMEOUT_MS },
	);
}
