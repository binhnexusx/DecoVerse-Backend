import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { GeneratePreviewDto } from './dto/generate-preview.dto';
import { buildInteriorPrompt } from './prompt.builder';
import { ProjectsService } from 'src/projects/projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AiGenerationResponse {
  imageUrl: string;
  publicId: string;
}

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly projectsService: ProjectsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate-preview')
  async generatePreview(
    @Body() dto: GeneratePreviewDto,
  ): Promise<AiGenerationResponse> {
    const prompt = buildInteriorPrompt(dto);

    const result = (await this.aiService.generateImage(
      prompt,
    )) as AiGenerationResponse;
    return result;
  }

  @Post('analyze')
  async analyzeImage(@Body() body: { imageUrl: string }): Promise<unknown> {
    const result: unknown = await this.aiService.analyzeImage(body.imageUrl);
    return result;
  }
}
