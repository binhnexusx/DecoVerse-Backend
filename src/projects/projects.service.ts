import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    prompt?: string;
    previewUrl?: string;
    publicId?: string;
  }) {
    return this.prisma.project.create({
      data,
    });
  }
}
