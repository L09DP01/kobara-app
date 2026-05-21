'use server'

import { createAdminClient } from "@/utils/supabase/admin";
import { approveMerchantKyc } from "@/lib/server/kyc";

export async function getPendingKycProfiles() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('kyc_profiles')
    .select('*, merchant:merchants(business_name, email)')
    .in('status', ['pending', 'in_review'])
    .order('submitted_at', { ascending: false });

  return data || [];
}

export async function getSignedUrl(path: string) {
  if (!path) return null;
  const supabase = createAdminClient();
  const { data } = await supabase.storage.from('kyc_documents').createSignedUrl(path, 3600);
  return data?.signedUrl || null;
}

export async function adminApproveKyc(profileId: string, merchantId: string) {
  const supabase = createAdminClient();
  
  await supabase.from('kyc_profiles').update({
    status: 'approved',
    approved_at: new Date().toISOString()
  }).eq('id', profileId);

  await approveMerchantKyc(merchantId);
}

export async function adminRejectKyc(profileId: string, merchantId: string, reason: string) {
  const supabase = createAdminClient();
  
  await supabase.from('kyc_profiles').update({
    status: 'rejected',
    rejected_at: new Date().toISOString(),
    rejection_reason: reason
  }).eq('id', profileId);

  await supabase.from('merchants').update({
    kyc_status: 'rejected'
  }).eq('id', merchantId);

  await supabase.from('kyc_events').insert({
    merchant_id: merchantId,
    kyc_profile_id: profileId,
    event_type: 'kyc.rejected.admin',
    payload: { reason }
  });
}
