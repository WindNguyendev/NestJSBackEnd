import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product' })
  product: MongooseSchema.Types.ObjectId;

  @Prop()
  quantity: number;

  @Prop()
  price: number;

  @Prop()
  total: number;

  @Prop({ type: Object })
  createdBy: {
    _id: string;
    email: string;
  };
  @Prop({ type: Object })
  updatedBy: {
    _id: string;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: string;
    email: string;
  };
  @Prop()
  deletedAt: Date;
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
