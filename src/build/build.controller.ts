import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BuildService } from './build.service';

@Controller('build')
export class BuildController {
  constructor(private readonly buildService: BuildService) {}
  @Post('update-many')
  async updateMany(@Body() body: {fromDate:string, toDate:string}) {
    return await this.buildService.updateMany(body.fromDate, body.toDate);
  }
  @Post('update/:id')
  async updateArticle(@Param('id') id: string) {
    return await this.buildService.update(id);
  }
  @Get('/:id')
  async getArticle(@Param('id') id: string) {
    return await this.buildService.buildArticle(id);
  }
  @Post('/:id')
  async postArticle(@Param('id') id: string) {
    return await this.buildService.publish(id);
  }
  @Delete('/:id')
  async deleteArticle(@Param('id') id: string) {
    return await this.buildService.delete(id);
  }
}
