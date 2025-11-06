import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CrudService } from './crud.service';
import { DayRules } from './schema/dayrules.schema';

@Controller('day-rules')
export class DayRulesController {
  constructor(private readonly sviatoService: CrudService) {}

  @Get(':date')
  getRulesByDate(@Param('date') date: string) {
    return this.sviatoService.getRulesByDate(date);
  }

  @Post()
  createDayRules(@Body() body: { title: string; html: string; date: Date }) {
    return this.sviatoService.createDayRule(body.title, body.html, body.date);
  }

  @Put(':id')
  updateDayRule(@Param('id') id: string, @Body() body: Partial<DayRules>) {
    return this.sviatoService.updateDayRule(id, body);
  }
}
