import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RelatedArticlesService {
  async findArticleIdByUrl(link: string) {
    try {
      const url = new URL(link);

      const slug = url.pathname.replace(/\/$/, '');
      const endpoint = `/posts?slug=${slug.replaceAll('/', '')}`;
      const id = await axios.get(
        `${process.env.BASE_URL}/${endpoint}`,
        {
          auth: {
            username: process.env.APP_USER,
            password: process.env.APP_PASSWORD,
          },
        },
      );
      return id;
    } catch (error) {
      throw error;
    }
  }
}
