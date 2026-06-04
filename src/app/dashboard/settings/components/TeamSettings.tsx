'use client'

import { useState } from 'react';
import { inviteTeamMember, removeTeamMember } from '../actions';
import { toast } from "sonner";

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
      toast.success("Invitation envoyée !");
      setInviteEmail('');
    } catch (err: any) {
      toast.error(err.message || "Erreur d'invitation");
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
      toast.error(err.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 rounded-3xl border border-white/10 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-white mb-1">Membres d'équipe</h2>
      <p className="text-sm text-slate-400 mb-6">Gérez les accès à votre compte Kobara.</p>

      <form onSubmit={handleInvite} className="flex gap-4 mb-8">
        <input 
          type="email" 
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
          placeholder="Adresse e-mail" 
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white shadow-sm transition-all"
        />
        <select 
          value={inviteRole}
          onChange={e => setInviteRole(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white shadow-sm transition-all appearance-none [&>option]:bg-[#131B2C]"
        >
          <option value="developer">Développeur</option>
          <option value="admin">Admin</option>
        </select>
        <button 
          type="submit" 
          disabled={loading || !inviteEmail}
          className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50"
        >
          Inviter
        </button>
      </form>

      <div className="space-y-4">
        {members.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Aucun membre dans votre équipe pour le moment.</p>
        ) : (
          members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div>
                <p className="text-base font-bold text-white">{member.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-white/10 rounded-md text-slate-300 font-bold capitalize">{member.role}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${member.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {member.status === 'active' ? 'Actif' : 'En attente'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleRemove(member.id)}
                disabled={loading}
                className="text-red-400 font-bold text-sm hover:text-red-500 transition-colors"
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
