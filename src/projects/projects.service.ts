import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    prompt?: string;
    previewUrl: string;
    publicId: string;
    userId: string;
    designData: any;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: data.name,
          prompt: data.prompt,
          previewUrl: data.previewUrl,
          publicId: data.publicId,
          userId: data.userId,
        },
      });

      await tx.project_version.create({
        data: {
          projectId: project.id,
          version: 1,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          designData: data.designData,
        },
      });
      return project;
    });
  }

  async findOne(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async saveVersion(projectId: string, userId: string, designData: any) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const lastVersion = await this.prisma.project_version.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
    });

    const nextVersion = lastVersion ? lastVersion.version + 1 : 1;

    await this.prisma.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    });

    return this.prisma.project_version.create({
      data: {
        projectId,
        version: nextVersion,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        designData: designData,
      },
    });
  }
}
