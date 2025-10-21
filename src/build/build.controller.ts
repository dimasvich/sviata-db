import { Controller, Get, Param, Post } from '@nestjs/common';
import { BuildService } from './build.service';

@Controller('build')
export class BuildController {
  constructor(private readonly buildService: BuildService) {}
  @Get('/:id')
  async getArticle(@Param('id') id: string) {
    return await this.buildService.buildArticle(id);
  }
  @Post('/:id')
  async postArticle(@Param('id') id: string) {
    return await this.buildService.publish(id);
  }
}
