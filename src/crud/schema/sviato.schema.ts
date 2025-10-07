import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Source, SviatoType } from 'src/types';

export type SviatoDocument = Sviato & Document;

@Schema({ collection: 'sviata' })
export class Sviato {
  @Prop({ type: String, required: false })
  title: string;

  @Prop({ type: String, required: false })
  description: string;

  @Prop({ type: String, required: false })
  name: string;

  @Prop({ type: String, required: false, maxLength: 250 })
  teaser: string;

  @Prop({ type: [String], required: false })
  tags: string[];

  @Prop({ type: [String], required: false })
  keywords: string[];

  @Prop({ type: [], required: false })
  sources: Source[];

  @Prop({ type: [String], required: false })
  omens: string[];

  @Prop({ type: String, required: false })
  seoText: string;

  @Prop({ type: String, enum: SviatoType })
  type: SviatoType;

  @Prop({ type: String, default: Date.now })
  date: string;

  @Prop({ type: Number })
  dayOfYear: number;

  @Prop({ type: Number })
  dayOfMonth: number;

  @Prop({ type: String })
  dayOfWeek: string;

  @Prop({ type: String })
  month: string;

  @Prop({ type: Number })
  year: number;
}

export const SviatoSchema = SchemaFactory.createForClass(Sviato);
