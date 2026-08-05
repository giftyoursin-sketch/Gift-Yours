-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  banner_image TEXT,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for easy access (or enable as per app policy)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Insert some default parent categories
INSERT INTO categories (id, name, slug, sort_order) VALUES
  ('cat-photo-frames', 'Photo Frames', 'photo-frames', 1),
  ('cat-gift-items', 'Gift Items', 'gift-items', 2),
  ('cat-personalized-gifts', 'Personalized Gifts', 'personalized-gifts', 3),
  ('cat-home-decor', 'Home Decor', 'home-decor', 4)
ON CONFLICT (id) DO NOTHING;

-- Insert some default sub categories
INSERT INTO categories (id, parent_id, name, slug, sort_order) VALUES
  ('cat-pf-wooden', 'cat-photo-frames', 'Wooden Frames', 'wooden-frames', 1),
  ('cat-pf-acrylic', 'cat-photo-frames', 'Acrylic Frames', 'acrylic-frames', 2),
  ('cat-pf-led', 'cat-photo-frames', 'LED Frames', 'led-frames', 3),
  ('cat-gi-mugs', 'cat-gift-items', 'Mugs', 'mugs', 1),
  ('cat-gi-keychains', 'cat-gift-items', 'Keychains', 'keychains', 2)
ON CONFLICT (id) DO NOTHING;
