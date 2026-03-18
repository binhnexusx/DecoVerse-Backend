import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFurnitureDto } from './dto/create-furniture.dto';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

interface GeminiObject {
  id: string;
  name: string;
  type: string;
  category: string;
  color: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  rotation: { y: number };
}

interface GeminiRoom {
  roomSize: { width: number; height: number; depth: number };
  objects: GeminiObject[];
}

const selectFields = {
  id: true,
  name: true,
  category: true,
  style: true,
  color: true,
  cloudinaryUrl: true,
  thumbnailUrl: true,
  publicId: true,
};

@Injectable()
export class ModelsService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadToCloudinary(
    file: Express.Multer.File,
  ): Promise<CloudinaryUploadResult> {
    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: '3d-models',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error)
            return reject(new InternalServerErrorException(error.message));
          resolve(result as CloudinaryUploadResult);
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async uploadAndSave(file: Express.Multer.File, dto: CreateFurnitureDto) {
    const cloudinaryResult = await this.uploadToCloudinary(file);
    return this.prisma.furnitureItem.create({
      data: {
        name: dto.name,
        category: dto.category,
        style: dto.style ?? null,
        color: dto.color ?? null,
        tags: dto.tags ?? [],
        thumbnailUrl: dto.thumbnailUrl ?? null,
        cloudinaryUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
      },
    });
  }

  async findAll(category?: string) {
    return this.prisma.furnitureItem.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.furnitureItem.findUnique({ where: { id } });
  }

  async remove(id: string) {
    const item = await this.prisma.furnitureItem.findUnique({ where: { id } });
    if (!item) return null;
    await cloudinary.uploader.destroy(item.publicId, { resource_type: 'raw' });
    return this.prisma.furnitureItem.delete({ where: { id } });
  }

  async matchFromGemini(geminiJson: GeminiRoom) {
    const objects: GeminiObject[] = geminiJson.objects ?? [];

    const SKIP_KEYWORDS = [
      'curtain',
      'blind',
      'window',
      'wall art',
      'framed',
      'painting',
      'ceiling spotlight',
      'downlight',
      'baseboard',
      'door',
      'window frame',
      'floor',
      'ceiling',
      'wall',
      'skirting',
      'spotlight',
    ];

    const results = await Promise.all(
      objects.map(async (obj: GeminiObject) => {
        const nameLower = (obj.name ?? '').toLowerCase();

        const shouldSkip = SKIP_KEYWORDS.some((kw) => nameLower.includes(kw));
        if (shouldSkip) {
          return { ...obj, furnitureItem: null, matched: false, skipped: true };
        }

        const category =
          obj.category && obj.category !== 'decoration'
            ? obj.category
            : this.mapNameToCategory(nameLower, obj.type ?? '');

        let furnitureItem = await this.prisma.furnitureItem.findFirst({
          where: { category },
          select: selectFields,
        });

        if (!furnitureItem) {
          furnitureItem = await this.prisma.furnitureItem.findFirst({
            where: { name: { contains: obj.name, mode: 'insensitive' } },
            select: selectFields,
          });
        }

        if (!furnitureItem) {
          furnitureItem = await this.prisma.furnitureItem.findFirst({
            where: { tags: { has: category } },
            select: selectFields,
          });
        }

        return {
          id: obj.id,
          name: obj.name,
          type: obj.type,
          category: obj.category ?? category,
          color: obj.color,
          position: obj.position,
          size: obj.size,
          rotation: obj.rotation,
          furnitureItem: furnitureItem ?? null,
          matched: !!furnitureItem,
          skipped: false,
        };
      }),
    );

    return {
      roomSize: geminiJson.roomSize,
      objects: results,
    };
  }

  private mapNameToCategory(name: string, type: string): string {
    const nameMap: [string[], string][] = [
      [['sofa', 'couch', 'sectional', 'loveseat'], 'sofa'],
      [['bed', 'mattress'], 'bed'],
      [
        [
          'chair',
          'armchair',
          'stool',
          'bean bag',
          'ottoman',
          'bench',
          'seat',
          'gaming chair',
          'office chair',
        ],
        'chair',
      ],
      [
        ['coffee table', 'side table', 'end table', 'nightstand', 'bedside'],
        'coffee_table',
      ],
      [['dining table', 'kitchen table', 'eating table'], 'dining_table'],
      [['desk', 'workstation', 'writing table', 'gaming desk'], 'desk'],
      [
        [
          'wardrobe',
          'closet',
          'dresser',
          'cabinet',
          'buffet',
          'sideboard',
          'chest',
        ],
        'wardrobe',
      ],
      [
        [
          'shelf',
          'bookcase',
          'bookshelf',
          'rack',
          'tv stand',
          'tv console',
          'media console',
        ],
        'shelf',
      ],
      [
        [
          'lamp',
          'floor lamp',
          'table lamp',
          'desk lamp',
          'chandelier',
          'ceiling fan',
          'pendant',
          'light',
        ],
        'lamp',
      ],
      [['plant', 'tree', 'cactus', 'bamboo', 'vase with', 'potted'], 'plant'],
      [
        [
          'vase',
          'frame',
          'art',
          'mirror',
          'candle',
          'sculpture',
          'clock',
          'pillow',
          'blanket',
          'decoration',
        ],
        'decoration',
      ],
      [['tv', 'television', 'monitor', 'screen', 'display'], 'television'],
      [
        [
          'fridge',
          'refrigerator',
          'oven',
          'microwave',
          'washer',
          'dryer',
          'dishwasher',
          'ac',
        ],
        'appliance',
      ],
      [['rug', 'carpet', 'mat', 'area rug'], 'rug'],
      [
        ['treadmill', 'exercise bike', 'dumbbell', 'barbell', 'weight bench'],
        'appliance',
      ],
      [['bathtub', 'shower', 'toilet', 'sink', 'vanity'], 'appliance'],
    ];

    for (const [keywords, category] of nameMap) {
      if (keywords.some((kw) => name.includes(kw))) return category;
    }

    const typeMap: Record<string, string> = {
      furniture: 'sofa',
      appliance: 'television',
      lighting: 'lamp',
      decoration: 'decoration',
    };
    return typeMap[type] ?? 'decoration';
  }
}
