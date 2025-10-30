import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DayController } from './day.controller';
import { DayService } from './day.service';
import { Day, DaySchema } from './schema/day.schema';
import { WhoWasBornImageMiddleware } from './whoWasBornImage.middleware';
import { MonthlyImageProcessingMiddleware } from './monthlyImageProcessingMiddleware';

@Module({
  imports: [MongooseModule.forFeature([{ name: Day.name, schema: DaySchema }])],
  providers: [DayService],
  controllers: [DayController],
})
export class DayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(WhoWasBornImageMiddleware)
      .forRoutes({ path: 'day/:date', method: RequestMethod.PUT });
    consumer
      .apply(MonthlyImageProcessingMiddleware)
      .forRoutes({ path: 'day/images/:date', method: RequestMethod.POST });
  }
}
