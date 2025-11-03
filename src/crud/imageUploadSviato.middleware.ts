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

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ storage: multer.memoryStorage() }).fields([
  { name: 'images', maxCount: 10 },
  { name: 'mainImage', maxCount: 1 },
]);

@Injectable()
export class ImageUploadSviato implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    upload(req, res, async (err) => {
      if (err) throw new BadRequestException('Помилка при завантаженні файлів');

      try {
        const sviatoId = req.params['id'];
        if (!sviatoId) {
          throw new BadRequestException('Відсутній ID свята у маршруті');
        }

        const targetDir = path.join(uploadDir, sviatoId);
        if (!fs.existsSync(targetDir))
          fs.mkdirSync(targetDir, { recursive: true });

        const processedImages = [];

        if (req.files && Array.isArray(req.files['images'])) {
          for (const file of req.files['images'] as Express.Multer.File[]) {
            const originalNameUtf8 = Buffer.from(
              file.originalname,
              'latin1',
            ).toString('utf8');
            const originalName = path.parse(originalNameUtf8).name;
            const outputFilename = `${originalName}.webp`;
            const outputPath = path.join(targetDir, outputFilename);

            const image = sharp(file.buffer);
            const metadata = await image.metadata();

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
              .resize(1280, 720)
              .toFormat('webp', { quality: 90 })
              .toFile(outputPath);

            await exiftool.write(outputPath, {}, ['-all=']);

            processedImages.push({
              filename: outputFilename,
              path: outputPath,
              alt: req.body.alt || 'Зображення без опису',
              mimetype: 'image/webp',
            });
          }
        }

        // 🔹 Обробка головного зображення (mainImage)
        if (req.files && Array.isArray(req.files['mainImage'])) {
          const file = req.files['mainImage'][0];
          const mainImageDir = path.join(targetDir, 'main');
          if (!fs.existsSync(mainImageDir))
            fs.mkdirSync(mainImageDir, { recursive: true });

          const outputFilename = `main.webp`;
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

          const left = Math.round(((metadata.width || 0) - cropWidth) / 2);
          const top = Math.round(((metadata.height || 0) - cropHeight) / 2);

          await image
            .extract({ left, top, width: cropWidth, height: cropHeight })
            .resize(1920, 1080) // головне зображення у 16:9
            .toFormat('webp', { quality: 90 })
            .toFile(outputPath);

          await exiftool.write(outputPath, {}, ['-all=']);
          req['mainImagePath'] = outputFilename;
        }

        req['processedImages'] = processedImages;
        next();
      } catch (error) {
        console.error('❌ Помилка при обробці зображення:', error);
        throw new BadRequestException('Не вдалося обробити зображення');
      }
    });
  }
}
