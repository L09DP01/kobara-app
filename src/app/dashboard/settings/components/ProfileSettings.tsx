'use client'

import { useState } from 'react';
import { updateMerchantProfile } from '../actions';

export function ProfileSettings({ user, merchant }: { user: any, merchant: any }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: merchant.business_name || '',
    category: merchant.category || '',
    email: merchant.email || '',
    phone: merchant.phone || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateMerchantProfile(formData);
      alert("Paramètres du profil sauvegardés avec succès !");
    } catch (err: any) {
      alert(err.message || "Erreur de sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.user_metadata?.first_name || '';
  const lastName = user?.user_metadata?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Propriétaire du compte';

  return (
    <div className="space-y-6">
      {/* User Personal Info Card */}
      <div className="bg-surface-card rounded-xl border border-border-subtle p-6 ambient-shadow">
        <h2 className="text-headline-md font-headline-md text-text-primary mb-6">Informations Personnelles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-body-sm font-medium text-text-primary">Nom et Prénom</label>
            <input 
              disabled
              value={fullName}
              type="text" 
              className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-text-secondary cursor-not-allowed" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-body-sm font-medium text-text-primary">Email du compte</label>
            <input 
              disabled
              value={user?.email || ''}
              type="email" 
              className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-text-secondary cursor-not-allowed" 
            />
          </div>
        </div>
      </div>

      {/* Business Info Card */}
      <div className="bg-surface-card rounded-xl border border-border-subtle p-6 ambient-shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-headline-md font-headline-md text-text-primary">Informations de l'entreprise</h2>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-medium text-body-sm hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-6 mb-6">
            <div className="h-20 w-20 rounded-full bg-surface-container border-2 border-border-subtle flex items-center justify-center overflow-hidden">
              <span className="text-2xl font-bold text-text-secondary">{formData.business_name.charAt(0) || 'K'}</span>
            </div>
            <div>
              <button className="px-4 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-container transition-colors mb-2">
                Changer le logo
              </button>
              <p className="text-[12px] text-text-secondary">JPG, GIF ou PNG. Max 1MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-text-primary">Nom de l'entreprise</label>
              <input 
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                type="text" 
                className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary text-text-primary" 
              />
            </div>
          <div className="space-y-1.5">
            <label className="text-body-sm font-medium text-text-primary">Secteur d'activité</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary text-text-primary"
            >
              <option value="">Sélectionner</option>
              <option value="Logiciels / SaaS">Logiciels / SaaS</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Services professionnels">Services professionnels</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-body-sm font-medium text-text-primary">Email de contact</label>
          <input 
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email" 
            className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary text-text-primary" 
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-body-sm font-medium text-text-primary">Téléphone</label>
          <input 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            type="tel" 
            className="w-full bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary text-text-primary" 
          />
        </div>
        </div>
      </div>
    </div>
  );
}
