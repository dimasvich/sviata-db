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

// 👇 одночасно приймаємо масив images і один файл mainImage
const upload = multer({ storage: multer.memoryStorage() }).fields([
  { name: 'images', maxCount: 10 },
  { name: 'mainImage', maxCount: 1 },
]);

@Injectable()
export class WhoWasBornImageMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    upload(req, res, async (err) => {
      if (err) throw new BadRequestException('Помилка при завантаженні файлів');

      try {
        const date = req.params['date'];
        if (!date) throw new BadRequestException('Відсутня дата у маршруті');

        const targetDir = path.join(uploadDir, date);
        if (!fs.existsSync(targetDir))
          fs.mkdirSync(targetDir, { recursive: true });

        const whoWasBornDir = path.join(targetDir, 'whoWasBorn');
        if (!fs.existsSync(whoWasBornDir))
          fs.mkdirSync(whoWasBornDir, { recursive: true });

        const processedImages = [];

        if (req.files && Array.isArray(req.files['images'])) {
          for (const file of req.files['images'] as Express.Multer.File[]) {
            const originalName = path.parse(file.originalname).name;
            const outputFilename = `${originalName}.webp`;
            const outputPath = path.join(whoWasBornDir, outputFilename);

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
