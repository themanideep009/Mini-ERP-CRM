import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import challanRoutes from './routes/challanRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import stockMovementRoutes from './routes/stockMovementRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { errorResponse } from './utils/responses.js';

const app = express();

// 1. Security & Global Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// 2. Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 3. API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stock-movements', stockMovementRoutes);

// 4. Wildcard Route (404 handler)
app.use((req, res, next) => {
  const err = new Error(`Cannot ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  err.errorCode = 'ROUTE_NOT_FOUND';
  next(err);
});

// 5. Centralized Error Handling
app.use(errorHandler);

export default app;
