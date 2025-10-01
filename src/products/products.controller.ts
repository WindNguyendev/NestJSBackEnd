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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { ResponseMessage, User, Roles } from 'src/decorator/coustomize';
import { IUser } from 'src/users/users.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @Roles('admin')
  create(@Body() createProductDto: CreateProductDto, @User() user: IUser) {
    return this.productsService.create(createProductDto, user);
  }

  @Post('upload')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', {
    storage: require('multer').diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'public/images/');
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
      }
    })
  }))
  uploadProductWithImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
    @User() user: IUser,
  ) {
    // console.log('File received:', file);
    const baseUrl = this.configService.get<string>('BASE_URL') || '';
    const productData = {
      ...createProductDto,
      img: `${baseUrl}/images/${file.filename}`,
    };
    return this.productsService.create(productData, user);
  }

  @Get()
  @ResponseMessage('Get list products')
  findAll(
    @Query('current') page: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.productsService.findAll(+page, +limit, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @User() user: IUser,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.productsService.remove(id, user);
  }
}
