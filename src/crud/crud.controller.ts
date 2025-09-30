import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CrudService } from './crud.service';
import {
  AddArticlesToSviatoDto,
  CreateSviatoDto,
  UpdateSviatoArticleDto,
  UpdateSviatoDto,
} from './dto/index.dto';

@Controller('crud')
export class CrudController {
  constructor(private readonly crudService: CrudService) {}

  @Post()
  async createSviato(@Body() body: CreateSviatoDto) {
    return await this.crudService.create(body);
  }
  @Post('add-article')
  async addArticle(@Body() body: AddArticlesToSviatoDto) {
    return await this.crudService.addArticleToSviato(body);
  }
  @Put()
  async updateSviato(@Body() body: UpdateSviatoDto) {
    return await this.crudService.update(body);
  }
  @Put('update-article')
  async updateSviatoArticle(@Body() body: UpdateSviatoArticleDto) {
    return await this.crudService.updateSviatoArticle(body);
  }
  @Get('list/:page')
  async get10(@Param('page') page: number) {
    return await this.crudService.get10(page);
  }
  @Get('one/:id')
  async getOne(@Param('id') id: string) {
    return await this.crudService.getOne(id);
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.crudService.delete(id);
  }
}
