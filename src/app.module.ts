import { Module } from '@nestjs/common';
import { CrudModule } from './crud/crud.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RelatedArticlesModule } from './related-articles/related-articles.module';
import { BuildModule } from './build/build.module';
import { GenerateFromCsvModule } from './generate-from-csv/generate-from-csv.module';
import { DayModule } from './day/day.module';
import { BuildDayModule } from './build-day/build-day.module';
import { JwtModule } from './jwt/jwt.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './jwt/jwt.guard';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get('MONGO_LINK');
        return {
          uri,
          dbName: 'sviata-db',
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'out'),
      exclude: ['/api*'],
    }),
    CrudModule,
    RelatedArticlesModule,
    BuildModule,
    GenerateFromCsvModule,
    DayModule,
    BuildDayModule,
    JwtModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
