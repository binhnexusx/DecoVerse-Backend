import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    prompt: string;
    previewUrl: string;
    publicId: string;
    userId: string; 
  }) {
    return this.prisma.project.create({
      data: {
        name: data.name,
        prompt: data.prompt,
        previewUrl: data.previewUrl,
        publicId: data.publicId,
        user: {
          connect: { id: data.userId }, 
        },
      },
    });
  }
}
