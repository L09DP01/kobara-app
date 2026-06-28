import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const paymentId = resolvedParams.id;
    
    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment id" }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    const { data: payment, error } = await supabase
      .from('payments')
      .select('status, expires_at')
      .eq('id', paymentId)
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Check expiration dynamically if status is still pending
    let currentStatus = payment.status;
    
    if (currentStatus === 'pending' && payment.expires_at) {
      const expiresAt = new Date(payment.expires_at);
      if (new Date() > expiresAt) {
        currentStatus = 'expired';
        // Auto-update to expired if not already done
        await supabase.from('payments').update({ status: 'expired' }).eq('id', paymentId);
      }
    }

    return NextResponse.json({ status: currentStatus });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
