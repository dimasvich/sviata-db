import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { Document } from 'mongoose';
import { CompleteStatus, TimeBlock, WhoWasBornToday } from 'src/types';

export type DayDocument = Day & Document;

@Schema({ collection: 'days' })
export class Day {
  @Prop({ type: String, required: false })
  articleId: string;

  @Prop({ type: String, required: false })
  description: string;

  @Prop({ type: String, required: false, maxLength: 250 })
  teaser: string;

  @Prop({ type: [], required: false })
  timeline: TimeBlock[];

  @Prop({ type: [String], required: false })
  bornNames: string[];

  @Prop({ type: [{}], required: false })
  whoWasBornToday: WhoWasBornToday[];

  @Prop({ type: String, required: false })
  mainImage: string;

  @Prop({ type: String, required: false })
  mainImageUpload: string;

  @Prop({ type: [String], required: false })
  keywords: string[];

  @Prop({ type: [String], required: false })
  omens: string[];

  @Prop({ type: String, required: false })
  seoText: string;

  @Prop({ type: String, required: false })
  doc: string;

  @Prop({ type: String, enum: CompleteStatus, default: CompleteStatus.EMPTY })
  status: CompleteStatus;

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
}

export const DaySchema = SchemaFactory.createForClass(Day);
