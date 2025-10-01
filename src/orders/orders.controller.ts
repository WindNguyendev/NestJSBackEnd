import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ResponseMessage, User, Roles } from 'src/decorator/coustomize';
import { IUser } from 'src/users/users.interface';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @User() user: IUser) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get()
  @ResponseMessage('Get list orders')
  findAll(
    @Query('current') page: string,
    @Query('pageSize') limit: string,
    @Req() req: any,
    @User() user: IUser,
  ) {
    const qs = (req.url.split('?')[1] || '') as string;
    return this.ordersService.findAll(+page, +limit, qs, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'user')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @User() user: IUser,
  ) {
    return this.ordersService.update(id, updateOrderDto, user);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.ordersService.remove(id, user);
  }
}
