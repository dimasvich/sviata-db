import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSviatoDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  teaser: string;

  @IsString()
  seoText: string;

  @IsString()
  date: string;
}
export class UpdateSviatoDto extends CreateSviatoDto {
  @IsString()
  id: string;
}
