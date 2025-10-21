import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DayRules, DayRulesDocument } from 'src/crud/schema/dayrules.schema';
import { Sviato, SviatoDocument } from 'src/crud/schema/sviato.schema';
import { SviatoImages } from 'src/crud/schema/sviatoimages.schema';
import { DayRulesEnum } from 'src/types';
import { capitalizeFirstLetter, getNext5YearsForecast } from 'src/utils';
import { html as beautifyHtml } from 'js-beautify';
import * as cheerio from 'cheerio';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';

import axios from 'axios';

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
                                    Чи є вихідний в цей день:
                                </div>
                                <div class="holiday-date__content" bis_skin_checked="1">${sviato.celebrate.isDayoff ? 'Так' : 'Ні'}</div>
                            </div>
                        </div>`;

      const host = process.env.HOST || 'http://104.248.21.126:9000';
      const $ = cheerio.load(content);

      $('img').each((_, el) => {
        const src = $(el).attr('src');
        if (src && !src.startsWith('http')) {
          $(el).attr('src', `${host}/uploads/${id}/${src}`);
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
            <div class="timeline-block__wrapper" bis_skin_checked="1">
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
            </div>
        `,
        'greetings-section': `
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
        </div>`,
        'ideas-section': `
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
        </div>`,
        'rules-section': `<div class="info-block" bis_skin_checked="1">
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
    <div class="content" bis_skin_checked="1">${dayrules.find((item) => item.title === DayRulesEnum.ALLOWED).html}</div>
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
    <div class="content" bis_skin_checked="1">${dayrules.find((item) => item.title === DayRulesEnum.FORBIDDEN).html}</div>
  </div>
</div>
`,
        'facts-section': `<h2 class="wp-block-heading">Цікаві факти про ${sviato.name}</h2><div class="facts-list" bis_skin_checked="1">
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
`,
        'sources-section': `<h2 class="wp-block-heading">Джерела інформації</h2>
        <div class="sources" bis_skin_checked="1">
        ${sviato.sources
          .map(
            (item) => `
            <a href="${item.link}"><span>${item.link}</span></a>
    `,
          )
          .join('')}
               </div> `,
        'related-section': `<h2>Пов’язані події</h2><div data-id="[${sviato.related.map((item) => item)}]"></div>`,
        'moreIdeas-section': `<h2>Більше ідей для привітань дивись у добірках порталу:</h2><div data-id="[${sviato.moreIdeas.map((item) => item)}]"></div>`,
      };
      //data-id="[1,2,3,4,5]"
      const placeholderRegex = /<div\s+data-placeholder="([^"]+)"\s*><\/div>/g;

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
      //    "id": 71810,
      const sviato = await this.sviatoModel.findById(id).lean();
      if (!sviato) throw new Error('Стаття не знайдена');

      const record = await this.sviatoImagesModel
        .findOne({ date: sviato.date })
        .exec();
      const images = record.images;

      const imageDir = path.join(__dirname, '..', '..', 'uploads');
      const imageName = images[0];
      const fullImagePath = path.join(imageDir, imageName);

      const formData = new FormData();
      formData.append('file', fs.createReadStream(fullImagePath), imageName);

      console.log(
        process.env.BASE_URL,
        process.env.APP_USER,
        process.env.APP_PASSWORD,
      );

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
            'Content-Disposition': `attachment; filename="${imageName}"`,
          },
        },
      );

      const mediaId = mediaResponse.data.id;
      console.log('Media uploaded, ID:', mediaId);

      const content = await this.buildArticle(id);
      const postData = {
        title: sviato.title,
        content,
        excerpt: sviato.teaser,
        status: 'publish',
        featured_media: mediaId,
        categories: [567],
        author: 34,
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
      return postResponse.data;
    } catch (error) {
      console.error('Error publishing:', error);
      throw error;
    }
  }
}
