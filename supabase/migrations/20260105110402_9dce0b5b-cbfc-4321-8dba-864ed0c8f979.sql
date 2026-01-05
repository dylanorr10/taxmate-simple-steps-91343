-- Create HMRC categories reference table with SA103F mappings
CREATE TABLE public.hmrc_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hmrc_categories ENABLE ROW LEVEL SECURITY;

-- Categories are publicly readable (reference data)
CREATE POLICY "HMRC categories are publicly readable"
ON public.hmrc_categories
FOR SELECT
USING (true);

-- Insert all SA103F expense categories
INSERT INTO public.hmrc_categories (code, display_name, type, description, icon, order_index) VALUES
('costOfGoods', 'Cost of Goods Sold', 'expense', 'Materials, stock, direct costs for products sold', 'Package', 1),
('carVanTravel', 'Travel & Transport', 'expense', 'Fuel, parking, train tickets, vehicle costs', 'Car', 2),
('wagesAndStaff', 'Wages & Staff', 'expense', 'Salaries, bonuses, agency fees, subcontractors', 'Users', 3),
('rentRatesPower', 'Rent, Rates & Power', 'expense', 'Office rent, business rates, electricity, gas', 'Building', 4),
('repairsAndRenewals', 'Repairs & Maintenance', 'expense', 'Equipment repairs, premises maintenance', 'Wrench', 5),
('phoneFaxStationery', 'Phone, Software & Office', 'expense', 'Mobile bills, software subscriptions, stationery', 'Phone', 6),
('advertising', 'Marketing & Advertising', 'expense', 'Website costs, PR, ads, social media marketing', 'Megaphone', 7),
('interest', 'Interest & Finance', 'expense', 'Bank charges, loan interest (not capital repayments)', 'Landmark', 8),
('accountancyLegal', 'Professional Fees', 'expense', 'Accountant, solicitor, surveyor, consultant fees', 'Briefcase', 9),
('other', 'Other Expenses', 'expense', 'Business expenses that don''t fit other categories', 'MoreHorizontal', 10),
('goodsOwnUse', 'Goods for Own Use', 'expense', 'Stock taken for personal use (negative expense)', 'ShoppingBag', 11);

-- Insert income categories
INSERT INTO public.hmrc_categories (code, display_name, type, description, icon, order_index) VALUES
('turnover', 'Sales & Turnover', 'income', 'Main business income from sales or services', 'TrendingUp', 1),
('otherIncome', 'Other Business Income', 'income', 'Grants, COVID support, bank interest, misc income', 'PlusCircle', 2);

-- Add HMRC category fields to expense_transactions
ALTER TABLE public.expense_transactions
ADD COLUMN IF NOT EXISTS hmrc_category_id UUID REFERENCES public.hmrc_categories(id),
ADD COLUMN IF NOT EXISTS disallowable_amount NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS disallowable_reason TEXT;

-- Add HMRC category fields to income_transactions
ALTER TABLE public.income_transactions
ADD COLUMN IF NOT EXISTS hmrc_category_id UUID REFERENCES public.hmrc_categories(id);

-- Create index for faster category lookups
CREATE INDEX idx_expense_hmrc_category ON public.expense_transactions(hmrc_category_id);
CREATE INDEX idx_income_hmrc_category ON public.income_transactions(hmrc_category_id);