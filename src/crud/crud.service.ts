import { LocalDate } from '@js-joda/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { Model } from 'mongoose';
import { DayInfo, SviatoTag } from 'src/types';
import { DayRules, DayRulesDocument } from './schema/dayrules.schema';
import { SviatoDocument, Svyato } from './schema/svyato.schema';

@Injectable()
@Injectable()
export class CrudService {
  constructor(
    @InjectModel(Svyato.name) private sviatoModel: Model<SviatoDocument>,
    @InjectModel(DayRules.name) private dayRulesModel: Model<DayRulesDocument>,
  ) {}

  async create(sviatoData: Partial<Svyato>): Promise<Svyato> {
    const svyato = new this.sviatoModel(sviatoData);

    if (
      svyato.date &&
      typeof svyato.date === 'string' &&
      svyato.date.includes('-')
    ) {
      try {
        const date = LocalDate.parse(svyato.date);
        svyato.dayOfMonth = date.dayOfMonth();
        svyato.dayOfYear = date.dayOfYear();
        svyato.dayOfWeek = date.dayOfWeek().toString();
        svyato.month = date.monthValue();
      } catch (e) {
        console.warn('Invalid date, skipping date parsing:', svyato.date);
      }
    }
    svyato.dateUpdate = dayjs().format('YYYY-MM-DD');
    return svyato.save();
  }

  async getById(id: string) {
    try {
      const svyato = await this.sviatoModel.findOne({ _id: id });
      return svyato;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, sviatoData: Partial<Svyato>): Promise<Svyato> {
    const updated = await this.sviatoModel.findOneAndUpdate(
      { _id: id },
      { $set: { ...sviatoData, dateUpdate: dayjs().format('YYYY-MM-DD') } },
      { new: true, upsert: false, runValidators: true },
    );

    if (!updated) {
      throw new NotFoundException('Свято не знайдено');
    }

    return updated;
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

  async addImagesToSviato(id: string, paths: string[]): Promise<Svyato> {
    const svyato = await this.sviatoModel.findById(id);
    if (!svyato) throw new NotFoundException('Свято не знайдено');

    // svyato.images = [...svyato.images, ...paths];
    return svyato.save();
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const res = await this.sviatoModel.findByIdAndDelete(id);
    return { deleted: !!res };
  }

  async getByDate(date: string): Promise<Svyato[]> {
    return this.sviatoModel.find({ date }).exec();
  }

  async setImagesForDate(id: string, images: string[]) {
    const svyato = await this.sviatoModel.findOne({ _id: id });
    if (!svyato) throw new Error('Svyato was not found');

    const start = new Date(svyato.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(svyato.date);
    end.setHours(23, 59, 59, 999);
  }

  async createDayRule(
    title: string,
    html: string,
    date: Date,
  ): Promise<DayRules> {
    const newRule = new this.dayRulesModel({ title, html, date });
    return newRule.save();
  }

  async searchByName(query: string) {
    try {
      if (!query) return [];

      const normalized = query.trim().replace(/\s+/g, ' ').toLowerCase();

      const words = normalized.split(' ');

      const regexConditions = words.map((word) => ({
        name: {
          $regex: new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
        },
      }));

      const results = await this.sviatoModel
        .find(
          {
            $and: regexConditions,
            articleId: { $exists: true, $ne: '' },
          },
          { _id: 1, name: 1, articleId: 1 },
        )
        .limit(3)
        .lean();

      return results;
    } catch (error) {
      throw error;
    }
  }

  // async makeRelated(body: {
  //   id: string;
  //   related: { _id: string; name: string; articleId: string };
  // }) {
  //   try {
  //     const { id, related } = body;
  //     const svyato = await this.sviatoModel.findOne({ _id: new Types.ObjectId(id) });
  //     await this.sviatoModel.findOneAndUpdate(
  //       { _id: new Types.ObjectId(id) },
  //       { related: [...svyato?.related || [],related] },
  //     );
  //     return { success: true };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

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
      svyata: {
        id: string;
        name: string;
        document: string;
        tag: SviatoTag | '';
      }[];
    }[]
  > {
    const svyata = await this.sviatoModel
      .find({ month })
      .sort({ date: 1 })
      .exec();

    const grouped: Record<
      string,
      {
        description: string;
        svyata: {
          name: string;
          document: string;
          tag: SviatoTag | '';
          id: string;
        }[];
      }
    > = {};

    svyata.forEach((item) => {
      const dateKey = item.date;

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          description: item.description || '-',
          svyata: [],
        };
      }

      if (item.name) {
        grouped[dateKey].svyata.push({
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
      svyata: value.svyata,
    }));
  }
  async getDayInfo(
    start: string,
    end: string,
    year: number,
  ): Promise<DayInfo[]> {
    const svyata = await this.sviatoModel
      .find({
        date: { $gte: start, $lte: end },
      })
      .exec();

    const filledDates = new Set(
      svyata
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
