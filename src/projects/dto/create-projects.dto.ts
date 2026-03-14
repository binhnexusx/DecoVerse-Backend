import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsString()
  previewUrl: string;

  @IsString()
  publicId: string;

  @IsNotEmpty()
  designData: any;
}
