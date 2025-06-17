import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ timestamps: true })
export class Company {
  @Prop()
  name: string;
  @Prop()
  address: string;
  @Prop()
  phone: string;
  @Prop()
  description: string;
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

export const CompanySchema = SchemaFactory.createForClass(Company);
