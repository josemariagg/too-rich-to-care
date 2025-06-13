import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// POST /choices – save billionaire selection
router.post('/', async (req, res) => {
  const { billionaire, userId } = req.body;

  if (!billionaire || !userId) {
    return res.status(400).json({ error: 'Missing billionaire or userId' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO choices (billionaire, user_id) VALUES ($1, $2) RETURNING *',
      [billionaire, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error inserting choice:', err);
    res.status(500).json({ error: 'Error inserting choice' });
  }
});

// GET /choices – retrieve all selections
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM choices ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching choices:', err);
    res.status(500).json({ error: 'Error fetching choices' });
  }
});

export default router;
