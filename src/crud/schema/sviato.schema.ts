import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SviatoDocument = Sviato & Document;

@Schema({ collection: 'sviata' })
export class Sviato {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  seoText: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

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
