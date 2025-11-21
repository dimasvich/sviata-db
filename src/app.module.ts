import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { BuildDayModule } from './build-day/build-day.module';
import { BuildModule } from './build/build.module';
import { CrudModule } from './crud/crud.module';
import { DayModule } from './day/day.module';
import { GenerateFromCsvModule } from './generate-from-csv/generate-from-csv.module';
import { RelatedArticlesModule } from './related-articles/related-articles.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get('MONGO_LINK');
        return {
          uri,
          dbName: 'svyata-db',
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
    AuthModule,
  ],
  controllers: [],
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: AuthGuard,
  //   },
  // ],
})
export class AppModule {}
