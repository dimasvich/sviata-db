import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as cheerio from 'cheerio';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { html as beautifyHtml } from 'js-beautify';
import { Model, Types } from 'mongoose';
import * as path from 'path';
import { DayRules, DayRulesDocument } from 'src/crud/schema/dayrules.schema';
import { Sviato, SviatoDocument } from 'src/crud/schema/sviato.schema';
import { SviatoImages } from 'src/crud/schema/sviatoimages.schema';
import { DayRulesEnum, SviatoTagToIdMap } from 'src/types';
import {
  capitalizeFirstLetter,
  convertYouTubeLinks,
  getNext5YearsForecast,
  groupSequentialImages,
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
      const celebrateBlock = sviato?.celebrate
        ? `<div class="holiday-date" bis_skin_checked="1">
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
                                    Започатковане:
                                </div>
                                <div class="holiday-date__content" bis_skin_checked="1">${sviato.celebrate.date}</div>
                            </div>
                            <div class="holiday-date__block" bis_skin_checked="1">
                                <div class="holiday-date__head" bis_skin_checked="1">
                                    <img src="/wp-content/themes/gosta/img/holiday/icon__holiday-date-3.svg" alt="Icon" width="20" height="20" loading="lazy" decoding="async">
                                    Чи є вихідний:
                                </div>
                                <div class="holiday-date__content" bis_skin_checked="1">${sviato.celebrate.isDayoff ? 'Так' : 'Ні'}</div>
                            </div>
                        </div>`
        : '';

      const host = process.env.HOST || 'https://gosta.ua/wp-content/uploads';
      const $ = cheerio.load(content);
      const figureStart = `<figure class="wp-block-image size-full">`;
      const figureEnd = `</figure>`;

      $('p').each((_, el) => {
        const $el = $(el);
        const innerHtml = $el.html() ? $el.html().trim() : '';

        const isRealImgOnly =
          $el.children().length === 1 &&
          $el.children('img').length === 1 &&
          !$el.text().trim();

        if (isRealImgOnly) {
          $el.replaceWith(innerHtml);
          return;
        }

        const decoded = innerHtml
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&');

        const imgOrAnchorImg = /^(?:<a[^>]*>\s*)?<img[\s\S]+?>(?:\s*<\/a>)?$/i;

        if (decoded && imgOrAnchorImg.test(decoded.trim())) {
          $el.replaceWith(decoded);
          return;
        }
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
      content = groupSequentialImages(content);
      content = convertYouTubeLinks(content);
      const postcardPath =
        'https://gosta.ua/wp-content/themes/gosta/img/holiday/postcard/';

      const getRelatedIds = async () => {
        const results = await Promise.all(
          sviato.related.map(async (item) => {
            const doc = await this.sviatoModel
              .findOne({ _id: new Types.ObjectId(item) })
              .select('articleId')
              .lean();

            return doc?.articleId || null;
          }),
        );

        return results.length ? results.filter((id) => id !== null) : null;
      };

      const related = await getRelatedIds();

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
            <figcaption class="wp-element-caption">В який день будемо відзначати ${sviato.name} у найближчі 5 років</figcaption>
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
        <div class="greetings-list" bis_skin_checked="1">
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
        <div class="greetings-list" bis_skin_checked="1">
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
          ? `<div class="facts-list" bis_skin_checked="1">
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
          ? `
        <div class="sources" bis_skin_checked="1">
        ${sviato.sources
          .map(
            (item) => `<a href="${item.link}"><span>${item.title}</span></a>`,
          )
          .join('')}
               </div> `
          : '',
        'related-section': related
          ? `<div class="related" data-id="[${related.map((item) => item)}]"></div>`
          : '',
        'moreIdeas-section': `<div class="moreIdeas"></div>`,
        'leaflets-section': sviato?.leaflets
          ? `
          <div class="postcard-block" bis_skin_checked="1">
          ${sviato.leaflets
            .map(
              (item) => `
            <figure class="wp-block-image size-full">
            <img src="${postcardPath}${item}" alt="" />
            <div class="postcard__btns" bis_skin_checked="1">
              <a
                href="${postcardPath}${item}"
                download=""
                class="btn"
              >
                Завантажити
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 16 16"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2 11.336c0 .62 0 .93.068 1.184a2 2 0 0 0 1.414 1.415c.255.068.565.068 1.185.068h6.666c.62 0 .93 0 1.185-.069a2 2 0 0 0 1.414-1.414c.068-.254.068-.564.068-1.184m-3-3.669s-2.21 3-3 3-3-3-3-3M8 10V2"
                  ></path>
                </svg>
              </a>
              <span
                class="btn share-image"
                data-image="${postcardPath}${item}"
              >
                Поділитись
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 16 16"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6.263 3H5.57c-1.964 0-2.946 0-3.556.586-.61.586-.61 1.528-.61 3.414v2.667c0 1.885 0 2.828.61 3.414.61.586 1.592.586 3.556.586h2.804c1.965 0 2.947 0 3.557-.586.395-.38.534-.91.583-1.748"
                  ></path>
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M10.778 4.67V2.571c0-.13.11-.236.245-.236a.25.25 0 0 1 .174.069l3.155 3.029c.157.15.245.355.245.569a.789.789 0 0 1-.245.569L11.197 9.6a.25.25 0 0 1-.174.07.24.24 0 0 1-.245-.236V7.336H8.744c-2.827 0-3.869 2.333-3.869 2.333V8.003c0-1.841 1.555-3.334 3.472-3.334h2.43Z"
                  ></path>
                </svg>
              </span>
            </div>
          </figure>  
          `,
            )
            .join('')}
        </div>
        `
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
  async uploadLeaflets(id: string) {
    const sviato = await this.sviatoModel.findById(id).lean();
    if (!sviato || !sviato.seoText) {
      throw new Error('Стаття не знайдена або відсутній seoText');
    }
    try {
      const imageDir2 = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        sviato._id.toString(),
        'leaflets',
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
              `https://gosta.ua/wp-json/gosta/v1/postcard`,
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
    } catch (error) {
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
      if (sviato?.leaflets.length) await this.uploadLeaflets(id);
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
          isAlternative: sviato.checkedAlternative,
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
      if (sviato?.leaflets.length) await this.uploadLeaflets(id);
      const tags = sviato.tags.map((item) => SviatoTagToIdMap[item]);
      const holiday_date = [
        sviato.date,
        `${new Date(sviato.date).getFullYear() + 1}-${dayjs(sviato.date).format('MM-DD')}`,
        `${new Date(sviato.date).getFullYear() + 2}-${dayjs(sviato.date).format('MM-DD')}`,
      ];
      const postData = {
        content,
        categories: [12771],
        featured_media: mediaId,
        title: sviato.name,
        meta: {
          isAlternative: sviato.checkedAlternative,
          holiday_date,
        },
        tags,
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
  async updateMany(fromDate: string, toDate: string) {
    try {
      const toUpdate = await this.sviatoModel.find(
        {
          date: { $gte: fromDate, $lte: toDate },
          articleId: { $exists: true, $ne: null },
        },
        {
          articleId: 1,
          _id: 1,
          date: 1,
        },
      );

      if (!toUpdate || toUpdate.length === 0) {
        throw new NotFoundException('No sviato found in given date range');
      }

      const updatePromises = toUpdate.map(async (item) => {
        const content = await this.buildArticle(item._id.toString());
        const postData = { content, title: item.name };

        try {
          const postResponse = await axios.post(
            `${process.env.BASE_URL}/posts/${item.articleId}`,
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
          return { id: item._id, success: true };
        } catch (err) {
          console.error(
            `Failed to update post ${item.articleId}:`,
            err.message,
          );
          return { id: item._id, success: false, error: err.message };
        }
      });

      // Очікуємо всі запити
      const results = await Promise.all(updatePromises);

      return results;
    } catch (error) {
      console.error('updateMany error:', error);
      throw new InternalServerErrorException(error.message || 'Update failed');
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
