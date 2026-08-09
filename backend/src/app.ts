import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import challanRoutes from './routes/challanRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import stockMovementRoutes from './routes/stockMovementRoutes.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';

const app = express();

// 1. Security & Global Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);
app.use(express.json());

// 2. Health & Root Welcome Routes
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: '🚀 Mini ERP + CRM Backend API is running live!',
    health: '/health',
    version: '1.0.0',
    timestamp: new Date()
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 3. API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stock-movements', stockMovementRoutes);

// 4. Wildcard Route (404 Handler)
app.use((req: Request, res: Response, next: NextFunction) => {
  const err: AppError = new Error(`Cannot ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  err.errorCode = 'ROUTE_NOT_FOUND';
  next(err);
});

// 5. Centralized Error Handling
app.use(errorHandler);

export default app;
