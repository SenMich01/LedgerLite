-- LedgerLite Supabase Schema

-- 1. users_profiles
CREATE TABLE users_profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  full_name text,
  business_name text,
  phone text,
  plan text DEFAULT 'free',
  created_at timestamptz DEFAULT now()
);

-- 2. customers
CREATE TABLE customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  name text NOT NULL,
  email text,
  phone text,
  outstanding_balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. transactions
CREATE TABLE transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  type text CHECK (type IN ('income','expense')),
  amount numeric NOT NULL,
  category text,
  payment_method text CHECK (payment_method IN ('Cash','Bank','POS')),
  description text,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- 4. debts
CREATE TABLE debts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  customer_id uuid REFERENCES customers(id),
  amount numeric NOT NULL,
  due_date date,
  status text CHECK (status IN ('pending','paid','overdue')) DEFAULT 'pending',
  description text,
  created_at timestamptz DEFAULT now()
);

-- 5. invoices
CREATE TABLE invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  customer_id uuid REFERENCES customers(id),
  invoice_number text UNIQUE,
  items jsonb,
  total_amount numeric NOT NULL,
  status text CHECK (status IN ('paid','pending','overdue')) DEFAULT 'pending',
  due_date date,
  created_at timestamptz DEFAULT now()
);

-- 6. products
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  name text NOT NULL,
  category text,
  cost_price numeric,
  selling_price numeric,
  stock_quantity integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

-- 7. staff
CREATE TABLE staff (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users,
  user_id uuid REFERENCES auth.users,
  role text CHECK (role IN ('manager','sales_staff')) DEFAULT 'sales_staff',
  permissions text CHECK (permissions IN ('view_only','add_transactions','full_access')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Users can only access their own profile" ON users_profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can only access their own customers" ON customers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own debts" ON debts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own invoices" ON invoices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own products" ON products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owners can only access their own staff" ON staff FOR ALL USING (auth.uid() = owner_id);
