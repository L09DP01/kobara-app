'use client'

import { useState } from 'react';
import { inviteTeamMember, removeTeamMember } from '../actions';

export function TeamSettings({ members }: { members: any[] }) {
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('developer');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      setLoading(true);
      await inviteTeamMember(inviteEmail, inviteRole);
      setInviteEmail('');
      alert("Invitation envoyée !");
    } catch (err: any) {
      alert(err.message || "Erreur d'invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Voulez-vous vraiment retirer ce membre ?")) return;
    try {
      setLoading(true);
      await removeTeamMember(id);
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-card rounded-xl border border-border-subtle p-6 ambient-shadow">
      <h2 className="text-headline-md font-headline-md text-text-primary mb-1">Membres d'équipe</h2>
      <p className="text-body-sm text-text-secondary mb-6">Gérez les accès à votre compte Kobara.</p>

      <form onSubmit={handleInvite} className="flex gap-4 mb-8">
        <input 
          type="email" 
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
          placeholder="Adresse e-mail" 
          className="flex-1 bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary text-text-primary"
        />
        <select 
          value={inviteRole}
          onChange={e => setInviteRole(e.target.value)}
          className="bg-surface-container-lowest border border-border-subtle rounded-lg px-3 py-2 text-text-primary"
        >
          <option value="developer">Développeur</option>
          <option value="admin">Admin</option>
        </select>
        <button 
          type="submit" 
          disabled={loading || !inviteEmail}
          className="bg-text-primary text-surface-card px-4 py-2 rounded-lg font-medium text-body-sm hover:opacity-90 disabled:opacity-50"
        >
          Inviter
        </button>
      </form>

      <div className="space-y-4">
        {members.length === 0 ? (
          <p className="text-body-sm text-text-secondary text-center py-4">Aucun membre dans votre équipe pour le moment.</p>
        ) : (
          members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-surface-container-low border border-border-subtle rounded-lg">
              <div>
                <p className="text-body-base font-medium text-text-primary">{member.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[12px] px-2 py-0.5 bg-surface-container-high rounded text-text-secondary capitalize">{member.role}</span>
                  <span className={`text-[12px] px-2 py-0.5 rounded ${member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {member.status === 'active' ? 'Actif' : 'En attente'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleRemove(member.id)}
                disabled={loading}
                className="text-error font-medium text-body-sm hover:opacity-80"
              >
                Retirer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
