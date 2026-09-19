import React, { useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { PageItem } from '../types';
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import { sanitizeUrl } from '../utils/security';

interface FooterProps {
  onOpenPage: (page: PageItem) => void;
  onNavigateSection: (id: string) => void;
  onOpenMembership: () => void;
  onOpenDonation: () => void;
  onOpenAdmin?: () => void;
  onOpenVerification?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPage,
  onNavigateSection,
  onOpenMembership,
  onOpenDonation,
  onOpenAdmin,
  onOpenVerification,
}) => {
  const { t, isUrdu, tSetting, getPages } = useLanguage();
  const { settings, pages } = useData();

  // Stealth multi-tap handler on copyright (3 clicks/taps within 2s)
  // Provides an unobtrusive backup admin trigger for mobile & desktop
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);

  const handleCopyrightTap = () => {
    if (!onOpenAdmin) return;
    tapCountRef.current += 1;
    if (tapTimerRef.current) {
      window.clearTimeout(tapTimerRef.current);
    }
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      onOpenAdmin();
      return;
    }
    tapTimerRef.current = window.setTimeout(() => {
      tapCountRef.current = 0;
    }, 2000);
  };

  const localizedPages = getPages(pages);

  return (
    <footer id="main-footer" className="bg-[#111A24] text-white pt-14 pb-14 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sacred Quranic Cooperation Inscription */}
        <div className="text-center pb-8 mb-10 border-b border-white/10">
          <div className="font-quran text-base sm:text-xl text-amber-300/90 tracking-wider select-none mb-1">
            وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ
          </div>
          <div className={`text-[11px] sm:text-xs text-slate-400 font-medium ${isUrdu ? 'font-nastaliq' : 'font-editorial italic'}`}>
            {isUrdu ? 'اور نیکی اور پرہیزگاری کے کاموں میں ایک دوسرے کی مدد کرو' : 'And cooperate in righteousness and piety (Surah Al-Ma\'idah 5:2)'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {settings.logoData ? (
                <img
                  src={settings.logoData}
                  alt="Logo"
                  className="w-11 h-11 rounded-full object-cover border border-[#AD7A28]"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#AD7A28] flex items-center justify-center font-black text-white text-sm shadow-sm">
                  {isUrdu ? 'آ ب' : 'AB'}
                </div>
              )}
              <div className="flex flex-col justify-center min-w-0 text-start">
                <div className={`font-bold text-base text-white ltr:tracking-tight rtl:tracking-normal ltr:leading-tight rtl:leading-normal ${
                  isUrdu ? 'font-nastaliq' : 'font-display tracking-wider'
                }`}>
                  {tSetting('siteName', settings)}
                </div>
                <div className={`text-xs text-amber-300 font-medium ltr:tracking-wide rtl:tracking-normal mt-0.5 sm:mt-1 ltr:leading-tight rtl:leading-relaxed ${
                  isUrdu ? 'font-naskh' : 'font-sans'
                }`}>
                  {tSetting('siteSubName', settings)}
                </div>
              </div>
            </div>

            <p className={`text-xs sm:text-sm text-slate-400 leading-relaxed font-normal ${
              isUrdu ? 'font-nastaliq' : 'font-sans'
            }`}>
              {tSetting('footerDesc', settings) || tSetting('siteTagline', settings)}
            </p>

            {/* Social Channels & Rights */}
            <div className="flex items-center gap-2 pt-2">
              {settings.socialFacebook && (
                <a
                  href={sanitizeUrl(settings.socialFacebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#AD7A28] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {settings.socialTwitter && (
                <a
                  href={sanitizeUrl(settings.socialTwitter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#AD7A28] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {settings.socialWhatsapp && (
                <a
                  href={sanitizeUrl(settings.socialWhatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#AD7A28] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {settings.socialInstagram && (
                <a
                  href={sanitizeUrl(settings.socialInstagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#AD7A28] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className={`text-xs uppercase font-bold tracking-wider text-amber-300 mb-4 ${
              isUrdu ? 'font-naskh' : 'font-sans'
            }`}>
              {t('footerQuickLinks', 'Quick Navigation')}
            </h4>
            <ul className={`space-y-2 text-xs sm:text-sm text-slate-400 ${
              isUrdu ? 'font-naskh' : 'font-sans'
            }`}>
              <li>
                <button
                  onClick={() => onNavigateSection('hero')}
                  className="app-btn-link hover:text-white"
                >
                  {t('navHome')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('about')}
                  className="app-btn-link hover:text-white"
                >
                  {t('navAbout')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('programs')}
                  className="app-btn-link hover:text-white"
                >
                  {t('navPrograms')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('leadership')}
                  className="app-btn-link hover:text-white"
                >
                  {t('navLeadership')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('events')}
                  className="app-btn-link hover:text-white"
                >
                  {t('navEvents')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('gallery')}
                  className="app-btn-link hover:text-white"
                >
                  {t('navGallery')}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenMembership}
                  className="app-btn-link text-emerald-400"
                >
                  {t('navApply')}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDonation}
                  className="app-btn-link text-amber-300"
                >
                  {t('navDonate')}
                </button>
              </li>
              {onOpenVerification && (
                <li>
                  <button
                    onClick={onOpenVerification}
                    className="app-btn-link text-amber-200 hover:text-white"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#AD7A28]" />
                    <span>{isUrdu ? 'کارڈ کی تصدیق' : 'Verify Membership Card'}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Community Pages & Policies */}
          <div>
            <h4 className={`text-xs uppercase font-bold tracking-wider text-amber-300 mb-4 ${
              isUrdu ? 'font-naskh' : 'font-sans'
            }`}>
              {t('footerCommunityPages', 'Information & Policies')}
            </h4>
            <ul className={`space-y-2 text-xs sm:text-sm text-slate-400 ${
              isUrdu ? 'font-naskh' : 'font-sans'
            }`}>
              {localizedPages.map((p) => (
                <li key={p.slug || p.id}>
                  <button
                    onClick={() => onOpenPage(p)}
                    className="app-btn-link hover:text-white text-left rtl:text-right"
                  >
                    {p.label || p.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Regional Contact */}
          <div>
            <h4 className={`text-xs uppercase font-bold tracking-wider text-amber-300 mb-4 ${
              isUrdu ? 'font-naskh' : 'font-sans'
            }`}>
              {t('footerContactTitle', 'Regional Center')}
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#AD7A28] shrink-0 mt-0.5" />
                <span className={isUrdu ? 'font-nastaliq' : 'font-sans'}>
                  {tSetting('contactAddress', settings)}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#AD7A28] shrink-0" />
                <span className="font-mono text-slate-300">
                  {tSetting('contactPhone', settings)}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#AD7A28] shrink-0" />
                <span className="font-mono text-slate-300">
                  {tSetting('contactEmail', settings)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Full-Width Copyright & Legal Banner (Below Quick Navigation and All Columns) */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div 
            onClick={handleCopyrightTap}
            className="cursor-default select-none hover:text-slate-300 transition-colors text-center sm:text-left rtl:sm:text-right"
          >
            <span>{tSetting('footerCopy', settings)}</span>
            <span className="mx-2 text-slate-600">·</span>
            <span className={isUrdu ? 'font-naskh' : 'font-sans'}>
              {isUrdu ? 'تمام حقوق محفوظ ہیں' : 'All rights reserved'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className={isUrdu ? 'font-nastaliq' : 'font-display'}>
              {tSetting('siteName', settings)}
            </span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
