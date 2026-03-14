import { Body, Param, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { CreateProjectDto } from '../projects/dto/create-projects.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() dto: CreateProjectDto, @GetUser('id') userId: string) {
    return this.projectsService.create({
      ...dto,
      userId,
    });
  }

  @Get()
  async findAll(@GetUser('id') userId: string) {
    return this.projectsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') projectId: string, @GetUser('id') userId: string) {
    return this.projectsService.findOne(projectId, userId);
  }

  @Post(':id/version')
  async createNewVersion(
    @Param('id') projectId: string,
    @Body('designData') designData: any,
    @GetUser('id') userId: string,
  ) {
    return this.projectsService.saveVersion(projectId, userId, designData);
  }
}
