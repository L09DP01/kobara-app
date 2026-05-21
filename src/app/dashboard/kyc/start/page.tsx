import { KycStepperClient } from "./stepper-client";
import { getKycStatus } from "../actions";
import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { redirect } from "next/navigation";

export default async function KycStartPage() {
  const { merchant } = await getCurrentUserAndMerchant();
  if (!merchant) redirect('/login');

  const profile = await getKycStatus();
  
  // If they are already in review or approved, redirect them to the main KYC page
  if (profile && (profile.status === 'in_review' || profile.status === 'approved' || profile.status === 'pending')) {
    redirect('/dashboard/kyc');
  }

  return (
    <div className="max-w-[800px] w-full mx-auto pb-12">
      <div className="bg-surface-card border border-border-subtle rounded-xl shadow-sm overflow-hidden">
        <KycStepperClient />
      </div>
    </div>
  );
}
