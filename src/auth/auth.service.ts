import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { CreateUserDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';

@Injectable()
export class AuthService {


constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
) {}

async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if( user){
        const isValidPassword = this.usersService.isValidPassword(pass, user.password);
        if(isValidPassword){
            return user;
        }
    }
    return null;
  }

 async login(user: IUser) {
  const {_id, email, role, name} = user;
    const payload = { 
      _id: _id,
      email: email,
      role: role,
      name: name,
      sub: "token login",
      iss: "from server"
    };
    const refreshToken = this.createRefreshToken(payload);
    const update = await   this.usersService.updateRefreshToken(user._id, refreshToken);
    console.log(update);
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
      user: {
        _id,
        email,
        role,
        name,
      }
    };
  }
  async register(registerUserDto: RegisterUserDto) {
    const user = await this.usersService.findOneByUsername(registerUserDto.email);
    if(user){
     throw new BadRequestException('Email already exists');
    }
    const new_user = await this.usersService.register(registerUserDto);
    return {
      _id: new_user._id,
      createdAt: new_user.createdAt,
    };
  }
  createRefreshToken = (payload: any) => {
    const refreshToken = this.jwtService.sign(payload,{
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE') || '7d'
    })
    return refreshToken;
}

}

