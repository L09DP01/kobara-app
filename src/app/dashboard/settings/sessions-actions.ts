'use server'

import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { revalidatePath } from "next/cache";

export async function getActiveSessions() {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  const { data, error } = await supabase
    .from('merchant_sessions')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('last_active_at', { ascending: false });

  if (error) {
    console.error("Erreur lors de la récupération des sessions:", error);
    return [];
  }

  return data || [];
}

export async function revokeSession(sessionId: string) {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  const { error } = await supabase
    .from('merchant_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('merchant_id', merchant.id);

  if (error) {
    console.error("Erreur lors de la révocation de la session:", error);
    return { error: "Erreur lors de la déconnexion de l'appareil." };
  }

  revalidatePath('/dashboard/settings');
  return { success: true };
}
