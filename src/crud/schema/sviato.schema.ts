import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SviatoDocument = Sviato & Document;

@Schema({ collection: 'sviata' })
export class Sviato {
  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  seoText: string;

  @Prop({ type: String })
  timestamp: string;

  @Prop({ type: Number })
  dayOfYear: number;

  @Prop({ type: Number })
  dayOfMonth: number;

  @Prop({ type: String })
  dayOfWeek: string;
}

export const SviatoSchema = SchemaFactory.createForClass(Sviato);
