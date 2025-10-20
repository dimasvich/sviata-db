import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CrudService } from './crud.service';
import { CrudController } from './crud.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sviato, SviatoSchema } from './schema/sviato.schema';
import { DayRules, DayRulesSchema } from './schema/dayrules.schema';
import { SviatoImages, SviatoImagesSchema } from './schema/sviatoimages.schema';
import { ImageProcessingMiddleware } from './image-processing.middleware';

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
export class CrudModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ImageProcessingMiddleware)
      .forRoutes('crud/sviato-images/:id', 'crud/images/:id');
  }
}
