# Too Rich To Care

This repo contains a small React frontend and an Express backend.

## API Endpoints

The backend exposes several routes used by the frontend:

| Method & Path | Description |
| --- | --- |
| `POST /choices` | Save the selected billionaire. Body expects `{ billionaire, userId }`. |
| `GET /choices` | Retrieve all saved choices. |
| `POST /api/cart/save-cart` | Persist the current cart before starting the payment flow. Expects `{ cartId, userId, items }`. |
| `POST /api/payments/create-checkout-session` | Creates a Stripe Checkout session and returns a redirect URL. Body expects `{ userId, cartId }`. |
| `POST /api/payments/webhook` | Stripe webhook endpoint to confirm completed payments. When a payment succeeds and `VIDEO_POD_URL` is configured, it forwards the cart and user info to that service. |

The frontend points to these routes using the `VITE_API_URL` environment variable. `SelectBillionaire` posts to `/choices`, `CheckoutReview` sends the cart to `/api/cart/save-cart` and then creates the checkout session via `/api/payments/create-checkout-session`.

## Environment Variables

### Backend
Values are defined in `too-rich-to-care-backend/.env.example`:

- `PORT` – port where the server runs.
- `DATABASE_URL` – PostgreSQL connection string.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` – Cloudinary credentials.
- `STRIPE_SECRET_KEY` – Stripe secret API key.
- `STRIPE_PRICE_ID` – price ID configured in Stripe.
- `STRIPE_WEBHOOK_SECRET` – secret used to validate Stripe webhooks.
- `VIDEO_POD_URL` – optional URL of the service that generates the
  personalized video after a successful payment.

### Frontend

- `VITE_API_URL` – base URL of the backend API.

## Deployment

When deploying the frontend to a static host, ensure that any request is rewritten
to `/index.html` so the React router can handle the route. The repository includes
an example configuration in `too-rich-to-care-frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

