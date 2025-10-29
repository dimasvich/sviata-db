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
export class WhoWasBornImageMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    upload.array('images')(req, res, async (err) => {
      if (err) throw new BadRequestException('Помилка при завантаженні файлів');

      // якщо взагалі немає файлів — просто йдемо далі
      if (!req.files || !(req.files instanceof Array)) return next();

      try {
        const date = req.params['date'];
        if (!date) throw new BadRequestException('Відсутня дата у маршруті');

        const targetDir = path.join(uploadDir, date, 'whoWasBorn');
        if (!fs.existsSync(targetDir))
          fs.mkdirSync(targetDir, { recursive: true });

        const processedImages = [];

        for (const file of req.files as Express.Multer.File[]) {
          const originalName = path.parse(file.originalname).name;
          const outputFilename = `${originalName}.webp`;
          const outputPath = path.join(targetDir, outputFilename);

          const image = sharp(file.buffer);
          const metadata = await image.metadata();

          const cropSize = Math.min(metadata.width || 0, metadata.height || 0);
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
