import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Day, DayDocument } from './schema/day.schema';

@Injectable()
export class DayService {
  constructor(@InjectModel(Day.name) private dayModel: Model<DayDocument>) {}

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

  async getDay(date: string) {
    try {
      const day = await this.dayModel.findOne({ date });
      return day;
    } catch (error) {
      throw error;
    }
  }
}
