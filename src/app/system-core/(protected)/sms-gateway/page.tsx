import { supabaseAdmin } from "@/lib/supabase/admin";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "SMS Gateway NatCash - Administration",
};

export default async function AdminSmsGatewayPage() {
  const { data: smsList, error } = await supabaseAdmin
    .from('sms_inbox')
    .select('*, payments(id, reference_code, amount, status, merchants(business_name))')
    .order('created_at', { ascending: false })
    .limit(100);

  async function manualValidateSMS(formData: FormData) {
    "use server";
    const smsId = formData.get('smsId') as string;
    const paymentId = formData.get('paymentId') as string;

    if (!smsId || !paymentId) return;

    // 1. Get SMS
    const { data: sms } = await supabaseAdmin.from('sms_inbox').select('*').eq('id', smsId).single();
    if (!sms) return;

    // 2. Get Payment
    const { data: payment } = await supabaseAdmin.from('payments').select('*').eq('id', paymentId).single();
    if (!payment) return;

    // 3. Update payment to succeeded
    await supabaseAdmin.from('payments').update({
      status: 'succeeded',
      trans_code: sms.parsed_json?.transCode || `MANUAL-${Date.now()}`,
      paid_at: new Date().toISOString()
    }).eq('id', payment.id);

    // 4. Update SMS status to processed
    await supabaseAdmin.from('sms_inbox').update({
      status: 'processed',
      payment_id: payment.id,
      error_reason: null
    }).eq('id', smsId);

    revalidatePath('/system-core/sms-gateway');
  }

  async function ignoreSMS(formData: FormData) {
    "use server";
    const smsId = formData.get('smsId') as string;
    if (!smsId) return;

    await supabaseAdmin.from('sms_inbox').update({
      status: 'ignored',
      error_reason: 'Ignoré manuellement par admin'
    }).eq('id', smsId);

    revalidatePath('/system-core/sms-gateway');
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Passerelle SMS NatCash</h1>
          <p className="text-slate-500">Supervision et Rapprochement Manuel</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151E32] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Heure</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Expéditeur</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Montant</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Code SMS</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Message & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {smsList && smsList.length > 0 ? (
                smsList.map((sms: any) => {
                  const parsed = sms.parsed_json || {};
                  return (
                    <tr key={sms.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="py-3 px-4 text-sm whitespace-nowrap">
                        {format(new Date(sms.created_at), "dd/MM/yyyy HH:mm")}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {sms.status === 'processed' && <span className="px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 text-xs">Validé</span>}
                        {sms.status === 'pending' && <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 text-xs">En attente</span>}
                        {sms.status === 'failed' && <span className="px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-xs">Échec</span>}
                        {sms.status === 'ignored' && <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 text-xs">Ignoré</span>}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {parsed.senderName || 'Inconnu'}<br/>
                        <span className="text-xs text-slate-500">{parsed.senderPhone || '-'}</span>
                      </td>
                      <td className="py-3 px-4 text-sm font-bold">
                        {parsed.amount ? `${parsed.amount.toLocaleString('fr-FR')} HTG` : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {parsed.referenceCode ? (
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{parsed.referenceCode}</span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-slate-500 mb-2 whitespace-pre-wrap">
                          {sms.raw_message}
                        </div>
                        {sms.error_reason && (
                          <div className="text-xs text-red-500 mb-2">{sms.error_reason}</div>
                        )}
                        
                        {(sms.status === 'failed' || sms.status === 'pending') && (
                          <div className="flex flex-col gap-2 p-2 bg-slate-50 dark:bg-slate-800/30 rounded border border-slate-200 dark:border-slate-700">
                            <form action={manualValidateSMS} className="flex gap-2 items-center">
                              <input type="hidden" name="smsId" value={sms.id} />
                              <input 
                                type="text" 
                                name="paymentId" 
                                placeholder="ID Paiement (UUID)" 
                                required
                                className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#0F1626] w-48"
                              />
                              <button type="submit" className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">
                                Lier & Valider
                              </button>
                            </form>
                            <form action={ignoreSMS}>
                              <input type="hidden" name="smsId" value={sms.id} />
                              <button type="submit" className="text-xs text-slate-500 hover:text-red-500 underline">
                                Ignorer ce SMS
                              </button>
                            </form>
                          </div>
                        )}
                        {sms.status === 'processed' && sms.payments && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Lié au paiement: {sms.payments.id.substring(0,8)}... ({sms.payments.merchants?.business_name})
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">Aucun SMS trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
