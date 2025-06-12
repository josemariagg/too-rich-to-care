import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { pool } from '../db.js';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ID de precio configurado en variables de entorno
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;

// Crear sesión de pago con Stripe
router.post('/create-checkout-session', async (req, res) => {
  console.log('Body recibido:', req.body);
  const { userId, cartId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://app.2richtocare.com/payment-success?cartId=${cartId}`,
      cancel_url: `https://app.2richtocare.com/payment-error`,
      metadata: {
        user_id: userId,
        cart_id: cartId,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('❌ Stripe session error:', err.message);
    res.status(500).json({ error: 'Stripe session creation failed' });
  }
});

// Webhook de Stripe para confirmar pagos
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('❌ Webhook signature error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { user_id, cart_id } = session.metadata || {};

      try {
        await pool.query(
          `INSERT INTO payments (
            user_id,
            cart_id,
            payment_intent_id,
            user_email,
            amount_total,
            status
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            user_id,
            cart_id,
            session.payment_intent,
            session.customer_details?.email || null,
            session.amount_total,
            session.payment_status
          ]
        );
        console.log('✅ Payment inserted successfully');

        // Gather information to send to the video generation service
        const cartRes = await pool.query(
          'SELECT name, user_id FROM carts WHERE id = $1',
          [cart_id]
        );
        const name = cartRes.rows[0]?.name || null;
        const realUserId = cartRes.rows[0]?.user_id || user_id;

        const itemsRes = await pool.query(
          'SELECT item_id, item_name, category, quantity, item_order FROM cart_items WHERE cart_id = $1 ORDER BY item_order',
          [cart_id]
        );

        const choiceRes = await pool.query(
          'SELECT billionaire FROM choices WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
          [realUserId]
        );

        const payload = {
          name,
          userId: realUserId,
          items: itemsRes.rows,
          billionaire: choiceRes.rows[0]?.billionaire || null,
        };

        if (process.env.VIDEO_POD_URL) {
          try {
            await fetch(process.env.VIDEO_POD_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            console.log('✅ Sent data to video pod');
          } catch (err) {
            console.error('❌ Error sending data to video pod:', err);
          }
        } else {
          console.log('ℹ️ VIDEO_POD_URL not configured, skipping video pod notification');
        }
      } catch (err) {
        console.error('❌ Error inserting payment:', err);
      }
    }

    res.json({ received: true });
  }
);

export default router;
