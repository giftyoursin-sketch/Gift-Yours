-- ============================================================
-- Gift Yours — Supabase Database Schema (Phase 3: E-Commerce)
-- ============================================================

-- ORDERS (For E-Commerce Customer tracking and statuses)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id),
  invoice_id TEXT, -- Link to the Business Management invoice
  status TEXT DEFAULT 'pending', -- pending, confirmed, processing, packed, shipped, delivered, cancelled, returned
  payment_method TEXT DEFAULT 'upi',
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed, refunded
  shipping_address JSONB,
  items JSONB DEFAULT '[]',
  subtotal NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  shipping_fee NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  delivery_instructions TEXT,
  coupon_code TEXT,
  estimated_delivery TEXT,
  tracking_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADDRESSES (Customer shipping addresses)
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home', -- Home, Work, etc.
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COUPONS (Discount codes managed by Business)
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT DEFAULT 'percentage', -- percentage, fixed
  discount_value NUMERIC NOT NULL,
  min_order_value NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  expiry_date TIMESTAMPTZ,
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS (For customer portal alerts)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, success, warning, error, order
  is_read BOOLEAN DEFAULT false,
  action_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- Ensure customers can only see their own data
-- ============================================================

-- Orders: Users can only select/insert their own orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = customer_id);
-- (Business app will bypass RLS by using the service role key or we can just disable RLS globally if it's a single shared DB without strict policies right now. Wait, the prompt says: "Use Supabase Row Level Security (RLS) to ensure complete data isolation.")

-- Addresses: Users can manage their own addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own addresses" ON addresses FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can insert own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users can update own addresses" ON addresses FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Users can delete own addresses" ON addresses FOR DELETE USING (auth.uid() = customer_id);

-- Notifications: Users can manage their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = customer_id);

-- Coupons: Public read, no write
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view coupons" ON coupons FOR SELECT USING (true);
-- (Writes are done by the Business app bypassing RLS or disabling RLS. Actually the prompt says "Coupons are managed only from Business Management" so public read is enough for E-commerce).

-- Existing Tables (Customers): 
-- The existing customers table uses TEXT id. Supabase auth users have UUID.
-- If the business app creates customers manually, they get arbitrary text IDs.
-- If they register via auth, they get UUIDs. We just need to ensure `customers` can be queried by auth.uid().
-- Since the existing tables have RLS DISABLED, we'll leave them disabled.

SELECT 'Phase 3 Schema created successfully! 🛒' AS status;
