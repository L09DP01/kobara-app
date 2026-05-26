import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import Link from "next/link";
import { CreatePaymentLinkForm } from "./create-form-client";

export default async function CreatePaymentLinkPage() {
  await getCurrentUserAndMerchant();

  return (
    <div className="max-w-[800px] mx-auto w-full space-y-6 sm:space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary mb-2">
            <Link href="/dashboard/payment-links" className="hover:text-text-primary transition-colors">Liens de Paiement</Link>
            <span className="material-symbols-outlined text-[14px] sm:text-[16px]">chevron_right</span>
            <span className="text-text-primary font-medium">Créer</span>
          </div>
          <h1 className="text-2xl sm:text-headline-lg font-headline-lg text-text-primary tracking-tight">Créer un lien de paiement</h1>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-4 sm:p-6">
        <CreatePaymentLinkForm />
      </div>
    </div>
  );
}
