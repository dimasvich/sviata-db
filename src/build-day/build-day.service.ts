import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as dayjs from 'dayjs';
import 'dayjs/locale/uk';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { html as beautifyHtml } from 'js-beautify';
import { Model } from 'mongoose';
import * as path from 'path';
import { DayRules, DayRulesDocument } from 'src/crud/schema/dayrules.schema';
import { Day, DayDocument } from 'src/day/schema/day.schema';
import { DayRulesEnum } from 'src/types';
import { removeBisSkinChecked } from 'src/utils';
import { formatDateForSlug } from 'src/utils/transliterator';

@Injectable()
export class BuildDayService {
  constructor(
    @InjectModel(DayRules.name) private dayRulesModel: Model<DayRulesDocument>,
    @InjectModel(Day.name) private dayModel: Model<DayDocument>,
  ) {}

  async buildArticle(date: string): Promise<string> {
    try {
      const day = await this.dayModel.findOne({ date }).lean();
      if (!day) {
        throw new Error(`День із датою ${date} не знайдено`);
      }
      const dayrules = await this.dayRulesModel.find({ date });
      const host = process.env.HOST || '/wp-content/uploads';

      let content = day.seoText || '';

      const blockTemplates: Record<string, string> = {
        'block-end': `</div><div class="content-list"></div></div></div></section>`,
        'calendar-end': `
                  </div>
                  </div>
                  <div class="right" bis_skin_checked="1">
                    <div class="download-calendar" bis_skin_checked="1">
                      <div class="icon" bis_skin_checked="1">
                        <img
                          src="/wp-content/themes/gosta/img/holiday/icon__download.svg"
                          alt="icon"
                          width="55"
                          height="72"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div class="name" bis_skin_checked="1">Церковний календар ${dayjs(day.date).locale('uk').format('YYYY')}</div>
                      <a href="" class="btn">
                        Завантажити календар
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M2.5 14.168c0 .775 0 1.163.085 1.48a2.5 2.5 0 0 0 1.768 1.768c.318.085.705.085 1.48.085h8.334c.775 0 1.162 0 1.48-.085a2.5 2.5 0 0 0 1.768-1.768c.085-.317.085-.705.085-1.48m-3.75-4.585s-2.762 3.75-3.75 3.75-3.75-3.75-3.75-3.75M10 12.5v-10"
                          ></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                <div class="recent-posts__scrollbar" bis_skin_checked="1"></div>
              </div>
            </section>

        `,
        'holiday-ukraine': `
        <section class="holiday-ukraine" id="holiday_ukraine">
          <div class="container" bis_skin_checked="1">
            <div class="top" bis_skin_checked="1">
              <div class="title-block" bis_skin_checked="1">
                <div class="icon" bis_skin_checked="1">
                  <img
                    src="/wp-content/themes/gosta/img/holiday/menu-icon/icon__page-menu-1.svg"
                    width="32"
                    height="32"
                    alt="Свята в Україні"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h2 class="h2">Свята в Україні сьогодні, ${dayjs(day.date).locale('uk').format('D MMMM')}</h2>
              </div>
        `,

        'professional-holiday': `
        <section class="professional-holiday second-bg" id="professional-holiday">
          <div class="container" bis_skin_checked="1">
            <div class="top" bis_skin_checked="1">
              <div class="title-block" bis_skin_checked="1">
                <div class="icon" bis_skin_checked="1">
                  <img
                    src="/wp-content/themes/gosta/img/holiday/menu-icon/icon__page-menu-8.svg"
                    width="32"
                    height="32"
                    alt="Професійні свята"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h2 class="h2">Професійні свята сьогодні, ${dayjs(day.date).locale('uk').format('D MMMM')}</h2>
              </div>
        `,

        'church-holiday': `
        <section class="church-holiday" id="holiday_church">
          <div class="container" bis_skin_checked="1">
            <div class="top" bis_skin_checked="1">
              <div class="title-block" bis_skin_checked="1">
                <div class="icon" bis_skin_checked="1">
                  <img
                    src="/wp-content/themes/gosta/img/holiday/menu-icon/icon__page-menu-3.svg"
                    width="32"
                    height="32"
                    alt="Церковні свята"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h2 class="h2">${dayjs(day.date).locale('uk').format('D MMMM')} – яке сьогодні церковне свято</h2>
              </div>
        `,

        'national-holiday': `
        <section class="holiday-ukraine" id="national_holiday">
          <div class="container" bis_skin_checked="1">
            <div class="top" bis_skin_checked="1">
              <div class="title-block" bis_skin_checked="1">
                <div class="icon" bis_skin_checked="1">
                  <img
                    src="/wp-content/themes/gosta/img/holiday/menu-icon/icon__page-menu-9.svg"
                    width="32"
                    height="32"
                    alt="Національні свята"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h2 class="h2">Національні свята сьогодні, ${dayjs(day.date).locale('uk').format('D MMMM')}</h2>
              </div>
        `,

        'holiday-world': `
        <section class="holiday-ukraine" id="holiday_world">
          <div class="container" bis_skin_checked="1">
            <div class="top" bis_skin_checked="1">
              <div class="title-block" bis_skin_checked="1">
                <div class="icon" bis_skin_checked="1">
                  <img
                    src="/wp-content/themes/gosta/img/holiday/menu-icon/icon__page-menu-2.svg"
                    width="32"
                    height="32"
                    alt="Міжнародні свята"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h2 class="h2">Міжнародні свята сьогодні, ${dayjs(day.date).locale('uk').format('D MMMM')}</h2>
              </div>
        `,

        'memory-date': `
        <section class="memory-date" id="memory_date">
          <img
            src="/wp-content/themes/gosta/img/holiday/bg__memory.webp"
            width="1920"
            height="830"
            alt="bg"
            class="bg"
            loading="lazy"
            decoding="async"
          />
          <div class="container" bis_skin_checked="1">
            <div class="top" bis_skin_checked="1">
              <div class="title-block" bis_skin_checked="1">
                <div class="icon" bis_skin_checked="1">
                  <img
                    src="/wp-content/themes/gosta/img/holiday/menu-icon/icon__page-menu-13.svg"
                    width="32"
                    height="32"
                    alt="Пам’ятні дні сьогодні, ${dayjs(day.date).locale('uk').format('D MMMM')}"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h2 class="h2">Пам’ятні дні сьогодні, ${dayjs(day.date).locale('uk').format('D MMMM')}</h2>
              </div>
        `,

        'church-calendar': `
        <section class="church-calendar second-bg">
          <div class="container" bis_skin_checked="1">
            <div class="inner" bis_skin_checked="1">
              <div class="left" bis_skin_checked="1">
                <div class="top" bis_skin_checked="1">
                  <div class="title-block" bis_skin_checked="1">
                    <div class="icon" bis_skin_checked="1">
                      <img
                        src="/wp-content/themes/gosta/img/holiday/menu-icon/icon__page-menu-12.svg"
                        width="32"
                        height="32"
                        alt="Православний церковний календар ${dayjs(day.date).locale('uk').format('YYYY')}"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <h2 class="h2">Православний церковний календар ${dayjs(day.date).locale('uk').format('YYYY')}</h2>
                  </div>
        `,

        'signs-block-top': `
        <section class="signs-block second-bg" id="signs">
          <div class="container" bis_skin_checked="1">
            <div class="top" bis_skin_checked="1">
              <div class="title-block" bis_skin_checked="1">
                <div class="icon" bis_skin_checked="1">
                  <img
                    src="/wp-content/themes/gosta/img/holiday/menu-icon/icon__page-menu-11.svg"
                    width="32"
                    height="32"
                    alt="Прикмети і традиції"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h2 class="h2">
                  Народні прикмети і традиції на ${dayjs(day.date).locale('uk').format('D MMMM')}
                </h2>
              </div>
      `,
        'signs-block-inner': `
        </div>
            <div class="inner" bis_skin_checked="1">
            <div class="left" bis_skin_checked="1">
              <ul class="signs-block__list">
                ${day?.omens.map((item) => `<li>${item};</li>`).join('') || ''}
              </ul>
            </div>
            <div class="right" bis_skin_checked="1">
              <div class="sidebar-block" bis_skin_checked="1">
                <div class="sidebar-block__head" bis_skin_checked="1">
                  <img
                    src="/wp-content/themes/gosta/img/holiday/menu-icon/icon__page-menu-4.svg"
                    width="42"
                    height="42"
                    alt="Іменини сьогодні"
                    loading="lazy"
                    decoding="async"
                  />
                  Іменини сьогодні
                </div>
                <div class="sidebar-block__content" bis_skin_checked="1">
                  Як назвати дитину, яка народилася ${dayjs(day.date).locale('uk').format('D MMMM')}?
                  <div class="name-list" bis_skin_checked="1">
                    ${day?.bornNames.map((item) => `<span class="item">${item}</span>`).join('') || ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
      `,

        'day-history-top': `
        <section class="day-history" id="day-history">
          <div class="container" bis_skin_checked="1">
            <div class="content" bis_skin_checked="1">
              <div class="left" bis_skin_checked="1">
                <div class="top" bis_skin_checked="1">
                  <div class="title-block" bis_skin_checked="1">
                    <div class="icon" bis_skin_checked="1">
                      <img
                        src="/wp-content/themes/gosta/img/holiday/menu-icon/icon__page-menu-7.svg"
                        width="32"
                        height="32"
                        alt="Історичні події"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <h2 class="h2">
                      ${dayjs(day.date).locale('uk').format('D MMMM')} – цей день в
                      історії
                    </h2>
                  </div>
      `,
        'day-history-inner': `
               </div>
        <div class="inner" bis_skin_checked="1">
          <ul class="list">
            ${
              day?.timeline
                .map(
                  (item) => `
            <li><span>${item.year}</span> - ${item.html}</li>
            `,
                )
                .join('') || ''
            }
          </ul>
        </div>
      </div>
      <div class="right" bis_skin_checked="1">
<div class="who-born" id="who_born">
  <div class="who-born__head">Хто сьогодні народився</div>
  <div class="who-born__content">
    <div class="who-born__slider swiper">
      <div class="swiper-wrapper">
        ${
          day?.whoWasBornToday
            .map(
              (item) => `
        <div class="swiper-slide item">
          <div class="photo">
            <img
              src="${item.image}"
              id="image"
              width="48"
              height="48"
              alt="Img"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="info">
            <div class="name">${item.title + item.year ? `(${item.year})` : ''}</div>
            <div class="desc">${item.html}</div>
          </div>
        </div>
        `,
            )
            .join('') || ''
        }
      </div>
      <div class="swiper-scrollbar"></div>
    </div>
  </div>
</div>

      `,
        'day-rules': `<section class="second-bg" id="permissions"> <div class="container" bis_skin_checked="1"> <div class="info-block" bis_skin_checked="1"> <div class="block" bis_skin_checked="1"> <div class="head" bis_skin_checked="1"> Що можна робити ${dayjs(day.date).locale('uk').format('D MMMM')}? <img class="icon" src="/wp-content/themes/gosta/img/holiday/icon__top-plus.svg" width="109" height="116" alt="Icon" loading="lazy" decoding="async" /> </div> <div class="content" bis_skin_checked="1"> ${dayrules.find((item) => item.title === DayRulesEnum.ALLOWED)?.html || ''} </div> </div> <div class="block minus" bis_skin_checked="1"> <div class="head" bis_skin_checked="1"> Чого не можна робити ${dayjs(day.date).locale('uk').format('D MMMM')}? <img class="icon" src="/wp-content/themes/gosta/img/holiday/icon__top-minus.svg" width="109" height="116" alt="Icon" loading="lazy" decoding="async" /> </div> <div class="content" bis_skin_checked="1"> ${dayrules.find((item) => item.title === DayRulesEnum.FORBIDDEN)?.html || ''} </div> </div> </div> </div> </section>`,
        'last-block-end': `        </div>
      </div>
      <div class="right" bis_skin_checked="1">
        <div class="ads-banner-1" bis_skin_checked="1">
          <span class="h4"
            >Бажаєте збільшити онлайн присутність вашого бренду?</span
          >
          <p>
            Отримайте<br />
            понад 5+ публікацій<br />
            на різних платформах<br />
            <strong>щомісяця</strong>
          </p>
          <a
            href="/vedennya-blogu-na-portali/"
            target="_blank"
            class="btn btn-blue btn-full"
            ><span>Замовити</span></a
          >
        </div>
      </div>
    </div>
  </div>
</section>`,
        'last-block': `<section class="category-desc" bis_skin_checked="1">
  <div class="container" bis_skin_checked="1">
    <div class="content" bis_skin_checked="1">
      <div class="left" bis_skin_checked="1">
        <div class="inner" bis_skin_checked="1">`,
      };
      const blockKeys = Object.keys(blockTemplates).filter(
        (key) => key !== 'day-rules',
      );

      if (!day.seoText) {
        let blocksContent = '';

        for (const key of blockKeys) {
          if (
            key.endsWith('-end') ||
            key === 'last-block' ||
            key === 'last-block-end' ||
            key === 'day-history-inner' ||
            key === 'day-rules' ||
            key === 'signs-block-inner'
          )
            continue;

          if (key === 'day-history-top') {
            blocksContent += blockTemplates['day-history-top'];
            blocksContent += blockTemplates['day-history-inner'];
            blocksContent += blockTemplates['block-end'];
            continue;
          }
          if (key === 'signs-block-top') {
            blocksContent += blockTemplates['signs-block-top'];
            blocksContent += blockTemplates['signs-block-inner'];
            blocksContent += blockTemplates['block-end'];
            continue;
          }

          blocksContent += blockTemplates[key];

          if (key === 'church-calendar') {
            blocksContent += blockTemplates['calendar-end'] || '';
          } else {
            blocksContent += blockTemplates['block-end'] || '';
          }
        }

        content = blocksContent;
      }

      const topBlock = `
      <div class="top-block__top">
        <div class="img-block">
            <img src="${host}/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${(
              day.mainImage || 'main.webp'
            )
              .replaceAll(' ', '_')
              .replaceAll(',', '')}" 
              alt="Img" width="447" height="224" loading="eager" decoding="async">
              <div class="date-block-info"></div>
        </div>
        <div class="text-block">
            <h1>${dayjs(day.date).locale('uk').format('D MMMM YYYY')} — яке сьогодні свято, церковне свято, день янгола, історичні події, народні прикмети та заборони?</h1>
            ${day?.description || ''}
            <p>Нижче ви знайдете добірку свят, іменин, народних прикмет та історичних подій цього дня.</p>
        </div>
      </div>
    `;

      const placeholderRegex =
        /<div\s+data-placeholder="([^"]+)"[^>]*>[\s\S]*?<\/div>/g;

      content = content.replace(
        placeholderRegex,
        (_, key) => blockTemplates[key] || `<p>[Невідомий блок: ${key}]</p>`,
      );

      const $ = cheerio.load(content);
      $('#image').each((_, el) => {
        const $el = $(el);
        const src = $el.attr('src');
        if (src && !src.startsWith('http')) {
          const newSrc = `${host}/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${src
            .replaceAll(' ', '_')
            .replaceAll(',', '')}`;
          $el.attr('src', newSrc.replace('wepb', 'webp'));
        }
      });

      content = $.html()
        .replaceAll('<b>', '<strong>')
        .replaceAll('</b>', '</strong>');

      content = topBlock + content;
      content = removeBisSkinChecked(content);
      content = beautifyHtml(content, {
        indent_size: 2,
        preserve_newlines: true,
        content_unformatted: ['pre', 'code', 'textarea'],
      })
        .replaceAll('<html>', '')
        .replaceAll('</html>', '')
        .replaceAll('<head>', '')
        .replaceAll('</head>', '')
        .replaceAll('<body>', '')
        .replaceAll('</body>', '')
        .replaceAll('\n', '');

      return content;
    } catch (error) {
      console.error('❌ Помилка збірки статті:', error);

      return `<section class="error"><p>Помилка збірки сторінки за ${date}: ${error.message}</p></section>`;
    }
  }

  public async handleUpload(date: string) {
    const day = await this.dayModel.findOne({ date }).lean();
    if (!day) throw new Error('Стаття не знайдена');

    const whoWasBornDir = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      date,
      'whoWasBorn',
    );
    const mainDir = path.join(__dirname, '..', '..', 'uploads', date, 'main');

    if (!fs.existsSync(whoWasBornDir)) {
      console.warn(`⚠️ Папка ${whoWasBornDir} не існує — пропускаю`);
    }
    if (!fs.existsSync(mainDir) || fs.readdirSync(mainDir).length === 0) {
      await this.ensureMainImage(date, mainDir);
    }

    const dirsToUpload = [
      { dir: whoWasBornDir, label: 'whoWasBorn' },
      { dir: mainDir, label: 'main' },
    ];

    const results = await this.uploadImages(dirsToUpload, date);
    return results;
  }

  private async ensureMainImage(date: string, mainDir: string) {
    const day = await this.dayModel.findOne({ date }).lean();
    if (!day) throw new Error('Стаття не знайдена');

    const monthDir = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      dayjs(date).format('YYYY-MM'),
    );

    if (!fs.existsSync(monthDir)) {
      console.warn(
        `⚠️ Директорія ${monthDir} не існує — пропускаю створення main`,
      );
      return;
    }

    const allImages = fs
      .readdirSync(monthDir)
      .filter((f) => /\.(webp)$/i.test(f));
    if (allImages.length === 0) {
      console.warn(
        '⚠️ У директорії YYYY-MM немає зображень для резервного копіювання',
      );
      return;
    }

    const mainImageName = `${crypto.randomUUID()}.webp`;

    const randomImage = allImages[Math.floor(Math.random() * allImages.length)];
    const sourcePath = path.join(monthDir, randomImage);

    fs.mkdirSync(mainDir, { recursive: true });
    const targetPath = path.join(mainDir, mainImageName);
    fs.copyFileSync(sourcePath, targetPath);

    await this.dayModel.findOneAndUpdate(
      { date },
      { mainImage: mainImageName },
    );

    console.log(`📁 ${mainImageName} створено з ${randomImage}`);
  }

  private async uploadImages(
    dirs: { dir: string; label: string }[],
    date: string,
  ): Promise<
    {
      folder: string;
      file: string;
      sentAs: string;
      status: string;
      response?: any;
      error?: string;
    }[]
  > {
    const results = [];

    const dateSlug = formatDateForSlug(date); 

    for (const { dir, label } of dirs) {
      if (!fs.existsSync(dir)) {
        console.warn(`⚠️ Папка ${label} (${dir}) не існує — пропускаю`);
        continue;
      }

      const files = fs.readdirSync(dir).filter((f) => /\.(webp)$/i.test(f));
      if (files.length === 0) {
        console.warn(`⚠️ У папці ${label} немає файлів`);
        continue;
      }

      let imgIndex = 1;

      for (const imageName of files) {
        const fullImagePath = path.join(dir, imageName);

        if (!fs.existsSync(fullImagePath)) {
          console.warn(`⚠️ Файл ${fullImagePath} не існує — пропускаю`);
          continue;
        }

        const newImageName = `gosta-${dateSlug}-${imgIndex}.webp`;
        imgIndex++;

        const formData = new FormData();
        formData.append(
          'file',
          fs.createReadStream(fullImagePath),
          newImageName, 
        );

        try {
          const mediaResponse = await axios.post(
            `${process.env.BASE_URL}/media`,
            formData,
            {
              auth: {
                username: process.env.APP_USER_PAGES,
                password: process.env.APP_PASSWORD_PAGES,
              },
              headers: {
                ...formData.getHeaders(),
                'Content-Disposition': `attachment; filename="${newImageName}"`,
              },
            },
          );

          results.push({
            folder: label,
            file: imageName,
            sentAs: newImageName, 
            status: 'ok',
            response: mediaResponse.data,
          });

          console.log(`✅ ${label}/${imageName} → ${newImageName} успішно`);
        } catch (error) {
          console.error(
            `❌ Помилка при завантаженні ${label}/${imageName}:`,
            error.message,
          );
          results.push({
            folder: label,
            file: imageName,
            sentAs: newImageName,
            status: 'error',
            error: error.message,
          });
        }
      }
    }

    return results;
  }

  async publish(date: string) {
    try {
      const day = await this.dayModel.findOne({ date }).lean();
      if (!day) throw new Error('Стаття не знайдена');

      await this.handleUpload(date);

      const content = await this.buildArticle(date);
      const postData = {
        title: `${dayjs(day.date).locale('uk').format('D MMMM')}`,
        slug: '',
        status: 'publish',
        content: content,
        template: 'template-ua/categories-ua/holiday-today-ua.php',
        meta: {
          holiday_date: day.date,
          isAlternative: day.checkedAlternative,
        },
        seofo_title: `${dayjs(day.date).locale('uk').format('D MMMM YYYY')} - – яке сьогодні свято, церковне свято, день янгола, історичні події, народні прикмети та заборони?`,
        seofo_description: `Дізнайтеся яке свято ${dayjs(day.date).locale('uk').format('D MMMM YYYY')} в Україні та світі`,
      };
      const postResponse = await axios.post(
        `${process.env.BASE_URL}/pages`,
        postData,
        {
          auth: {
            username: process.env.APP_USER_PAGES,
            password: process.env.APP_PASSWORD_PAGES,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Post created:', postResponse.data);
      await this.dayModel.updateOne(
        { date },
        {
          $set: {
            articleId: postResponse.data.id,
            dateUpload: dayjs().format('YYYY-MM-DD'),
          },
        },
      );
      return postResponse.data;
    } catch (error) {
      console.error('Error publishing', error);
      throw error;
    }
  }
  async update(date: string) {
    try {
      const day = await this.dayModel.findOne({ date }).lean();
      if (!day) throw new Error('Стаття не знайдена');
      const content = await this.buildArticle(date);
      const postData = {
        isAlternative: day.checkedAlternative,
        content,
      };
      await this.handleUpload(date);

      const postResponse = await axios.post(
        `${process.env.BASE_URL}/pages/${day.articleId}`,
        postData,
        {
          auth: {
            username: process.env.APP_USER_PAGES,
            password: process.env.APP_PASSWORD_PAGES,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      await this.dayModel.updateOne(
        { date },
        {
          $set: {
            dateUpload: dayjs().format('YYYY-MM-DD'),
          },
        },
      );
      return postResponse.data;
    } catch (error) {
      throw error;
    }
  }
}

