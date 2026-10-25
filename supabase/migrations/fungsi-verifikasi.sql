
CREATE OR REPLACE FUNCTION public.admin_review_payment(
  p_payment_id uuid,
  p_decision text,
  p_admin_note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_payment public.payments%ROWTYPE;
  v_subscription public.subscriptions%ROWTYPE;
  v_plan public.plans%ROWTYPE;
  v_now timestamptz := now();
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_admin() THEN
    RAISE EXCEPTION 'Hanya admin yang boleh memverifikasi pembayaran.';
  END IF;

  IF p_decision NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Keputusan harus approve atau reject.';
  END IF;

  SELECT *
  INTO v_payment
  FROM public.payments
  WHERE id = p_payment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pembayaran tidak ditemukan.';
  END IF;

  IF v_payment.status <> 'pending' THEN
    RAISE EXCEPTION 'Pembayaran ini sudah diproses.';
  END IF;

  IF p_decision = 'approve' THEN
    IF v_payment.proof_path IS NULL
       OR btrim(v_payment.proof_path) = '' THEN
      RAISE EXCEPTION 'Bukti pembayaran belum tersedia.';
    END IF;

    SELECT *
    INTO v_subscription
    FROM public.subscriptions
    WHERE id = v_payment.subscription_id
    FOR UPDATE;

    IF NOT FOUND OR v_subscription.status <> 'pending' THEN
      RAISE EXCEPTION 'Pesanan tidak ditemukan atau sudah diproses.';
    END IF;

    SELECT *
    INTO v_plan
    FROM public.plans
    WHERE id = v_subscription.plan_id;

    IF NOT FOUND OR v_plan.duration_days <> 365 THEN
      RAISE EXCEPTION 'Paket tidak valid untuk langganan tahunan.';
    END IF;

    UPDATE public.payments
    SET status = 'approved',
        admin_note = NULLIF(btrim(p_admin_note), ''),
        verified_by = auth.uid(),
        verified_at = v_now
    WHERE id = p_payment_id;

    UPDATE public.subscriptions
    SET status = 'active',
        started_at = v_now,
        expires_at = v_now + interval '365 days',
        updated_at = v_now
    WHERE id = v_subscription.id;

    RETURN jsonb_build_object(
      'success', true,
      'decision', 'approved',
      'subscription_id', v_subscription.id,
      'expires_at', v_now + interval '365 days'
    );
  END IF;

  UPDATE public.payments
  SET status = 'rejected',
      admin_note = NULLIF(btrim(p_admin_note), ''),
      verified_by = auth.uid(),
      verified_at = v_now
  WHERE id = p_payment_id;

  UPDATE public.subscriptions
  SET status = 'cancelled',
      updated_at = v_now
  WHERE id = v_payment.subscription_id
    AND status = 'pending';

  RETURN jsonb_build_object(
    'success', true,
    'decision', 'rejected'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_review_payment(uuid, text, text)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_review_payment(uuid, text, text)
TO authenticated;
