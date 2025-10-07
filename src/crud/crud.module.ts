import { Module } from '@nestjs/common';
import { CrudService } from './crud.service';
import { CrudController } from './crud.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sviato, SviatoSchema } from './schema/sviato.schema';
import { DayRules, DayRulesSchema } from './schema/dayrules.schema';
import { SviatoImages, SviatoImagesSchema } from './schema/sviatoimages.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sviato.name, schema: SviatoSchema },
      { name: DayRules.name, schema: DayRulesSchema },
      { name: SviatoImages.name, schema: SviatoImagesSchema },
    ]),
  ],
  providers: [CrudService],
  controllers: [CrudController],
})
export class CrudModule {}
