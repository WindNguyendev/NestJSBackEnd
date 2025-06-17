import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import mongoose, { Model, Types } from 'mongoose';
import { IUser } from 'src/users/users.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

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

  findAll() {
    return `This action returns all companies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} company`;
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


