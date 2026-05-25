import { z } from "zod";
import { ApiMethod, zJson } from "../common.js";

export type AuthenticatedIdentity =
	| { type: "bearer"; sub: string; role: RoleType }
	| { type: "api_key"; keyId: number; role: RoleType; scopes: string[] };

export const Role = z.enum(["FREE", "PRO", "TRADER", "ADMIN"]).default("FREE");

export const User = z.object({
	id: z.number(),
	publicId: z.string(),

	email: z.email(),
	passwordHash: z.string(),

	role: Role,

	emailVerified: z.boolean(),
	isActive: z.boolean(),

	twoFactorEnabled: z.boolean(),
	twoFactorSecret: z.string().nullable(),

	failedLoginAttempts: z.number(),
	lockedUntil: z.date().nullable(),

	lastLoginAt: z.date().nullable(),

	passwordResetToken: z.string().nullable(),
	passwordResetExpires: z.date().nullable(),

	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	deletedAt: z.coerce.date().nullable(),
	autoDeleteAt: z.coerce.date().nullable(),
});

export const PublicUser = z.object({
	publicId: z.string(),
	email: z.email(),
	role: Role,
	emailVerified: z.boolean(),
	createdAt: z.coerce.date(),
});

export const PublicUserArray = z.array(
	PublicUser.extend({
		updatedAt: z.coerce.date(),
		deletedAt: z.coerce.date().nullable(),
		autoDeleteAt: z.coerce.date().nullable(),
	}),
);

export const CreateUser = z.object({
	email: z.email(),
	password: z.string().min(8, "Password must be at least 8 characters long"),
	role: Role,
});

export const UpdateUser = CreateUser.partial().omit({ password: true }).extend({
	passwordHash: z.string().optional(),
});

export const CreateUserExtras = z.object({
	name: z.string(),
	avatar: z.string().optional(),
	phone: z.string().optional(),
});

export const CreateUserSession = z.object({
	publicId: z.string().uuid().optional(),
	userId: z.number(),

	ip: z.string().optional(),
	userAgent: z.string().optional(),
	device: z.string().optional(),

	expiresAt: z.date(),
	revokedAt: z.date().optional(),

	metadata: zJson,
});

export const CreateUserApiKey = z.object({
	name: z.string(),
	scopes: z.array(z.string()).default([]),

	ipWhitelist: z.array(z.string()).optional(),

	expiresAt: z.date().optional(),
	revokedAt: z.date().optional(),

	metadata: zJson,
});

export const PublicUserApiKey = CreateUserApiKey.extend({
	publicId: z.string(),
});

export const PublicUserApiKeyArray = z.object({
	meta: z.object({
		total: z.number(),
	}),
	data: z.array(
		PublicUserApiKey.extend({
			metadata: z.json().optional(),
		}),
	),
});

export const CreateApiRequestLog = z.object({
	userId: z.number().optional(), //Pode ser null se a requisição for feita sem autenticação
	ip: z.string().optional(),

	method: ApiMethod,
	endpoint: z.string(),
	statusCode: z.number(),

	durationMs: z.number().optional(),
});

export const Login = z.object({
	email: z.email(),
	password: z.string(),
	rememberMe: z.boolean().default(false),
});

export const RefreshToken = z.object({
	refreshToken: z.string(),
});

export interface PayloadAcessToken {
	sub: string;
	role: RoleType;
	iat?: number;
	exp?: number;
}

export interface PayloadRefreshToken {
	sub: string;
	sessionId: string;
}

export const AuthTokensResponse = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
	expiresIn: z.number(),
});

export interface VerifiedApiKeyData {
	id: number;
	scopes: string[];
	role: RoleType;
	ipWhitelist: string[];
}

export type RoleType = z.infer<typeof Role>;
export type UserType = z.infer<typeof User>;
export type PublicUserType = z.infer<typeof PublicUser>;
export type PublicUserApiKeyType = z.infer<typeof PublicUserApiKey>;
export type CreateUserType = z.infer<typeof CreateUser>;
export type CreateUserSessionType = z.infer<typeof CreateUserSession>;
export type CreateUserApiKeyType = z.infer<typeof CreateUserApiKey>;
export type UpdateUserType = z.infer<typeof UpdateUser>;
export type LoginType = z.infer<typeof Login>;
export type RefreshTokenType = z.infer<typeof RefreshToken>;
export type PublicUserApiKeyArrayType = z.infer<typeof PublicUserApiKeyArray>;
export type AuthTokensResponseType = z.infer<typeof AuthTokensResponse>;
