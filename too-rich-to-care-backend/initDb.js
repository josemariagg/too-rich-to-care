import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  const sql = `
    -- Borrar primero en orden correcto (dependencias)
    DROP TABLE IF EXISTS cart_items;
    DROP TABLE IF EXISTS carts;
    DROP TABLE IF EXISTS purchased_items;
    DROP TABLE IF EXISTS payments;
    DROP TABLE IF EXISTS choices;

    -- Tabla de pagos
    CREATE TABLE payments (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      cart_id UUID,
      payment_intent_id TEXT NOT NULL UNIQUE,
      user_email TEXT,
      amount_total INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Ítems comprados vinculados al pago
    CREATE TABLE purchased_items (
      id SERIAL PRIMARY KEY,
      payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
      item_id TEXT NOT NULL,
      item_name TEXT,
      item_price INTEGER NOT NULL,
      quantity INTEGER NOT NULL
    );

    -- Carrito guardado antes del pago
    CREATE TABLE carts (
      id UUID PRIMARY KEY,
      user_id TEXT,
      name TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Ítems del carrito (con cantidad y orden de selección)
    CREATE TABLE cart_items (
      id SERIAL PRIMARY KEY,
      cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
      item_id TEXT NOT NULL,
      item_name TEXT,
      category TEXT,
      quantity INTEGER DEFAULT 1,
      item_order INTEGER NOT NULL
    );

    -- Elección del multimillonario
    CREATE TABLE choices (
      id SERIAL PRIMARY KEY,
      billionaire TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  try {
    await pool.query(sql);
    console.log('✅ Todas las tablas creadas correctamente: payments, purchased_items, carts, cart_items y choices');
  } catch (error) {
    console.error('❌ Error creando tablas:', error);
  } finally {
    await pool.end();
  }
}

initDb();
