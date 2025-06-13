import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model, mongo } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  async getHashPassword(createUserDto: CreateUserDto) {
    return await bcrypt.hash(createUserDto.password, 10);
  }

  async create(createUserDto: CreateUserDto) {
    // const hashPassword = await this.getHashPassword(password);
    // let newUser = await this.userModel.create({ email,password:hashPassword, name });

    // return newUser;
    let newUser = await this.userModel.create({
      email: createUserDto.email,
      password: await this.getHashPassword(createUserDto),
      name: createUserDto.name,
      age: createUserDto.age,
    });
    return newUser;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findOneByUsername(username: string) {
    return await this.userModel.findOne({ email: username });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // return `This action updates a #${id} user`;
    if (mongoose.Types.ObjectId.isValid(id)) {
      return await this.userModel.updateOne({ _id: id }, {...updateUserDto });
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
}
