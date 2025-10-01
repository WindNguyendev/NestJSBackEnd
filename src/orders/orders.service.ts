import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { InjectModel as InjectProductModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import mongoose, { Types } from 'mongoose';
import { IUser } from 'src/users/users.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: SoftDeleteModel<OrderDocument>,
    @InjectProductModel(Product.name) private productModel: any,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: IUser) {
    // Lưu dữ liệu, bổ sung title từ Product, không validate tổng
    const orderItems = [] as Array<{ product: Types.ObjectId; title: string; quantity: number; price: number; total: number }>;
    for (const item of createOrderDto.items) {
      const product = await this.productModel.findById(item.product).select('title price');
      const title = product?.title || '';
      const price = 0; // không tính toán
      orderItems.push({
        product: new Types.ObjectId(item.product),
        title,
        quantity: item.quantity,
        price,
        total: item.total,
      });
    }

    const createdOrder = await this.orderModel.create({
      user: new Types.ObjectId(user._id),
      items: orderItems,
      total: createOrderDto.total,
      createdBy: {
        _id: new Types.ObjectId(user._id),
        email: user.email,
        name: user.name,
      }
    });
    return createdOrder;
  }

  async findAll(page: number, limit: number, qs: string, user: IUser) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const currentPage = Number(page) || 1;
    const defaultLimit = Number(limit) || 10;
    const offset = (currentPage - 1) * defaultLimit;

    const roleFilter = user.role === 'admin' ? {} : { 'createdBy._id': new Types.ObjectId(user._id) };

    const totalItems = (await this.orderModel.find({ ...filter, ...roleFilter })).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.orderModel
      .find({ ...filter, ...roleFilter })
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
    };
  }

  async findOne(id: string) {
    return await this.orderModel.findOne({ _id: id })
      .populate('user', 'name email')
      .populate('items.product', 'title img price');
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, user: IUser) {
    // Kiểm tra user chỉ có thể sửa order của mình (trừ admin)
    if (user.role !== 'admin') {
      const order = await this.orderModel.findOne({ _id: id });
      if (!order || order.createdBy._id.toString() !== user._id) {
        throw new BadRequestException('You can only update your own orders');
      }
    }

    const updateData: any = {
      ...updateOrderDto,
      updatedBy: {
        _id: new Types.ObjectId(user._id),
        email: user.email,
        name: user.name,
      }
    };
    // Note: Order update logic removed as orders are typically immutable after creation
    return this.orderModel.updateOne(
      { _id: new Types.ObjectId(id) },
      updateData,
    );
  }

  async remove(id: string, user: IUser) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      await this.orderModel.updateOne({ _id: id }, {
        deletedBy: {
          _id: new Types.ObjectId(user._id),
          email: user.email,
          name: user.name,
        }
      });
      return await this.orderModel.softDelete({ _id: id });
    }
    throw new BadRequestException('Invalid ID');
  }
}
