import { NextResponse } from "next/server"
import { riskEngine } from "@/lib/risk/engine"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data: merchants } = await supabaseAdmin.from("merchants").select("id").eq("status", "active")
    
    if (merchants) {
      await Promise.allSettled(merchants.map(m => riskEngine.analyzeMerchant(m.id)))
    }
    
    return NextResponse.json({ success: true, merchants_scanned: merchants?.length || 0 })
  } catch (error) {
    console.error("Cron risk watcher error:", error)
    return NextResponse.json({ error: "Job failed" }, { status: 500 })
  }
}
