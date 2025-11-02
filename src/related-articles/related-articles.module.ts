import { Module } from '@nestjs/common';
import { RelatedArticlesService } from './related-articles.service';

@Module({
  providers: [RelatedArticlesService]
})
export class RelatedArticlesModule {}
