import { Module } from '@nestjs/common';
import { CrudService } from './crud.service';
import { CrudController } from './crud.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sviato, SviatoSchema } from './schema/sviato.schema';
import {
  SviatoArticle,
  SviatoArticleSchema,
} from './schema/sviato-article.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sviato.name, schema: SviatoSchema },
      { name: SviatoArticle.name, schema: SviatoArticleSchema },
    ]),
  ],
  providers: [CrudService],
  controllers: [CrudController],
})
export class CrudModule {}
