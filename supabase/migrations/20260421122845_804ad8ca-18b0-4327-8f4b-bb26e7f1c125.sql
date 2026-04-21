-- Add optional module flags to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS invoicing_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mileage_enabled boolean NOT NULL DEFAULT false;

-- Auto-enable mileage for existing users with mileage data
UPDATE public.profiles p
SET mileage_enabled = true
WHERE EXISTS (
  SELECT 1 FROM public.mileage_trips mt WHERE mt.user_id = p.id
);

-- Auto-enable invoicing for existing users with invoice data (unpaid or invoice number set)
UPDATE public.profiles p
SET invoicing_enabled = true
WHERE EXISTS (
  SELECT 1 FROM public.income_transactions it
  WHERE it.user_id = p.id
    AND (it.invoice_number IS NOT NULL OR it.payment_status IN ('unpaid','overdue','pending'))
);