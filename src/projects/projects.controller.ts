import { Body, Controller, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';

class CreateProjectDto {
  name: string;
  prompt?: string;
  previewUrl?: string;
  publicId?: string;
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }
}
