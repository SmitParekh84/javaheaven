import 'dotenv/config';
import app from './app';
import { connectDB } from './lib/db';

const PORT = parseInt(process.env.PORT ?? '5000', 10);

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  })
  .catch((err: unknown) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });
