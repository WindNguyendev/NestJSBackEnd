import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import mongoose, { Types } from 'mongoose';
import { IUser } from 'src/users/users.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: SoftDeleteModel<ProductDocument>,
  ) {}
  
  async create(createProductDto: CreateProductDto, user: IUser) {
    const createdProduct = await this.productModel.create({
      ...createProductDto,
      createdBy: {
        _id: new Types.ObjectId(user._id),
        email: user.email,
      }
    });
    return createdProduct;
  }

  async findAll(page: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const currentPage = Number(page) || 1;
    const defaultLimit = Number(limit) || 10;
    const offset = (currentPage - 1) * defaultLimit;

    const totalItems = (await this.productModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.productModel.find(filter)
      .sort(sort as any)
      .skip(offset)
      .limit(defaultLimit)
      .select(projection)
      .populate(population)
      .exec();

    return {
      meta: {
        currentPage: currentPage,
        pageSize: defaultLimit,
        total: totalItems,
        pages: totalPages,
      },
      result: result,
    }
  }

  async findOne(id: string) {
    return await this.productModel.findOne({ _id: id });
  }

  update(id: string, updateProductDto: UpdateProductDto, user: IUser) {
    return this.productModel.updateOne({_id: new Types.ObjectId(id)}, {
      ...updateProductDto,
      updatedBy: {
        _id: new Types.ObjectId(user._id),
        email: user.email,
      }
    });
  }

  async remove(id: string, user: IUser) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      await this.productModel.updateOne({ _id: id }, {
        deletedBy: {
          _id: new Types.ObjectId(user._id),
          email: user.email,
        }
      });
      return await this.productModel.softDelete({ _id: id });
    }
    throw new BadRequestException('Invalid ID');
  }
}
