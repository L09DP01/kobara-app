'use client'

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { 
  updatePassword, 
  sendEmailOtpAction, 
  verifyEmailOtpAction, 
  generateTotpSecretAction, 
  verifyAndActivateTotpAction, 
  disable2faAction,
  deletePasskeyAction
} from '../actions';
import { getActiveSessions, revokeSession } from '../sessions-actions';
import { 
  Shield, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Smartphone, 
  Copy, 
  Check,
  QrCode,
  Mail,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export function SecuritySettings({ user, settings }: { user: any; settings: any }) {
  const supabase = createClient();

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // DB Saved 2FA Method
  const [dbMethod, setDbMethod] = useState<'none' | 'email' | 'totp'>(
    settings?.security_json?.two_factor_method || 'none'
  );

  // MFA / 2FA local states
  const [selectedMethod, setSelectedMethod] = useState<'none' | 'email' | 'totp'>(
    settings?.security_json?.two_factor_method || 'none'
  );
  
  const [mfaLoading, setMfaLoading] = useState(true);
  const [factors, setFactors] = useState<any[]>([]);
  const [activeFactor, setActiveFactor] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [mfaError, setMfaError] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState('');

  // TOTP Configuration state
  const [isConfiguringTotp, setIsConfiguringTotp] = useState(false);
  const [enrollFactorId, setEnrollFactorId] = useState('');
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  // Email Configuration state
  const [isConfiguringEmail, setIsConfiguringEmail] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Fetch MFA factors from Supabase Auth (for TOTP verification status)
  const fetchFactors = async () => {
    try {
      setMfaLoading(true);
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const active = data.totp.find((f: any) => f.status === 'verified');
      setFactors(data.totp);
      setActiveFactor(active || null);
    } catch (err: any) {
      console.error("Error fetching MFA factors:", err);
    } finally {
      setMfaLoading(false);
    }
  };

  // Sessions management state
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Sync state if settings prop changes
  useEffect(() => {
    fetchFactors();
    
    // Fetch active sessions
    getActiveSessions().then(res => {
      setSessions(res);
      setSessionsLoading(false);
    });

    if (settings?.security_json?.two_factor_method) {
      setDbMethod(settings.security_json.two_factor_method);
      setSelectedMethod(settings.security_json.two_factor_method);
    }
  }, [settings]);

  // Handle password update
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await updatePassword(newPassword);
      if (res.success) {
        setPasswordSuccess('Votre mot de passe a été mis à jour avec succès !');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Une erreur est survenue lors de la mise à jour.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Cooldown timer for Email OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown(resendCooldown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Email OTP Flow
  const startEmailConfiguration = async () => {
    setMfaError('');
    setMfaSuccess('');
    setActionLoading(true);
    try {
      await sendEmailOtpAction();
      setEmailOtpSent(true);
      setIsConfiguringEmail(true);
      setResendCooldown(60);
      setMfaSuccess('Un code de vérification a été envoyé à votre adresse e-mail.');
    } catch (err: any) {
      setMfaError(err.message || "Erreur lors de l'envoi du code.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length !== 6) {
      setMfaError('Veuillez saisir un code à 6 chiffres.');
      return;
    }
    setMfaError('');
    setMfaSuccess('');
    setActionLoading(true);
    try {
      const res = await verifyEmailOtpAction(emailOtp);
      if (res.success) {
        setMfaSuccess('Double authentification par e-mail activée avec succès !');
        setIsConfiguringEmail(false);
        setEmailOtp('');
        setDbMethod('email');
      }
    } catch (err: any) {
      setMfaError(err.message || 'Code de vérification invalide.');
    } finally {
      setActionLoading(false);
    }
  };

  // TOTP Flow
  const startTotpEnrollment = async () => {
    setMfaError('');
    setMfaSuccess('');
    setActionLoading(true);
    try {
      const { secret, qrCodeDataUrl } = await generateTotpSecretAction();
      setSecretKey(secret);
      setQrCodeSvg(qrCodeDataUrl);
      setIsConfiguringTotp(true);
    } catch (err: any) {
      setMfaError(err.message || "Impossible d'initialiser l'application d'authentification.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyTotp = async () => {
    if (totpCode.length !== 6) {
      setMfaError('Veuillez saisir un code à 6 chiffres.');
      return;
    }
    setMfaError('');
    setMfaSuccess('');
    setActionLoading(true);
    try {
      const res = await verifyAndActivateTotpAction(totpCode);
      if (res.success) {
        setMfaSuccess("Authentification par application activée avec succès !");
        setIsConfiguringTotp(false);
        setTotpCode('');
        setDbMethod('totp');
      }
    } catch (err: any) {
      setMfaError(err.message || 'Code de vérification invalide.');
    } finally {
      setActionLoading(false);
    }
  };

  // Disable / Switch 2FA to None
  const handleDisable2fa = async () => {
    if (dbMethod === 'none') return;
    
    if (!confirm('Êtes-vous sûr de vouloir désactiver la double authentification ? Cela réduira considérablement la sécurité de votre compte.')) {
      setSelectedMethod(dbMethod);
      return;
    }

    setMfaError('');
    setMfaSuccess('');
    setActionLoading(true);
    try {
      await disable2faAction();
      setMfaSuccess('Double authentification désactivée.');
      setDbMethod('none');
      setSelectedMethod('none');
      await supabase.auth.refreshSession();
      await fetchFactors();
    } catch (err: any) {
      setMfaError(err.message || 'Impossible de désactiver le 2FA.');
      setSelectedMethod(dbMethod);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Password Management Card */}
      <div className="bg-surface-card rounded-xl border border-border-subtle p-6 ambient-shadow">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-rose-50 rounded-xl text-kobara-red">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-headline-md font-headline-md text-text-primary">Mot de passe</h2>
            <p className="text-body-sm text-text-secondary mt-0.5">Gérez votre mot de passe pour sécuriser votre compte.</p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-medium animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p>{passwordSuccess}</p>
          </div>
        )}

        {passwordError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm font-medium animate-in fade-in duration-300">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p>{passwordError}</p>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2" htmlFor="new_password">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input 
                id="new_password"
                type={showNewPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-kobara-red/20 focus:border-kobara-red transition-all shadow-sm text-sm"
                placeholder="Au moins 6 caractères"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2" htmlFor="confirm_password">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input 
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-kobara-red/20 focus:border-kobara-red transition-all shadow-sm text-sm"
                placeholder="Répétez le mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={passwordLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-lg text-body-sm font-semibold text-text-primary hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {passwordLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
            Mettre à jour le mot de passe
          </button>
        </form>
      </div>

      {/* 2FA Method Selector Card */}
      <div className="bg-surface-card rounded-xl border border-border-subtle p-6 ambient-shadow">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-rose-50 rounded-xl text-kobara-red">
            <Shield className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-headline-md font-headline-md text-text-primary">Authentification à deux facteurs (2FA)</h2>
              {!mfaLoading && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  dbMethod !== 'none' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {dbMethod !== 'none' ? `Activé (${dbMethod === 'email' ? 'E-mail' : 'App'})` : 'Inactif'}
                </span>
              )}
            </div>
            <p className="text-body-sm text-text-secondary mt-0.5">Choisissez votre méthode de double validation préférée pour sécuriser vos accès et transferts.</p>
          </div>
        </div>

        {mfaSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-medium animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p>{mfaSuccess}</p>
          </div>
        )}

        {mfaError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm font-medium animate-in fade-in duration-300">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p>{mfaError}</p>
          </div>
        )}

        {mfaLoading ? (
          <div className="flex items-center gap-2 text-text-secondary text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin text-kobara-red" />
            Chargement de la configuration de sécurité...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Interactive Grid Selection */}
            {!isConfiguringTotp && !isConfiguringEmail && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Option 1: None */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethod('none');
                    handleDisable2fa();
                  }}
                  className={`flex flex-col text-left p-5 rounded-xl border transition-all relative ${
                    selectedMethod === 'none'
                      ? 'border-kobara-red bg-rose-50/10 shadow-sm'
                      : 'border-border-subtle bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className={`p-2 rounded-lg ${selectedMethod === 'none' ? 'bg-rose-50 text-kobara-red' : 'bg-gray-50 text-gray-500'}`}>
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    {dbMethod === 'none' && (
                      <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold uppercase">Actif</span>
                    )}
                  </div>
                  <h3 className="font-bold text-text-primary text-sm">Aucune protection</h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Accédez à votre compte uniquement avec votre adresse email et votre mot de passe classique.
                  </p>
                </button>

                {/* Option 2: Email OTP */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    if (dbMethod === 'email') return;
                    setSelectedMethod('email');
                    startEmailConfiguration();
                  }}
                  className={`flex flex-col text-left p-5 rounded-xl border transition-all relative ${
                    selectedMethod === 'email'
                      ? 'border-kobara-red bg-rose-50/10 shadow-sm'
                      : 'border-border-subtle bg-white hover:border-gray-300'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className={`p-2 rounded-lg ${selectedMethod === 'email' ? 'bg-rose-50 text-kobara-red' : 'bg-gray-50 text-gray-500'}`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    {dbMethod === 'email' ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">Actif</span>
                    ) : (
                      <span className="text-[9px] border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-medium">Recommandé</span>
                    )}
                  </div>
                  <h3 className="font-bold text-text-primary text-sm">Code OTP par Email</h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Un code temporaire à 6 chiffres est envoyé à votre adresse de messagerie lors de chaque connexion.
                  </p>
                </button>

                {/* Option 3: Authenticator App */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    if (dbMethod === 'totp') return;
                    setSelectedMethod('totp');
                    startTotpEnrollment();
                  }}
                  className={`flex flex-col text-left p-5 rounded-xl border transition-all relative ${
                    selectedMethod === 'totp'
                      ? 'border-kobara-red bg-rose-50/10 shadow-sm'
                      : 'border-border-subtle bg-white hover:border-gray-300'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className={`p-2 rounded-lg ${selectedMethod === 'totp' ? 'bg-rose-50 text-kobara-red' : 'bg-gray-50 text-gray-500'}`}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    {dbMethod === 'totp' ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">Actif</span>
                    ) : (
                      <span className="text-[9px] bg-rose-50 text-kobara-red px-1.5 py-0.5 rounded font-bold uppercase">Ultra Securisé</span>
                    )}
                  </div>
                  <h3 className="font-bold text-text-primary text-sm">Application TOTP</h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Utilisez Google Authenticator ou une application compatible pour générer des clés temporaires instantanées.
                  </p>
                </button>

              </div>
            )}

            {/* Email Verification Wizard */}
            {isConfiguringEmail && (
              <div className="border border-border-subtle rounded-xl p-6 bg-surface-container-low space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-xl">
                <div className="flex items-center gap-2 border-b border-border-subtle pb-4">
                  <Mail className="w-5 h-5 text-kobara-red" />
                  <h3 className="font-bold text-text-primary text-sm">Validation de votre adresse E-mail</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Pour activer la double validation par email, nous venons d'envoyer un code temporaire à 6 chiffres à l'adresse <strong>{user.email}</strong>. Saisissez ce code ci-dessous :
                  </p>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-text-primary uppercase tracking-wider" htmlFor="email_otp">
                      Code de validation
                    </label>
                    <div className="flex gap-3">
                      <input 
                        id="email_otp"
                        type="text"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-44 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-mono text-center text-lg font-bold tracking-widest text-gray-900 focus:outline-none focus:ring-2 focus:ring-kobara-red/20 focus:border-kobara-red transition-all shadow-sm"
                        placeholder="000000"
                      />
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleVerifyEmailOtp}
                        className="flex-1 flex items-center justify-center gap-2 px-6 bg-kobara-red text-white hover:bg-rose-600 rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
                      >
                        {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Activer la protection
                      </button>
                    </div>
                  </div>

                  <div className="text-xs flex items-center justify-between pt-2">
                    <button
                      type="button"
                      disabled={actionLoading || resendCooldown > 0}
                      onClick={startEmailConfiguration}
                      className="text-kobara-red font-medium hover:underline disabled:text-text-secondary disabled:no-underline"
                    >
                      {resendCooldown > 0 ? `Renvoyer le code dans ${resendCooldown}s` : "Renvoyer le code"}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-border-subtle">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsConfiguringEmail(false);
                      setSelectedMethod(dbMethod);
                      setMfaError('');
                    }}
                    className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* TOTP Verification Wizard */}
            {isConfiguringTotp && (
              <div className="border border-border-subtle rounded-xl p-6 bg-surface-container-low space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-xl">
                <div className="flex items-center gap-2 border-b border-border-subtle pb-4">
                  <QrCode className="w-5 h-5 text-kobara-red" />
                  <h3 className="font-bold text-text-primary text-sm">Configurer votre application d'authentification</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-text-secondary leading-relaxed">
                    1. Scannez ce code QR avec votre application d'authentification (Google Authenticator, Microsoft Authenticator, Authy, etc.) :
                  </p>
                  
                  <div className="flex justify-center bg-white p-4 rounded-xl border border-border-subtle w-fit mx-auto shadow-sm">
                    <img 
                      src={qrCodeSvg} 
                      alt="QR Code MFA" 
                      className="w-44 h-44" 
                    />
                  </div>

                  <div className="text-xs text-text-secondary leading-relaxed space-y-2">
                    <p>2. Si vous ne pouvez pas scanner le code QR, saisissez manuellement cette clé secrète dans votre application :</p>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2.5 font-mono text-gray-800 text-sm font-semibold shadow-inner w-full justify-between">
                      <span className="break-all tracking-wider">{secretKey}</span>
                      <button 
                        type="button" 
                        onClick={copyToClipboard}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500"
                        title="Copier la clé secrète"
                      >
                        {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-border-subtle pt-4 space-y-3">
                    <label className="block text-xs font-bold text-text-primary" htmlFor="totp_verification_code">
                      3. Entrez le code de vérification à 6 chiffres généré par votre application :
                    </label>
                    <div className="flex gap-3">
                      <input 
                        id="totp_verification_code"
                        type="text"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-44 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-mono text-center text-lg font-bold tracking-widest text-gray-900 focus:outline-none focus:ring-2 focus:ring-kobara-red/20 focus:border-kobara-red transition-all shadow-sm"
                        placeholder="000000"
                      />
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleVerifyTotp}
                        className="flex-1 flex items-center justify-center gap-2 px-6 bg-kobara-red text-white hover:bg-rose-600 rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
                      >
                        {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Activer l'A2F App
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-border-subtle">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsConfiguringTotp(false);
                      setSelectedMethod(dbMethod);
                      setMfaError('');
                    }}
                    className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Passkeys Management Card */}
      <div className="bg-surface-card rounded-xl border border-border-subtle p-6 ambient-shadow">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <span className="material-symbols-outlined">fingerprint</span>
          </div>
          <div>
            <h2 className="text-headline-md font-headline-md text-text-primary">Connexion Biométrique (Passkey)</h2>
            <p className="text-body-sm text-text-secondary mt-0.5">Utilisez Touch ID, Face ID ou Windows Hello pour vous connecter sans mot de passe.</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            disabled={actionLoading}
            onClick={async () => {
              setActionLoading(true);
              setMfaError('');
              setMfaSuccess('');
              try {
                const { startRegistration } = await import('@simplewebauthn/browser');
                const resp = await fetch('/api/auth/passkey/generate-registration-options');
                if (!resp.ok) throw new Error("Erreur de génération des options");
                const options = await resp.json();
                
                const attResp = await startRegistration(options);
                
                const verifyResp = await fetch('/api/auth/passkey/verify-registration', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(attResp),
                });
                
                if (!verifyResp.ok) throw new Error("Échec de la validation de la clé");
                setMfaSuccess("Clé biométrique ajoutée avec succès ! Rechargez la page pour la voir.");
              } catch (e: any) {
                console.error(e);
                setMfaError(e.message || "Impossible d'ajouter le Passkey.");
              } finally {
                setActionLoading(false);
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-text-primary text-surface-container-lowest rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span className="material-symbols-outlined text-[18px]">add</span>
            Ajouter un appareil biométrique
          </button>

          {(settings?.security_json?.passkeys?.length || 0) > 0 && (
            <div className="mt-6 border border-border-subtle rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-lowest border-b border-border-subtle text-text-secondary">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Appareil</th>
                    <th className="py-3 px-4 font-semibold">Date d'ajout</th>
                    <th className="py-3 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle bg-white">
                  {settings.security_json.passkeys.map((pk: any) => (
                    <tr key={pk.id}>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400">devices</span>
                        <span className="font-medium text-text-primary capitalize">{pk.deviceType || 'Appareil inconnu'}</span>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {new Date(pk.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={async () => {
                            if (!confirm("Voulez-vous vraiment supprimer cet appareil biométrique ?")) return;
                            setActionLoading(true);
                            try {
                              await deletePasskeyAction(pk.id);
                              setMfaSuccess("Clé biométrique supprimée.");
                            } catch (e: any) {
                              setMfaError("Erreur lors de la suppression.");
                            } finally {
                              setActionLoading(false);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 font-medium text-sm transition-colors disabled:opacity-50"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sessions Management Card */}
      <div className="bg-surface-card rounded-xl border border-border-subtle p-6 ambient-shadow">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <span className="material-symbols-outlined">devices</span>
            </div>
            <div>
              <h2 className="text-headline-md font-headline-md text-text-primary">Sessions Actives</h2>
              <p className="text-body-sm text-text-secondary mt-0.5">Appareils et navigateurs actuellement connectés à votre compte.</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => {
              setSessionsLoading(true);
              getActiveSessions().then(res => {
                setSessions(res);
                setSessionsLoading(false);
              });
            }}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>

        {sessionsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-text-secondary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 bg-surface-container-lowest rounded-xl border border-border-subtle border-dashed">
            <p className="text-text-secondary text-sm">Aucune session active trouvée.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session: any) => {
              // Extract device/os from user agent
              const ua = session.user_agent || '';
              const isMobile = ua.toLowerCase().includes('mobile');
              let browser = "Navigateur Inconnu";
              if (ua.includes('Chrome')) browser = "Google Chrome";
              else if (ua.includes('Firefox')) browser = "Mozilla Firefox";
              else if (ua.includes('Safari')) browser = "Apple Safari";
              else if (ua.includes('Edge')) browser = "Microsoft Edge";
              
              let os = "OS Inconnu";
              if (ua.includes('Windows')) os = "Windows";
              else if (ua.includes('Mac OS')) os = "macOS";
              else if (ua.includes('Linux')) os = "Linux";
              else if (ua.includes('Android')) os = "Android";
              else if (ua.includes('iOS') || ua.includes('iPhone')) os = "iOS";

              // Check if it's the current session (we don't have perfect session ID matching without exposing it, so we'll just check if it's recent + same IP for a guess, or just allow revoking all)
              // Since Next.js has its own session, we'll let them revoke any of them. If they revoke their own, they will be logged out eventually.

              return (
                <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-surface-container-lowest border border-border-subtle rounded-xl gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-text-secondary">
                      <span className="material-symbols-outlined text-[20px]">{isMobile ? 'smartphone' : 'computer'}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-text-primary">{os} • {browser}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-secondary font-mono bg-surface-container px-1.5 py-0.5 rounded">{session.ip_address}</span>
                        <span className="text-xs text-text-secondary">Dernière activité: {new Date(session.last_active_at).toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={async () => {
                      if (!confirm("Voulez-vous vraiment déconnecter cet appareil ?")) return;
                      setActionLoading(true);
                      try {
                        const res = await revokeSession(session.id);
                        if (res.error) throw new Error(res.error);
                        setSessions(sessions.filter(s => s.id !== session.id));
                        toast.success("Appareil déconnecté.");
                      } catch (e: any) {
                        toast.error(e.message || "Erreur lors de la déconnexion.");
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    className="px-3 py-1.5 border border-border-subtle text-text-secondary hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-medium rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    Déconnecter
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
