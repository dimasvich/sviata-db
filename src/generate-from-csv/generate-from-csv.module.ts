import { Module } from '@nestjs/common';
import { GenerateFromCsvService } from './generate-from-csv.service';
import { GenerateFromCsvController } from './generate-from-csv.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sviato, SviatoSchema } from 'src/crud/schema/sviato.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sviato.name, schema: SviatoSchema }]),
  ],
  providers: [GenerateFromCsvService],
  controllers: [GenerateFromCsvController],
})
export class GenerateFromCsvModule {}
