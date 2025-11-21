import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { Document } from 'mongoose';
import {
  Celebrate,
  CompleteStatus,
  Faq,
  ImageWP,
  RelatedSviato,
  Source,
  SviatoTag,
  SviatoType,
  TimeBlock,
} from 'src/types';
export type SviatoDocument = Svyato & Document;

@Schema({ collection: 'svyata' })
export class Svyato {
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

  @Prop({ type: [], required: false })
  related: RelatedSviato[];

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

  @Prop({ type: [], required: false })
  faq: Faq[];

  @Prop({ type: String, required: false })
  seoText: string;

  @Prop({ type: String, required: false })
  doc: string;

  @Prop({ type: String, enum: SviatoType })
  type: SviatoType;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [], default: [] })
  imagesMap: ImageWP[];

  @Prop({ type: [String], default: [] })
  leaflets: string[];

  @Prop({ type: [], default: [] })
  leafletsMap: ImageWP[];

  @Prop({ type: String, enum: CompleteStatus, default: CompleteStatus.EMPTY })
  status: CompleteStatus;

  @Prop({ type: String, required: false })
  mainImage: string;

  @Prop({ type: String, required: false })
  link: string;

  @Prop({ type: Boolean, default: false })
  checkedAlternative: boolean;

  @Prop({
    type: String,
    default: () => dayjs().format('YYYY-MM-DD'),
  })
  date: string;

  @Prop({
    type: String,
    default: () => dayjs().format('YYYY-MM-DD'),
  })
  dateUpdate: string;

  @Prop({
    type: String,
    default: () => dayjs().format('YYYY-MM-DD'),
  })
  dateUpload: string;

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

export const SviatoSchema = SchemaFactory.createForClass(Svyato);
