import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { GeneratePreviewDto } from './dto/generate-preview.dto';
import { buildInteriorPrompt } from './prompt.builder';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-preview')
  async generatePreview(@Body() dto: GeneratePreviewDto): Promise<unknown> {
    const prompt = buildInteriorPrompt(dto);
    const result: unknown = await this.aiService.generateImage(prompt);
    return result;
  }

  @Post('analyze')
  async analyzeImage(@Body() body: { imageUrl: string }): Promise<unknown> {
    const result: unknown = await this.aiService.analyzeImage(body.imageUrl);
    return result;
  }
}
