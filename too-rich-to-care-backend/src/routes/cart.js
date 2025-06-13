import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

router.post('/save-cart', async (req, res) => {
  const { cartId, userId, name, items } = req.body;

  if (!cartId || !userId || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Incomplete data to save cart' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Save cart
    await client.query(
      'INSERT INTO carts (id, user_id, name) VALUES ($1, $2, $3)',
      [cartId, userId, name]
    );

    // Save cart items
    for (const item of items) {
      const { item_id, item_name, category, quantity, item_order } = item;
      await client.query(
        `INSERT INTO cart_items (cart_id, item_id, item_name, category, quantity, item_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [cartId, item_id, item_name, category, quantity, item_order]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ message: '🛒 Cart saved successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error saving cart:', err);
    res.status(500).json({ error: 'Error saving cart' });
  } finally {
    client.release();
  }
});

export default router;
