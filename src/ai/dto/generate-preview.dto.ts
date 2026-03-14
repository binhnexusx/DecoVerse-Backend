import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GeneratePreviewDto {
  @IsString()
  projectName: string;

  @IsString()
  roomType: string;

  @IsNumber()
  length: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  previewUrl: string;

  @IsOptional()
  @IsString()
  publicId: string;
}
