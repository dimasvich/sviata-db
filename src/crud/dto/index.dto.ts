import { IsNumber, IsString } from 'class-validator';

export class CreateSviatoDto {
  @IsString()
  name: string;

  @IsString()
  seoText: string;

  @IsString()
  timestamp: string;
}
export class UpdateSviatoDto extends CreateSviatoDto {
  @IsString()
  id: string;
}
