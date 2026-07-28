-- ============================================================
-- Gift Yours — Dummy Data Seed
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Make sure you have run schema.sql first to create the tables!
-- ============================================================

INSERT INTO products (id, name, category, sku, description, purchase_price, selling_price, stock, min_stock, status)
VALUES
  ('prod-' || substr(md5(random()::text), 1, 8), 'Custom Wooden Photo Frame', 'Photo Frames', 'FRM-001', 'Handcrafted wooden frame suitable for 8x10 photos', 250, 499, 50, 10, 'active'),
  ('prod-' || substr(md5(random()::text), 1, 8), 'Personalized Coffee Mug', 'Personalized Gifts', 'MUG-001', 'Ceramic mug with custom print', 90, 299, 100, 20, 'active'),
  ('prod-' || substr(md5(random()::text), 1, 8), 'LED Crystal Keychain', 'Gift Items', 'KCH-001', 'Crystal keychain with color changing LED', 45, 150, 200, 30, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO customers (id, name, phone, email, address, notes)
VALUES
  ('cust-' || substr(md5(random()::text), 1, 8), 'Rahul Sharma', '9876543210', 'rahul@example.com', '42 MG Road, Bangalore', 'Frequent buyer'),
  ('cust-' || substr(md5(random()::text), 1, 8), 'Priya Patel', '9988776655', 'priya@example.com', '15 High Street, Mumbai', 'Prefers personalized items')
ON CONFLICT DO NOTHING;

SELECT 'Dummy data inserted successfully! 🎁' AS status;
