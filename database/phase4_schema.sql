-- ============================================================
-- Gift Yours — Supabase Database Schema (Phase 4: Advanced E-commerce)
-- ============================================================

-- WISHLIST
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

-- PRODUCT REVIEWS
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RECENTLY VIEWED (Browsing History)
CREATE TABLE IF NOT EXISTS recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- Wishlist: Users manage their own wishlist
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wishlist" ON wishlist FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can insert into own wishlist" ON wishlist FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users can delete from own wishlist" ON wishlist FOR DELETE USING (auth.uid() = customer_id);

-- Product Reviews: Anyone can read, logged in users can write
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON product_reviews FOR SELECT USING (true);
CREATE POLICY "Users can write reviews" ON product_reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users can update own reviews" ON product_reviews FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Users can delete own reviews" ON product_reviews FOR DELETE USING (auth.uid() = customer_id);

-- Recently Viewed: Users manage their own history
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own history" ON recently_viewed FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can insert own history" ON recently_viewed FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users can update own history" ON recently_viewed FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Users can delete own history" ON recently_viewed FOR DELETE USING (auth.uid() = customer_id);
