import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { IsMongoId } from 'class-validator';

export class CreateCartDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  product: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}
