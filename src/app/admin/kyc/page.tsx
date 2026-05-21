import { getPendingKycProfiles } from "./actions";
import { AdminKycClient } from "./admin-kyc-client";

export default async function AdminKycPage() {
  const profiles = await getPendingKycProfiles();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Administration - Revue KYC</h1>
      <AdminKycClient initialProfiles={profiles} />
    </div>
  );
}
