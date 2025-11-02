import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Celebrate, Source, SviatoTag, SviatoType, TimeBlock } from 'src/types';

export type SviatoDocument = Sviato & Document;

@Schema({ collection: 'sviata' })
export class Sviato {
  @Prop({ type: String, required: false })
  articleId: string;

  @Prop({ type: String, required: false })
  title: string;

  @Prop({ type: String, required: false })
  description: string;

  @Prop({ type: String, required: false })
  name: string;

  @Prop({ type: String, required: false, maxLength: 250 })
  teaser: string;

  @Prop({ type: [String], required: false, enum: SviatoTag })
  tags: SviatoTag[];

  @Prop({ type: [String], required: false })
  keywords: string[];

  @Prop({ type: [], required: false })
  sources: Source[];

  @Prop({ type: [], required: false })
  timeline: TimeBlock[];

  @Prop({ type: [String], required: false })
  related: string[];

  @Prop({ type: [String], required: false })
  moreIdeas: string[];

  @Prop({ type: [String], required: false })
  greetings: string[];

  @Prop({ type: [String], required: false })
  ideas: string[];

  @Prop({ type: [String], required: false })
  facts: string[];

  @Prop({ type: {}, required: false })
  celebrate: Celebrate;

  @Prop({ type: String, required: false })
  seoText: string;

  @Prop({ type: String, required: false })
  doc: string;

  @Prop({ type: String, enum: SviatoType })
  type: SviatoType;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: String, default: Date.now })
  date: string;

  @Prop({ type: Number })
  dayOfYear: number;

  @Prop({ type: Number })
  dayOfMonth: number;

  @Prop({ type: String })
  dayOfWeek: string;

  @Prop({ type: Number })
  month: number;

  @Prop({ type: Number })
  year: number;
}

export const SviatoSchema = SchemaFactory.createForClass(Sviato);
