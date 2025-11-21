import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrudController } from './crud.controller';
import { CrudService } from './crud.service';
import { DayRulesController } from './day-rules.controller';
import { ImageProcessingMiddleware } from './image-processing.middleware';
import { ImageUploadSvyato } from './imageUploadSvyato.middleware';
import { DayRules, DayRulesSchema } from './schema/dayrules.schema';
import { SviatoSchema, Svyato } from './schema/svyato.schema';
import { SvyatoImageProcessingMiddleware } from './svyato-images.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Svyato.name, schema: SviatoSchema },
      { name: DayRules.name, schema: DayRulesSchema },
    ]),
  ],
  providers: [CrudService],
  controllers: [CrudController, DayRulesController],
})
export class CrudModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ImageUploadSvyato)
      .forRoutes({ path: 'crud/:id', method: RequestMethod.PUT });
    consumer
      .apply(SvyatoImageProcessingMiddleware)
      .forRoutes('crud/svyato-images/:id');
  }
}
