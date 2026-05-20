import express from 'express';
import cors from 'cors';
import menuRouter from './routes/menu';
import cartRouter from './routes/cart';
import ordersRouter from './routes/orders';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
}));

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/api/menu', menuRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

export default app;
