import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import {RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import ms  from 'ms';

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

 async login(user: IUser, res: Response) {
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

    //save refresh token to database
    await this.usersService.updateRefreshToken(_id, refreshToken);
    //set cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: ms((this.configService.get<string>('JWT_REFRESH_EXPIRE') || '7d') as `${number}d`),
    });

    return {
      access_token: this.jwtService.sign(payload),
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

  processNewToken = async (refreshToken: string, res: Response) => {

    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      })

      const user = await this.usersService.findUserByToken(refreshToken);
      if(!user){
        throw new UnauthorizedException('Invalid refresh token! Please login again');
      }
      const {_id, email, role, name} = user;
      res.clearCookie('refresh_token');
      return this.login({
        _id: _id.toString(),
        email,
        role,
        name
      }, res);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token! Please login again');
  } 

}
  logout = async (user: IUser, res: Response) => {
    res.clearCookie('refresh_token');
    console.log(user._id);
    await this.usersService.updateRefreshToken(user._id, '');
    return "ok";
}
}
