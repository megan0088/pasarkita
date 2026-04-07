-- ============================================================
-- C9titip — Supabase Schema
-- ============================================================

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL DEFAULT '',
  full_name   TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer','seller','admin')),
  phone       TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''));
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Categories ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name      TEXT NOT NULL,
  slug      TEXT NOT NULL UNIQUE,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0
);

-- ── Products ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT NOT NULL DEFAULT '',
  price         BIGINT NOT NULL CHECK (price >= 0),
  compare_price BIGINT CHECK (compare_price > price),
  stock         INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
  image_urls    TEXT[] DEFAULT '{}',
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  seller_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,  -- nullable, no auth needed
  seller_name   TEXT NOT NULL DEFAULT '',                         -- nama penjual tanpa auth
  is_active     BOOLEAN DEFAULT TRUE,
  rating_avg    NUMERIC(2,1) DEFAULT 0,
  rating_count  INTEGER DEFAULT 0,
  sold_count    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_seller   ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(is_active);

-- ── Orders ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number              TEXT NOT NULL UNIQUE,
  buyer_id                  UUID REFERENCES profiles(id),  -- nullable for guest checkout
  buyer_name                TEXT NOT NULL DEFAULT '',
  buyer_email               TEXT NOT NULL DEFAULT '',
  status                    TEXT NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled')),
  subtotal                  BIGINT NOT NULL,
  shipping_fee              BIGINT NOT NULL DEFAULT 15000,
  total                     BIGINT NOT NULL,
  shipping_address          JSONB NOT NULL DEFAULT '{}',
  stripe_payment_intent_id  TEXT,
  paid_at                   TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_buyer  ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ── Order Items ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  BIGINT NOT NULL,
  total_price BIGINT NOT NULL
);

-- ── Reviews ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Auto-update rating after review ──────────────────────────
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE products SET
    rating_avg   = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE product_id = NEW.product_id),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_review_created ON reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ── Auto-update stock & sold_count after order paid ──────────
CREATE OR REPLACE FUNCTION update_stock_on_paid()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status = 'pending' THEN
    UPDATE products p
    SET
      stock      = p.stock - oi.quantity,
      sold_count = p.sold_count + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_order_paid ON orders;
CREATE TRIGGER on_order_paid
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_paid();

-- ── updated_at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER orders_updated_at   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Storage ──────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('c9titip', 'c9titip', true) ON CONFLICT DO NOTHING;

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews     ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles"           ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile"  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories
CREATE POLICY "Public categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Products — anyone can list and view, no auth needed
CREATE POLICY "Public read products"   ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can list items"  ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own"  ON products FOR UPDATE USING (true);

-- Orders — public can create orders
CREATE POLICY "Anyone can create orders"  ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Buyers see own orders"     ON orders FOR SELECT USING (
  buyer_id = auth.uid() OR buyer_id IS NULL
);
CREATE POLICY "Admin see all orders"      ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone can update order"   ON orders FOR UPDATE USING (true);

-- Order items
CREATE POLICY "Order items visible to buyer" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND buyer_id = auth.uid())
);
CREATE POLICY "Anyone insert order items" ON order_items FOR INSERT WITH CHECK (true);

-- Reviews
CREATE POLICY "Public reviews"         ON reviews FOR SELECT USING (true);
CREATE POLICY "Anyone create reviews"  ON reviews FOR INSERT WITH CHECK (true);

-- Storage — public read and write
CREATE POLICY "Public read"    ON storage.objects FOR SELECT USING (bucket_id = 'c9titip');
CREATE POLICY "Public upload"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'c9titip');
CREATE POLICY "Public delete"  ON storage.objects FOR DELETE USING (bucket_id = 'c9titip');

-- ── Seed Categories ──────────────────────────────────────────
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Elektronik',       'elektronik',     0),
  ('Fashion Pria',     'fashion-pria',   1),
  ('Fashion Wanita',   'fashion-wanita', 2),
  ('Makanan & Minuman','makanan-minuman', 3),
  ('Kesehatan',        'kesehatan',      4),
  ('Olahraga',         'olahraga',       5),
  ('Rumah & Taman',    'rumah-taman',    6),
  ('Hobi & Koleksi',   'hobi-koleksi',   7)
ON CONFLICT (slug) DO NOTHING;
