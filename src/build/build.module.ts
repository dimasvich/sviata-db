import { Module } from '@nestjs/common';
import { BuildService } from './build.service';
import { BuildController } from './build.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sviato, SviatoSchema } from 'src/crud/schema/sviato.schema';
import { DayRules, DayRulesSchema } from 'src/crud/schema/dayrules.schema';
import { SviatoImages, SviatoImagesSchema } from 'src/crud/schema/sviatoimages.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sviato.name, schema: SviatoSchema },
      { name: DayRules.name, schema: DayRulesSchema },
      { name: SviatoImages.name, schema: SviatoImagesSchema },
    ]),
  ],
  providers: [BuildService],
  controllers: [BuildController],
})
export class BuildModule {}
