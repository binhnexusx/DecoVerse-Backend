import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() dto: CreateProjectDto,
    @GetUser('id') userId: string,
  ) {
    return this.projectsService.create({
      ...dto,
      userId,
    });
  }
}
