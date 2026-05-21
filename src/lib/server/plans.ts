import { createAdminClient } from "@/utils/supabase/admin";

export interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_htg: number;
  monthly_payment_limit: number | null;
  api_keys_limit: number | null;
  transaction_fee_percent: number;
  daily_withdrawal_limit: number | null;
  wordpress_plugin: boolean;
  webhooks_level: string;
  analytics_level: string;
  support_level: string;
  is_contact_sales: boolean;
  features: any;
  limits: any;
  status: string;
  sort_order: number;
}

export interface Subscription {
  id: string;
  merchant_id: string;
  plan_id: string;
  status: string;
  billing_cycle: string;
  amount_htg: number;
  current_period_start: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export async function getPlans(): Promise<Plan[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('status', 'active')
    .order('sort_order', { ascending: true });
    
  if (error) {
    console.error("Erreur récupération plans:", error);
    return [];
  }
  return data as Plan[];
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('slug', slug)
    .single();
    
  if (error) return null;
  return data as Plan;
}

export async function getMerchantCurrentPlan(merchantId: string) {
  const supabase = createAdminClient();
  
  // Get merchant info
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('plan_slug, plan_status, account_access, kyc_status')
    .eq('id', merchantId)
    .single();
    
  if (merchantError || !merchant) {
    throw new Error("Marchand introuvable");
  }

  // If plan is 'test_only', return minimal info
  if (merchant.plan_slug === 'test_only') {
    return {
      merchant,
      plan: null,
      subscription: null
    };
  }

  // Get active subscription and plan details
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:plans(*)
    `)
    .eq('merchant_id', merchantId)
    .eq('status', 'active')
    .maybeSingle();

  if (subError) {
    console.error("Erreur récupération souscription:", subError);
  }

  return {
    merchant,
    plan: subscription?.plan as Plan | undefined,
    subscription: subscription as Subscription | undefined
  };
}

export async function activateFreePlanAfterKyc(merchantId: string) {
  const supabase = createAdminClient();
  
  // 1. Get merchant
  const { data: merchant, error: mError } = await supabase
    .from('merchants')
    .select('kyc_status, plan_status')
    .eq('id', merchantId)
    .single();

  if (mError || !merchant) throw new Error("Marchand introuvable");
  
  if (merchant.kyc_status !== 'approved') {
    throw new Error("Le KYC doit être approuvé pour activer le mode Live.");
  }

  if (merchant.plan_status === 'active') {
    throw new Error("Un plan est déjà actif pour ce marchand.");
  }

  // 2. Get Free Plan
  const freePlan = await getPlanBySlug('free');
  if (!freePlan) throw new Error("Plan Gratuit introuvable en base");

  // 3. Create Subscription
  const { error: subError } = await supabase
    .from('subscriptions')
    .insert({
      merchant_id: merchantId,
      plan_id: freePlan.id,
      status: 'active',
      amount_htg: 0,
      billing_cycle: 'monthly'
    });

  if (subError) throw new Error("Erreur création souscription: " + subError.message);

  // 4. Update Merchant
  const { error: updateError } = await supabase
    .from('merchants')
    .update({
      plan_slug: 'free',
      plan_status: 'active',
      account_access: 'limited_live'
    })
    .eq('id', merchantId);

  if (updateError) throw new Error("Erreur mise à jour marchand: " + updateError.message);

  // 5. Create Notification
  await supabase.from('notifications').insert({
    merchant_id: merchantId,
    type: 'plan_activated',
    title: 'Compte vérifié !',
    message: 'Votre compte a été vérifié et le plan Gratuit a été activé. Vous pouvez désormais accepter des paiements réels.'
  });

  // 6. Audit Log
  await supabase.from('audit_logs').insert({
    merchant_id: merchantId,
    action: 'plan.free_activated_after_kyc',
    metadata: { plan_slug: 'free' }
  });

  return { success: true };
}

export async function upgradeMerchantPlan(merchantId: string, planSlug: string) {
  const supabase = createAdminClient();
  
  // TODO: Add billing/payment logic here. For now, we assume the upgrade is free or already paid.
  // We need to check if they pay directly with MonCash or deduct from available_balance.
  
  const newPlan = await getPlanBySlug(planSlug);
  if (!newPlan) throw new Error("Plan introuvable");

  // Deactivate old subscription
  await supabase
    .from('subscriptions')
    .update({ status: 'canceled', cancelled_at: new Date().toISOString() })
    .eq('merchant_id', merchantId)
    .eq('status', 'active');

  // Create new subscription
  const { error: subError } = await supabase
    .from('subscriptions')
    .insert({
      merchant_id: merchantId,
      plan_id: newPlan.id,
      status: 'active',
      amount_htg: newPlan.price_htg,
      billing_cycle: 'monthly'
    });

  if (subError) throw new Error("Erreur création nouvelle souscription: " + subError.message);

  // Update Merchant
  await supabase
    .from('merchants')
    .update({
      plan_slug: planSlug,
      plan_status: 'active',
      account_access: 'live' // Unrestricted live access
    })
    .eq('id', merchantId);

  // Audit Log
  await supabase.from('audit_logs').insert({
    merchant_id: merchantId,
    action: 'plan.upgraded',
    metadata: { new_plan: planSlug }
  });

  return { success: true };
}

export async function cancelSubscription(merchantId: string) {
  const supabase = createAdminClient();
  
  await supabase
    .from('subscriptions')
    .update({ cancel_at_period_end: true })
    .eq('merchant_id', merchantId)
    .eq('status', 'active');

  await supabase.from('audit_logs').insert({
    merchant_id: merchantId,
    action: 'plan.cancel_scheduled'
  });

  return { success: true };
}
