import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Sviato } from './sviato.schema';
import { SviatoBlock } from 'src/types';

export type SviatoArticleDocument = SviatoArticle & Document;

@Schema({ collection: 'sviata_articles' })
export class SviatoArticle {
  @Prop({ type: String, required: true })
  sviatoId: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: [], default: null })
  blocks?: SviatoBlock[];
}

export const SviatoArticleSchema = SchemaFactory.createForClass(SviatoArticle);
