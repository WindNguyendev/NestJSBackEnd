import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ResponseMessage, User, Roles } from 'src/decorator/coustomize';
import { IUser } from 'src/users/users.interface';

@Controller('carts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @Roles('admin', 'user')
  addToCart(@Body() createCartDto: CreateCartDto, @User() user: IUser) {
    return this.cartsService.addToCart(createCartDto, user);
  }

  @Get()
  @Roles('admin', 'user')
  @ResponseMessage('Get my cart')
  getMyCart(@User() user: IUser) {
    return this.cartsService.getMyCart(user);
  }

  @Get('total')
  @Roles('admin', 'user')
  @ResponseMessage('Get cart total')
  getCartTotal(@User() user: IUser) {
    return this.cartsService.getCartTotal(user);
  }

  @Patch(':id')
  @Roles('admin', 'user')
  updateCartItem(
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
    @User() user: IUser,
  ) {
    return this.cartsService.updateCartItem(id, updateCartDto, user);
  }

  @Delete(':id')
  @Roles('admin', 'user')
  removeFromCart(@Param('id') id: string, @User() user: IUser) {
    return this.cartsService.removeFromCart(id, user);
  }

  @Delete()
  @Roles('admin', 'user')
  clearCart(@User() user: IUser) {
    return this.cartsService.clearCart(user);
  }
}
