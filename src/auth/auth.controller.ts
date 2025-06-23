import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public, ResponseMessage, User } from 'src/decorator/coustomize';
import { CreateUserDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/users/users.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ResponseMessage('Login success')
  handleLogin( 
    @Req() req, 
    @Res({passthrough: true}) res: Response
  ) {
    return this.authService.login(req.user, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Public()
  @ResponseMessage('Create a new user')
  @Post('/register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }


  @ResponseMessage('Get account success')
  @Get('/account')
  handleGetAccount(@User() user: IUser) {
    return user;
  }

  @Public()
  @ResponseMessage('Get User by refresh token')
  @Get('/refresh') 
  handleRefreshToken(@Req() req: Request, @Res({passthrough: true}) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, res);
  }

  @Post('/logout')
  @ResponseMessage('Logout successfully')
  async handleLogout(@User() user: IUser, @Res({passthrough: true}) res: Response) {
    return this.authService.logout(user, res);
  }
}
