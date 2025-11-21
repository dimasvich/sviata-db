import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as csv from 'csv-parser';
import { Model, Types } from 'mongoose';
import OpenAI from 'openai';
import { Svyato, SviatoDocument } from 'src/crud/schema/svyato.schema';
import { Readable } from 'stream';
import * as cheerio from 'cheerio';
import * as dayjs from 'dayjs';
import 'dayjs/locale/uk';
import { Day, DayDocument } from 'src/day/schema/day.schema';
import { CompleteStatus } from 'src/types';

@Injectable()
export class GenerateFromCsvService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Svyato.name) private sviatoModel: Model<SviatoDocument>,
    @InjectModel(Day.name) private dayModel: Model<DayDocument>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private async parseCsvFile(file: Express.Multer.File): Promise<
    {
      date: string;
      tags: string[];
      name: string;
    }[]
  > {
    return new Promise((resolve, reject) => {
      const results: {
        date: string;
        tags: string[];
        name: string;
      }[] = [];

      const stream = Readable.from(file.buffer);

      stream
        .pipe(csv({ separator: ',' }))
        .on('data', (row) => {
          const parsed = {
            date: row['дата']?.trim(),
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

  public async parseUploadedFile(
    data: {
      date: string;
      tags: string[];
      name: string;
    }[],
  ) {
    const prompts = data.map(
      (item) => `PROMPT:
        Створи коротку інформаційну статтю про свято {${item.name}}, яке відзначають {${item.date}}, 
        а також має наступний список тегів: {${item.tags.map((t) => t)}}.

        Мета: дати користувачу лаконічне, але змістовне пояснення про це свято, щоб він одразу зрозумів його суть, історію і значення.

        Структура статті:
        H1: офіційна назва свята (без дати).
        вступний текст. в першому реченні одразу давати відповідь/пояснення на/про Н1

        H2: «Про ${item.name}»
        1–2 речення з конкретною датою святкування.
        2–3 речення з коротким описом походження.
        2–4 речення про традиції святкування, символіку та значення.
        1–2 речення з цікавими фактами, якщо є.

        Наприкінці додай:
        <meta name="title" content="(55–65 символів)">
        <meta name="description" content="(165–200 символів)">
        <meta name="teaser" content="(150–200 символів)"> 
        `,
    );
    return prompts;
  }

  private async generateHtmlForPrompt(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content:
            'Ви експерт з написання статей українською мовою, який генерує текст у форматі HTML.',
        },
        { role: 'user', content: prompt },
      ],
    });

    return response.choices[0]?.message?.content?.trim() || '';
  }

  public async uploadGenerateAndSave(file: Express.Multer.File) {
    try {
      const data = await this.parseCsvFile(file);
      const prompts = await this.parseUploadedFile(data);

      const results = await Promise.all(
        prompts.map(async (prompt, index) => {
          try {
            console.log(
              `Генерація ${index + 1}/${data.length}: ${data[index].name}`,
            );

            const html = await this.generateHtmlForPrompt(prompt);

            if (!html) {
              console.warn(`Порожній результат для: ${data[index].name}`);
              return { name: data[index].name, success: false };
            }

            const $ = cheerio.load(html);
            const h1Text = $('h1').first().text().trim();
            $('h1').first().remove();
            const metaTitle = $('meta[name="title"]').attr('content') || '';
            const metaDescription =
              $('meta[name="description"]').attr('content') || '';
            const teaser = $('meta[name="teaser"]').attr('content') || '';
            const updatedHtml = $.html();

            await this.sviatoModel.create({
              tags: data[index].tags,
              date: data[index].date,
              name: h1Text || data[index].name,
              title: metaTitle,
              description: metaDescription,
              teaser: teaser,
              seoText: updatedHtml,
              status: CompleteStatus.OPENAI,
            });

            console.log(`Збережено: ${data[index].name}`);
            return { name: data[index].name, success: true };
          } catch (err) {
            console.error(
              `Помилка при обробці ${data[index].name}:`,
              err.message,
            );
            return {
              name: data[index].name,
              success: false,
              error: err.message,
            };
          }
        }),
      );

      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.filter((r) => !r.success).length;

      console.log(
        `Завершено. Успішно: ${successCount}, Помилок: ${failedCount}`,
      );

      return { total: data.length, successCount, failedCount, results };
    } catch (error) {
      console.error('Error in uploadGenerateAndSave:', error);
      throw error;
    }
  }
  public async readGenerateAndSave(data: {
    date: string;
    tags: string[];
    name: string;
  }, id:string) {
    try {
      const prompts = await this.parseUploadedFile([data]);

      const results = await Promise.all(
        prompts.map(async (prompt, index) => {
          try {
            console.log(
              `Генерація ${index + 1}/${[data].length}: ${[data][index].name}`,
            );

            const html = await this.generateHtmlForPrompt(prompt);

            if (!html) {
              console.warn(`Порожній результат для: ${[data][index].name}`);
              return { name: [data][index].name, success: false };
            }

            const $ = cheerio.load(html);
            const h1Text = $('h1').first().text().trim();
            $('h1').first().remove();
            const metaTitle = $('meta[name="title"]').attr('content') || '';
            const metaDescription =
              $('meta[name="description"]').attr('content') || '';
            const teaser = $('meta[name="teaser"]').attr('content') || '';
            const updatedHtml = $.html();

            await this.sviatoModel.findByIdAndUpdate(new Types.ObjectId(id),{
              tags: [data][index].tags,
              date: [data][index].date,
              name: h1Text || [data][index].name,
              title: metaTitle,
              description: metaDescription,
              teaser: teaser,
              seoText: updatedHtml,
              status: CompleteStatus.OPENAI,
            });

            console.log(`Збережено: ${[data][index].name}`);
            return { name: [data][index].name, success: true };
          } catch (err) {
            console.error(
              `Помилка при обробці ${[data][index].name}:`,
              err.message,
            );
            return {
              name: [data][index].name,
              success: false,
              error: err.message,
            };
          }
        }),
      );

      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.filter((r) => !r.success).length;

      console.log(
        `Завершено. Успішно: ${successCount}, Помилок: ${failedCount}`,
      );

      return { successCount, failedCount, results };
    } catch (error) {
      console.error('Error in uploadGenerateAndSave:', error);
      throw error;
    }
  }
  public async generateDay(date: string) {
    try {
      const svyata = await this.sviatoModel.find({ date });
      if (!svyata) throw new NotFoundException('Date dismatch');

      const prompt = `
        Створи короткий опис до статті.

        Мета: дати користувачу лаконічну відповідь на питання "Яке сьогодні свято?".

        Список свят: ${svyata.map((item) => item.name)}.
        Дата: ${date}.

        Структура опису:
        - 1 речення у форматі: "${dayjs(date).locale('uk').format('D MMMM')} у світі відзначають відразу кілька подій  – " перелік подій.
        - 1-2 речення розповідь про сезон року, згадуючи традиції та звичаї.
        - 1 речення про свята та історію свят у цей місяць.
        - 1-2 речення розповідь про особливості святкування цього свята в Україні у поєднанні з сучасністю.

        Формат: 
        - Кожну частину опису повернути у абзаці <p>.
        - Не роби акцент на одному святі, намагайся узагальнити.
      `;
      const description = await this.generateHtmlForPrompt(prompt);
      await this.dayModel.create({
        date,
        description,
        status: CompleteStatus.OPENAI,
      });
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
