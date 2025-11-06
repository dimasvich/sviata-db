import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { exiftool } from 'exiftool-vendored';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';
import * as sharp from 'sharp';
import * as crypto from 'crypto';

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ storage: multer.memoryStorage() }).fields([
  { name: 'images', maxCount: 20 },
  { name: 'mainImage', maxCount: 1 },
  { name: 'leaflets', maxCount: 20 }, // 🔹 додано для leaflet-зображень
]);

@Injectable()
export class ImageUploadSviato implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (!req.body || Object.keys(req.body).length === 0) {
      let rawBody = '';
      req.on('data', (chunk) => (rawBody += chunk));
      req.on('end', () => {
        console.log('📦 [RAW BODY BEFORE MULTER]', rawBody.slice(0, 200));
      });
    }

    upload(req, res, async (err) => {
      console.log('🟢 [MULTER] Завантаження стартувало');
      if (err) {
        console.error('❌ [MULTER] Помилка при завантаженні файлів:', err);
        throw new BadRequestException('Помилка при завантаженні файлів');
      }

      try {
        const sviatoId = req.params['id'];
        console.log('🟡 [PARAMS] sviatoId =', sviatoId);
        if (!sviatoId) {
          throw new BadRequestException('Відсутній ID свята у маршруті');
        }

        const targetDir = path.join(uploadDir, sviatoId);
        if (!fs.existsSync(targetDir))
          fs.mkdirSync(targetDir, { recursive: true });

        let sviatoDataRaw = req.body.sviatoData;
        let sviatoData: any = {};

        if (sviatoDataRaw) {
          try {
            sviatoData = JSON.parse(sviatoDataRaw);
          } catch (e) {
            console.error(
              '❌ [PARSE ERROR] Не вдалося розпарсити sviatoData:',
              e,
            );
          }
        }

        let seoText = sviatoData.seoText || '';
        console.log('🟣 [SEO TEXT - BEFORE]', seoText.slice(0, 300));
        const processedImages = [];

        // 🔹 Обробка масових зображень (images)
        if (req.files && Array.isArray(req.files['images'])) {
          console.log(
            '🧩 [IMAGES] знайдено',
            req.files['images'].length,
            'файлів',
          );
          for (const file of req.files['images'] as Express.Multer.File[]) {
            console.log('📸 [FILE] originalname:', file.originalname);

            const uuid = crypto.randomUUID();
            const outputFilename = `${uuid}.webp`;
            const outputPath = path.join(targetDir, outputFilename);
            console.log('🧾 [OUTPUT]', outputFilename, '->', outputPath);

            await sharp(file.buffer)
              .toFormat('webp', { quality: 90 })
              .toFile(outputPath);

            await exiftool.write(outputPath, {}, ['-all=']);

            processedImages.push({
              filename: outputFilename,
              path: outputPath,
              alt: req.body.alt || 'Зображення без опису',
              mimetype: 'image/webp',
            });

            const originalNameUtf8 = Buffer.from(
              file.originalname,
              'latin1',
            ).toString('utf8');
            const baseName = path.parse(originalNameUtf8).name;
            const escapedName = originalNameUtf8.replace(
              /[.*+?^${}()|[\]\\]/g,
              '\\$&',
            );
            const escapedBase = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            console.log('🔍 [REPLACE] originalNameUtf8:', originalNameUtf8);
            console.log('🔍 [REPLACE] baseName:', baseName);

            const patterns = [
              new RegExp(
                `(&lt;img\\b[^&]*?src=(&quot;|"))${escapedName}((&quot;|")[^&]*?(&gt;|/&gt;))`,
                'gi',
              ),
              new RegExp(
                `(&lt;img\\b[^&]*?src=(&quot;|"))${escapedBase}((&quot;|")[^&]*?(&gt;|/&gt;))`,
                'gi',
              ),
            ];

            for (const pattern of patterns) {
              seoText = seoText.replace(pattern, (match, before, q1, after) => {
                let updated = `${before}${outputFilename}${after}`;
                if (!/\/&gt;$/i.test(updated)) {
                  updated = updated.replace(/&gt;$/i, ' /&gt;');
                }
                return updated;
              });
            }

            let replaced = false;
            for (const pattern of patterns) {
              if (pattern.test(seoText)) {
                console.log('✅ [MATCH FOUND] pattern:', pattern);
                replaced = true;
              }
              seoText = seoText.replace(pattern, `$1${outputFilename}$2`);
            }
            seoText = seoText.replace(
              /(&lt;img\b[^&]*?src=(&quot;|"))([^&]*?)((&quot;|")[^&]*?(&gt;|\/&gt;))/gi,
              (match, beforeSrc, quoteStart, oldSrc, afterSrc) => {
                let updated = `${beforeSrc}${oldSrc}${afterSrc}`;
                if (!/\/&gt;$/i.test(updated)) {
                  updated = updated.replace(/&gt;$/i, ' /&gt;');
                }
                return updated;
              },
            );

            if (!replaced) {
              console.warn('⚠️ [NO MATCH FOUND] Для файлу:', originalNameUtf8);
            }
          }
        } else {
          console.log('🟠 [IMAGES] Жодного файлу не знайдено');
        }

        if (req.files && Array.isArray(req.files['leaflets'])) {
          console.log(
            '🪧 [LEAFLETS] знайдено',
            req.files['leaflets'].length,
            'файлів',
          );

          const leafletsDir = path.join(targetDir, 'leaflets');
          if (!fs.existsSync(leafletsDir))
            fs.mkdirSync(leafletsDir, { recursive: true });
          const leafletsPath = [];
          for (const file of req.files['leaflets'] as Express.Multer.File[]) {
            const uuid = crypto.randomUUID();
            const outputFilename = `${uuid}.webp`;
            const outputPath = path.join(leafletsDir, outputFilename);

            console.log(
              '🧾 [LEAFLET OUTPUT]',
              outputFilename,
              '->',
              outputPath,
            );

            await sharp(file.buffer)
              .toFormat('webp', { quality: 90 })
              .toFile(outputPath);

            await exiftool.write(outputPath, {}, ['-all=']);

            leafletsPath.push({
              outputFilename,
            });
          }
          req['leafletsPath'] = leafletsPath;
        }

        if (req.files && Array.isArray(req.files['mainImage'])) {
          console.log('⭐ [MAIN IMAGE] знайдено 1 файл');
          const file = req.files['mainImage'][0];
          const mainImageDir = path.join(targetDir, 'main');
          if (!fs.existsSync(mainImageDir))
            fs.mkdirSync(mainImageDir, { recursive: true });

          const outputFilename = `main.webp`;
          const outputPath = path.join(mainImageDir, outputFilename);

          const image = sharp(file.buffer);
          const metadata = await image.metadata();
          console.log('📏 [MAIN META]', metadata);

          const targetAspect = 16 / 9;
          let cropWidth = metadata.width || 0;
          let cropHeight = Math.round(cropWidth / targetAspect);

          if (cropHeight > (metadata.height || 0)) {
            cropHeight = metadata.height || 0;
            cropWidth = Math.round(cropHeight * targetAspect);
          }

          const left = Math.round(((metadata.width || 0) - cropWidth) / 2);
          const top = Math.round(((metadata.height || 0) - cropHeight) / 2);

          await image
            .extract({ left, top, width: cropWidth, height: cropHeight })
            .resize(1920, 1080)
            .toFormat('webp', { quality: 90 })
            .toFile(outputPath);

          await exiftool.write(outputPath, {}, ['-all=']);
          req['mainImagePath'] = path.join('main', outputFilename);
          console.log('✅ [MAIN IMAGE] збережено ->', req['mainImagePath']);
        }

        console.log('🟩 [SEO TEXT - AFTER]', seoText.slice(0, 300));
        sviatoData.seoText = seoText;
        req.body.sviatoData = JSON.stringify(sviatoData);
        req['processedImages'] = processedImages;
        console.log('🧠 [PROCESSED IMAGES]', processedImages);

        next();
      } catch (error) {
        console.error('❌ [ERROR] Помилка при обробці зображення:', error);
        throw new BadRequestException('Не вдалося обробити зображення');
      }
    });
  }
}
