import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DayRulesEnum } from 'src/types';

export type DayRulesDocument = DayRules & Document;

@Schema()
export class DayRules {
  @Prop({ type: String, enum: DayRulesEnum })
  title: DayRulesEnum;

  @Prop()
  html: string;

  @Prop({ type: String, default: Date.now })
  date: string;
}

export const DayRulesSchema = SchemaFactory.createForClass(DayRules);
