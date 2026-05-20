import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICartItem {
  menuItemId: string;
  name:       string;
  price:      number;
  qty:        number;
  size:       string;
  imageUrl?:  string;
}

export interface ICart extends Document {
  userId:   string;
  tenantId: string;
  items:    ICartItem[];
}

const CartItemSchema = new Schema<ICartItem>({
  menuItemId: { type: String, required: true },
  name:       { type: String, required: true },
  price:      { type: Number, required: true },
  qty:        { type: Number, required: true },
  size:       { type: String, default: 'Regular' },
  imageUrl:   String,
}, { _id: false });

const CartSchema = new Schema<ICart>({
  userId:   { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  items:    [CartItemSchema],
}, { timestamps: true });

const CartModel: Model<ICart> =
  mongoose.models.Cart ?? mongoose.model<ICart>('Cart', CartSchema);

export default CartModel;
