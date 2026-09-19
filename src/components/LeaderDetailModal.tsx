import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Leader } from '../types';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Quote, 
  CheckCircle2, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { FullScreenHeader } from './common/FullScreenHeader';

interface LeaderDetailModalProps {
  leader: Leader | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderDetailModal: React.FC<LeaderDetailModalProps> = ({
  leader,
  isOpen,
  onClose
}) => {
  const { isUrdu, t, getLeaders } = useLanguage();

  // Handle ESC key dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !leader) return null;

  // Bilingual resolution with getLeaders
  const resolved = getLeaders([leader])[0] || leader;
  const displayName = resolved.name;
  const displayRole = resolved.role;
  const displayMessage = resolved.message;
  const displayBio = resolved.bio;
  const displayLocation = resolved.location;
  const responsibilities = resolved.responsibilities || [];

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#FBF9F4] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn"
      role="region"
      aria-label="Leadership Profile"
    >
      {/* Sticky Full-Screen Header with Back Movement */}
      <FullScreenHeader
        title={displayName}
        subtitle={displayRole}
        badge={t('siteName', 'ARAAIN BANNU')}
        icon={<UserCheck className="w-4 h-4 text-amber-300" />}
        onBack={onClose}
      />

      {/* Screen Body Content */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header Hero Banner */}
          <div className="relative bg-gradient-to-r from-[#16232F] via-[#1E3142] to-[#16232F] text-white p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Leader Avatar */}
              <div className="relative shrink-0">
                {(leader.photo_data || leader.image || (leader as any).photoUrl) ? (
                  <img
                    src={leader.photo_data || leader.image || (leader as any).photoUrl}
                    alt={displayName}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-[#AD7A28] shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-[#0F1922] to-[#25394C] text-[#F5CA7B] font-black text-3xl sm:text-4xl flex items-center justify-center border-4 border-[#AD7A28] shadow-lg">
                    {leader.initials || (isUrdu ? 'آ ب' : 'AB')}
                  </div>
                )}

                {Boolean(leader.featured) && (
                  <div className="absolute -bottom-1.5 -right-1.5 rtl:-left-1.5 rtl:-right-auto p-2 rounded-full bg-[#AD7A28] text-white shadow-md" title="Featured Council Leader">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                )}
              </div>

              {/* Title & Designations */}
              <div className="text-center sm:text-left rtl:sm:text-right flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  {Boolean(leader.featured) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#AD7A28]/25 text-amber-300 text-xs font-bold border border-[#AD7A28]/40">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'کونسل کے نمایاں رہنما' : 'Featured Executive'}</span>
                    </span>
                  )}
                  {displayLocation && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-300 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#AD7A28]" />
                      <span>{displayLocation}</span>
                    </span>
                  )}
                </div>

                <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 ${
                  isUrdu ? 'font-nastaliq text-3xl sm:text-4xl' : 'font-display tracking-wide'
                }`}>
                  {displayName}
                </h2>
                <p className={`text-base sm:text-lg font-semibold text-[#F5CA7B] ${
                  isUrdu ? 'font-naskh' : 'font-sans'
                }`}>
                  {displayRole}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details Body */}
          <div className="p-6 sm:p-10 space-y-8">
            
            {/* Customized Message to Viewers (Core Highlight) */}
            {displayMessage && (
              <div className="relative rounded-2xl bg-[#FBF8F0] border-2 border-[#AD7A28]/30 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-[#8A5F19]">
                  <div className="w-8 h-8 rounded-lg bg-[#AD7A28]/20 flex items-center justify-center text-[#8A5F19]">
                    <Quote className="w-4 h-4 rtl:rotate-180" />
                  </div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${
                    isUrdu ? 'font-naskh' : 'font-sans'
                  }`}>
                    {isUrdu ? 'پیغام برائے برادری و قارئین' : 'Special Message to Viewers & Community'}
                  </h3>
                </div>
                
                <p className={`text-base sm:text-lg text-slate-800 italic leading-relaxed rtl:leading-[2] font-medium ${
                  isUrdu ? 'font-nastaliq' : 'font-serif'
                }`}>
                  "{displayMessage}"
                </p>

                <div className="mt-4 pt-4 border-t border-[#AD7A28]/15 flex items-center justify-between text-xs text-slate-500">
                  <span className={`font-bold text-[#8A5F19] text-sm ${
                    isUrdu ? 'font-nastaliq' : 'font-display'
                  }`}>— {displayName}</span>
                  <span className={`text-[11px] text-slate-400 ${
                    isUrdu ? 'font-naskh' : 'font-sans'
                  }`}>{isUrdu ? 'باضابطہ تنظیمی پیغام' : 'Official Message'}</span>
                </div>
              </div>
            )}

            {/* Background / Bio */}
            {displayBio && (
              <div>
                <h3 className={`text-xs uppercase font-bold text-slate-400 tracking-wider mb-2.5 ${
                  isUrdu ? 'font-naskh' : 'font-sans'
                }`}>
                  {isUrdu ? 'تعارف اور پس منظر' : 'Profile Overview'}
                </h3>
                <p className={`text-sm sm:text-base text-slate-700 leading-relaxed rtl:leading-[2] ${
                  isUrdu ? 'font-nastaliq' : 'font-sans'
                }`}>
                  {displayBio}
                </p>
              </div>
            )}

            {/* Key Portfolios & Responsibilities */}
            {responsibilities && responsibilities.length > 0 && (
              <div>
                <h3 className={`text-xs uppercase font-bold text-slate-400 tracking-wider mb-3 ${
                  isUrdu ? 'font-naskh' : 'font-sans'
                }`}>
                  {isUrdu ? 'کلیدی ذمہ داریاں اور دائرہ کار' : 'Key Portfolios & Responsibilities'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {responsibilities.map((resp, idx) => (
                    <div
                      key={idx}
                      className={`inline-flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200 ${
                        isUrdu ? 'font-naskh' : 'font-sans'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#AD7A28] shrink-0" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Communication Channels */}
            <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {leader.email && (
                  <a
                    href={`mailto:${leader.email}?subject=${encodeURIComponent(isUrdu ? 'رابطہ برائے آرائیں بنوں' : 'Inquiry to Council Leadership')}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16232F] hover:bg-[#25394C] text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
                  >
                    <Mail className="w-4 h-4 text-[#F5CA7B]" />
                    <span className={isUrdu ? 'font-naskh' : 'font-sans'}>{isUrdu ? 'ای میل بھیجیں' : 'Send Email'}</span>
                  </a>
                )}

                {leader.phone && (
                  <a
                    href={`tel:${leader.phone.replace(/[^\d+]/g, '')}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#AD7A28] hover:bg-[#8A5F19] text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 font-mono"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{leader.phone}</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
