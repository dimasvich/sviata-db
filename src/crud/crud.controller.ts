import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CrudService } from './crud.service';
import { Sviato } from './schema/sviato.schema';
import * as crypto from 'crypto';
import { DayRules } from './schema/dayrules.schema';

@Controller('crud')
export class CrudController {
  constructor(private readonly sviatoService: CrudService) {}

  @Post()
  async create(@Body() sviatoData: Partial<Sviato>): Promise<Sviato> {
    return this.sviatoService.create(sviatoData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() sviatoData: Partial<Sviato>,
  ): Promise<Sviato> {
    return this.sviatoService.update(id, sviatoData);
  }

  @Get(':id')
  async getByIds(@Param('id') id: string) {
    return this.sviatoService.getById(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.sviatoService.delete(id);
  }

  @Get('date/:date')
  async getByDate(@Param('date') date: string): Promise<Sviato[]> {
    return this.sviatoService.getByDate(date);
  }

  @Get('sviato-images/:date')
  async getImages(@Param('date') date: string) {
    return this.sviatoService.getImagesByDate(date);
  }
  @Get('day-rules/:date')
  async getRulesByDate(@Param('date') date: string) {
    return this.sviatoService.getRulesByDate(date);
  }
  @Post('day-rules')
  async createDayRules(
    @Body() body: { title: string; html: string; date: Date },
  ) {
    return this.sviatoService.createDayRule(body.title, body.html, body.date);
  }
  @Put('day-rules/:id')
  async updateDayRule(
    @Param('id') id: string,
    @Body() DayRuleData: Partial<DayRules>,
  ): Promise<DayRules> {
    return await this.sviatoService.updateDayRule(id, DayRuleData);
  }
  @Post('images/:id')
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const hash = crypto
            .createHash('sha256')
            .update(file.originalname + Date.now().toString())
            .digest('hex');
          const ext = extname(file.originalname);
          callback(null, `${hash}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const paths = files.map((file) => `${file.filename}`);
    return this.sviatoService.setImagesForDate(id, paths);
  }
}
