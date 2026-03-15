import { IsString, IsOptional, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFurnitureDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  style?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: { value: unknown }) => {
    // Postman gửi tags dạng string "sofa,modern,gray" → parse thành array
    if (typeof value === 'string') {
      return value.split(',').map((t) => t.trim());
    }
    return value;
  })
  tags?: string[];

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}
