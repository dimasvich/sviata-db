import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BuildDayService } from './build-day.service';

@Controller('build-day')
export class BuildDayController {
  constructor(private readonly buildService: BuildDayService) {}
  //   @Post('update/:id')
  //   async updateArticle(@Param('id') id: string) {
  //     return await this.buildService.update(id);
  //   }
  @Get('/:date')
  async getArticle(@Param('date') date: string) {
    return await this.buildService.buildArticle(date);
  }
  @Post('/:id')
  async postArticle(@Param('id') id: string) {
    return await this.buildService.publish(id);
  }
  //   @Delete('/:id')
  //   async deleteArticle(@Param('id') id: string) {
  //     return await this.buildService.delete(id);
  //   }
}
