import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import choicesRoutes from './routes/choices.js';
import paymentsRouter from './routes/payments.js'; // ✅ Stripe
import cartRoutes from './routes/cart.js';
import videosRoutes from './routes/videos.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins for CORS. If the environment variable is not defined,
// fall back to the hardcoded list used previously.
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:5173',
      'https://too-rich-to-care-frontend.vercel.app',
      'https://app.2richtocare.com',
    ];

app.use(cors({
  origin: allowedOrigins,
}));

// Raw body parser ONLY for the Stripe webhook
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// JSON parser for everything else
app.use(express.json());

// Non-conflicting routes
app.use('/choices', choicesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/videos', videosRoutes);


// Here we split the payments router into two routes:
// - webhook (raw) registered above
// - the rest of /api/payments using json normally
app.use('/api/payments', (req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    return next();
  }
  express.json()(req, res, () => next());
}, paymentsRouter);

app.get('/', (req, res) => {
  res.send('✅ Too Rich To Care backend running');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Server running on 0.0.0.0:${PORT}`);
});
