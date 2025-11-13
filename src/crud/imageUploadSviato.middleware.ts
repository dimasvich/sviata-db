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

// ✅ додаємо поле mainImages замість mainImage
const upload = multer({ storage: multer.memoryStorage() }).fields([
  { name: 'images', maxCount: 20 },
  { name: 'mainImages', maxCount: 10 }, // ✅ головні зображення — множина
  { name: 'leaflets', maxCount: 20 },
]);

@Injectable()
export class ImageUploadSviato implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    upload(req, res, async (err) => {
      console.log('🟢 [MULTER] Завантаження стартувало');
      if (err) throw new BadRequestException('Помилка при завантаженні файлів');

      try {
        const sviatoId = req.params['id'];
        if (!sviatoId)
          throw new BadRequestException('Відсутній ID свята у маршруті');

        const targetDir = path.join(uploadDir, sviatoId);
        if (!fs.existsSync(targetDir))
          fs.mkdirSync(targetDir, { recursive: true });

        let sviatoDataRaw = req.body.sviatoData;
        let sviatoData: any = {};
        if (sviatoDataRaw) {
          try {
            sviatoData = JSON.parse(sviatoDataRaw);
          } catch (e) {
            console.error('❌ [PARSE ERROR] sviatoData:', e);
          }
        }

        const processedImages = [];

        // 🔹 Обробка звичайних зображень
        if (req.files && Array.isArray(req.files['images'])) {
          for (const file of req.files['images'] as Express.Multer.File[]) {
            const uuid = crypto.randomUUID();
            const outputFilename = `${uuid}.webp`;
            const outputPath = path.join(targetDir, outputFilename);

            await sharp(file.buffer)
              .toFormat('webp', { quality: 90 })
              .toFile(outputPath);
            await exiftool.write(outputPath, {}, ['-all=']);

            processedImages.push(outputFilename);
          }
        }

        // 🔹 Обробка головних зображень (mainImages)
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

            // 🔸 Пропорційно центровано crop під 16:9
            const targetAspect = 16 / 9;
            let cropWidth = metadata.width || 0;
            let cropHeight = Math.round(cropWidth / targetAspect);
            if (cropHeight > (metadata.height || 0)) {
              cropHeight = metadata.height || 0;
              cropWidth = Math.round(cropHeight * targetAspect);
            }

            const left = Math.max(0, Math.round(((metadata.width || 0) - cropWidth) / 2));
            const top = Math.max(0, Math.round(((metadata.height || 0) - cropHeight) / 2));

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

        // 🔹 Обробка leaflet-файлів
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

        req['processedImages'] = processedImages;
        req.body.sviatoData = JSON.stringify(sviatoData);
        next();
      } catch (error) {
        console.error('❌ [ERROR] Помилка при обробці зображень:', error);
        throw new BadRequestException('Не вдалося обробити зображення');
      }
    });
  }
}
