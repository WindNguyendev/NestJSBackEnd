import { Type } from 'class-transformer';
import { IsEmail, IsMongoId, IsNotEmpty, IsNumber, IsObject, IsString, MinLength, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';




class Company {
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class RegisterUserDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;


  age: number;

  @IsString()
  @IsNotEmpty()
  gender: string;


  @IsString()
  address: string;
  
} 
export class CreateUserDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  age: number;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  role: string;


  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };


  @ValidateNested()
  @Type(() => Company)
  company: Company;  
  


}

