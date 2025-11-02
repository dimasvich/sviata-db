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

const upload = multer({ storage: multer.memoryStorage() });

@Injectable()
export class MonthlyImageProcessingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    upload.array('images', 100)(req, res, async (err) => {
      if (err) throw new BadRequestException('Помилка при завантаженні файлів');
      if (!req.files) return next();

      const { date } = req.params;
      if (!date) {
        throw new BadRequestException('Поле "date" є обовʼязковим');
      }

      const targetDir = path.join(__dirname, '..', '..', 'uploads', date);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const processedImages = [];

      for (const file of req.files as Express.Multer.File[]) {
        const uniqueName = crypto.randomUUID() + '.webp';
        const outputPath = path.join(targetDir, uniqueName);

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
