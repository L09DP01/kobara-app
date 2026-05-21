'use client'

import { useState } from "react";
import { adminApproveKyc, adminRejectKyc, getSignedUrl } from "./actions";

export function AdminKycClient({ initialProfiles }: { initialProfiles: any[] }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [images, setImages] = useState<{front: string | null, back: string | null, selfie: string | null}>({front: null, back: null, selfie: null});
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleSelect = async (profile: any) => {
    setSelectedProfile(profile);
    setLoading(true);
    const front = await getSignedUrl(profile.document_front_url);
    const back = await getSignedUrl(profile.document_back_url);
    const selfie = await getSignedUrl(profile.selfie_url);
    setImages({ front, back, selfie });
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!selectedProfile) return;
    setLoading(true);
    await adminApproveKyc(selectedProfile.id, selectedProfile.merchant_id);
    setProfiles(profiles.filter(p => p.id !== selectedProfile.id));
    setSelectedProfile(null);
    setLoading(false);
  };

  const handleReject = async () => {
    if (!selectedProfile || !rejectionReason) return;
    setLoading(true);
    await adminRejectKyc(selectedProfile.id, selectedProfile.merchant_id, rejectionReason);
    setProfiles(profiles.filter(p => p.id !== selectedProfile.id));
    setSelectedProfile(null);
    setRejectionReason("");
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* List */}
      <div className="col-span-1 bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-gray-50 font-medium">Profils en attente ({profiles.length})</div>
        <div className="divide-y max-h-[800px] overflow-y-auto">
          {profiles.map(p => (
            <button 
              key={p.id}
              onClick={() => handleSelect(p)}
              className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedProfile?.id === p.id ? 'bg-blue-50' : ''}`}
            >
              <div className="font-semibold">{p.full_name}</div>
              <div className="text-sm text-gray-500">{p.merchant?.business_name}</div>
              <div className="mt-2 flex gap-2">
                <span className={`text-xs px-2 py-1 rounded ${p.risk_score >= 80 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  Score: {p.risk_score}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">{p.document_type}</span>
              </div>
            </button>
          ))}
          {profiles.length === 0 && (
            <div className="p-8 text-center text-gray-500">Aucun profil à valider.</div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="col-span-1 lg:col-span-2">
        {selectedProfile ? (
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Revue de {selectedProfile.full_name}</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Score Liveness IA</div>
                <div className="font-mono text-lg">{selectedProfile.liveness_score} / 100</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Score Face Match IA</div>
                <div className="font-mono text-lg">{selectedProfile.face_match_score} / 100</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-medium mb-3">Selfie Capturé</h3>
                <div className="bg-gray-100 rounded-lg aspect-[3/4] flex items-center justify-center overflow-hidden">
                  {loading ? <span className="animate-pulse">Chargement...</span> : (
                    images.selfie ? <img src={images.selfie} alt="Selfie" className="w-full h-full object-cover" /> : <span>Non disponible</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">Pièce d'Identité (Recto)</h3>
                <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center overflow-hidden">
                  {loading ? <span className="animate-pulse">Chargement...</span> : (
                    images.front ? <img src={images.front} alt="ID Front" className="w-full h-full object-cover" /> : <span>Non disponible</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Décision</h3>
              <div className="flex gap-4 mb-4">
                <button 
                  onClick={handleApprove}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  Approuver & Activer Plan Free
                </button>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 mt-8">
                <label className="block text-sm font-medium text-red-800 mb-2">Rejeter le document</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Raison (ex: Flou, expiré...)"
                    className="flex-1 px-4 py-2 border border-red-200 rounded-lg focus:outline-none"
                  />
                  <button 
                    onClick={handleReject}
                    disabled={loading || !rejectionReason}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                  >
                    Rejeter
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed rounded-xl h-full min-h-[400px] flex items-center justify-center text-gray-500">
            Sélectionnez un profil pour voir les détails
          </div>
        )}
      </div>
    </div>
  );
}
