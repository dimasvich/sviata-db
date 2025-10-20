import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
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
import { DayInfo } from 'src/types';

@Controller('crud')
export class CrudController {
  constructor(private readonly sviatoService: CrudService) {}

  @Get('by-month')
  async getByMonth(@Query('month') month: string) {
    const monthNum = Number(month);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new Error('Невірний параметр month');
    }
    return this.sviatoService.getByMonth(monthNum);
  }

  @Get('tags')
  async getTags() {
    return this.sviatoService.getTags();
  }

  @Get('day-info')
  async getDayInfo(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('year') year: string,
  ): Promise<DayInfo[]> {
    const y = parseInt(year, 10);
    return this.sviatoService.getDayInfo(start, end, y);
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
    return this.sviatoService.updateDayRule(id, DayRuleData);
  }

  @Post('images/:id')
  async uploadImages(@Param('id') id: string, @Req() req: Request) {
    const images = req['processedImages'];
    if (!images || images.length === 0) {
      throw new BadRequestException('Зображення не завантажено');
    }
    const filenames = images.map((img) => img.filename);
    return this.sviatoService.setImagesForDate(id, filenames);
  }

  @Post()
  async create(@Body() sviatoData: Partial<Sviato>): Promise<Sviato> {
    return this.sviatoService.create(sviatoData);
  }

  @Post('sviato-images/:id')
  async uploadSviatoImage(@Param('id') id: string, @Req() req: Request) {
    const images = req['processedImages'];
    if (!images || images.length === 0) {
      throw new BadRequestException('Зображення не завантажено');
    }
    const filenames = images.map((img) => img.filename);
    return this.sviatoService.addImagesToSviato(id, filenames);
  }

  @Put('update-description')
  async updateOpis(@Body() body: { date: string; description: string }) {
    const { date, description } = body;
    return this.sviatoService.updateDescriptionByDate(date, description);
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
}
