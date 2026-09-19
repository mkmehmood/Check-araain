import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Sparkles, ArrowRight, X, Megaphone, CheckCircle2 } from 'lucide-react';
import { isUrduText, translateEnglishToUrdu, translateUrduToEnglish, translateTextAsync } from '../utils/urduTransliterator';

interface AnnouncementBarProps {
  onOpenMembership: () => void;
  onOpenDonation: () => void;
  onNavigateSection: (id: string) => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  onOpenMembership,
  onOpenDonation,
  onNavigateSection,
}) => {
  const { isUrdu, t } = useLanguage();
  const { settings } = useData();
  const [isDismissed, setIsDismissed] = useState(false);
  const [asyncBadge, setAsyncBadge] = useState<string>('');
  const [asyncMessage, setAsyncMessage] = useState<string>('');

  useEffect(() => {
    let active = true;
    const targetLang = isUrdu ? 'ur' : 'en';

    const rawBadge = isUrdu 
      ? (settings.announcementBadgeUr || settings.announcementBadge)
      : (settings.announcementBadge || settings.announcementBadgeUr);

    const rawMessage = isUrdu
      ? (settings.announcementTextUr || settings.announcementText)
      : (settings.announcementText || settings.announcementTextUr);

    if (rawBadge) {
      translateTextAsync(rawBadge, targetLang).then((res) => {
        if (active && res) setAsyncBadge(res);
      }).catch(() => {});
    }
    if (rawMessage) {
      translateTextAsync(rawMessage, targetLang).then((res) => {
        if (active && res) setAsyncMessage(res);
      }).catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [isUrdu, settings.announcementBadge, settings.announcementBadgeUr, settings.announcementText, settings.announcementTextUr]);

  if (!settings.announcementEnabled || isDismissed) {
    return null;
  }

  // Pure language isolation: Urdu only in Urdu mode, English only in English mode
  let badgeText = '';
  if (isUrdu) {
    if (asyncBadge && isUrduText(asyncBadge)) {
      badgeText = asyncBadge;
    } else if (settings.announcementBadgeUr && isUrduText(settings.announcementBadgeUr)) {
      badgeText = settings.announcementBadgeUr;
    } else if (settings.announcementBadge && isUrduText(settings.announcementBadge)) {
      badgeText = settings.announcementBadge;
    } else if (settings.announcementBadge) {
      badgeText = translateEnglishToUrdu(settings.announcementBadge);
    } else {
      badgeText = 'اہم اطلاع';
    }
  } else {
    if (asyncBadge && !isUrduText(asyncBadge)) {
      badgeText = asyncBadge;
    } else if (settings.announcementBadge && !isUrduText(settings.announcementBadge)) {
      badgeText = settings.announcementBadge;
    } else if (settings.announcementBadgeUr && !isUrduText(settings.announcementBadgeUr)) {
      badgeText = settings.announcementBadgeUr;
    } else if (settings.announcementBadge || settings.announcementBadgeUr) {
      const translated = translateUrduToEnglish(settings.announcementBadge || settings.announcementBadgeUr || '');
      badgeText = !isUrduText(translated) && translated.trim() ? translated : 'Important Notice';
    } else {
      badgeText = 'Important Notice';
    }
  }

  let messageText = '';
  if (isUrdu) {
    if (asyncMessage && isUrduText(asyncMessage)) {
      messageText = asyncMessage;
    } else if (settings.announcementTextUr && isUrduText(settings.announcementTextUr)) {
      messageText = settings.announcementTextUr;
    } else if (settings.announcementText && isUrduText(settings.announcementText)) {
      messageText = settings.announcementText;
    } else if (settings.announcementText) {
      messageText = translateEnglishToUrdu(settings.announcementText);
    } else {
      messageText = 'آرائیں بنوں کی ممبرشپ مہم جاری ہے۔ اپنا کارڈ بنوائیں۔';
    }
  } else {
    if (asyncMessage && !isUrduText(asyncMessage)) {
      messageText = asyncMessage;
    } else if (settings.announcementText && !isUrduText(settings.announcementText)) {
      messageText = settings.announcementText;
    } else if (settings.announcementTextEn && !isUrduText(settings.announcementTextEn)) {
      messageText = settings.announcementTextEn;
    } else if (settings.announcementTextUr && !isUrduText(settings.announcementTextUr)) {
      messageText = settings.announcementTextUr;
    } else if (settings.announcementText || settings.announcementTextUr) {
      const translated = translateUrduToEnglish(settings.announcementText || settings.announcementTextUr || '');
      messageText = !isUrduText(translated) && translated.trim() ? translated : 'Araain Bannu Membership Drive is live. Register now.';
    } else {
      messageText = 'ARAAIN BANNU Membership Drive is live. Register now.';
    }
  }
  
  let linkText = '';
  if (isUrdu) {
    if (settings.announcementLinkText && isUrduText(settings.announcementLinkText)) {
      linkText = settings.announcementLinkText;
    } else {
      linkText = 'رکنیت حاصل کریں';
    }
  } else {
    if (settings.announcementLinkText && !isUrduText(settings.announcementLinkText)) {
      linkText = settings.announcementLinkText;
    } else {
      linkText = 'Join Us';
    }
  }
  const action = settings.announcementAction || 'membership';

  const handleActionClick = () => {
    if (action === 'membership') {
      onOpenMembership();
    } else if (action === 'donation') {
      onOpenDonation();
    } else if (action === 'events') {
      onNavigateSection('events');
    } else if (action === 'contact') {
      onNavigateSection('contact');
    } else {
      onOpenMembership();
    }
  };

  return (
    <div 
      id="public-announcement-bar"
      className="bg-gradient-to-r from-[#121D27] via-[#1E3040] to-[#121D27] text-white border-b border-[#AD7A28]/40 h-9 sm:h-10 px-2.5 sm:px-5 relative z-50 shadow-sm transition-all overflow-hidden flex items-center"
      style={{
        borderBottomColor: settings.websiteThemeAccent ? `${settings.websiteThemeAccent}66` : undefined
      }}
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
        
        {/* Left: Badge */}
        <div className="flex items-center gap-1.5 shrink-0 z-10 bg-[#121D27]/80 pr-1 rtl:pl-1 rtl:pr-0">
          <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-[#AD7A28] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wide shadow-xs shrink-0 ${
            isUrdu ? 'font-naskh' : 'font-sans'
          }`}>
            <Megaphone className="w-3 h-3 animate-pulse" />
            <span className="whitespace-nowrap">{badgeText}</span>
          </span>
        </div>

        {/* Center: Single line moving animated marquee ticker */}
        <div className="overflow-hidden whitespace-nowrap flex-1 mx-1 sm:mx-3 relative group">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap py-0.5">
            <span className={`text-slate-100 font-medium ${isUrdu ? 'font-naskh text-xs sm:text-[13px]' : 'font-sans text-xs sm:text-sm'}`}>
              {messageText}
            </span>
            <span className="text-[#F5CA7B] select-none">✦</span>
            <span className={`text-slate-100 font-medium ${isUrdu ? 'font-naskh text-xs sm:text-[13px]' : 'font-sans text-xs sm:text-sm'}`}>
              {messageText}
            </span>
            <span className="text-[#F5CA7B] select-none">✦</span>
            <span className={`text-slate-100 font-medium ${isUrdu ? 'font-naskh text-xs sm:text-[13px]' : 'font-sans text-xs sm:text-sm'}`}>
              {messageText}
            </span>
            <span className="text-[#F5CA7B] select-none">✦</span>
          </div>
        </div>

        {/* Right: CTA & Dismiss Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-10 bg-[#121D27]/80 pl-1 rtl:pr-1 rtl:pl-0">
          <button
            onClick={handleActionClick}
            className={`inline-flex items-center gap-1 h-6 sm:h-7 px-2.5 sm:px-3 rounded-full bg-white/10 hover:bg-[#AD7A28] border border-white/20 hover:border-[#AD7A28] text-[#F5CA7B] hover:text-white text-[10px] sm:text-[11px] font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 whitespace-nowrap ${
              isUrdu ? 'font-naskh' : 'font-sans'
            }`}
          >
            <span>{linkText}</span>
            <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 rtl:rotate-180 shrink-0" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss Announcement"
            title={isUrdu ? 'بند کریں' : 'Dismiss'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
