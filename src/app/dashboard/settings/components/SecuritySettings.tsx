'use client'

import { useState } from 'react';

export function SecuritySettings() {
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    // Implement password change logic using Supabase Auth (e.g. supabase.auth.updateUser)
    alert("Fonctionnalité en cours de développement.");
  };

  return (
    <div className="bg-surface-card rounded-xl border border-border-subtle p-6 ambient-shadow space-y-8">
      <div>
        <h2 className="text-headline-md font-headline-md text-text-primary mb-2">Mot de passe</h2>
        <p className="text-body-sm text-text-secondary mb-4">Gérez votre mot de passe pour sécuriser votre compte.</p>
        <button onClick={handleChangePassword} className="px-4 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-container transition-colors">
          Changer le mot de passe
        </button>
      </div>

      <div className="border-t border-border-subtle pt-8">
        <h2 className="text-headline-md font-headline-md text-text-primary mb-2">Authentification à deux facteurs (2FA)</h2>
        <p className="text-body-sm text-text-secondary mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
        <button className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:opacity-90 transition-opacity">
          Configurer l'A2F
        </button>
      </div>
    </div>
  );
}
