import { IsNotEmpty, IsNumber, IsArray, ValidateNested, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { IsMongoId } from 'class-validator';

class OrderItemDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  product: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  total: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  total: number;
}
