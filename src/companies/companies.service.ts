import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import mongoose, { Model, Types } from 'mongoose';
import { IUser } from 'src/users/users.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: SoftDeleteModel<CompanyDocument>,
  ) {}
  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
    const createdCompany = await this.companyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: new Types.ObjectId(user._id),
        email: user.email,
      }
    });
    return createdCompany;
  }

 async findAll(page: number, limit: number, qs: string) {

    const { filter, sort, projection, population } = aqp(qs);
    delete filter.page;
    delete filter.limit;

    let offset = (+page - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.companyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.companyModel.find(filter)

    .sort(sort as any)
    .skip(offset)
    .limit(defaultLimit)
    .select(projection)
    .populate(population)
    .exec();

    return {
      meta: {
        currentPage: page,
        pageSize: defaultLimit,
        total: totalItems,
        pages: totalPages,
      },
      result: result,
    }
  }

  async findOne(id: string) {
    return await this.companyModel.findOne({ _id: id });
  }

  update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
   return this.companyModel.updateOne({_id: new Types.ObjectId(id)}, {
    ...updateCompanyDto,
    updatedBy: {
      _id: new Types.ObjectId(user._id),
      email: user.email,
    }
   });
  }

  async remove(id: string, user: IUser) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      await this.companyModel.updateOne({ _id: id }, {
        deletedBy: {
          _id: new Types.ObjectId(user._id),
          email: user.email,
        }
      });
      return await this.companyModel.softDelete({ _id: id });
    }
    throw new BadRequestException('Invalid ID');
  }
}


