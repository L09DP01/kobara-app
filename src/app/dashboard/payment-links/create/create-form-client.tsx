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
        <div className="bg-status-error/10 text-status-error px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="title" className="block text-body-sm font-medium text-text-primary">Titre du paiement *</label>
        <input 
          type="text" 
          id="title" 
          name="title" 
          required
          placeholder="ex: Consultation vidéo 1h"
          className="w-full px-4 py-3 sm:py-2 bg-white border border-slate-200 rounded-lg text-base sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-sm"
        />
        <p className="text-text-secondary text-xs">Ce que vos clients verront lors du paiement.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="amount" className="block text-body-sm font-medium text-text-primary">Montant (HTG) *</label>
        <input 
          type="number" 
          id="amount" 
          name="amount" 
          required
          step="0.01"
          min="10"
          placeholder="ex: 1500.00"
          className="w-full px-4 py-3 sm:py-2 bg-white border border-slate-200 rounded-lg text-base sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-sm"
        />
        <p className="text-text-secondary text-xs">Le montant fixe à payer en Gourdes Haïtiennes.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-body-sm font-medium text-text-primary">Description (Optionnel)</label>
        <textarea 
          id="description" 
          name="description" 
          rows={3}
          placeholder="Détails supplémentaires sur le paiement..."
          className="w-full px-4 py-3 sm:py-2 bg-white border border-slate-200 rounded-lg text-base sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-sm"
        ></textarea>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
        <h3 className="text-body-md font-semibold text-text-primary">Options supplémentaires</h3>
        <p className="text-xs text-text-secondary">Informations à collecter auprès du client lors du paiement.</p>
        
        <div className="space-y-4 pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="collect_phone" value="true" className="w-5 h-5 sm:w-4 sm:h-4 text-slate-900 bg-white border-slate-300 rounded focus:ring-slate-900 focus:ring-2" />
            <span className="text-base sm:text-sm font-medium text-text-primary">Demander le numéro de téléphone</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="collect_address" value="true" className="w-5 h-5 sm:w-4 sm:h-4 text-slate-900 bg-white border-slate-300 rounded focus:ring-slate-900 focus:ring-2" />
            <span className="text-base sm:text-sm font-medium text-text-primary">Demander l'adresse de livraison</span>
          </label>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
        <h3 className="text-body-md font-semibold text-text-primary">Frais de transaction</h3>
        <p className="text-xs text-text-secondary">Choisissez qui prend en charge les frais de paiement.</p>
        
        <div className="space-y-4 pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="pass_fees_to_customer" value="true" className="w-5 h-5 sm:w-4 sm:h-4 mt-0.5 text-slate-900 bg-white border-slate-300 rounded focus:ring-slate-900 focus:ring-2" />
            <div>
              <span className="text-base sm:text-sm font-medium text-text-primary">Faire payer les frais par le client</span>
              <p className="text-sm sm:text-xs text-text-secondary mt-1">Si activé, le client paiera le montant du lien + les frais Kobara. Vous recevrez le montant exact du lien.</p>
            </div>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-border-subtle flex flex-col-reverse sm:flex-row justify-end gap-3">
        <Link 
          href="/payment-links"
          className="w-full sm:w-auto text-center px-5 py-3 sm:py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          Annuler
        </Link>
        <button 
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-slate-900 text-white px-5 py-3 sm:py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Créer le lien'}
        </button>
      </div>
    </form>
  );
}
