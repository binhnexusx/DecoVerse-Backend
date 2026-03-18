import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ProjectsModule } from 'src/projects/projects.module';
import { ModelsModule } from 'src/models/models.module'; // 👈 thêm

@Module({
  imports: [ProjectsModule, ModelsModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
