const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://malvtksmbmhfrpufibbi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hbHZ0a3NtYm1oZnJwdWZpYmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzU3NjQsImV4cCI6MjA3NDc1MTc2NH0.6mLkj2rWaRy7k8TP375N8Nie_fqE5QSkdJcriohtpBs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  console.log('🗄️ Supabase veritabanı kuruluyor...')
  
  try {
    // Test connection
    const { data, error } = await supabase.from('organizations').select('count')
    if (error) {
      console.log('❌ Veritabanı bağlantısı başarısız:', error.message)
      console.log('📝 Lütfen Supabase Dashboard\'da SQL Editor\'ı açın ve şu SQL\'i çalıştırın:')
      console.log(`
-- Organizations table
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memberships table
CREATE TABLE memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

-- Warehouses table
CREATE TABLE warehouses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Final', 'SemiFinished', 'Raw')),
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'L', 'piece')),
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  kg_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, code)
);

-- Stocks table
CREATE TABLE stocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, warehouse_id)
);

-- Stock movements table
CREATE TABLE stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'transfer')),
  quantity DECIMAL(10,2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT USING (
    id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
  );

-- Memberships policies
CREATE POLICY "Users can view their own memberships" ON memberships
  FOR SELECT USING (user_id = auth.uid());

-- Warehouses policies
CREATE POLICY "Users can view warehouses in their organizations" ON warehouses
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins and managers can manage warehouses" ON warehouses
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Products policies
CREATE POLICY "Users can view products in their organizations" ON products
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins and managers can manage products" ON products
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Stocks policies
CREATE POLICY "Users can view stocks in their organizations" ON stocks
  FOR SELECT USING (
    product_id IN (
      SELECT id FROM products 
      WHERE org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Admins and managers can manage stocks" ON stocks
  FOR ALL USING (
    product_id IN (
      SELECT id FROM products 
      WHERE org_id IN (
        SELECT org_id FROM memberships 
        WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );

-- Stock movements policies
CREATE POLICY "Users can view stock movements in their organizations" ON stock_movements
  FOR SELECT USING (
    product_id IN (
      SELECT id FROM products 
      WHERE org_id IN (SELECT org_id FROM memberships WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Admins and managers can create stock movements" ON stock_movements
  FOR INSERT WITH CHECK (
    product_id IN (
      SELECT id FROM products 
      WHERE org_id IN (
        SELECT org_id FROM memberships 
        WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );

-- Insert demo data
INSERT INTO organizations (id, name, slug) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Demo Organization', 'demo-org');

INSERT INTO warehouses (id, org_id, name, location) VALUES 
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'Ana Depo', 'İstanbul');

INSERT INTO products (id, org_id, code, name, type, unit, vat_rate, kg_price, min_stock) VALUES 
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'PC001', 'Nitrogen Fertilizer', 'Final', 'kg', 10, 15.50, 500),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'PC002', 'Phosphate Fertilizer', 'Final', 'kg', 10, 18.75, 300),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'PC003', 'Ammonium Nitrate', 'Raw', 'kg', 5, 12.30, 1000);

INSERT INTO stocks (product_id, warehouse_id, quantity) VALUES 
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 500),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 300),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 1000);
      `)
      return
    }
    
    console.log('✅ Supabase bağlantısı başarılı!')
    console.log('📊 Mevcut organizasyon sayısı:', data.length)
    
  } catch (error) {
    console.error('❌ Hata:', error.message)
  }
}

setupDatabase()
