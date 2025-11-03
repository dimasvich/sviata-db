import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CrudService } from './crud.service';
import { CrudController } from './crud.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sviato, SviatoSchema } from './schema/sviato.schema';
import { DayRules, DayRulesSchema } from './schema/dayrules.schema';
import { SviatoImages, SviatoImagesSchema } from './schema/sviatoimages.schema';
import { ImageProcessingMiddleware } from './image-processing.middleware';
import { SviatoImageProcessingMiddleware } from './sviato-images.middleware';
import { ImageUploadSviato } from './imageUploadSviato.middleware';

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
      .apply(ImageUploadSviato)
      .forRoutes({ path: 'crud/:id', method: RequestMethod.PUT });
    consumer.apply(ImageProcessingMiddleware).forRoutes('crud/images/:id');
    consumer
      .apply(SviatoImageProcessingMiddleware)
      .forRoutes('crud/sviato-images/:id');
  }
}
