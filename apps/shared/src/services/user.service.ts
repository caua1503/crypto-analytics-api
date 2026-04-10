import type { UserPrismaClientType } from "@repo/shared";
import { httpErrors } from "@fastify/sensible";

import {
    type CreateUserType,
    type CreateUserSessionType,
    type CreateUserApiKeyType,
    type PublicUserType,
    type PublicUserApiKeyType,
    type PublicUserApiKeyArrayType,
    type LoginType,
    PublicUserArray,
    UserType,
    User,
    Login,
    CreateUser,
    PublicUser,
    CreateUserSession,
    CreateUserApiKey,
    PublicUserApiKeyArray,
    PublicUserApiKey,
    PayloadAcessToken,
    VerifiedApiKeyData,
} from "@repo/shared/types/interfaces/user.interface";
import { ApiKeyMode } from "@repo/shared/types/common";
import { PaginationUserParamsType } from "@repo/shared/types/interfaces/common.interface";
import { getPasswordHash, createApiKey } from "@repo/shared/core/security";
import { env } from "@repo/shared/env";
import { verifyPassword } from "@repo/shared/core/security";

export class UserService {
    constructor(private prisma: UserPrismaClientType) { }

    async findAllUsers(params: PaginationUserParamsType): Promise<PublicUserType[]> {
        try {
            const { take, skip, orderBy, ...restParams } = params;
            const users = await this.prisma.user.findMany({
                where: {
                    ...restParams,
                },
                orderBy: {
                    [orderBy]: "asc",
                },
                take,
                skip,
            });
            return PublicUserArray.parse(users);
        } catch (error) {
            console.error(error);
            throw httpErrors.internalServerError("Failed to find users");
        }
    }

    async findByPublicId(publicId: string): Promise<UserType> {
        const user = await this.prisma.user.findUnique({
            where: {
                publicId,
            },
        });

        if (!user) {
            throw httpErrors.notFound("User not found");
        }

        return User.parse(user);
    }

    async findByEmail(email: string): Promise<UserType> {
        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            throw httpErrors.notFound("User not found");
        }

        return User.parse(user);
    }

    async findByID(id: number): Promise<UserType> {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
            },
        });

        if (!user) {
            throw httpErrors.notFound("User not found");
        }

        return User.parse(user);
    }

    async create(data: Partial<CreateUserType>): Promise<PublicUserType> {
        const { success, data: validatedData } = CreateUser.safeParse(data);

        if (!success) {
            throw httpErrors.internalServerError("Invalid user data");
        }

        const hashedPassword = await getPasswordHash(validatedData.password);
        const { password, ...userData } = validatedData;

        const user = await this.prisma.user.create({
            data: {
                ...userData,
                passwordHash: hashedPassword,
            },
        });

        return PublicUser.parse(user);
    }

    async createPayloadAcessToken(body: LoginType): Promise<PayloadAcessToken> {
        let user: UserType;

        try {
            user = await this.findByEmail(body.email);

            if (!user.isActive) {
                throw new Error("Invalid credentials");
            }

            //desabilitado para teste dev
            // if (!user.emailVerified) {
            //     throw new Error("Email not verified");
            // }

            const isPasswordValid = await verifyPassword(body.password, user.passwordHash);

            if (!isPasswordValid) {
                throw new Error("Invalid credentials");
            }
        } catch (error: any) {
            if (error.message === "Email not verified") {
                throw httpErrors.unauthorized("Email not verified");
            }

            throw httpErrors.unauthorized("Invalid credentials");
        }

        const payload = {
            sub: user.publicId,
            role: user.role,
            isActive: user.isActive,
            iat: new Date().getTime(),
            exp: new Date().getTime() + env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
        };

        void this.updateLastLogin(user.publicId, new Date());

        return payload;
    }

    async createRefreshToken(body: LoginType) {
        let user: UserType;

        try {
            user = await this.findByEmail(body.email);

            if (!user.isActive) {
                throw new Error("Invalid credentials");
            }

            //desabilitado para teste dev
            // if (!user.emailVerified) {
            //     throw new Error("Email not verified");
            // }

            const isPasswordValid = await verifyPassword(body.password, user.passwordHash);

            if (!isPasswordValid) {
                throw new Error("Invalid credentials");
            }
        } catch (error: any) {
            if (error.message === "Email not verified") {
                throw httpErrors.unauthorized("Email not verified");
            }

            throw httpErrors.unauthorized("Invalid credentials");
        }

        const payload = {
            sub: user.publicId,
            role: user.role,
            isActive: user.isActive,
            iat: new Date().getTime(),
            exp: new Date().getTime() + env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
        };

        void this.updateLastLogin(user.publicId, new Date());

        return payload;
    }

    async update(publicId: string, data: Partial<CreateUserType>): Promise<PublicUserType> {
        const { success, data: validatedData } = CreateUser.partial().safeParse(data);

        if (!success) {
            throw httpErrors.internalServerError("Invalid user data");
        }

        const { password, ...restData } = validatedData;
        const updateData: any = { ...restData };

        if (password) {
            updateData.passwordHash = await getPasswordHash(password);
        }

        const user = await this.prisma.user.update({
            where: {
                publicId,
            },
            data: updateData,
        });

        return PublicUser.parse(user);
    }

    async updateLastLogin(publicId: string, date: Date = new Date()) {
        try {
            const user = await this.prisma.user.update({
                where: {
                    publicId,
                },
                data: {
                    lastLoginAt: date,
                },
            });
        } catch (error) {
            console.error(`Error no update last login: ${error}`);
            throw httpErrors.internalServerError("Failed to update user last login");
        }
    }

    async delete(publicId: string) {
        try {
            const user = await this.prisma.user.delete({
                where: {
                    publicId,
                },
            });
        } catch (error) {
            console.error(`Error no delete: ${error}`);
            throw httpErrors.internalServerError("Failed to delete user");
        }
    }

    async deleteTemporarily(publicId: string, autoDeleteInDays: number = 90) {
        try {
            const autoDeleteAt = new Date(Date.now() + autoDeleteInDays * 24 * 60 * 60 * 1000);
            const user = await this.prisma.user.update({
                where: {
                    publicId,
                },
                data: {
                    isActive: false,
                    deletedAt: new Date(),
                    autoDeleteAt: autoDeleteAt,
                },
            });
        } catch (error) {
            console.error(`Error no delete temporariamente: ${error}`);
            throw httpErrors.internalServerError("Failed to delete user temporarily");
        }
    }

    async restore(publicId: string) {
        try {
            const user = await this.prisma.user.update({
                where: {
                    publicId,
                },
                data: {
                    isActive: true,
                    deletedAt: null,
                    autoDeleteAt: null,
                },
            });
        } catch (error) {
            console.error(`Error no restore: ${error}`);
            throw httpErrors.internalServerError("Failed to restore user");
        }
    }

    async createApiKey(
        publicId: string,
        data: CreateUserApiKeyType,
        mode: ApiKeyMode = ApiKeyMode.PROD,
    ): Promise<string> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    publicId,
                },
                select: {
                    id: true,
                    emailVerified: true,
                },
            });

            if (!user) {
                throw httpErrors.notFound("User not found");
            }

            if (!user.emailVerified) {
                throw httpErrors.unauthorized("User email not verified");
            }

            const apiKey = createApiKey(mode);
            const apiKeyHash = new Bun.CryptoHasher("sha256").update(apiKey).digest("hex");

            const restData = CreateUserApiKey.parse(data);

            const userApiKey = await this.prisma.userApiKey.create({
                data: {
                    ...restData,
                    userId: user.id,
                    apiKeyHash,
                },
            });

            return apiKey;
        } catch (error) {
            console.error(`Error no create user api key: ${error}`);
            throw httpErrors.internalServerError("Failed to create user api key");
        }
    }

    /**
     * Verifica a validade de uma API Key.
     * Faz o hash SHA-256 da chave recebida, busca no banco e valida
     * se não está expirada ou revogada.
     * @throws {ForbiddenError} Se a chave for inválida, expirada ou revogada.
     */
    async verifyApiKey(apiKey: string): Promise<VerifiedApiKeyData> {
        const apiKeyHash = new Bun.CryptoHasher("sha256").update(apiKey).digest("hex");

        const record = await this.prisma.userApiKey.findUnique({
            where: { apiKeyHash },
            select: {
                id: true,
                isActive: true,
                revokedAt: true,
                expiresAt: true,
                scopes: true,
                ipWhitelist: true,
                user: {
                    select: { role: true },
                },
            },
        });

        if (!record || !record.isActive) {
            throw httpErrors.forbidden("Invalid API Key");
        }

        if (record.revokedAt) {
            throw httpErrors.forbidden("API Key has been revoked");
        }

        if (record.expiresAt && record.expiresAt < new Date()) {
            throw httpErrors.forbidden("API Key has expired");
        }

        return {
            id: record.id,
            scopes: record.scopes,
            role: record.user.role,
            ipWhitelist: record.ipWhitelist,
        };
    }

    async getApiKeys(publicId: string): Promise<PublicUserApiKeyArrayType> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    publicId,
                },
                select: {
                    apiKeys: true,
                    _count: {
                        select: {
                            apiKeys: true,
                        },
                    },
                },
            });

            if (!user) {
                throw httpErrors.notFound("User not found");
            }

            return PublicUserApiKeyArray.parse({
                meta: { total: user._count.apiKeys },
                data: user.apiKeys,
            });
        } catch (error) {
            console.error(error);
            throw httpErrors.internalServerError("Failed to get user api keys");
        }
    }
}

export class UserSessionService {
    constructor(private prisma: UserPrismaClientType) { }

    async findByPublicUserId(publicUserId: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    publicId: publicUserId,
                },
                select: {
                    sessions: true,
                },
            });

            if (!user) {
                throw httpErrors.notFound("User not found");
            }

            return user.sessions;
        } catch (error: any) {
            console.error(error);
            if (error.statusCode) {
                throw error;
            }
            throw httpErrors.internalServerError("Failed to find user session");
        }
    }

    async create(data: CreateUserSessionType) {
        try {
            const { success, data: validatedData } = CreateUserSession.safeParse(data);

            if (!success) {
                throw httpErrors.internalServerError("Invalid user session data");
            }

            const session = await this.prisma.userSession.create({
                data: validatedData,
            });
            return session;
        } catch (error) {
            console.error(error);
            throw httpErrors.internalServerError("Failed to create user session");
        }
    }

    async findByPublicId(publicId: string) {
        try {
            const session = await this.prisma.userSession.findUnique({
                where: {
                    publicId,
                },
            });

            if (!session) {
                throw httpErrors.notFound("User session not found");
            }

            return session;
        } catch (error) {
            console.error(error);
            throw httpErrors.internalServerError("Failed to find user session");
        }
    }

    async delete(publicId: string) {
        try {
            const session = await this.prisma.userSession.findUnique({
                where: {
                    publicId,
                },
            });

            if (!session) {
                throw httpErrors.notFound("User session not found");
            }

            await this.prisma.userSession.delete({
                where: {
                    publicId,
                },
            });
        } catch (error) {
            console.error(error);
            throw httpErrors.internalServerError("Failed to delete user session");
        }
    }

    async deleteAll(publicUserId: string) {
        try {
            const result = await this.prisma.userSession.deleteMany({
                where: {
                    user: {
                        publicId: publicUserId,
                    },
                },
            });

            if (result.count === 0) {
                throw httpErrors.notFound("User or sessions not found");
            }
        } catch (error: any) {
            console.error(error);
            throw httpErrors.internalServerError("Failed to delete user sessions");
        }
    }
}
