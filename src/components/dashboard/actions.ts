'use server';

import { createAdminClient } from '@/utils/supabase/admin';

export async function markNotificationAsReadAction(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) {
    console.error("Failed to mark notification as read:", error);
    return { error: error.message };
  }
  return { success: true };
}

export async function markAllNotificationsAsReadAction(merchantId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('notifications').update({ read: true }).eq('merchant_id', merchantId).eq('read', false);
  if (error) {
    console.error("Failed to mark all notifications as read:", error);
    return { error: error.message };
  }
  return { success: true };
}
