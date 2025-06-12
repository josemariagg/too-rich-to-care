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

app.use(cors({
  origin: ['http://localhost:5173', 'https://too-rich-to-care-frontend.vercel.app', 'https://app.2richtocare.com'],
}));

// Raw body parser SOLO para webhook Stripe
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// JSON parser para todo lo demás
app.use(express.json());

// Rutas sin conflicto
app.use('/choices', choicesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/videos', videosRoutes);


// Aquí dividimos el router de pagos en dos rutas:
// - webhook (raw) ya registrado arriba
// - resto de /api/payments usando json normalmente
app.use('/api/payments', (req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    return next();
  }
  express.json()(req, res, () => next());
}, paymentsRouter);

app.get('/', (req, res) => {
  res.send('✅ Backend Too Rich To Care funcionando');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Servidor corriendo en 0.0.0.0:${PORT}`);
});
