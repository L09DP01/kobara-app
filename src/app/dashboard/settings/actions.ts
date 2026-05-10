'use server'

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateMerchantProfile(formData: {
  business_name: string;
  category: string;
  email: string;
  phone: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('merchants')
    .update({
      business_name: formData.business_name,
      category: formData.category,
      email: formData.email,
      phone: formData.phone
    })
    .eq('user_id', user.id);

  if (error) throw new Error("Erreur lors de la mise à jour du profil");
  revalidatePath('/dashboard/settings');
}

export async function updateNotificationSettings(notificationsJson: any) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get current merchant id
  const { data: merchantId } = await supabase.rpc('get_current_merchant_id');

  if (!merchantId) throw new Error("Merchant not found");

  const { error } = await supabase
    .from('settings')
    .update({ notifications_json: notificationsJson })
    .eq('merchant_id', merchantId);

  // If no settings exist yet, we might need to upsert
  if (error) throw new Error("Failed to update notification settings");
  revalidatePath('/dashboard/settings');
}

export async function inviteTeamMember(email: string, role: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: merchantId } = await supabase.rpc('get_current_merchant_id');

  if (!merchantId) throw new Error("Merchant not found");

  // Only owners and admins can invite
  const { error } = await supabase
    .from('merchant_members')
    .insert({
      merchant_id: merchantId,
      email: email,
      role: role,
      status: 'pending' // They need to accept or just signup
    });

  if (error) throw new Error("Erreur lors de l'invitation: " + error.message);
  revalidatePath('/dashboard/settings');
}

export async function removeTeamMember(memberId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: merchantId } = await supabase.rpc('get_current_merchant_id');

  if (!merchantId) throw new Error("Merchant not found");

  const { error } = await supabase
    .from('merchant_members')
    .delete()
    .eq('id', memberId)
    .eq('merchant_id', merchantId);

  if (error) throw new Error("Erreur lors de la suppression");
  revalidatePath('/dashboard/settings');
}
