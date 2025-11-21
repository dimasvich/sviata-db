import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { exiftool } from 'exiftool-vendored';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';
import * as sharp from 'sharp';

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ storage: multer.memoryStorage() }).fields([
  { name: 'images', maxCount: 20 },
  { name: 'mainImages', maxCount: 10 },
  { name: 'leaflets', maxCount: 20 },
]);

@Injectable()
export class ImageUploadSvyato implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    upload(req, res, async (err) => {
      console.log('🟢 [MULTER] Завантаження стартувало');
      if (err) throw new BadRequestException('Помилка при завантаженні файлів');

      try {
        const svyatoId = req.params['id'];
        if (!svyatoId)
          throw new BadRequestException('Відсутній ID свята у маршруті');

        const targetDir = path.join(uploadDir, svyatoId);
        if (!fs.existsSync(targetDir))
          fs.mkdirSync(targetDir, { recursive: true });

        const processedImages = [];
        const sviatoData = req.body.svyatoData
          ? JSON.parse(req.body.svyatoData)
          : {};
        let seoText = sviatoData.seoText || '';

        if (req.files && Array.isArray(req.files['images'])) {
          for (const file of req.files['images'] as Express.Multer.File[]) {
            const uuid = crypto.randomUUID();
            const outputFilename = `${uuid}.webp`;
            const outputPath = path.join(targetDir, outputFilename);

            const image = sharp(file.buffer);

            await image.toFormat('webp', { quality: 90 }).toFile(outputPath);

            await exiftool.write(outputPath, {}, ['-all=']);

            processedImages.push({
              filename: outputFilename,
              path: outputPath,
              alt: req.body.alt || 'Зображення без опису',
              mimetype: 'image/webp',
            });
            const fixedName = Buffer.from(file.originalname, 'latin1').toString(
              'utf8',
            );
            const escapedName = fixedName.replace(
              /[.*+?^${}()|[\]\\]/gu,
              '\\$&',
            );

            // 1) Проста заміна по тексту
            const regexNormal = new RegExp(escapedName, 'gu');
            seoText = seoText.replace(regexNormal, outputFilename);

            // 2) HTML-encoded: &lt;img ... src=&quot;filename&quot; ... &gt;
            const regexEscaped = new RegExp(
              `(&lt;img[^&]*src=&quot;)${escapedName}(&quot;[^&]*&gt;)`,
              'gu',
            );
            seoText = seoText.replace(regexEscaped, `$1${outputFilename}$2`);

            // 3) HTML-encoded, але з подвійними лапками всередині: src="filename"
            const regexMixed = new RegExp(
              `(&lt;img[^&]*src=")${escapedName}(".*?&gt;)`,
              'gu',
            );
            seoText = seoText.replace(regexMixed, `$1${outputFilename}$2`);
          }

          req['newSeoText'] = seoText;
          req['processedImages'] = processedImages;
        }
        if (req.files && Array.isArray(req.files['mainImages'])) {
          console.log(
            '⭐ [MAIN IMAGES] знайдено',
            req.files['mainImages'].length,
            'файлів',
          );

          const mainImageDir = path.join(targetDir, 'main');
          if (!fs.existsSync(mainImageDir))
            fs.mkdirSync(mainImageDir, { recursive: true });

          const mainImagesPath: string[] = [];

          for (const file of req.files['mainImages'] as Express.Multer.File[]) {
            const uuid = crypto.randomUUID();
            const outputFilename = `${uuid}.webp`;
            const outputPath = path.join(mainImageDir, outputFilename);

            const image = sharp(file.buffer);
            const metadata = await image.metadata();

            const targetAspect = 16 / 9;
            let cropWidth = metadata.width || 0;
            let cropHeight = Math.round(cropWidth / targetAspect);

            if (cropHeight > (metadata.height || 0)) {
              cropHeight = metadata.height || 0;
              cropWidth = Math.round(cropHeight * targetAspect);
            }

            const left = Math.max(
              0,
              Math.round(((metadata.width || 0) - cropWidth) / 2),
            );
            const top = Math.max(
              0,
              Math.round(((metadata.height || 0) - cropHeight) / 2),
            );

            await image
              .extract({ left, top, width: cropWidth, height: cropHeight })
              .resize(1920, 1080)
              .toFormat('webp', { quality: 90 })
              .toFile(outputPath);

            await exiftool.write(outputPath, {}, ['-all=']);
            mainImagesPath.push(outputFilename);
          }

          req['mainImagesPath'] = mainImagesPath;
          console.log('✅ [MAIN IMAGES SAVED]', mainImagesPath);
        }

        if (req.files && Array.isArray(req.files['leaflets'])) {
          const leafletsDir = path.join(targetDir, 'leaflets');
          if (!fs.existsSync(leafletsDir))
            fs.mkdirSync(leafletsDir, { recursive: true });

          const leafletsPath = [];
          for (const file of req.files['leaflets'] as Express.Multer.File[]) {
            const uuid = crypto.randomUUID();
            const outputFilename = `${uuid}.webp`;
            const outputPath = path.join(leafletsDir, outputFilename);

            await sharp(file.buffer)
              .toFormat('webp', { quality: 90 })
              .toFile(outputPath);

            await exiftool.write(outputPath, {}, ['-all=']);

            leafletsPath.push(outputFilename);
          }
          req['leafletsPath'] = leafletsPath;
        }

        next();
      } catch (error) {
        console.error('❌ [ERROR] Помилка при обробці зображень:', error);
        throw new BadRequestException('Не вдалося обробити зображення');
      }
    });
  }
}
