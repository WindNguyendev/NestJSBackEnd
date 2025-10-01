import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './schemas/user.schema';
import mongoose, { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import { CompaniesService } from 'src/companies/companies.service';
import aqp from 'api-query-params';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: SoftDeleteModel<UserDocument>,
    private companyService: CompaniesService,
  ) {}

  async getHashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    // const hashPassword = await this.getHashPassword(password);
    // let newUser = await this.userModel.create({ email,password:hashPassword, name });

    // return newUser;
    const checkUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (checkUser) {
      throw new BadRequestException('Email already exists');
    }
    const newUser = await this.userModel.create({
      email: createUserDto.email,
      password: await this.getHashPassword(createUserDto.password),
      name: createUserDto.name,
      age: createUserDto.age,
      address: createUserDto.address,
      gender: createUserDto.gender,
      role: createUserDto.role,
      company: createUserDto.company,
      createdBy: {
        _id: new Types.ObjectId(user._id),
        email: user.email,
      },
      createdAt: new Date(),
    });
    return {
      _id: newUser._id,
      createdAt: newUser.createdAt,
    };
  }

  async register(registerUserDto: RegisterUserDto) {
    // Đếm số user chưa bị soft delete (plugin đặt isDeleted=true khi xoá)
    const userCount = await this.userModel.countDocuments({
      isDeleted: { $ne: true },
    });
    const role = userCount === 0 ? 'admin' : 'user';
    
    console.log(`User count: ${userCount}, Role assigned: ${role}`);
    
    const newUser = await this.userModel.create({
      email: registerUserDto.email,
      password: await this.getHashPassword(registerUserDto.password),
      name: registerUserDto.name,
      age: registerUserDto.age,
      address: registerUserDto.address,
      gender: registerUserDto.gender,
      role: role,
      createdAt: new Date(),
    });
    return newUser;
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const offset = (+page - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.userModel
      .find(filter)
      .sort(sort as any)
      .skip(offset)
      .limit(defaultLimit)
      .select(projection)
      .populate(population)
      .exec();
    return {
      meta: {
        current: page,
        pageSize: defaultLimit,
        total: totalItems,
        pages: totalPages,
      },
      result: result,
    };
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if(!user){
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async findOneByUsername(username: string) {
    return await this.userModel.findOne({ email: username });
  }

  async  update(updateUserDto: UpdateUserDto, user: IUser) {
    // return `This action updates a #${id} user`;
    const emailCheck = await this.userModel.findOne({ email: updateUserDto.email });
    
    if (updateUserDto.company) {
      const companyCheck = await this.companyService.findOne(updateUserDto.company._id.toString());
    }
    
    if (mongoose.Types.ObjectId.isValid(updateUserDto._id)) {
      return await this.userModel.updateOne({ _id: updateUserDto._id }, {...updateUserDto, updatedBy: {
        _id: new Types.ObjectId(user._id),
        email: user.email,
      } });
    }
    throw new BadRequestException('Invalid ID');
  }

  async remove(id: string) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return await this.userModel.softDelete({ _id: id });
    }
    throw new BadRequestException('Invalid ID');
  }

  isValidPassword(password: string, hashPassword: string) {
    return bcrypt.compareSync(password, hashPassword);
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    return await this.userModel.updateOne({ _id: id }, { refreshToken: refreshToken });
  }

  findUserByToken = (refreshToken: string) => {
    return this.userModel.findOne({ refreshToken: refreshToken });
  }
}
