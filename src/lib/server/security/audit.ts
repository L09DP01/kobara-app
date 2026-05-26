import { createAdminClient } from "@/utils/supabase/admin";
import { headers } from "next/headers";

export async function logMerchantAudit(merchantId: string | null, action: string, metadata: any = {}) {
  try {
    const supabase = createAdminClient();
    let headersList;
    try {
      headersList = await headers();
    } catch {
      // headers() might throw outside request context
    }
    
    // Attempt to get IP address
    const ip = headersList?.get('x-forwarded-for') || headersList?.get('x-real-ip') || '127.0.0.1';
    const userAgent = headersList?.get('user-agent') || 'Unknown';

    await supabase.from('audit_logs').insert({
      merchant_id: merchantId,
      action,
      ip_address: ip.split(',')[0].trim(),
      user_agent: userAgent,
      metadata
    });
  } catch (error) {
    console.error("Failed to write merchant audit log:", error);
  }
}
