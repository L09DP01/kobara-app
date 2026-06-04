import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { DocsClient } from "../docs-client";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await props.params;
  const titleMap: Record<string, string> = {
    'quickstart': 'Quickstart Integration',
    'authentication': 'Authentication API',
    'api-keys': 'API Keys Management',
    'javascript-sdk': 'JavaScript SDK',
    'nodejs-sdk': 'Node.js SDK',
    'python-sdk': 'Python SDK',
    'php-sdk': 'PHP SDK',
    'wordpress-plugin': 'WordPress Plugin',
    'payments': 'Payments API',
    'payment-links': 'Payment Links API',
    'webhooks': 'Webhooks Integration',
    'withdrawals': 'Withdrawals API',
    'errors': 'API Errors',
    'metadata': 'Metadata Expansion',
    'ai-integration': 'AI Integration'
  };

  const title = titleMap[resolvedParams.slug] || 'Documentation';
  return {
    title: `${title} | Kobara Docs`,
    description: `Learn how to integrate ${title} with the Kobara Payment Gateway API for MonCash in Haiti.`,
    keywords: [`Kobara ${title}`, `MonCash API ${title}`, "Haiti Payment API"]
  };
}

export default async function DocsDocPage(props: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;
  const resolvedParams = await props.params;
  const { slug } = resolvedParams;

  const testPublicKey = 'kbr_pk_test_a1b2c3d4e5f6';
  const livePublicKey = 'kbr_pk_live_a1b2c3d4e5f6';
  const testSecretKey = 'kbr_sk_test_a1b2c3d4e5f6g7h8i9j0';

  let markdownContent = "";
  try {
    const filePath = path.join(process.cwd(), "src", "content", "docs", `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      return notFound();
    }
    markdownContent = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error("Could not read docs file", error);
    return notFound();
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <DocsClient 
        testPublicKey={testPublicKey} 
        testSecretKey={testSecretKey}
        livePublicKey={livePublicKey}
        isAuthenticated={isAuthenticated}
        markdownContent={markdownContent}
        currentSlug={slug}
      />
    </div>
  );
}
