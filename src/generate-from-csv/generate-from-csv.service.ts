import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as csv from 'csv-parser';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { Sviato, SviatoDocument } from 'src/crud/schema/sviato.schema';
import { Readable } from 'stream';
import cheerio from 'cheerio';

@Injectable()
export class GenerateFromCsvService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Sviato.name) private sviatoModel: Model<SviatoDocument>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  private async parseCsvFile(file: Express.Multer.File): Promise<
    {
      date: string;
      type: string;
      tags: string[];
      name: string;
    }[]
  > {
    return new Promise((resolve, reject) => {
      const results: {
        date: string;
        type: string;
        tags: string[];
        name: string;
      }[] = [];

      const stream = Readable.from(file.buffer);

      stream
        .pipe(csv({ separator: ',' }))
        .on('data', (row) => {
          const parsed = {
            date: row['дата']?.trim(),
            type: row['тип свята']?.trim(),
            tags: row['список тегів']
              ? row['список тегів']
                  .split(',')
                  .map((t: string) => t.trim())
                  .filter(Boolean)
              : [],
            name: row['назва свята']?.trim(),
          };
          results.push(parsed);
        })
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  private async parseUploadedFile(
    data: {
      date: string;
      type: string;
      tags: string[];
      name: string;
    }[],
  ) {
    const prompts = data.map(
      (item) => `PROMPT:
        Створи коротку інформаційну статтю про свято {${item.name}}, яке відзначають {${item.date}}, що належить до категорії {${item.type}}, 
        а також має наступний список тегів: {${item.tags.map((item) => item)}}.

        Мета: дати користувачу лаконічне, але змістовне пояснення про це свято, щоб він одразу зрозумів його суть, історію і значення.

        Структура статті:
        H1: офіційна назва свята (без дати).
        вступний текст. в першому реченні одразу давати відповідь/пояснення на/про Н1

        H2: «Про {назва_свята}»
        1–2 речення з конкретною датою святкування (у форматі «щороку {дата}» або «{число} {місяць}»).
        2–3 речення з коротким фактичним описом походження або причини заснування свята. Якщо дата міжнародна – згадайте ініціатора або подію, з якої почалося святкування.
        2–4 речення про те, як це свято відзначають, що воно символізує, кого вшановує, або яку ідею несе.
        1–2 короткі речення (якщо є цікаві деталі, зміни дати, міжнародні аналоги, тощо).

        Метатеги: 
        Title: (55-65 символів з пробілами - це обов'язково). Тайтл має описувати коротко суть всієї статті. Бажано використовувати цифри

        Description: (165-200 символів з пробілами - це обов'язково). Дескриптор має так само описувати про що стаття, але іншими словами

        Додаткові вимоги до стилю та оформлення:
        - Заголовки H2 мають бути інформативними і клікбейтно сформульованими.
        - Кожне речення після H2 має безпосередньо відповідати на його запитання.
        - Не використовуй жодних посилань на джерела.
        - Використовуй середнє тире «–», а лапки тільки кириличні «».
        - До читача звертайся виключно на «ви».
        - Пиши коротко, нейтрально, але цікаво, як редакційний матеріал для широкої аудиторії.
        - Якщо даних мало – не вигадуй фактів, просто не пиши багато тексту.

        Повернути статтю у форматі HTML:
        - Дотримуватись інструкцій до заголовків.
        - Речення під заголовками обов'язково писати у одному спільному "<p>".
        - інформацію, котру необхідно виділити писати у тегах "<strong>".
        - Писати лише теги для статті, не використовувати базову html-розмітку (html, head, body).
        - Не вставляти абзац з тегами до статті.
        `,
    );
    return prompts;
  }
  private async generateHtmlForPrompt(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-5o',
      messages: [
        {
          role: 'system',
          content:
            'Ви експерт з написання статей українською мовою, який генерує текст у форматі HTML.',
        },
        { role: 'user', content: prompt },
      ],
    });

    return response.choices[0]?.message?.content || '';
  }

  public async uploadGenerateAndSave(file: Express.Multer.File) {
    try {
      const data = await this.parseCsvFile(file);
      const prompts = await this.parseUploadedFile(data);

      const res = await Promise.all(
        prompts.map(async (p, index) => {
          const html = await this.generateHtmlForPrompt(p);
          const $ = cheerio.load(html);

          const h1Text = $('h1').text() || '';
          const metaTitle = $('meta[name="title"]').attr('content') || '';
          const metaDescription =
            $('meta[name="description"]').attr('content') || '';

          await this.sviatoModel.create({
            tags: data[index].tags,
            date: data[index].date,
            type: data[index].type,
            name: h1Text,
            title: metaTitle,
            description: metaDescription,
            seoText: html,
          });
        }),
      );

      return { prompts };
    } catch (error) {
      console.error('Error in uploadGenerateAndSave:', error);
      throw error;
    }
  }
}
