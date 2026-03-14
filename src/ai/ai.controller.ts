import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { GeneratePreviewDto } from './dto/generate-preview.dto';
import { buildInteriorPrompt } from './prompt.builder';
import { ProjectsService } from 'src/projects/projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

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
    @GetUser('id') userId: string,
  ): Promise<AiGenerationResponse> {
    const prompt = buildInteriorPrompt(dto);

    const result = (await this.aiService.generateImage(
      prompt,
    )) as AiGenerationResponse;

    try {
      await this.projectsService.create({
        name: dto.projectName,
        prompt: dto.prompt ?? '',
        previewUrl: dto.previewUrl,
        publicId: dto.publicId,
        userId: userId,
        designData: {},
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
