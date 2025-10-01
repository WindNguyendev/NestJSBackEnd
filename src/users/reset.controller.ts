import { Controller, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Controller('reset')
export class ResetController {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  @Post('database')
  async resetDatabase() {
    // Xóa tất cả users (cả soft deleted)
    await this.userModel.deleteMany({});
    return { message: 'Database reset successfully. Next user will be admin.' };
  }
}
