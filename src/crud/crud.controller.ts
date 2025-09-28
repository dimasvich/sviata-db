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
import { CreateSviatoDto, UpdateSviatoDto } from './dto/index.dto';

@Controller('crud')
export class CrudController {
  constructor(private readonly crudService: CrudService) {}

  @Post()
  async createSviato(@Body() body: CreateSviatoDto) {
    return await this.crudService.create(body);
  }
  @Put()
  async updateSviato(@Body() body: UpdateSviatoDto) {
    return await this.crudService.update(body);
  }
  @Get('list/:page')
  async get10(@Param() page: number) {
    return await this.crudService.get10(page);
  }
  @Get('one/:id')
  async getOne(@Param() id: string) {
    return await this.crudService.getOne(id);
  }
  @Delete(':id')
  async delete(@Param() id: string) {
    return await this.crudService.delete(id);
  }
}
