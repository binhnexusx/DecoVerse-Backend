import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { GeneratePreviewDto } from './dto/generate-preview.dto';
import { buildInteriorPrompt } from './prompt.builder';
import { ProjectsService } from 'src/projects/projects.service';

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

  @Post('generate-preview')
  async generatePreview(
    @Body() dto: GeneratePreviewDto,
  ): Promise<AiGenerationResponse> {
    const prompt = buildInteriorPrompt(dto);

    const result = (await this.aiService.generateImage(
      prompt,
    )) as AiGenerationResponse;

    try {
      await this.projectsService.create({
        name: dto.projectName,
        prompt,
        previewUrl: result.imageUrl,
        publicId: result.publicId,
      });
    } catch (err) {
      console.error('Failed to save project:', err);
    }

    return result;
  }

  @Post('analyze')
  async analyzeImage(@Body() body: { imageUrl: string }): Promise<unknown> {
    const result: unknown = await this.aiService.analyzeImage(body.imageUrl);
    return result;
  }
}
