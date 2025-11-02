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

        for (const file of req.files as Express.Multer.File[]) {
          const originalName = path.parse(file.originalname).name;
          const outputFilename = `${originalName}.webp`;
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
