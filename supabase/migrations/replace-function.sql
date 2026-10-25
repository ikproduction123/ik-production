
CREATE OR REPLACE FUNCTION public.create_checkout_order(p_plan_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_plan record;
  v_subscription_id uuid;
  v_payment_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Silakan login terlebih dahulu.';
  END IF;

  SELECT id, name, price, duration_days, is_active
  INTO v_plan
  FROM public.plans
  WHERE id = p_plan_id
  FOR SHARE;

  IF NOT FOUND OR v_plan.is_active IS NOT TRUE THEN
    RAISE EXCEPTION 'Paket tidak tersedia.';
  END IF;

  IF v_plan.price < 0 OR v_plan.duration_days <> 365 THEN
    RAISE EXCEPTION 'Konfigurasi paket tidak valid.';
  END IF;

  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    status,
    started_at,
    expires_at
  )
  VALUES (
    v_user_id,
    v_plan.id,
    'pending',
    NULL,
    NULL
  )
  RETURNING id INTO v_subscription_id;

  INSERT INTO public.payments (
    subscription_id,
    amount,
    method,
    status
  )
  VALUES (
    v_subscription_id,
    v_plan.price,
    'bank_transfer',
    'pending'
  )
  RETURNING id INTO v_payment_id;

  RETURN jsonb_build_object(
    'subscription_id', v_subscription_id,
    'payment_id', v_payment_id,
    'plan_name', v_plan.name,
    'amount', v_plan.price,
    'duration_days', v_plan.duration_days
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_checkout_order(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.create_checkout_order(uuid)
TO authenticated;
