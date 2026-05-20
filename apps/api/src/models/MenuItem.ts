import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMenuItem extends Document {
  tenantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
}

const MenuItemSchema = new Schema<IMenuItem>({
  tenantId:    { type: String, required: true, index: true },
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true },
  category:    { type: String, required: true },
  imageUrl:    { type: String, default: '' },
  stock:       { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const MenuItemModel: Model<IMenuItem> =
  mongoose.models.MenuItem ?? mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export default MenuItemModel;
