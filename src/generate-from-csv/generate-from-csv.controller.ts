import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GenerateFromCsvService } from './generate-from-csv.service';

@Controller('generate-from-csv')
export class GenerateFromCsvController {
  constructor(
    private readonly generateFromCsvService: GenerateFromCsvService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    const result =
      await this.generateFromCsvService.uploadGenerateAndSave(file);
    return {
      data: result,
    };
  }
  @Post('day/:date')
  async generateDate(@Param('date') date: string) {
    const res = await this.generateFromCsvService.generateDay(date);
    return res;
  }
}
