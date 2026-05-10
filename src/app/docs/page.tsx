import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { DocsClient } from "./docs-client";

export default async function DocsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  // We do NOT fetch real keys for the documentation.
  // We use standard mock keys for documentation examples.
  const testPublicKey = 'kobara_pk_test_a1b2c3d4e5f6';
  const livePublicKey = 'kobara_pk_live_a1b2c3d4e5f6';
  const testSecretKey = 'kobara_sk_test_a1b2c3d4e5f6g7h8i9j0';

  return (
    <div className="min-h-screen bg-background">
      <DocsClient 
        testPublicKey={testPublicKey} 
        testSecretKey={testSecretKey}
        livePublicKey={livePublicKey}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
