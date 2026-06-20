import { cookies } from "next/headers"
import { verifyAdminJwt } from "@/lib/server/admin/auth"
import { createAdminClient } from "@/utils/supabase/admin"

/**
 * Ensures the current request is from an authenticated super admin.
 * Uses the existing system-core authentication mechanism.
 */
export async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get("kbr_admin_token")?.value

  if (!token) {
    throw new Error("Unauthorized - You must be logged in")
  }

  const payload = await verifyAdminJwt(token)

  if (!payload || payload.role !== "superadmin") {
    throw new Error("Forbidden - Insufficient permissions")
  }

  // Fetch the actual super_admin UUID
  const supabase = createAdminClient()
  const { data: admin } = await supabase
    .from('super_admins')
    .select('id')
    .ilike('email', payload.email as string)
    .single()

  if (!admin) {
    throw new Error("Unauthorized - Admin account not found")
  }

  return {
    user: {
      id: admin.id,
      email: payload.email as string,
      role: payload.role as string
    }
  }
}
