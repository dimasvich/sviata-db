import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sviato, SviatoDocument } from 'src/crud/schema/sviato.schema';
import { Day, DayDocument } from './schema/day.schema';

@Injectable()
export class DayService {
  constructor(
    @InjectModel(Day.name) private dayModel: Model<DayDocument>,
    @InjectModel(Sviato.name) private sviatoModel: Model<SviatoDocument>,
  ) {}

  async update(date: string, dayData: Partial<Day>): Promise<Day> {
    const day = await this.dayModel.findOneAndUpdate(
      { date },
      { $set: dayData },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    return day;
  }

  async getDaysRange(dateFrom: string, dateTo: string) {
    try {
    } catch (error) {
      throw error;
    }
  }

  async getDay(date: string) {
    try {
      const day = await this.dayModel.findOne({ date });
      return day;
    } catch (error) {
      throw error;
    }
  }
  async getByMonth(month: number): Promise<
    {
      date: string;
      description: string;
      sviata: {
        id: string;
        name: string;
        document: string;
        tags: string[];
      }[];
    }[]
  > {
    const year = new Date().getFullYear();
    const monthStr = month.toString().padStart(2, '0');
    const regex = new RegExp(`^${year}-${monthStr}`);

    const days = await this.dayModel
      .find({ date: regex }, { date: 1, description: 1, _id: 0 })
      .sort({ date: 1 })
      .lean()
      .exec();

    const sviata = await this.sviatoModel
      .find({ date: regex }, { date: 1, name: 1, doc: 1, tags: 1 })
      .sort({ date: 1 })
      .lean()
      .exec();

    const sviataByDate: Record<
      string,
      {
        id: string;
        name: string;
        document: string;
        tags: string[];
      }[]
    > = {};

    sviata.forEach((item) => {
      const date = item.date;
      if (!sviataByDate[date]) sviataByDate[date] = [];
      sviataByDate[date].push({
        id: item._id.toString(),
        name: item.name,
        document: item.doc,
        tags: item.tags,
      });
    });

    const result = days.map((day) => ({
      date: day.date,
      description: day.description || '',
      sviata: sviataByDate[day.date] || [],
    }));

    return result;
  }

  async getStatusByYear(year: number): Promise<Partial<Day>[]> {
    const regex = new RegExp(`^${year}-`);

    const days = await this.dayModel
      .find({ date: regex })
      .sort({ date: 1, status: 1 })
      .exec();

    return days;
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
