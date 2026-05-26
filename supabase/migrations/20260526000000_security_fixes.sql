-- =============================================================================
-- SECURITY FIXES MIGRATION — 2026-05-26
-- Fixes: CRIT-05 (race condition soldes), MED-07 (search_path RLS)
-- Also enforces: Only service_role can write (admin-only writes)
-- =============================================================================

-- --------------------------------------------------------
-- CRIT-05: Atomic balance operations (prevents race conditions)
-- --------------------------------------------------------

-- Credit merchant balance atomically (used after successful payments)
CREATE OR REPLACE FUNCTION public.credit_merchant_balance(
  p_merchant_id UUID,
  p_amount DECIMAL
)
RETURNS void AS $$
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  UPDATE public.merchants
  SET available_balance = available_balance + p_amount,
      updated_at = NOW()
  WHERE id = p_merchant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Merchant not found: %', p_merchant_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Debit merchant balance atomically (used for withdrawals)
CREATE OR REPLACE FUNCTION public.debit_merchant_balance(
  p_merchant_id UUID,
  p_amount DECIMAL
)
RETURNS void AS $$
DECLARE
  v_current_balance DECIMAL;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT available_balance INTO v_current_balance
  FROM public.merchants
  WHERE id = p_merchant_id
  FOR UPDATE; -- Row-level lock to prevent concurrent reads

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Merchant not found: %', p_merchant_id;
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %, Requested: %', v_current_balance, p_amount;
  END IF;

  UPDATE public.merchants
  SET available_balance = available_balance - p_amount,
      updated_at = NOW()
  WHERE id = p_merchant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- --------------------------------------------------------
-- MED-07: Fix get_current_merchant_id() with search_path
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_current_merchant_id()
RETURNS UUID AS $$
  SELECT id FROM public.merchants WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER
SET search_path = public;

-- --------------------------------------------------------
-- ADMIN-ONLY WRITES: Drop all remaining INSERT/UPDATE/DELETE policies
-- Only service_role (admin client) can write. Users only get SELECT.
-- --------------------------------------------------------

-- Merchants: keep SELECT, drop INSERT/UPDATE
DROP POLICY IF EXISTS "Users can insert their own merchant" ON public.merchants;
DROP POLICY IF EXISTS "Users can update their own merchant" ON public.merchants;

-- Customers: keep SELECT, drop INSERT/UPDATE
DROP POLICY IF EXISTS "Merchant users can insert their customers" ON public.customers;
DROP POLICY IF EXISTS "Merchant users can update their customers" ON public.customers;

-- Payment Links: keep SELECT, drop INSERT/UPDATE
DROP POLICY IF EXISTS "Merchant users can insert their payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchant users can update their payment links" ON public.payment_links;

-- Payments: keep SELECT, drop INSERT/UPDATE (already done in security_lockdown, ensure idempotent)
DROP POLICY IF EXISTS "Merchant users can insert their payments" ON public.payments;
DROP POLICY IF EXISTS "Merchant users can update their payments" ON public.payments;

-- Withdrawals: keep SELECT, drop INSERT (already done in security_lockdown)
DROP POLICY IF EXISTS "Merchant users can insert their withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Merchant users can update their withdrawals" ON public.withdrawals;

-- API Keys: keep SELECT, drop INSERT/UPDATE (already done in security_lockdown)
DROP POLICY IF EXISTS "Merchant users can insert their api keys" ON public.api_keys;
DROP POLICY IF EXISTS "Merchant users can update their api keys" ON public.api_keys;

-- Webhook Endpoints: keep SELECT, drop INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Merchant users can insert their webhook endpoints" ON public.webhook_endpoints;
DROP POLICY IF EXISTS "Merchant users can update their webhook endpoints" ON public.webhook_endpoints;
DROP POLICY IF EXISTS "Merchant users can delete their webhook endpoints" ON public.webhook_endpoints;

-- Notifications: keep SELECT, drop UPDATE
DROP POLICY IF EXISTS "Merchant users can update their notifications" ON public.notifications;

-- Settings: keep SELECT, drop UPDATE
DROP POLICY IF EXISTS "Merchant users can update their settings" ON public.settings;

-- Audit Logs: keep SELECT only (already read-only)

-- Webhook Events: keep SELECT only (already read-only)
