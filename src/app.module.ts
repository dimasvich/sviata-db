import { Module } from '@nestjs/common';
import { CrudModule } from './crud/crud.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
