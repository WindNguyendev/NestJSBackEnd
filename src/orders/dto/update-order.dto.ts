import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsString()
  @IsIn(['Chưa duyệt', 'Đã duyệt', 'Đang giao', 'Giao thành công'])
  status?: string;
}
