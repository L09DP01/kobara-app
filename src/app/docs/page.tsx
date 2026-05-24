import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { DocsClient } from "./docs-client";
import fs from "fs";
import path from "path";

export default async function DocsPage() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;

  // We do NOT fetch real keys for the documentation.
  // We use standard mock keys for documentation examples.
  const testPublicKey = 'kbr_pk_test_a1b2c3d4e5f6';
  const livePublicKey = 'kbr_pk_live_a1b2c3d4e5f6';
  const testSecretKey = 'kbr_sk_test_a1b2c3d4e5f6g7h8i9j0';

  let markdownContent = "";
  try {
    const filePath = path.join(process.cwd(), "contenudocs.md");
    markdownContent = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error("Could not read docs file", error);
  }

  return (
    <div className="min-h-screen bg-background">
      <DocsClient 
        testPublicKey={testPublicKey} 
        testSecretKey={testSecretKey}
        livePublicKey={livePublicKey}
        isAuthenticated={isAuthenticated}
        markdownContent={markdownContent}
      />
    </div>
  );
}
