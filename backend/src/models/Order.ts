import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  product: 'tshirt' | 'sweater';
  color: string;
  rate: string;
  material: 'light' | 'heavy';
  text: string;
  price: number;
  imagePath?: string;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    product: { type: String, enum: ['tshirt', 'sweater'], required: true },
    color: { type: String, required: true },
    rate: { type: String, required: true },
    material: { type: String, enum: ['light', 'heavy'], required: true },
    text: { type: String },
    price: { type: Number, required: true },
    imagePath: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
