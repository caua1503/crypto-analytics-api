import { PrismaClient } from '@prisma/client';
import { Asset, AssetCreate} from '../interfaces/asset.interface.js';

export class AssetService {
    constructor(private prisma: PrismaClient) {}

    async create(data: unknown): Promise<Asset> {
        const validatedData = AssetCreate.parse(data);
        return this.prisma.asset.create({data: validatedData});
    }
}