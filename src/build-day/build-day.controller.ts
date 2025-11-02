import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BuildDayService } from './build-day.service';

@Controller('build-day')
export class BuildDayController {
  constructor(private readonly buildService: BuildDayService) {}
  @Post('update/:date')
  async updateArticle(@Param('date') date: string) {
    return await this.buildService.update(date);
  }
  @Get('/:date')
  async getArticle(@Param('date') date: string) {
    return await this.buildService.buildArticle(date);
  }
  @Post('/:date')
  async postArticle(@Param('date') date: string) {
    return await this.buildService.publish(date);
  }
  //   @Delete('/:id')
  //   async deleteArticle(@Param('id') id: string) {
  //     return await this.buildService.delete(id);
  //   }
}
