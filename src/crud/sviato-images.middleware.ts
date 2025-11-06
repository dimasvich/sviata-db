import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as multer from 'multer';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import { exiftool } from 'exiftool-vendored';
import * as crypto from 'crypto';

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ storage: multer.memoryStorage() });

@Injectable()
export class SviatoImageProcessingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    upload.array('images', 20)(req, res, async (err) => {
      if (err) throw new BadRequestException('Помилка при завантаженні файлів');
      if (!req.files) return next();

      try {
        const sviatoId = req.params['id'];
        if (!sviatoId) {
          throw new BadRequestException('Відсутній ID свята у маршруті');
        }

        const targetDir = path.join(uploadDir, sviatoId);
        if (!fs.existsSync(targetDir))
          fs.mkdirSync(targetDir, { recursive: true });

        const processedImages = [];

        let seoText = req.body.seoText || '';

        for (const file of req.files as Express.Multer.File[]) {
          const uuid = crypto.randomUUID();
          const outputFilename = `${uuid}.webp`;
          const outputPath = path.join(targetDir, outputFilename);

          const image = sharp(file.buffer);
          const metadata = await image.metadata();

          const targetAspect = 16 / 9;
          let cropWidth = metadata.width;
          let cropHeight = Math.round(metadata.width / targetAspect);

          if (cropHeight > metadata.height) {
            cropHeight = metadata.height;
            cropWidth = Math.round(metadata.height * targetAspect);
          }

          const left = Math.round((metadata.width - cropWidth) / 2);
          const top = Math.round((metadata.height - cropHeight) / 2);

          await image
            .extract({ left, top, width: cropWidth, height: cropHeight })
            .toFormat('webp', { quality: 90 })
            .toFile(outputPath);

          await exiftool.write(outputPath, {}, ['-all=']);

          processedImages.push({
            filename: outputFilename,
            path: outputPath,
            alt: req.body.alt || 'Зображення без опису',
            mimetype: 'image/webp',
          });

          // Підготовка назв для безпечного використання у RegExp
          const escapedName = file.originalname.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&',
          );

          // Звичайна заміна (напряму у тексті)
          const regexNormal = new RegExp(escapedName, 'g');
          seoText = seoText.replace(regexNormal, outputFilename);

          // Додаткова заміна для HTML-екранованих тегів <img>
          const regexEscaped = new RegExp(
            `(&lt;img[^&]*src=&quot;)${escapedName}(&quot;[^&]*&gt;)`,
            'g',
          );
          seoText = seoText.replace(regexEscaped, `$1${outputFilename}$2`);

          // Також варіант, якщо у тебе src="..." екрановано через &lt; і &gt;, але не через &quot;
          const regexMixed = new RegExp(
            `(&lt;img[^&]*src=")${escapedName}(".*?&gt;)`,
            'g',
          );
          seoText = seoText.replace(regexMixed, `$1${outputFilename}$2`);
        }

        req.body.seoText = seoText;

        req['processedImages'] = processedImages;

        next();
      } catch (error) {
        console.error('❌ Помилка при обробці зображення:', error);
        throw new BadRequestException('Не вдалося обробити зображення');
      }
    });
  }
}
