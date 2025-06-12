# Too Rich To Care Backend

This folder contains the Express server that powers the game. Follow these steps to run it locally.

## Install dependencies

```bash
npm install
```

## Environment variables

Copy `.env.example` to `.env` and fill in the required values (database URL, Stripe keys, Cloudinary credentials, etc.):

```bash
cp .env.example .env
```

## Database setup

Before starting the server for the first time, create the PostgreSQL tables by running:

```bash
node initDb.js
```

This script uses the `DATABASE_URL` from your `.env` file and sets up tables like `payments`, `purchased_items`, `carts`, `cart_items` and `choices`.

## Run the server

Start the API with:

```bash
npm start
```

The server listens on the port defined in `PORT` (defaults to `5000`).
