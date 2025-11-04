import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as cheerio from 'cheerio';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { html as beautifyHtml } from 'js-beautify';
import { Model } from 'mongoose';
import * as path from 'path';
import { DayRules, DayRulesDocument } from 'src/crud/schema/dayrules.schema';
import { Sviato, SviatoDocument } from 'src/crud/schema/sviato.schema';
import { SviatoImages } from 'src/crud/schema/sviatoimages.schema';
import { DayRulesEnum, SviatoTagToIdMap } from 'src/types';
import {
  capitalizeFirstLetter,
  getNext5YearsForecast,
  removeBisSkinChecked,
} from 'src/utils';

import axios from 'axios';
import * as dayjs from 'dayjs';

@Injectable()
export class BuildService {
  constructor(
    @InjectModel(Sviato.name) private sviatoModel: Model<SviatoDocument>,
    @InjectModel(SviatoImages.name)
    private sviatoImagesModel: Model<SviatoImages>,
    @InjectModel(DayRules.name) private dayRulesModel: Model<DayRulesDocument>,
  ) {}

  async buildArticle(id: string): Promise<string> {
    try {
      const sviato = await this.sviatoModel.findById(id).lean();
      if (!sviato || !sviato.seoText) {
        throw new Error('Стаття не знайдена або відсутній seoText');
      }
      const dayrules = await this.dayRulesModel.find({ date: sviato.date });
      let content = sviato.seoText;
      const next5 = getNext5YearsForecast(sviato.date);
      const celebrateBlock = `<div class="holiday-date" bis_skin_checked="1">
                            <div class="holiday-date__block" bis_skin_checked="1">
                                <div class="holiday-date__head" bis_skin_checked="1">
                                    <img src="/wp-content/themes/gosta/img/holiday/icon__holiday-date-1.svg" alt="Icon" width="20" height="20" loading="lazy" decoding="async">
                                    Коли святкують:
                                </div>
                                <div class="holiday-date__content" bis_skin_checked="1">${sviato.celebrate.when}</div>
                            </div>
                            <div class="holiday-date__block" bis_skin_checked="1">
                                <div class="holiday-date__head" bis_skin_checked="1">
                                    <img src="/wp-content/themes/gosta/img/holiday/icon__holiday-date-2.svg" alt="Icon" width="20" height="20" loading="lazy" decoding="async">
                                    Коли започатковане:
                                </div>
                                <div class="holiday-date__content" bis_skin_checked="1">${sviato.celebrate.date}</div>
                            </div>
                            <div class="holiday-date__block" bis_skin_checked="1">
                                <div class="holiday-date__head" bis_skin_checked="1">
                                    <img src="/wp-content/themes/gosta/img/holiday/icon__holiday-date-3.svg" alt="Icon" width="20" height="20" loading="lazy" decoding="async">
                                    Чи вихідний цей день:
                                </div>
                                <div class="holiday-date__content" bis_skin_checked="1">${sviato.celebrate.isDayoff ? 'Так' : 'Ні'}</div>
                            </div>
                        </div>`;

      const host = process.env.HOST || 'https://gosta.ua/wp-content/uploads';
      const $ = cheerio.load(content);
      const figureStart = `<figure class="wp-block-image size-full">`;
      const figureEnd = `</figure>`;

      $('p').each((_, el) => {
        const $el = $(el);
        const innerHtml = $el.html() ? $el.html().trim() : '';

        // 1) випадок: реальне <img> як єдиний дочірній елемент
        const isRealImgOnly =
          $el.children().length === 1 &&
          $el.children('img').length === 1 &&
          !$el.text().trim();

        if (isRealImgOnly) {
          $el.replaceWith(innerHtml);
          return;
        }

        // 2) випадок: всередині лежить екранований HTML, наприклад &lt;img ... /&gt;
        // Просте декодування поширених entities (якщо є 'he' - краще використати його)
        const decoded = innerHtml
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          // WARNING: заміна &amp; може бути ризикована, але зазвичай потрібна для правильної декодув.
          .replace(/&amp;/g, '&');

        // регулярка дозволяє варіанти: <img...> або <a...><img...></a>
        const imgOrAnchorImg = /^(?:<a[^>]*>\s*)?<img[\s\S]+?>(?:\s*<\/a>)?$/i;

        if (decoded && imgOrAnchorImg.test(decoded.trim())) {
          // вставляємо декодований HTML (Cheerio сам його розпарсить як HTML)
          $el.replaceWith(decoded);
          return;
        }

        // інші випадки — не чіпаємо
      });
      $('img').each((_, el) => {
        const $el = $(el);
        const src = $el.attr('src');

        if (src && !src.startsWith('http')) {
          const newSrc = `${host}/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${src.replaceAll(' ', '_').replaceAll(',', '')}`;
          $el.attr('src', newSrc.replace('wepb', 'webp'));
        }

        if (!$el.parent().is('figure')) {
          $el.wrap(figureStart + figureEnd);
        }
      });

      content = $.html();

      const blockTemplates: Record<string, string> = {
        'when-section-title': `<h1>В який день будемо відзначати ${sviato.name} в наступні 5 років</h1>`,
        'when-section': `<figure class="wp-block-table">
            <table class="has-fixed-layout">
                <thead>
                <tr>
                    <th>Рік</th>
                    <th>Дата</th>
                    <th>День</th>
                </tr>
                </thead>
                <tbody>
                            ${next5
                              .map(
                                (item) => `
                                <tr>
                                    <td>${item.year}</td>
                                    <td>${item.date}</td>
                                    <td>${capitalizeFirstLetter(item.weekday)}</td>
                                </tr>
                                `,
                              )
                              .join('')}
                </tbody>
            </table>
            </figure>
            `,
        'timeline-section': `
            ${
              sviato?.timeline
                ? `<div class="timeline-block__wrapper" bis_skin_checked="1">
            <div class="timeline-block" bis_skin_checked="1">
                ${sviato.timeline
                  .map(
                    (item) => `
                    <div class="item-block" bis_skin_checked="1">
                        <div class="item" bis_skin_checked="1">
                        <div class="date" bis_skin_checked="1">${item.year}</div>
                        <div class="text" bis_skin_checked="1">${item.html}</div>
                        </div>
                    </div>
                    `,
                  )
                  .join('')}
            </div>
            </div>`
                : ''
            }
        `,
        'greetings-section': sviato?.greetings
          ? `
        <h2 class="wp-block-heading">Короткі привітання</h2><div class="greetings-list" bis_skin_checked="1">
                  ${sviato.greetings
                    .map(
                      (item) => `  <div class="item" bis_skin_checked="1">
                    ${item}
                    <div
                    class="btn-copy"
                    data-text="${item.replaceAll('<b>', '').replaceAll('<i>', '').replaceAll('</b>', '').replaceAll('</i>', '')}"
                    bis_skin_checked="1"
                    ></div>
                </div>`,
                    )
                    .join('')}
        </div>`
          : '',
        'ideas-section': sviato?.ideas
          ? `
        <h2 class="wp-block-heading">Ідеї для постів і листів</h2><div class="greetings-list" bis_skin_checked="1">
                  ${sviato.ideas
                    .map(
                      (item) => `  <div class="item" bis_skin_checked="1">
                    ${item}
                    <div
                    class="btn-copy"
                    data-text="${item.replaceAll('<b>', '').replaceAll('<i>', '').replaceAll('</b>', '').replaceAll('</i>', '')}"
                    bis_skin_checked="1"
                    ></div>
                </div>`,
                    )
                    .join('')}
        </div>`
          : '',
        'rules-section': dayrules
          ? `<div class="info-block" bis_skin_checked="1">
  <div class="block" bis_skin_checked="1">
    <div class="head" bis_skin_checked="1">
      Що варто зробити
      <img
        class="icon"
        src="/wp-content/themes/gosta/img/holiday/icon__top-plus.svg"
        width="109"
        height="116"
        alt="Icon"
        loading="lazy"
        decoding="async"
      />
    </div>
    <div class="content" bis_skin_checked="1">${dayrules.find((item) => item.title === DayRulesEnum.ALLOWED)?.html || ''}</div>
  </div>
  <div class="block minus" bis_skin_checked="1">
    <div class="head" bis_skin_checked="1">
      Чого краще уникати
      <img
        class="icon"
        src="/wp-content/themes/gosta/img/holiday/icon__top-minus.svg"
        width="109"
        height="116"
        alt="Icon"
        loading="lazy"
        decoding="async"
      />
    </div>
    <div class="content" bis_skin_checked="1">${dayrules.find((item) => item.title === DayRulesEnum.FORBIDDEN)?.html || ''}</div>
  </div>
</div>
`
          : '',
        'facts-section': sviato.facts
          ? `<h2 class="wp-block-heading">Цікаві факти про ${sviato.name}</h2><div class="facts-list" bis_skin_checked="1">
      ${sviato.facts
        .map(
          (item) => `  
            <div class="item" bis_skin_checked="1">
          <div class="icon" bis_skin_checked="1">
      <img
        src="/wp-content/themes/gosta/img/holiday/icon__fact.svg"
        width="32"
        height="32"
        loading="lazy"
        decoding="async"
        alt="Icon"
      />
    </div>
    ${item.replaceAll('<p>', '').replaceAll('</p>', '')}
  </div>`,
        )
        .join('')}

</div>
`
          : '',
        'sources-section': sviato?.sources
          ? `<h2 class="wp-block-heading">Джерела інформації</h2>
        <div class="sources" bis_skin_checked="1">
        ${sviato.sources
          .map(
            (item) => `
            <a href="${item.link}"><span>${item.link}</span></a>
    `,
          )
          .join('')}
               </div> `
          : '',
        'related-section': sviato?.related
          ? `<h2>Пов’язані події</h2><div class="related" data-id="[${sviato.related.map((item) => item)}]"></div>`
          : '',
        'moreIdeas-section': sviato?.moreIdeas
          ? `<h2>Більше ідей для привітань дивись у добірках порталу:</h2><div class="moreIdeas" data-id="[${sviato.moreIdeas.map((item) => item)}]"></div>`
          : '',
      };

      const placeholderRegex =
        /<div\s+data-placeholder="([^"]+)"[^>]*>[\s\S]*?<\/div>/g;

      content = content.replace(placeholderRegex, (_, key) => {
        return blockTemplates[key] || `<p>[Невідомий блок: ${key}]</p>`;
      });
      content = content
        .replaceAll('<b>', '<strong>')
        .replaceAll('</b>', '</strong>');

      content = content.replace(
        /<h2([^>]*)>(.*?)<\/h2>/g,
        (match, attrs, innerText) => {
          let newAttrs = attrs
            .replace(/\s*class="[^"]*"/, '')
            .replace(/\s*id="[^"]*"/, '')
            .trim();

          return `<h2 ${newAttrs ? newAttrs + ' ' : ''}class="wp-block-heading" >${innerText}</h2>`;
        },
      );
      content = removeBisSkinChecked(content);

      content = beautifyHtml(content, {
        indent_size: 2,
        preserve_newlines: true,
        content_unformatted: ['pre', 'code', 'textarea'],
      });
      content = content
        .replaceAll('<html>', '')
        .replaceAll('</html>', '')
        .replaceAll('<head>', '')
        .replaceAll('</head>', '')
        .replaceAll('<body>', '')
        .replaceAll('</body>', '');
      content = celebrateBlock + content;
      return content.replaceAll('\n', '');
    } catch (error) {
      console.error('❌ Помилка збірки статті:', error);
      throw error;
    }
  }
  async publish(id: string) {
    try {
      const sviato = await this.sviatoModel.findById(id).lean();
      if (!sviato) throw new Error('Стаття не знайдена');

      const mainImage = sviato.mainImage;

      const imageDir1 = path.join(__dirname, '..', '..', 'uploads', id, 'main');
      const imageName1 = mainImage;
      const fullImagePath1 = path.join(imageDir1, imageName1);

      const formData = new FormData();
      formData.append('file', fs.createReadStream(fullImagePath1), imageName1);

      const mediaResponse = await axios.post(
        `${process.env.BASE_URL}/media`,
        formData,
        {
          auth: {
            username: process.env.APP_USER,
            password: process.env.APP_PASSWORD,
          },
          headers: {
            ...formData.getHeaders(),
            'Content-Disposition': `attachment; filename="${imageName1}"`,
          },
        },
      );

      const mediaId = mediaResponse.data.id;
      console.log('Media uploaded, ID:', mediaId);

      const imageDir2 = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        sviato._id.toString(),
      );

      if (!fs.existsSync(imageDir2)) {
        throw new Error(`Папка ${imageDir2} не існує`);
      }
      const imageFiles = fs
        .readdirSync(imageDir2)
        .filter((f) => /\.(webp)$/i.test(f));

      if (imageFiles.length > 0) {
        const results = [];

        for (const imageName of imageFiles) {
          const safeImageName = imageName.replaceAll(' ', '_');
          const fullImagePath2 = path.join(imageDir2, imageName);

          const formData = new FormData();
          formData.append(
            'file',
            fs.createReadStream(fullImagePath2),
            safeImageName,
          );

          try {
            const mediaResponse2 = await axios.post(
              `${process.env.BASE_URL}/media`,
              formData,
              {
                auth: {
                  username: process.env.APP_USER,
                  password: process.env.APP_PASSWORD,
                },
                headers: {
                  ...formData.getHeaders(),
                  'Content-Disposition': `attachment; filename="${safeImageName}"`,
                },
              },
            );

            results.push({
              file: imageName,
              status: 'ok',
              response: mediaResponse2.data,
            });

            console.log(`✅ ${imageName} завантажено успішно`);
          } catch (error) {
            console.error(
              `❌ Помилка при завантаженні ${imageName}:`,
              error.message,
            );
            results.push({
              file: imageName,
              status: 'error',
              error: error.message,
            });
          }
        }
      }
      const tags = sviato.tags.map((item) => SviatoTagToIdMap[item]);
      const holiday_date = [
        sviato.date,
        `${new Date(sviato.date).getFullYear() + 1}-${dayjs(sviato.date).format('MM-DD')}`,
        `${new Date(sviato.date).getFullYear() + 2}-${dayjs(sviato.date).format('MM-DD')}`,
      ];
      const content = await this.buildArticle(id);
      const postData = {
        title: sviato.name,
        content,
        excerpt: sviato.teaser,
        status: 'publish',
        featured_media: mediaId,
        categories: [12771],
        tags,
        meta: {
          holiday_date,
        },
        seofo_title: sviato.title,
        seofo_description: sviato.description
          .replaceAll('<p>', '')
          .replaceAll('</p>', '')
          .replaceAll('<strong>', '')
          .replaceAll('</strong>', ''),
      };

      const postResponse = await axios.post(
        `${process.env.BASE_URL}/posts`,
        postData,
        {
          auth: {
            username: process.env.APP_USER,
            password: process.env.APP_PASSWORD,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Post created:', postResponse.data);
      await this.sviatoModel.findByIdAndUpdate(id, {
        articleId: postResponse.data.id,
        link: postResponse.data.link,
      });

      return postResponse.data;
    } catch (error) {
      console.error('Error publishing:', error);
      throw error;
    }
  }
  async update(id: string) {
    try {
      const sviato = await this.sviatoModel.findById(id).lean();
      if (!sviato) throw new Error('Стаття не знайдена');
      const content = await this.buildArticle(id);
      const mainImage = sviato.mainImage;

      const imageDir1 = path.join(__dirname, '..', '..', 'uploads', id, 'main');
      const imageName1 = mainImage;
      const fullImagePath1 = path.join(imageDir1, imageName1);

      const formData = new FormData();
      formData.append('file', fs.createReadStream(fullImagePath1), imageName1);

      const mediaResponse = await axios.post(
        `${process.env.BASE_URL}/media`,
        formData,
        {
          auth: {
            username: process.env.APP_USER,
            password: process.env.APP_PASSWORD,
          },
          headers: {
            ...formData.getHeaders(),
            'Content-Disposition': `attachment; filename="${imageName1}"`,
          },
        },
      );

      const mediaId = mediaResponse.data.id;
      console.log('Media uploaded, ID:', mediaId);
      const postData = {
        content,
        categories: [12771],
        featured_media: mediaId,
        title: sviato.name,
      };
      const imageDir2 = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        sviato._id.toString(),
      );

      if (!fs.existsSync(imageDir2)) {
        throw new Error(`Папка ${imageDir2} не існує`);
      }
      const imageFiles = fs
        .readdirSync(imageDir2)
        .filter((f) => /\.(webp)$/i.test(f));

      if (imageFiles.length > 0) {
        const results = [];

        for (const imageName of imageFiles) {
          const safeImageName = imageName.replaceAll(' ', '_');
          const fullImagePath2 = path.join(imageDir2, imageName);

          const formData = new FormData();
          formData.append(
            'file',
            fs.createReadStream(fullImagePath2),
            safeImageName,
          );

          try {
            const mediaResponse2 = await axios.post(
              `${process.env.BASE_URL}/media`,
              formData,
              {
                auth: {
                  username: process.env.APP_USER,
                  password: process.env.APP_PASSWORD,
                },
                headers: {
                  ...formData.getHeaders(),
                  'Content-Disposition': `attachment; filename="${safeImageName}"`,
                },
              },
            );

            results.push({
              file: imageName,
              status: 'ok',
              response: mediaResponse2.data,
            });

            console.log(`✅ ${imageName} завантажено успішно`);
          } catch (error) {
            console.error(
              `❌ Помилка при завантаженні ${imageName}:`,
              error.message,
            );
            results.push({
              file: imageName,
              status: 'error',
              error: error.message,
            });
          }
        }
      }
      const postResponse = await axios.post(
        `${process.env.BASE_URL}/posts/${sviato.articleId}`,
        postData,
        {
          auth: {
            username: process.env.APP_USER,
            password: process.env.APP_PASSWORD,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Post updated:', postResponse.data);
      await this.sviatoModel.findByIdAndUpdate(id, {
        articleId: postResponse.data.id,
        link: postResponse.data.link,
      });
      return postResponse.data;
    } catch (error) {
      throw error;
    }
  }
  async delete(id: string) {
    try {
      const sviato = await this.sviatoModel.findById(id).lean();
      if (!sviato) throw new Error('Стаття не знайдена');
      const postResponse = await axios.delete(
        `${process.env.BASE_URL}/posts/${sviato.articleId}`,
        {
          auth: {
            username: process.env.APP_USER,
            password: process.env.APP_PASSWORD,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Post deleted:', postResponse.data);
      return postResponse.data;
    } catch (error) {
      throw error;
    }
  }
}
