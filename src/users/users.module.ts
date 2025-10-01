import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ResetController } from './reset.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { CompaniesModule } from 'src/companies/companies.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  CompaniesModule],
  controllers: [UsersController, ResetController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
