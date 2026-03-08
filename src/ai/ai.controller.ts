import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { GeneratePreviewDto } from './dto/generate-preview.dto';
import { buildInteriorPrompt } from './prompt.builder';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-preview')
  async generatePreview(@Body() dto: GeneratePreviewDto) {
    const prompt = buildInteriorPrompt(dto);

    const result = await this.aiService.generateImage(prompt);

    return result;
  }
}
