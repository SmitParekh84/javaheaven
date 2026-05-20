import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

interface OrderItem {
  menuItemId: string;
  name:       string;
  price:      number;
  qty:        number;
  size:       string;
}

export interface IOrder extends Document {
  userId:                  string;
  tenantId:                string;
  items:                   OrderItem[];
  subtotal:                number;
  total:                   number;
  status:                  OrderStatus;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?:  string;
}

const OrderItemSchema = new Schema<OrderItem>({
  menuItemId: { type: String, required: true },
  name:       { type: String, required: true },
  price:      { type: Number, required: true },
  qty:        { type: Number, required: true },
  size:       { type: String, default: 'Regular' },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  userId:                  { type: String, required: true, index: true },
  tenantId:                { type: String, required: true },
  items:                   [OrderItemSchema],
  subtotal:                { type: Number, required: true },
  total:                   { type: Number, required: true },
  status:                  { type: String, enum: ['pending', 'paid', 'preparing', 'ready', 'delivered', 'cancelled'], default: 'pending' },
  stripeCheckoutSessionId: String,
  stripePaymentIntentId:   String,
}, { timestamps: true });

const OrderModel: Model<IOrder> =
  mongoose.models.Order ?? mongoose.model<IOrder>('Order', OrderSchema);

export default OrderModel;
