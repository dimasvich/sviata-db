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

        const imagesDir = path.join(targetDir);
        if (!fs.existsSync(imagesDir))
          fs.mkdirSync(imagesDir, { recursive: true });

        const processedImages = [];

        if (req.files && Array.isArray(req.files['images'])) {
          for (const file of req.files['images'] as Express.Multer.File[]) {
            const originalNameUtf8 = Buffer.from(
              file.originalname,
              'latin1',
            ).toString('utf8');
            const originalName = path.parse(originalNameUtf8).name;
            const outputFilename = `${originalName}.webp`;
            const outputPath = path.join(imagesDir, outputFilename);

            const image = sharp(file.buffer);
            const metadata = await image.metadata();

            const cropSize = Math.min(
              metadata.width || 0,
              metadata.height || 0,
            );
            const left = Math.floor(((metadata.width || 0) - cropSize) / 2);
            const top = Math.floor(((metadata.height || 0) - cropSize) / 2);

            await image
              .extract({ left, top, width: cropSize, height: cropSize })
              .resize(400, 400)
              .toFormat('webp', { quality: 90 })
              .toFile(outputPath);

            await exiftool.write(outputPath, {}, ['-all=']);

            processedImages.push({
              filename: outputFilename,
              path: outputPath,
              mimetype: 'image/webp',
            });
          }
        }

        if (req.files && Array.isArray(req.files['mainImage'])) {
          const file = req.files['mainImage'][0];
          const mainImageDir = path.join(targetDir, 'main');
          if (!fs.existsSync(mainImageDir))
            fs.mkdirSync(mainImageDir, { recursive: true });

          const outputFilename = `main.webp`;
          const outputPath = path.join(mainImageDir, outputFilename);

          await sharp(file.buffer)
            .resize(800, 800, { fit: 'cover' })
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
