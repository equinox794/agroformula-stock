-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is member of organization
CREATE OR REPLACE FUNCTION is_member_of_org(org_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships 
    WHERE memberships.org_id = is_member_of_org.org_id 
    AND memberships.user_id = is_member_of_org.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user role in organization
CREATE OR REPLACE FUNCTION get_user_role_in_org(org_id UUID, user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM memberships 
    WHERE memberships.org_id = get_user_role_in_org.org_id 
    AND memberships.user_id = get_user_role_in_org.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view organizations they are members of" ON organizations
  FOR SELECT USING (is_member_of_org(id, auth.uid()));

CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Only admins can update organizations" ON organizations
  FOR UPDATE USING (
    auth.uid() = owner_id OR 
    get_user_role_in_org(id, auth.uid()) = 'admin'
  );

CREATE POLICY "Only owners can delete organizations" ON organizations
  FOR DELETE USING (auth.uid() = owner_id);

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Memberships policies
CREATE POLICY "Users can view memberships in their organizations" ON memberships
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()));

CREATE POLICY "Only admins can manage memberships" ON memberships
  FOR ALL USING (
    get_user_role_in_org(org_id, auth.uid()) IN ('admin')
  );

-- Warehouses policies
CREATE POLICY "Users can view warehouses in their organizations" ON warehouses
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()));

CREATE POLICY "Managers and admins can manage warehouses" ON warehouses
  FOR ALL USING (
    get_user_role_in_org(org_id, auth.uid()) IN ('admin', 'manager')
  );

-- Products policies
CREATE POLICY "Users can view products in their organizations" ON products
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()));

CREATE POLICY "Managers and admins can manage products" ON products
  FOR ALL USING (
    get_user_role_in_org(org_id, auth.uid()) IN ('admin', 'manager')
  );

-- Stocks policies
CREATE POLICY "Users can view stocks in their organizations" ON stocks
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()));

CREATE POLICY "Managers and admins can manage stocks" ON stocks
  FOR ALL USING (
    get_user_role_in_org(org_id, auth.uid()) IN ('admin', 'manager')
  );

-- Stock movements policies
CREATE POLICY "Users can view stock movements in their organizations" ON stock_movements
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()));

CREATE POLICY "Managers and admins can create stock movements" ON stock_movements
  FOR INSERT WITH CHECK (
    get_user_role_in_org(org_id, auth.uid()) IN ('admin', 'manager')
  );

-- Subscriptions policies
CREATE POLICY "Users can view subscriptions in their organizations" ON subscriptions
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()));

CREATE POLICY "Only admins can manage subscriptions" ON subscriptions
  FOR ALL USING (
    get_user_role_in_org(org_id, auth.uid()) = 'admin'
  );

-- Audit logs policies
CREATE POLICY "Users can view audit logs in their organizations" ON audit_logs
  FOR SELECT USING (is_member_of_org(org_id, auth.uid()));

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);
