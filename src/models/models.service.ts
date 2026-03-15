import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFurnitureDto } from './dto/create-furniture.dto';

@Injectable()
export class ModelsService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadToCloudinary(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: '3d-models',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            return reject(new InternalServerErrorException(error.message));
          }
          resolve(result as UploadApiResponse);
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
}
