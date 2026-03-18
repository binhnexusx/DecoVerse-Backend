import { Prisma } from '@prisma/client';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(data: {
    name: string;
    prompt?: string;
    previewUrl: string;
    publicId: string;
    userId: string;
    designData: Prisma.InputJsonValue;
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
          designData: data.designData,
        },
      });
      return project;
    });
  }

  async findOne(projectId: string, userId: string, userEmail: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        versions: { orderBy: { version: 'desc' } },
        accessList: true,
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    const isOwner = project.userId === userId;
    const isCollaborator = project.accessList.some(
      (a) => a.email === userEmail,
    );

    if (!isOwner && !isCollaborator) {
      throw new ForbiddenException('You do not have permission to access');
    }

    return project;
  }

  async findAll(userId: string, userEmail: string) {
    return this.prisma.project.findMany({
      where: {
        OR: [
          { userId: userId },
          { accessList: { some: { email: userEmail } } },
        ],
      },
      include: {
        accessList: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async saveVersion(
    projectId: string,
    userId: string,
    designData: Prisma.InputJsonValue,
  ) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project)
      throw new NotFoundException('Project not found or you are not the owner');

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
        designData: designData,
      },
    });
  }

  async addCollaborator(projectId: string, ownerId: string, email: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId: ownerId },
      include: { user: true },
    });
    if (!project) {
      throw new ForbiddenException('Only owners can invite collaborators');
    }

    const access = await this.prisma.projectAccess.upsert({
      where: { projectId_email: { projectId, email } },
      update: {},
      create: { projectId, email },
    });

    try {
      await this.mailService.sendInviteEmail(
        email,
        project.name,
        projectId,
        project.user.name || 'A user',
      );
    } catch (err) {
      console.error('Failed to send email:', err);
    }

    return access;
  }

  async getCollaborator(projectId: string, ownerId: string) {
    return this.prisma.projectAccess.findMany({
      where: { projectId, project: { userId: ownerId } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeAccess(accessId: string, ownerId: string) {
    return this.prisma.projectAccess.delete({
      where: {
        id: accessId,
        project: { userId: ownerId },
      },
    });
  }

  async checkAccess(projectId: string, userEmail: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { accessList: true },
    });

    if (!project) {
      throw new NotFoundException('Project does not exist');
    }

    const isOwner = project.userId === userId;
    const isCollaborator = project.accessList.some(
      (a) => a.email === userEmail,
    );

    if (!isOwner && !isCollaborator) {
      throw new ForbiddenException(
        'You do not have permission to access this project',
      );
    }

    return { isOwner };
  }

  async getMessages(projectId: string) {
    return this.prisma.chatMessage.findMany({
      where: { projectId },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
