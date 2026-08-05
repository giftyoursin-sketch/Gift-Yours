-- Migration to add frame_configurations table
CREATE TABLE IF NOT EXISTS frame_configurations (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,          -- Size, Color, Margin, PaperType, CanvasType, Thickness, Wrap, Border, Orientation, Finish
  name TEXT NOT NULL,          -- "12x8", "Matte Black", "White Margin"
  value TEXT,                  -- "#000000" for color, or specific dimensions like "12x8"
  price DECIMAL(10,2) DEFAULT 0.00,       -- Base or modifier price
  offer_price DECIMAL(10,2),   -- Optional discounted price
  thumbnail_url TEXT,          -- Image for margins, wraps, etc.
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial basic data (optional, but good for starting points)
INSERT INTO frame_configurations (id, type, name, value, price, sort_order) VALUES
  ('size-8x8', 'Size', '8 Inch x 8 Inch', '8x8', 145, 1),
  ('size-12x8', 'Size', '12 Inch x 8 Inch', '12x8', 189, 2),
  ('size-10x15', 'Size', '10 Inch x 15 Inch', '10x15', 227, 3),
  
  ('color-oak', 'Color', 'Natural Oak', '#D1B48C', 0, 1),
  ('color-black', 'Color', 'Matte Black', '#222222', 0, 2),
  ('color-white', 'Color', 'Gallery White', '#F8F9FA', 0, 3),
  ('color-brown', 'Color', 'Walnut Brown', '#5C4033', 0, 4),
  
  ('margin-white', 'Margin', 'White Margin', 'white', 0, 1),
  ('margin-none', 'Margin', 'No Margin', 'none', 0, 2),
  
  ('paper-matte', 'PaperType', 'Matte Paper', 'matte', 50, 1),
  ('paper-gloss', 'PaperType', 'Gloss Paper', 'gloss', 63, 2),
  ('paper-glitter', 'PaperType', 'Glitter', 'glitter', 85, 3),
  
  ('canvas-mounted', 'CanvasType', 'Mounted Canvas', 'mounted', 0, 1),
  ('canvas-gallery', 'CanvasType', 'Gallery Wrap', 'gallery', 50, 2),
  
  ('thickness-0.5', 'Thickness', '0.5 Inch Frame', '0.5', 145, 1),
  ('thickness-1', 'Thickness', '1 Inch Frame', '1', 189, 2),
  ('thickness-1.5', 'Thickness', '1.5 Inch Frame', '1.5', 227, 3)
ON CONFLICT (id) DO NOTHING;

-- Disable RLS for now so Business Management and E-Commerce can access easily (like other tables)
ALTER TABLE frame_configurations DISABLE ROW LEVEL SECURITY;
