-- ============================================================
-- Gift Yours — Supabase Complete Setup & Dummy Data
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- This will create tables and insert dummy products, customers, and sales!
-- ============================================================

-- 1. CREATE TABLES
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  sku TEXT,
  description TEXT,
  purchase_price NUMERIC DEFAULT 0,
  selling_price NUMERIC DEFAULT 0,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  supplier TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  customer_name TEXT,
  items JSONB DEFAULT '[]',
  total NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'Cash',
  date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT,
  customer_id TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  date TEXT,
  due_date TEXT,
  items JSONB DEFAULT '[]',
  subtotal NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  discount_amt NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'Cash',
  notes TEXT,
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  category TEXT,
  date TEXT,
  description TEXT,
  payment_method TEXT DEFAULT 'Cash',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_history (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  product_name TEXT,
  delta INTEGER DEFAULT 0,
  reason TEXT,
  date TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- DISABLE Row Level Security
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- SEED SETTINGS
INSERT INTO settings (key, value) VALUES
  ('businessName', 'Gift Yours'),
  ('phone', ''),
  ('address', ''),
  ('invoicePrefix', 'INV'),
  ('currency', '₹'),
  ('theme', 'light'),
  ('nextInvoiceNumber', '1')
ON CONFLICT (key) DO NOTHING;

-- 2. INSERT DUMMY DATA

-- Insert Products
INSERT INTO products (id, name, category, sku, description, purchase_price, selling_price, stock, min_stock, status)
VALUES
  ('prod-123', 'Custom Wooden Photo Frame', 'Photo Frames', 'FRM-001', 'Handcrafted wooden frame suitable for 8x10 photos', 250, 499, 50, 10, 'active'),
  ('prod-456', 'Personalized Coffee Mug', 'Personalized Gifts', 'MUG-001', 'Ceramic mug with custom print', 90, 299, 100, 20, 'active'),
  ('prod-789', 'LED Crystal Keychain', 'Gift Items', 'KCH-001', 'Crystal keychain with color changing LED', 45, 150, 200, 30, 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert Customers
INSERT INTO customers (id, name, phone, email, address, notes)
VALUES
  ('cust-123', 'Rahul Sharma', '9876543210', 'rahul@example.com', '42 MG Road, Bangalore', 'Frequent buyer'),
  ('cust-456', 'Priya Patel', '9988776655', 'priya@example.com', '15 High Street, Mumbai', 'Prefers personalized items')
ON CONFLICT (id) DO NOTHING;

-- Insert Sales
INSERT INTO sales (id, customer_id, customer_name, items, total, payment_method, date, notes)
VALUES
  (
    'sale-123', 
    'cust-123', 
    'Rahul Sharma', 
    '[{"productId": "prod-123", "name": "Custom Wooden Photo Frame", "qty": 2, "price": 499}, {"productId": "prod-456", "name": "Personalized Coffee Mug", "qty": 1, "price": 299}]'::jsonb, 
    1297, 
    'UPI', 
    to_char(NOW(), 'YYYY-MM-DD'), 
    'Birthday gift purchase'
  ),
  (
    'sale-456', 
    'cust-456', 
    'Priya Patel', 
    '[{"productId": "prod-789", "name": "LED Crystal Keychain", "qty": 5, "price": 150}]'::jsonb, 
    750, 
    'Cash', 
    to_char(NOW(), 'YYYY-MM-DD'), 
    'Return gifts for party'
  )
ON CONFLICT (id) DO NOTHING;

-- Done!
SELECT 'Tables created and dummy data (Products, Customers, Sales) inserted successfully! 🚀' AS status;
