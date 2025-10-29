import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as csv from 'csv-parser';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { Sviato, SviatoDocument } from 'src/crud/schema/sviato.schema';
import { Readable } from 'stream';
import * as cheerio from 'cheerio';

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
              `🔹 Генерація ${index + 1}/${data.length}: ${data[index].name}`,
            );

            const html = await this.generateHtmlForPrompt(prompt);

            if (!html) {
              console.warn(`⚠️ Порожній результат для: ${data[index].name}`);
              return { name: data[index].name, success: false };
            }

            const $ = cheerio.load(html);
            const h1Text = $('h1').first().text().trim();
            const metaTitle = $('meta[name="title"]').attr('content') || '';
            const metaDescription =
              $('meta[name="description"]').attr('content') || '';

            await this.sviatoModel.create({
              tags: data[index].tags,
              date: data[index].date,
              type: data[index].type,
              name: h1Text || data[index].name,
              title: metaTitle,
              description: metaDescription,
              seoText: html,
            });

            console.log(`✅ Збережено: ${data[index].name}`);
            return { name: data[index].name, success: true };
          } catch (err) {
            console.error(
              `❌ Помилка при обробці ${data[index].name}:`,
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
        `🏁 Завершено. Успішно: ${successCount}, Помилок: ${failedCount}`,
      );

      return { total: data.length, successCount, failedCount, results };
    } catch (error) {
      console.error('💥 Error in uploadGenerateAndSave:', error);
      throw error;
    }
  }
}
