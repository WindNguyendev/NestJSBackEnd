import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import mongoose, { Model, Types } from 'mongoose';
import { IUser } from 'src/users/users.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Cart.name) private cartModel: SoftDeleteModel<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}
  
  async addToCart(createCartDto: CreateCartDto, user: IUser) {
    // Kiểm tra sản phẩm có tồn tại không
    const product = await this.productModel.findById(createCartDto.product);
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    // Kiểm tra đã có sản phẩm này trong giỏ hàng chưa
    const existingCart = await this.cartModel.findOne({
      user: new Types.ObjectId(user._id),
      product: new Types.ObjectId(createCartDto.product),
    });

    if (existingCart) {
      // Cập nhật số lượng
      const newQuantity = existingCart.quantity + createCartDto.quantity;
      const newTotal = newQuantity * product.price;
      
      return this.cartModel.updateOne(
        { _id: existingCart._id },
        {
          quantity: newQuantity,
          total: newTotal,
          updatedBy: {
            _id: new Types.ObjectId(user._id),
            email: user.email,
          }
        }
      );
    } else {
      // Thêm mới vào giỏ hàng
      const total = createCartDto.quantity * product.price;
      const createdCart = await this.cartModel.create({
        user: new Types.ObjectId(user._id),
        product: new Types.ObjectId(createCartDto.product),
        quantity: createCartDto.quantity,
        price: product.price,
        total: total,
        createdBy: {
          _id: new Types.ObjectId(user._id),
          email: user.email,
        }
      });
      return createdCart;
    }
  }

  async getMyCart(user: IUser) {
    return await this.cartModel.find({ user: new Types.ObjectId(user._id) })
      .populate('product')
      .exec();
  }

  async updateCartItem(id: string, updateCartDto: UpdateCartDto, user: IUser) {
    const cartItem = await this.cartModel.findOne({ 
      _id: id, 
      user: new Types.ObjectId(user._id) 
    });
    
    if (!cartItem) {
      throw new BadRequestException('Cart item not found');
    }

    if (updateCartDto.quantity) {
      const product = await this.productModel.findById(cartItem.product);
      if (!product) {
        throw new BadRequestException('Product not found');
      }
      const newTotal = updateCartDto.quantity * product.price;
      
      return this.cartModel.updateOne(
        { _id: id },
        {
          quantity: updateCartDto.quantity,
          total: newTotal,
          updatedBy: {
            _id: new Types.ObjectId(user._id),
            email: user.email,
          }
        }
      );
    }
  }

  async removeFromCart(id: string, user: IUser) {
    const cartItem = await this.cartModel.findOne({ 
      _id: id, 
      user: new Types.ObjectId(user._id) 
    });
    
    if (!cartItem) {
      throw new BadRequestException('Cart item not found');
    }

    await this.cartModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: new Types.ObjectId(user._id),
        email: user.email,
      }
    });
    return await this.cartModel.softDelete({ _id: id });
  }

  async clearCart(user: IUser) {
    await this.cartModel.updateMany(
      { user: new Types.ObjectId(user._id) },
      {
        deletedBy: {
          _id: new Types.ObjectId(user._id),
          email: user.email,
        }
      }
    );
    return await this.cartModel.softDelete({ user: new Types.ObjectId(user._id) });
  }

  async getCartTotal(user: IUser) {
    const cartItems = await this.cartModel.find({ user: new Types.ObjectId(user._id) });
    const total = cartItems.reduce((sum, item) => sum + item.total, 0);
    return { total, items: cartItems.length };
  }
}
