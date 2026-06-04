'use client'

import { useState } from 'react';
import Link from 'next/link';
import { createPaymentLink } from '../actions';
import { toast } from 'sonner';

export function CreatePaymentLinkForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await createPaymentLink(formData);
      if (res && res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      
      toast.success("Lien de paiement créé !");
      window.location.href = '/payment-links';
    } catch (err: any) {
      if (err.message === 'NEXT_REDIRECT') {
        throw err; // Let Next.js handle it
      }
      setError(err.message || "Une erreur inattendue s'est produite.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-bold text-white">Titre du paiement *</label>
        <input 
          type="text" 
          id="title" 
          name="title" 
          required
          placeholder="ex: Consultation vidéo 1h"
          className="w-full px-4 py-3 sm:py-2 bg-white/5 border border-white/10 rounded-lg text-base sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm placeholder:text-slate-500"
        />
        <p className="text-slate-400 text-xs">Ce que vos clients verront lors du paiement.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="amount" className="block text-sm font-bold text-white">Montant (HTG) *</label>
        <input 
          type="number" 
          id="amount" 
          name="amount" 
          required
          step="0.01"
          min="10"
          placeholder="ex: 1500.00"
          className="w-full px-4 py-3 sm:py-2 bg-white/5 border border-white/10 rounded-lg text-base sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm placeholder:text-slate-500"
        />
        <p className="text-slate-400 text-xs">Le montant fixe à payer en Gourdes Haïtiennes.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-bold text-white">Description (Optionnel)</label>
        <textarea 
          id="description" 
          name="description" 
          rows={3}
          placeholder="Détails supplémentaires sur le paiement..."
          className="w-full px-4 py-3 sm:py-2 bg-white/5 border border-white/10 rounded-lg text-base sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm placeholder:text-slate-500"
        ></textarea>
      </div>

      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white">Options supplémentaires</h3>
        <p className="text-xs text-slate-400">Informations à collecter auprès du client lors du paiement.</p>
        
        <div className="space-y-4 pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="collect_phone" value="true" className="w-5 h-5 sm:w-4 sm:h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2" />
            <span className="text-base sm:text-sm font-bold text-white">Demander le numéro de téléphone</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="collect_address" value="true" className="w-5 h-5 sm:w-4 sm:h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2" />
            <span className="text-base sm:text-sm font-bold text-white">Demander l'adresse de livraison</span>
          </label>
        </div>
      </div>

      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white">Frais de transaction</h3>
        <p className="text-xs text-slate-400">Choisissez qui prend en charge les frais de paiement.</p>
        
        <div className="space-y-4 pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="pass_fees_to_customer" value="true" className="w-5 h-5 sm:w-4 sm:h-4 mt-0.5 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2" />
            <div>
              <span className="text-base sm:text-sm font-bold text-white">Faire payer les frais par le client</span>
              <p className="text-sm sm:text-xs text-slate-400 mt-1">Si activé, le client paiera le montant du lien + les frais Kobara. Vous recevrez le montant exact du lien.</p>
            </div>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 flex flex-col-reverse sm:flex-row justify-end gap-3">
        <Link 
          href="/payment-links"
          className="w-full sm:w-auto text-center px-5 py-3 sm:py-2.5 rounded-xl text-sm font-bold border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          Annuler
        </Link>
        <button 
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-orange-500 text-white px-5 py-3 sm:py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Créer le lien'}
        </button>
      </div>
    </form>
  );
}
