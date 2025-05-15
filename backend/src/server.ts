import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';


import { connectDB } from './db';
import { Order, IOrder } from './models/Order';

// Type definition for a T-shirt order
interface Order {
  id: number;
  product: 'tshirt' | 'sweater';
  color: string;
  rate: string;
  material: 'light' | 'heavy';
  text: string;
  price: number;
  imagePath: string | null;
}

// Express app and port setup
const app = express();
const port = 8080;

// Middleware
app.use(cors());
connectDB();0
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Create uploads dir if not exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// File upload handler using multer
const upload = multer({
  dest: uploadDir,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// In-memory order storage
const orders: Order[] = [];

// POST /api/order
app.post('/api/order', upload.single('image'), async (req: Request, res: Response) => {
  const { product, color, rate, material, text, price } = req.body;
  const file = req.file;

  if (
    typeof product !== 'string' ||
    typeof color !== 'string' ||
    typeof rate !== 'string' ||
    typeof material !== 'string' ||
    typeof text !== 'string' ||
    isNaN(Number(price))
  ) {
    return res.status(400).json({ ok: false, message: 'Invalid or missing fields' });
  }

  const newOrder: Partial<IOrder> = {
    product: product as 'tshirt' | 'sweater',
    color,
    rate,
    material: material as 'light' | 'heavy',
    text,
    price: parseFloat(price),
    imagePath: file ? `/uploads/${file.filename}` : undefined,
  };

//   orders.push(newOrder);
  const order = new Order(newOrder);
  await order.save();
  console.log('Received Order:', newOrder);

  return res.status(201).json({ ok: true, order: newOrder });
});

// GET /api/orders (optional)
app.get('/api/orders', (_req, res) => {
  res.json(orders);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server listening on http://localhost:${port}`);
});