import { LocalDate } from '@js-joda/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sviato, SviatoDocument } from './schema/sviato.schema';
import * as crypto from 'crypto';
import { SviatoImages } from './schema/sviatoimages.schema';
import { DayRules, DayRulesDocument } from './schema/dayrules.schema';
import { DayInfo, SviatoTag } from 'src/types';

@Injectable()
@Injectable()
export class CrudService {
  constructor(
    @InjectModel(Sviato.name) private sviatoModel: Model<SviatoDocument>,
    @InjectModel(SviatoImages.name)
    private sviatoImagesModel: Model<SviatoImages>,
    @InjectModel(DayRules.name) private dayRulesModel: Model<DayRulesDocument>,
  ) {}

  async create(sviatoData: Partial<Sviato>): Promise<Sviato> {
    const sviato = new this.sviatoModel(sviatoData);

    const date = LocalDate.parse(sviato.date);

    sviato.dayOfMonth = date.dayOfMonth();
    sviato.dayOfYear = date.dayOfYear();
    sviato.dayOfWeek = date.dayOfWeek().toString();
    sviato.month = date.monthValue();

    return sviato.save();
  }

  async getById(id: string) {
    try {
      const sviato = await this.sviatoModel.findOne({ _id: id });
      return sviato;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, sviatoData: Partial<Sviato>): Promise<Sviato> {
    const sviato = await this.sviatoModel.findById(id);
    if (!sviato) throw new NotFoundException('Свято не знайдено');

    Object.assign(sviato, sviatoData);

    return sviato.save();
  }

  async updateDescriptionByDate(
    date: string,
    description: string,
  ): Promise<{ modifiedCount: number }> {
    const result = await this.sviatoModel.updateMany({ date }, { description });

    if (result.matchedCount === 0) {
      throw new NotFoundException(`Свята з датою ${date} не знайдено`);
    }

    return { modifiedCount: result.modifiedCount };
  }

  async addImagesToSviato(id: string, paths: string[]): Promise<Sviato> {
    const sviato = await this.sviatoModel.findById(id);
    if (!sviato) throw new NotFoundException('Свято не знайдено');

    sviato.images = [...sviato.images, ...paths];
    return sviato.save();
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const res = await this.sviatoModel.findByIdAndDelete(id);
    return { deleted: !!res };
  }

  async getByDate(date: string): Promise<Sviato[]> {
    return this.sviatoModel.find({ date }).exec();
  }

  async getImagesByDate(date: string): Promise<string[]> {
    const record = await this.sviatoImagesModel.findOne({ date }).exec();
    return record ? record.images : [];
  }

  async setImagesForDate(id: string, images: string[]) {
    const sviato = await this.sviatoModel.findOne({ _id: id });
    if (!sviato) throw new Error('Sviato was not found');

    const start = new Date(sviato.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(sviato.date);
    end.setHours(23, 59, 59, 999);

    return await this.sviatoImagesModel.create({
      date: sviato.date,
      images,
    });
  }

  async createDayRule(
    title: string,
    html: string,
    date: Date,
  ): Promise<DayRules> {
    const newRule = new this.dayRulesModel({ title, html, date });
    return newRule.save();
  }

  async getRulesByDate(date: string): Promise<DayRules[]> {
    return this.dayRulesModel.find({ date }).exec();
  }

  async updateDayRule(
    id: string,
    dayRule: Partial<DayRules>,
  ): Promise<DayRules> {
    const dayrule = await this.dayRulesModel.findById(id);
    if (!dayrule) throw new NotFoundException('Правило не знайдено');

    Object.assign(dayrule, dayRule);

    return dayrule.save();
  }
  async getByMonth(month: number): Promise<
    {
      date: string;
      description: string;
      sviata: {
        id: string;
        name: string;
        document: string;
        tag: SviatoTag | '';
      }[];
    }[]
  > {
    const sviata = await this.sviatoModel
      .find({ month })
      .sort({ date: 1 })
      .exec();

    const grouped: Record<
      string,
      {
        description: string;
        sviata: {
          name: string;
          document: string;
          tag: SviatoTag | '';
          id: string;
        }[];
      }
    > = {};

    sviata.forEach((item) => {
      const dateKey = item.date;

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          description: item.description || '-',
          sviata: [],
        };
      }

      if (item.name) {
        grouped[dateKey].sviata.push({
          name: item.name,
          document: item.doc || '',
          tag: (item.tags.map((item) => item).join(',') as SviatoTag) || '',
          id: item._id as string,
        });
      }
    });

    return Object.entries(grouped).map(([date, value]) => ({
      date,
      description: value.description,
      sviata: value.sviata,
    }));
  }
  async getDayInfo(
    start: string,
    end: string,
    year: number,
  ): Promise<DayInfo[]> {
    const sviata = await this.sviatoModel
      .find({
        date: { $gte: start, $lte: end },
      })
      .exec();

    const filledDates = new Set(
      sviata
        .filter(
          (s) =>
            s.description &&
            s.description.trim() !== '' &&
            s.name &&
            s.name.trim() !== '' &&
            s.seoText &&
            s.seoText.trim() !== '',
        )
        .map((s) => s.date),
    );

    const startDate = new Date(start);
    const endDate = new Date(end);
    const result: DayInfo[] = [];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const dayOfYear = Math.floor(
        (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      result.push({
        dayOfMonth: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        date: dateStr,
        dayOfYear,
        isFilled: filledDates.has(dateStr),
      });
    }

    return result;
  }

  async getTags() {
    return Object.values(SviatoTag).filter((v) => typeof v === 'string');
  }
}
