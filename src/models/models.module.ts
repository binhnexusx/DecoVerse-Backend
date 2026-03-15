import { Module } from '@nestjs/common';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';
import { CloudinaryProvider } from '../config/cloudinary.config';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ModelsController],
  providers: [ModelsService, CloudinaryProvider],
  exports: [ModelsService],
})
export class ModelsModule {}
