import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SviatoDocument = SviatoImages & Document;

@Schema({ collection: 'sviatoimages' })
export class SviatoImages {
  @Prop({ type: String, required: true })
  date: string;

  @Prop({ type: [String], default: [] })
  images: string[];
}

export const SviatoImagesSchema = SchemaFactory.createForClass(SviatoImages);
