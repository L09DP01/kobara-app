"use client";

import { useState } from "react";
import { CheckCircle2, Lock, ChevronDown } from "lucide-react";

export default function PaymentFormClient({ link, processPaymentAction }: { link: any, processPaymentAction: (formData: FormData) => void }) {
  const [provider, setProvider] = useState<'moncash' | 'natcash'>('moncash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    // Let the form submit normally using the server action
  };

  return (
    <form action={processPaymentAction} onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="paymentLinkId" value={link.id} />
      <input type="hidden" name="merchantId" value={link.merchant_id} />
      
      {/* SECTION: Informations Client */}
      <div className="space-y-4 border border-white/10 bg-white/5 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Informations</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="customerName" className="block text-sm font-semibold text-slate-300">
              Nom complet *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-500 text-[20px]">person</span>
              </div>
              <input 
                type="text" 
                id="customerName" 
                name="customerName" 
                required
                placeholder="Ex. Jean Dupont"
                className="w-full pl-11 pr-4 py-3 sm:py-4 bg-[#0F1626] border border-white/10 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder:text-slate-600 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="customerPhone" className="block text-sm font-semibold text-slate-300">
              Téléphone {provider === 'moncash' ? 'MonCash' : 'NatCash'} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-500 text-[20px]">call</span>
              </div>
              <input 
                type="tel" 
                id="customerPhone" 
                name="customerPhone" 
                required
                placeholder="Ex. 37000000"
                className="w-full pl-11 pr-4 py-3 sm:py-4 bg-[#0F1626] border border-white/10 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder:text-slate-600 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Montant dynamique si non fixé */}
      {!link.amount && (
        <div className="space-y-4 border border-white/10 bg-white/5 rounded-2xl p-5 sm:p-6 shadow-sm mt-6">
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-semibold text-slate-300">
              Montant à payer (HTG) *
            </label>
            <input 
              type="number" 
              id="amount" 
              name="amount" 
              required
              step="0.01"
              min="10"
              placeholder="0.00"
              className="w-full px-4 py-3 sm:py-4 bg-[#0F1626] border border-white/10 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder:text-slate-600 shadow-sm"
            />
          </div>
        </div>
      )}
      {link.amount && (
        <input type="hidden" name="amount" value={link.amount} />
      )}

      {/* SECTION: Adresse de Livraison */}
      {link.metadata?.collect_address && (
        <div className="space-y-4 mt-6 border border-white/10 bg-white/5 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Adresse de livraison</h3>
            <ChevronDown size={16} className="text-slate-400" />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 bg-[#0F1626] border border-white/10 rounded-xl p-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 bg-orange-500 rounded-full p-1 flex justify-end items-center shrink-0">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Ajouter une adresse de livraison</p>
                <p className="text-xs text-slate-400 mt-0.5">Frais de livraison appliqués</p>
              </div>
            </div>
            {link.metadata?.shipping_fee > 0 && (
              <div className="text-left sm:text-right">
                <p className="text-[10px] text-slate-400">Frais de livraison</p>
                <p className="text-sm font-bold text-orange-500">{Number(link.metadata.shipping_fee).toLocaleString('fr-FR')} HTG</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="country" className="block text-xs font-semibold text-slate-400">Pays *</label>
              <select 
                id="country"
                name="country"
                className="w-full px-4 py-3 bg-[#0F1626] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 appearance-none"
              >
                <option value="Haiti">Haïti</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="city" className="block text-xs font-semibold text-slate-400">Ville / Commune *</label>
              <input 
                type="text" 
                id="city"
                name="city"
                required
                placeholder="Ex. Port-au-Prince"
                className="w-full px-4 py-3 bg-[#0F1626] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 placeholder:text-slate-600"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="customerAddress" className="block text-xs font-semibold text-slate-400">Adresse complète *</label>
              <input 
                type="text" 
                id="customerAddress" 
                name="customerAddress" 
                required
                placeholder="Ex. #12, Rue Panaméricaine, Delmas 33"
                className="w-full px-4 py-3 bg-[#0F1626] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 placeholder:text-slate-600"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="reference" className="block text-xs font-semibold text-slate-400">Référence (optionnel)</label>
              <input 
                type="text" 
                id="reference" 
                name="reference" 
                placeholder="Ex. Près de l'église"
                className="w-full px-4 py-3 bg-[#0F1626] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Méthode de Paiement */}
      <div className="space-y-4 mt-6 border border-white/10 bg-white/5 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Méthode de paiement</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className={`relative flex items-center p-4 cursor-pointer rounded-xl border transition-all group ${provider === 'moncash' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-[#0F1626] hover:bg-white/5'}`}>
            <input 
              type="radio" 
              name="provider" 
              value="moncash" 
              className="sr-only" 
              checked={provider === 'moncash'}
              onChange={() => setProvider('moncash')}
            />
            <div className="flex-1 flex items-center gap-3">
              <div className="w-12 h-8 flex items-center justify-center shrink-0 bg-white rounded overflow-hidden">
                <img src="/moncash.png" alt="MonCash" className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  MonCash 
                  {provider === 'moncash' && <span className="bg-orange-500/20 text-orange-400 text-[10px] px-2 py-0.5 rounded-full font-semibold">Recommandé</span>}
                </div>
                {provider === 'moncash' && (
                   <div className="text-slate-400 text-xs mt-0.5 hidden sm:block">Payez avec votre compte MonCash</div>
                )}
              </div>
            </div>
            {provider === 'moncash' ? (
              <div className="w-5 h-5 rounded-full border-[5px] border-orange-500 ml-2 shrink-0"></div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-slate-600 ml-2 shrink-0"></div>
            )}
          </label>
          
          <label className={`relative flex items-center p-4 cursor-pointer rounded-xl border transition-all group ${provider === 'natcash' ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-[#0F1626] hover:bg-white/5'}`}>
            <input 
              type="radio" 
              name="provider" 
              value="natcash" 
              className="sr-only" 
              checked={provider === 'natcash'}
              onChange={() => setProvider('natcash')}
            />
            <div className="flex-1 flex items-center gap-3">
              <div className="w-12 h-8 flex items-center justify-center shrink-0 bg-white rounded overflow-hidden">
                <img src="/natcash.png" alt="NatCash" className="w-full h-full object-contain p-1" />
              </div>
              <div>
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  NatCash
                  {provider === 'natcash' && <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-semibold">Recommandé</span>}
                </div>
                {provider === 'natcash' && (
                  <div className="text-slate-400 text-xs mt-0.5 hidden sm:block">Payez avec votre compte NatCash</div>
                )}
              </div>
            </div>
            {provider === 'natcash' ? (
              <div className="w-5 h-5 rounded-full border-[5px] border-green-500 ml-2 shrink-0"></div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-slate-600 ml-2 shrink-0"></div>
            )}
          </label>
        </div>
      </div>

      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full relative group overflow-hidden bg-[#F95005] text-white py-4 rounded-xl font-bold text-base hover:opacity-90 transition-all shadow-lg flex justify-center items-center gap-2 mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <Lock size={18} />
        <span>
          {isSubmitting 
            ? 'Traitement en cours...' 
            : `Payer ${link.amount ? `${(Number(link.amount) + (link.metadata?.shipping_fee ? Number(link.metadata.shipping_fee) : 0)).toLocaleString('fr-FR')} HTG` : ''}`}
        </span>
        <div className="absolute right-4 opacity-50 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined font-bold text-[20px]">arrow_forward</span>
        </div>
      </button>
      
      <div className="flex items-center justify-center gap-2 mt-4 text-slate-500 text-xs font-medium">
        <Lock size={12} />
        <span>Paiement sécurisé de bout en bout. Vos données sont protégées.</span>
      </div>
    </form>
  );
}
