import { Body, Controller, Get, Param, Put, Req, Res } from '@nestjs/common';
import { Day } from './schema/day.schema';
import { DayService } from './day.service';

@Controller('day')
export class DayController {
  constructor(private readonly dayService: DayService) {}

  @Put(':date')
  async update(@Param('date') date: string, @Req() req, @Res() res) {
    const { processedImages } = req;
    const dayData = JSON.parse(req.body.dayData);

    if (processedImages?.length) {
      dayData.whoWasBornToday = dayData.whoWasBornToday.map((person) => {
        const match = processedImages.find(
          (img) => img.filename === person.image,
        );
        return match ? { ...person, imagePath: match.path } : person;
      });
    }

    const updated = await this.dayService.update(date, dayData);
    return res.json(updated);
  }

  @Get(':date')
  async getByIds(@Param('date') date: string) {
    return this.dayService.getDay(date);
  }
}
