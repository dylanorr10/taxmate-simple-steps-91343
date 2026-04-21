
-- payroll_settings
CREATE TABLE public.payroll_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  employer_reference TEXT,
  paye_scheme_reference TEXT,
  auto_create_expenses BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payroll_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payroll settings" ON public.payroll_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own payroll settings" ON public.payroll_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own payroll settings" ON public.payroll_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own payroll settings" ON public.payroll_settings FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_payroll_settings_updated_at
BEFORE UPDATE ON public.payroll_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- payroll_people
CREATE TABLE public.payroll_people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  person_type TEXT NOT NULL CHECK (person_type IN ('director','contractor','employee')),
  name TEXT NOT NULL,
  email TEXT,
  annual_salary NUMERIC NOT NULL DEFAULT 0,
  monthly_salary NUMERIC NOT NULL DEFAULT 0,
  ni_category TEXT DEFAULT 'A',
  ir35_status TEXT CHECK (ir35_status IN ('inside','outside','unknown')),
  utr TEXT,
  start_date DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payroll_people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payroll people" ON public.payroll_people FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own payroll people" ON public.payroll_people FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own payroll people" ON public.payroll_people FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own payroll people" ON public.payroll_people FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_payroll_people_updated_at
BEFORE UPDATE ON public.payroll_people
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_payroll_people_user ON public.payroll_people(user_id);

-- payroll_runs
CREATE TABLE public.payroll_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  person_id UUID NOT NULL REFERENCES public.payroll_people(id) ON DELETE CASCADE,
  pay_month DATE NOT NULL,
  gross NUMERIC NOT NULL DEFAULT 0,
  income_tax NUMERIC NOT NULL DEFAULT 0,
  employee_ni NUMERIC NOT NULL DEFAULT 0,
  employer_ni NUMERIC NOT NULL DEFAULT 0,
  pension_contribution NUMERIC NOT NULL DEFAULT 0,
  net_pay NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','paid','exported')),
  expense_transaction_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(person_id, pay_month)
);

ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payroll runs" ON public.payroll_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own payroll runs" ON public.payroll_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own payroll runs" ON public.payroll_runs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own payroll runs" ON public.payroll_runs FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_payroll_runs_updated_at
BEFORE UPDATE ON public.payroll_runs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_payroll_runs_user_month ON public.payroll_runs(user_id, pay_month);
CREATE INDEX idx_payroll_runs_person ON public.payroll_runs(person_id);
