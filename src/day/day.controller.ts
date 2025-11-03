import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { DayService } from './day.service';

@Controller('day')
export class DayController {
  constructor(private readonly dayService: DayService) {}

  @Get('by-month')
  async getByMonth(@Query('month') month: string) {
    const monthNum = Number(month);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new Error('Невірний параметр month');
    }
    return this.dayService.getByMonth(monthNum);
  }

  @Get('status-by-year')
  async getStatusByYear(@Query('year') year: string) {
    const yearNum = Number(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      throw new BadRequestException('Невірний параметр year');
    }
    return this.dayService.getStatusByYear(yearNum);
  }

  @Get('status-by-month')
  async getStatusByMonth(@Query('month') month: string) {
    const monthNum = Number(month);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new Error('Невірний параметр month');
    }
    return this.dayService.getStatusByMonth(monthNum);
  }

  @Post('images/:date')
  async uploadImages(@Param('date') date: string, @Req() req: Request) {
    const images = req['processedImages'];
    if (!images || images.length === 0) {
      throw new BadRequestException('Зображення не завантажено');
    }
    return { status: true };
  }
  @Put(':date')
  async update(@Param('date') date: string, @Req() req, @Res() res) {
    const { processedImages, mainImagePath } = req;
    const dayData = JSON.parse(req.body.dayData);

    if (processedImages?.length) {
      dayData.whoWasBornToday = dayData.whoWasBornToday.map((person) => {
        const match = processedImages.find(
          (img) => img.filename === person.image,
        );
        return match ? { ...person, imagePath: match.path } : person;
      });
    }

    if (mainImagePath) {
      dayData.mainImage = mainImagePath;
    }

    const updated = await this.dayService.update(date, dayData);
    return res.json(updated);
  }

  @Get(':date')
  async getByIds(@Param('date') date: string) {
    return this.dayService.getDay(date);
  }
}
