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
  Res,
} from '@nestjs/common';
import { DayInfo } from 'src/types';
import { CrudService } from './crud.service';
import { DayRules } from './schema/dayrules.schema';
import { Svyato } from './schema/svyato.schema';

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

  @Get('search')
  async searchByName(@Query('query') query: string) {
    if (!query || query.trim() === '') {
      throw new BadRequestException('Параметр "query" є обов’язковим');
    }

    return this.sviatoService.searchByName(query.trim());
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
  async getByDate(@Param('date') date: string): Promise<Svyato[]> {
    return this.sviatoService.getByDate(date);
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
  async create(@Body() sviatoData: Partial<Svyato>): Promise<Svyato> {
    return this.sviatoService.create(sviatoData);
  }

  @Post('svyato-images/:id')
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
    @Req() req,
    @Res() res,
  ): Promise<Svyato> {
    const { processedImages, mainImagesPath, leafletsPath, newSeoText } = req;
    const svyatoData = JSON.parse(req.body.svyatoData);

    if (processedImages?.length) {
      svyatoData.images = processedImages.map((img) => img.filename);
    }

    if (leafletsPath?.length) {
      svyatoData.leaflets = leafletsPath
    }

    if (mainImagesPath?.length) {
      svyatoData.mainImage = mainImagesPath[0];
    }
    if (newSeoText) {
      svyatoData.seoText = newSeoText;
    }
    const updated = await this.sviatoService.update(id, svyatoData);
    return res.json(updated);
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
