import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSviatoDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @IsString()
  seoText: string;

  @IsString()
  timestamp: string;
}
export class UpdateSviatoDto extends CreateSviatoDto {
  @IsString()
  id: string;
}
export class AddArticlesToSviatoDto {
  @IsString()
  sviatoId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsArray()
  blocks: Array<{
    title?: string;
    description?: string;
    image: string;
    alt?: string;
  }>;

  @IsOptional()
  @IsArray()
  staticList?: string[];
}
export class UpdateSviatoArticleDto extends AddArticlesToSviatoDto {
  @IsString()
  id: string;
}
