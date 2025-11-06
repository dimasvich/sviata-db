import { Controller, Get, Param } from '@nestjs/common';
import { RelatedArticlesService } from './related-articles.service';

@Controller('related-articles')
export class RelatedArticlesController {
    constructor (private readonly relatedArticlesService: RelatedArticlesService) {}

    @Get(':link')
    async getId(@Param('link') link:string){
        return await this.relatedArticlesService.findArticleIdByUrl(link)
    }
}
