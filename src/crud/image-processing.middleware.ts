import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as multer from 'multer';
import * as sharp from 'sharp';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { exiftool } from 'exiftool-vendored';

const upload = multer({ storage: multer.memoryStorage() });

@Injectable()
export class ImageProcessingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    upload.array('images', 20)(req, res, async (err) => {
      if (err) throw new BadRequestException('Помилка при завантаженні файлів');
      if (!req.files) return next();

      const sviatoId = req.params['id'];
      if (!sviatoId) {
        throw new BadRequestException('Відсутній ID свята у маршруті');
      }

      // Створюємо директорію uploads/{sviatoId}/main якщо її ще немає
      const sviatoDir = path.join(__dirname, '..', '..', 'uploads', sviatoId, 'main');
      if (!fs.existsSync(sviatoDir)) {
        fs.mkdirSync(sviatoDir, { recursive: true });
      }

      const processedImages = [];

      for (const file of req.files as Express.Multer.File[]) {
        const uniqueName = crypto.randomUUID() + '.webp';
        const outputPath = path.join(sviatoDir, uniqueName);

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

        // Очищаємо EXIF-дані
        await exiftool.write(outputPath, {}, ['-all=']);

        processedImages.push({
          filename: uniqueName,
          path: outputPath,
          alt: req.body.alt || 'Зображення без опису',
          mimetype: 'image/webp',
        });
      }

      req['processedImages'] = processedImages;
      next();
    });
  }
}
