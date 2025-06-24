import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Types } from 'mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class JobsService {

  constructor(
    @InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>,
  ) {}
  async create(createJobDto: CreateJobDto, user: IUser) {
    const createdJob = await this.jobModel.create({
      ...createJobDto,
      createdBy: {
        _id: new Types.ObjectId(user._id),
        email: user.email,
      }
    });
    return createdJob;
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+page - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
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
    const job = await this.jobModel.findOne({_id: id});
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    const updatedJob = await this.jobModel.updateOne({_id: id}, {
      ...updateJobDto,
      updatedBy: {
        _id: user._id,
        email: user.email,
      }
    });
    return updatedJob;
  }

  async remove(id: string, user: IUser) {
    await this.jobModel.softDelete({_id: id});
    await this.jobModel.updateOne({_id: id}, {
      deletedBy: {
        _id: user._id,
        email: user.email,
      }
    });

    return {
      deleted: "success"
    };
  }
}
