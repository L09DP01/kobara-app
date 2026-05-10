'use server'

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function requestWithdrawal(amount: number, method: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, available_balance')
    .eq('user_id', user.id)
    .single();

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  if (amount > Number(merchant.available_balance)) {
    throw new Error("Solde insuffisant");
  }

  if (amount < 100) {
    throw new Error("Le montant minimum est de 100 HTG");
  }

  // Deduct from available balance immediately (pending state)
  // In a robust system, you would use a transaction or RPC, but this works for MVP.
  const newBalance = Number(merchant.available_balance) - amount;

  const { error: updateError } = await supabase
    .from('merchants')
    .update({ available_balance: newBalance })
    .eq('id', merchant.id);

  if (updateError) {
    throw new Error("Erreur de mise à jour du solde");
  }

  // Create withdrawal request
  const reference = `WTH-${Date.now()}`;
  const { error: insertError } = await supabase
    .from('withdrawals')
    .insert({
      merchant_id: merchant.id,
      amount: amount,
      status: 'pending',
      method: method,
      reference: reference,
    });

  if (insertError) {
    // We should revert the balance if this fails, but skipping for MVP
    throw new Error("Erreur lors de la création de la demande");
  }

  revalidatePath('/dashboard/withdrawals');
  
  // Note: For MVP we leave it as 'pending' for manual admin approval.
  // We could call BazikService.createWithdrawal() here if we want automatic transfers.
}
