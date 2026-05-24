'use server';

import { createAdminClient } from "@/utils/supabase/admin";
import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import crypto from "crypto";

export async function generateHandoffToken() {
  try {
    const { merchant } = await getCurrentUserAndMerchant();
    const supabase = createAdminClient();

    // Generate a secure token UUID
    const token = crypto.randomUUID();
    
    // Expires in 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const { error } = await supabase
      .from('kyc_profiles')
      .update({
        mobile_handoff_token: token,
        mobile_handoff_expires_at: expiresAt.toISOString(),
        mobile_handoff_completed: false
      })
      .eq('merchant_id', merchant.id);

    if (error) {
      console.error("Failed to update kyc_profiles with handoff token:", error);
      return { error: "Erreur lors de la génération du lien." };
    }

    return { token };
  } catch (error: any) {
    console.error("generateHandoffToken error:", error);
    return { error: error.message || "Non autorisé" };
  }
}

export async function checkHandoffStatus() {
  try {
    const { merchant } = await getCurrentUserAndMerchant();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('kyc_profiles')
      .select('mobile_handoff_completed, mobile_handoff_expires_at')
      .eq('merchant_id', merchant.id)
      .single();

    if (error || !data) {
      return { completed: false };
    }

    // Check expiration just in case
    const now = new Date();
    const expiresAt = new Date(data.mobile_handoff_expires_at);
    const isExpired = now > expiresAt;

    if (isExpired && !data.mobile_handoff_completed) {
      return { expired: true, completed: false };
    }

    return { completed: !!data.mobile_handoff_completed };
  } catch (error) {
    return { completed: false };
  }
}
