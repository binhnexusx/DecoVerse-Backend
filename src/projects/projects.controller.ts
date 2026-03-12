import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

class CreateProjectDto {
  name: string;
  prompt: string;
  previewUrl: string;
  publicId: string;
}

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
}
