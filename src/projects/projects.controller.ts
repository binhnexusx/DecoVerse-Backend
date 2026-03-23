import {
  Body,
  Param,
  Controller,
  Get,
  Post,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { CreateProjectDto } from '../projects/dto/create-projects.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('count/collaborations')
  async getCount(@GetUser('id') userId: string) {
    return this.projectsService.getCollaborationCount(userId);
  }

  @Post()
  async create(@Body() dto: CreateProjectDto, @GetUser('id') userId: string) {
    return this.projectsService.create({
      ...dto,
      userId,
    });
  }

  @Get()
  async findAll(
    @GetUser('id') userId: string,
    @GetUser('email') userEmail: string,
  ) {
    return this.projectsService.findAll(userId, userEmail);
  }

  @Get(':id')
  async findOne(
    @Param('id') projectId: string,
    @GetUser('id') userId: string,
    @GetUser('email') userEmail: string,
  ) {
    return this.projectsService.findOne(projectId, userId, userEmail);
  }

  @Post(':id/version')
  async createNewVersion(
    @Param('id') projectId: string,
    @Body('designData') designData: any,
    @GetUser('id') userId: string,
  ) {
    return this.projectsService.saveVersion(projectId, userId, designData);
  }

  @Post(':id/share')
  async addCollaborate(
    @Param('id') projectId: string,
    @GetUser('id') userId: string,
    @Body('email') email: string,
  ) {
    return this.projectsService.addCollaborator(projectId, userId, email);
  }

  @Get(':id/collaborators')
  async getCollaborators(
    @Param('id') projectId: string,
    @GetUser('id') userId: string,
  ) {
    return this.projectsService.getCollaborator(projectId, userId);
  }

  @Delete('share/:accessId')
  async revokeAccess(
    @Param('accessId') accessId: string,
    @GetUser('id') userId: string,
  ) {
    return this.projectsService.revokeAccess(accessId, userId);
  }

  @Get(':id/messages')
  async getMessages(@Param('id') projectId: string) {
    return this.projectsService.getMessages(projectId);
  }
}
