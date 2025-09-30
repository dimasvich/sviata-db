import { LocalDate } from '@js-joda/core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AddArticlesToSviatoDto,
  CreateSviatoDto,
  UpdateSviatoArticleDto,
  UpdateSviatoDto,
} from './dto/index.dto';
import { Sviato } from './schema/sviato.schema';
import { SviatoArticle } from './schema/sviato-article.schema';

@Injectable()
export class CrudService {
  constructor(
    @InjectModel(Sviato.name)
    private sviatoModel: Model<Sviato>,

    @InjectModel(SviatoArticle.name)
    private sviatoArticleModel: Model<SviatoArticle>,
  ) {}

  async create(body: CreateSviatoDto) {
    try {
      const { timestamp } = body;
      const date = LocalDate.parse(timestamp);
      const sviato = await this.sviatoModel.create({
        ...body,
        timestamp,
        dayOfWeek: date.dayOfWeek(),
        dayOfMonth: date.dayOfMonth(),
        dayOfYear: date.dayOfYear(),
        month: date.month(),
        year: date.year(),
      });
      return { success: true, sviatoId: sviato._id };
    } catch (error) {
      throw error;
    }
  }
  async addArticleToSviato(body: AddArticlesToSviatoDto) {
    try {
      const { sviatoId, title } = body;

      // const articleExists = await this.sviatoArticleModel.find({
      //   sviatoId: new Types.ObjectId(sviatoId),
      //   title,
      // });

      // if (articleExists)
      //   throw new BadRequestException('The article already exists');

      const article = await this.sviatoArticleModel.create({
        sviatoId: sviatoId,
        ...body,
      });

      return { article };
    } catch (error) {
      throw error;
    }
  }
  async updateSviatoArticle(body: UpdateSviatoArticleDto) {
    try {
      const { id } = body;

      const article = await this.sviatoArticleModel.updateOne(
        {
          _id: new Types.ObjectId(id),
        },
        { ...body },
      );

      return { article };
    } catch (error) {
      throw error;
    }
  }
  async update(body: UpdateSviatoDto) {
    try {
      const { id, timestamp } = body;
      const date = LocalDate.parse(timestamp.split('T')[0]);
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
      const articles = await this.sviatoArticleModel.find({
        sviatoId: id,
      });
      return { sviato, articles };
    } catch (error) {
      throw error;
    }
  }
  async delete(id: string) {
    const objectId = new Types.ObjectId(id);

    await this.sviatoArticleModel.deleteMany({ sviatoId: id });

    await this.sviatoModel.deleteOne({ _id: objectId });

    return { success: true };
  }
}
