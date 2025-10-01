import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop()
  title: string;

  @Prop()
  img: string;

  @Prop()
  description: string;

  @Prop()
  price: number;

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

export const ProductSchema = SchemaFactory.createForClass(Product);
