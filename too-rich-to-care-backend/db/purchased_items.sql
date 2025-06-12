CREATE TABLE IF NOT EXISTS purchased_items (
  id SERIAL PRIMARY KEY,
  payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_name TEXT,
  item_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL
);
