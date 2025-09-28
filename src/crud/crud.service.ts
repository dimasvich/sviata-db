import { LocalDate } from '@js-joda/core';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSviatoDto, UpdateSviatoDto } from './dto/index.dto';
import { Sviato } from './schema/sviato.schema';

@Injectable()
export class CrudService {
  constructor(
    @InjectModel(Sviato.name)
    private sviatoModel: Model<Sviato>,
  ) {}

  async create(body: CreateSviatoDto) {
    try {
      const { timestamp } = body;
      const date = LocalDate.parse(timestamp);
      await this.sviatoModel.create({
        ...body,
        timestamp,
        dayOfWeek: date.dayOfWeek(),
        dayOfMonth: date.dayOfMonth(),
        dayOfYear: date.dayOfYear(),
      });
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
  async update(body: UpdateSviatoDto) {
    try {
      const { id, timestamp } = body;
      const date = LocalDate.parse(timestamp);
      await this.sviatoModel.updateOne(
        { _id: new Types.ObjectId(id) },
        {
          ...body,
          timestamp,
          dayOfWeek: date.dayOfWeek(),
          dayOfMonth: date.dayOfMonth(),
          dayOfYear: date.dayOfYear(),
        },
      );
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
  async get10(page: number) {
    try {
      const elementsPerPage = 10;

      const [data, total] = await Promise.all([
        this.sviatoModel
          .find()
          .skip((page - 1) * elementsPerPage)
          .limit(elementsPerPage),
        this.sviatoModel.countDocuments(),
      ]);

      return {
        page,
        total,
        totalPages: Math.ceil(total / elementsPerPage),
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async getOne(id: string) {
    try {
      const sviato = await this.sviatoModel.findById(new Types.ObjectId(id));
      return { sviato };
    } catch (error) {
      throw error;
    }
  }
  async delete(id: string) {
    try {
      await this.sviatoModel.deleteOne({ _id: new Types.ObjectId(id) });
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
