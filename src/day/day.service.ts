import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Svyato, SviatoDocument } from 'src/crud/schema/svyato.schema';
import { Day, DayDocument } from './schema/day.schema';
import { CompleteStatus } from 'src/types';
import * as dayjs from 'dayjs';
import { countWebpImages } from 'src/utils/count-webp-images';
import * as path from 'path';

@Injectable()
export class DayService {
  constructor(
    @InjectModel(Day.name) private dayModel: Model<DayDocument>,
    @InjectModel(Svyato.name) private sviatoModel: Model<SviatoDocument>,
  ) {}

  async update(date: string, dayData: Partial<Day>): Promise<Day> {
    const day = await this.dayModel.findOneAndUpdate(
      { date },
      { $set: { ...dayData, dateUpdate: dayjs().format('YYYY-MM-DD') } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    return day;
  }

  async getDay(date: string) {
    try {
      const day = await this.dayModel.findOne({ date });
      return day;
    } catch (error) {
      throw error;
    }
  }
  async getByMonth(month: number) {
    const year = new Date().getFullYear();
    const monthStr = month.toString().padStart(2, '0');
    const regex = new RegExp(`^${year}-${monthStr}`);

    const days = await this.dayModel
      .find({ date: regex }, { date: 1, description: 1, dateUpload: 1, _id: 0 })
      .sort({ date: 1 })
      .lean();

    const svyata = await this.sviatoModel
      .find(
        { date: regex },
        { date: 1, name: 1, description: 1, leaflets: 1, tags: 1 },
      )
      .sort({ date: 1 })
      .lean();

    const sviataByDate: Record<
      string,
      {
        id: string;
        name: string;
        hasDescription: boolean;
        hasLeaflets: boolean;
        tags: string[];
        images: number;
      }[]
    > = {};

    for (const item of svyata) {
      const date = item.date?.trim?.();
      if (!date) continue;

      const uploadDir = path.join('uploads', item._id.toString());
      const imagesCount = await countWebpImages(uploadDir);

      if (!sviataByDate[date]) sviataByDate[date] = [];

      sviataByDate[date].push({
        id: item._id.toString(),
        name: item.name,
        hasDescription: Boolean(
          item.description && item.description.trim().length > 0,
        ),
        hasLeaflets: Boolean(item.leaflets && item.leaflets.length > 0),
        tags: item.tags,
        images: imagesCount,
      });
    }

    const allDates = Array.from(
      new Set([...days.map((d) => d.date), ...Object.keys(sviataByDate)]),
    ).sort();

    return allDates.map((date) => {
      const day = days.find((d) => d.date === date);
      return {
        date,
        description: day?.description || '',
        dateUpload: day?.dateUpload || '',
        svyata: sviataByDate[date] || [],
      };
    });
  }

  async getStatusByYear(
    year: number,
  ): Promise<{ date: string; status: string | CompleteStatus }[]> {
    const regex = new RegExp(`^${year}-`);

    const daysFromDb = await this.dayModel
      .find({ date: regex })
      .select('date status -_id')
      .lean()
      .exec();

    const dayMap = new Map(
      daysFromDb.map((d) => [d.date, d.status as CompleteStatus]),
    );

    const start = dayjs(`${year}-01-01`);
    const end = dayjs(`${year}-12-31`);
    const daysInYear = end.diff(start, 'day') + 1;

    const allDays: { date: string; status: string | CompleteStatus }[] = [];

    for (let i = 0; i < daysInYear; i++) {
      const dateStr = start.add(i, 'day').format('YYYY-MM-DD');
      const status = dayMap.get(dateStr) ?? CompleteStatus.EMPTY;
      allDays.push({ date: dateStr, status });
    }

    return allDays;
  }

  async getStatusByMonth(month: number): Promise<Partial<Day>[]> {
    const year = new Date().getFullYear();
    const monthStr = month.toString().padStart(2, '0');
    const regex = new RegExp(`^${year}-${monthStr}`);

    const days = await this.dayModel
      .find({ date: regex })
      .sort({ date: 1, status: 1 })
      .exec();

    return days;
  }
}
