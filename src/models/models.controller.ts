import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ModelsService } from './models.service';
import { CreateFurnitureDto } from './dto/create-furniture.dto';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('model', {
      storage: memoryStorage(),
      limits: { fileSize: 100 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ext = '.' + file.originalname.split('.').pop()?.toLowerCase();
        if (['.glb', '.gltf'].includes(ext)) cb(null, true);
        else
          cb(
            new BadRequestException('Only .glb and .gltf files are allowed'),
            false,
          );
      },
    }),
  )
  async uploadModel(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateFurnitureDto,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.modelsService.uploadAndSave(file, dto);
  }

  @Get()
  async findAll(@Query('category') category?: string) {
    return this.modelsService.findAll(category);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.modelsService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.modelsService.remove(id);
    return { message: 'Deleted successfully' };
  }
}
