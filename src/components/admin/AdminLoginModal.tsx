import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ShieldCheck, Lock, Mail, AlertCircle, Clock } from 'lucide-react';
import { FullScreenHeader } from '../common/FullScreenHeader';
import { 
  sanitizeEmail, 
  getLoginSecurityStatus, 
  recordFailedLoginAttempt, 
  resetLoginSecurity 
} from '../../utils/security';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userEmail: string) => void;
}

/**
 * AdminLoginModal - Converted into Complete Screen with Back Navigation
 */
export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { t, isUrdu } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutSec, setLockoutSec] = useState<number>(0);

  // Check login security status on mount/open
  useEffect(() => {
    if (isOpen) {
      const status = getLoginSecurityStatus();
      if (status.isLocked) {
        setLockoutSec(status.remainingSec);
      }
    }
  }, [isOpen]);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSec <= 0) return;
    const timer = setInterval(() => {
      setLockoutSec((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSec]);

  // Escape key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Enforce brute-force lockout
    const secStatus = getLoginSecurityStatus();
    if (secStatus.isLocked) {
      setLockoutSec(secStatus.remainingSec);
      setError(
        isUrdu
          ? `مسلسل ناکام کوششوں کی وجہ سے پورٹل عارضی طور پر مقفل ہے۔ براہ کرم ${secStatus.remainingSec} سیکنڈ بعد کوشش کریں۔`
          : `Portal temporarily locked due to excessive failed attempts. Please wait ${secStatus.remainingSec} seconds.`
      );
      return;
    }

    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      setError(
        isUrdu ? 'براہ کرم درست ای میل ایڈریس درج کریں۔' : 'Please provide a valid administrator email.'
      );
      return;
    }

    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      resetLoginSecurity();
      setPassword('');
      onLoginSuccess(cred.user.email || cleanEmail);
      onClose();
    } catch (err: any) {
      setPassword('');
      const failStatus = recordFailedLoginAttempt();
      if (failStatus.isLocked) {
        setLockoutSec(failStatus.remainingSec);
        setError(
          isUrdu
            ? `حد سے زیادہ ناکام لاگ ان کوششیں! سسٹم کو ${failStatus.remainingSec} سیکنڈ کے لیے محفوظ لاک کر دیا گیا ہے۔`
            : `Too many failed attempts. Login locked for ${failStatus.remainingSec} seconds.`
        );
      } else {
        setError(
          isUrdu
            ? 'غلط ایڈمن کوائف۔ براہ کرم درست ای میل اور پاس ورڈ درج کریں۔'
            : 'Invalid administrator credentials. Please verify your email and password.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121D27] text-white flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
      {/* Complete Screen Header with Back Movement */}
      <FullScreenHeader
        title={t('adminLoginTitle', 'Administrator Sign In')}
        subtitle={t('adminLoginSub', 'Central council database and content manager.')}
        badge={t('siteName', 'ARAAIN BANNU')}
        icon={<ShieldCheck className="w-4 h-4 text-amber-300" />}
        onBack={onClose}
        dark={true}
      />

      {/* Complete Screen Centered Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="bg-[#16232F] rounded-3xl max-w-md w-full shadow-2xl border border-white/10 overflow-hidden">
          
          <div className="p-6 sm:p-8 text-center border-b border-white/10 bg-white/5">
            <div className="w-14 h-14 rounded-2xl bg-[#AD7A28]/20 border border-[#AD7A28]/40 text-[#F5CA7B] flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t('adminLoginTitle', 'Administrator Sign In')}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {isUrdu ? 'باضابطہ ایڈمنسٹریٹر لاگ ان' : 'Authorized Personnel Only'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {lockoutSec > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2.5">
                <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{isUrdu ? `مقفل: ${lockoutSec} سیکنڈ` : `Locked: ${lockoutSec}s remaining`}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('adminEmail', 'Admin Email')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 rtl:pr-10 rtl:pl-3.5 pr-3.5 py-2.5 rounded-xl bg-[#0F1922] border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#AD7A28] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('adminPassword', 'Password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 rtl:pr-10 rtl:pl-3.5 pr-3.5 py-2.5 rounded-xl bg-[#0F1922] border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#AD7A28] text-sm"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading || lockoutSec > 0}
                className="app-btn-primary app-btn-lg app-btn-full disabled:opacity-50"
              >
                {loading ? (isUrdu ? 'توثیق جاری ہے...' : 'Authenticating...') : t('btnLogin', 'Sign In to Admin')}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
