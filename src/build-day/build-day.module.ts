import { Module } from '@nestjs/common';
import { BuildDayService } from './build-day.service';
import { BuildDayController } from './build-day.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Day, DaySchema } from 'src/day/schema/day.schema';
import { DayRules, DayRulesSchema } from 'src/crud/schema/dayrules.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Day.name, schema: DaySchema },
      { name: DayRules.name, schema: DayRulesSchema },
    ]),
  ],
  providers: [BuildDayService],
  controllers: [BuildDayController],
})
export class BuildDayModule {}
