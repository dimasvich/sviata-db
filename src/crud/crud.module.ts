import { Module } from '@nestjs/common';
import { CrudService } from './crud.service';
import { CrudController } from './crud.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sviato, SviatoSchema } from './schema/sviato.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sviato.name, schema: SviatoSchema }]),
  ],
  providers: [CrudService],
  controllers: [CrudController],
})
export class CrudModule {}
