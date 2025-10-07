import { LocalDate } from '@js-joda/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sviato, SviatoDocument } from './schema/sviato.schema';
import * as crypto from 'crypto';
import { SviatoImages } from './schema/sviatoimages.schema';
import { DayRules, DayRulesDocument } from './schema/dayrules.schema';

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
}
