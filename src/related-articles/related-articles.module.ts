import { Module } from '@nestjs/common';
import { RelatedArticlesService } from './related-articles.service';
import { RelatedArticlesController } from './related-articles.controller';

@Module({
  providers: [RelatedArticlesService],
  controllers: [RelatedArticlesController]
})
export class RelatedArticlesModule {}
