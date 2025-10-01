import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: MongooseSchema.Types.ObjectId;

  @Prop([{
    product: { type: MongooseSchema.Types.ObjectId, ref: 'Product' },
    title: String,
    quantity: Number,
    price: Number,
    total: Number
  }])
  items: Array<{
    product: MongooseSchema.Types.ObjectId;
    title: string;
    quantity: number;
    price: number;
    total: number;
  }>;

  @Prop()
  total: number;

  @Prop({
    type: String,
    enum: ['Chưa duyệt', 'Đã duyệt', 'Đang giao', 'Giao thành công'],
    default: 'Chưa duyệt',
  })
  status: string;

  @Prop({ type: Object })
  createdBy: {
    _id: string;
    email: string;
    name: string;
  };
  @Prop({ type: Object })
  updatedBy: {
    _id: string;
    email: string;
    name: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: string;
    email: string;
    name: string;
  };
  @Prop()
  deletedAt: Date;
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
