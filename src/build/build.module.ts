import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DayRules, DayRulesSchema } from 'src/crud/schema/dayrules.schema';
import { SviatoSchema, Svyato } from 'src/crud/schema/svyato.schema';
import { BuildController } from './build.controller';
import { BuildService } from './build.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Svyato.name, schema: SviatoSchema },
      { name: DayRules.name, schema: DayRulesSchema },
    ]),
  ],
  providers: [BuildService],
  controllers: [BuildController],
})
export class BuildModule {}
