'use server'

import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { revalidatePath } from "next/cache";
import { BazikService } from "@/lib/server/bazik/bazik.service";

export async function requestWithdrawal(amount: number, method: string, receiver?: string) {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  if (!merchant) {
    throw new Error("Merchant not found");
  }

  if (amount > Number(merchant.available_balance)) {
    throw new Error("Solde insuffisant pour ce retrait.");
  }

  if (amount < 100) {
    throw new Error("Le montant minimum est de 100 HTG.");
  }

  if (method === 'MonCash' && !receiver) {
    throw new Error("Numéro de réception requis pour MonCash.");
  }

  const reference = `WTH-${Date.now()}`;
  
  // 2. Appel de l'API Bazik (AVANT de déduire l'argent)
  if (method === 'MonCash') {
    try {
      await BazikService.createWithdrawal({
        amount: amount,
        receiver: receiver!,
        reference: reference,
        description: "Retrait Kobara",
      });
    } catch (error: any) {
      console.error("Bazik withdrawal error:", error);
      throw new Error(`Échec du transfert MonCash: ${error.message || "Erreur interne"}`);
    }
  }

  // 3. Déduction du solde de l'utilisateur
  const newBalance = Number(merchant.available_balance) - amount;

  const { error: updateError } = await supabase
    .from('merchants')
    .update({ available_balance: newBalance })
    .eq('id', merchant.id);

  if (updateError) {
    throw new Error("Erreur critique: le transfert est passé mais le solde n'a pu être mis à jour. Veuillez contacter le support.");
  }

  // 4. Enregistrement en base de données
  const { error: insertError } = await supabase
    .from('withdrawals')
    .insert({
      merchant_id: merchant.id,
      amount: amount,
      status: 'completed', // MonCash transferts via Bazik sont généralement instantanés
      method: method,
      reference: reference,
    });

  if (insertError) {
    console.error("Failed to record withdrawal in DB", insertError);
  }

  revalidatePath('/dashboard/withdrawals');
}

