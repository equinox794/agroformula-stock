-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at
  BEFORE UPDATE ON warehouses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stocks_updated_at
  BEFORE UPDATE ON stocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update stock levels when movements are added
CREATE OR REPLACE FUNCTION update_stock_from_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update stock record
  INSERT INTO stocks (org_id, product_id, warehouse_id, quantity)
  VALUES (NEW.org_id, NEW.product_id, NEW.warehouse_id, NEW.qty_change)
  ON CONFLICT (product_id, warehouse_id)
  DO UPDATE SET 
    quantity = stocks.quantity + NEW.qty_change,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stock levels
CREATE TRIGGER update_stock_on_movement
  AFTER INSERT ON stock_movements
  FOR EACH ROW EXECUTE FUNCTION update_stock_from_movement();

-- Function to ensure only one default warehouse per organization
CREATE OR REPLACE FUNCTION ensure_single_default_warehouse()
RETURNS TRIGGER AS $$
BEGIN
  -- If this warehouse is being set as default
  IF NEW.is_default = TRUE THEN
    -- Set all other warehouses in the same org to not default
    UPDATE warehouses 
    SET is_default = FALSE, updated_at = NOW()
    WHERE org_id = NEW.org_id 
    AND id != NEW.id 
    AND is_default = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure single default warehouse
CREATE TRIGGER ensure_single_default_warehouse_trigger
  BEFORE INSERT OR UPDATE ON warehouses
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_warehouse();

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  p_org_id UUID,
  p_actor_id UUID,
  p_action TEXT,
  p_entity TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_meta JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (org_id, actor_id, action, entity, entity_id, meta)
  VALUES (p_org_id, p_actor_id, p_action, p_entity, p_entity_id, p_meta);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get stock summary for a product across all warehouses
CREATE OR REPLACE FUNCTION get_product_stock_summary(p_product_id UUID, p_org_id UUID)
RETURNS TABLE (
  warehouse_id UUID,
  warehouse_name TEXT,
  quantity NUMERIC,
  is_low_stock BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.warehouse_id,
    w.name as warehouse_name,
    s.quantity,
    (s.quantity <= p.min_stock) as is_low_stock
  FROM stocks s
  JOIN warehouses w ON s.warehouse_id = w.id
  JOIN products p ON s.product_id = p.id
  WHERE s.product_id = p_product_id 
  AND s.org_id = p_org_id
  ORDER BY w.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products(p_org_id UUID)
RETURNS TABLE (
  product_id UUID,
  product_code TEXT,
  product_name TEXT,
  total_quantity NUMERIC,
  min_stock NUMERIC,
  warehouse_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.code as product_code,
    p.name as product_name,
    COALESCE(SUM(s.quantity), 0) as total_quantity,
    p.min_stock,
    COUNT(s.warehouse_id) as warehouse_count
  FROM products p
  LEFT JOIN stocks s ON p.id = s.product_id AND s.org_id = p.org_id
  WHERE p.org_id = p_org_id
  GROUP BY p.id, p.code, p.name, p.min_stock
  HAVING COALESCE(SUM(s.quantity), 0) <= p.min_stock
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
