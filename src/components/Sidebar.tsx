import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { 
  Globe, 
  Heart, 
  UserPlus, 
  Home, 
  Info, 
  Layers, 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  Mail, 
  Phone, 
  MapPin,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Menu
} from 'lucide-react';
import { FullScreenHeader } from './common/FullScreenHeader';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMembership: () => void;
  onOpenDonation: () => void;
  onNavigateSection: (id: string) => void;
  onOpenVerification?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOpenMembership,
  onOpenDonation,
  onNavigateSection,
  onOpenVerification,
}) => {
  const { lang, setLanguage, t, isUrdu, tSetting } = useLanguage();
  const { settings } = useData();

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
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navLinks = [
    { id: 'hero', label: t('navHome', 'Home'), icon: Home },
    { id: 'about', label: t('navAbout', 'About Us'), icon: Info },
    { id: 'programs', label: t('navPrograms', 'Programs'), icon: Layers },
    { id: 'leadership', label: t('navLeadership', 'Leadership'), icon: Users },
    { id: 'events', label: t('navEvents', 'Events'), icon: Calendar },
    { id: 'gallery', label: t('navGallery', 'Gallery'), icon: ImageIcon },
    { id: 'contact', label: t('navContact', 'Contact'), icon: Mail },
  ];

  const handleLink = (id: string) => {
    onClose();
    onNavigateSection(id);
  };

  const ArrowIcon = isUrdu ? ChevronLeft : ChevronRight;

  return (
    <div className="fixed inset-0 z-50 bg-[#121D27] text-white flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
      {/* Full-Screen Sticky Header with Back Movement */}
      <FullScreenHeader
        title={t('siteName', 'ARAAIN BANNU')}
        subtitle={isUrdu ? 'مکمل نیویگیشن مینو' : 'Full Navigation Menu & Quick Access'}
        badge={isUrdu ? 'مرکزی کونسل' : 'Official Portal'}
        icon={<Menu className="w-4 h-4 text-amber-300" />}
        onBack={onClose}
        dark={true}
      />

      {/* Screen Body Content */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Language & Contact */}
          <div className="space-y-6">
            
            {/* Language Switcher */}
            <div className="bg-[#182634] rounded-3xl p-6 border border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-[#F5CA7B]" />
                  <span>{isUrdu ? 'زبان کا انتخاب / ترجمہ' : 'Language / Translations'}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                  {lang === 'ur' ? 'اردو فعال' : 'English Active'}
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                {isUrdu 
                  ? 'پوری ویب سائٹ کا مواد فوری طور پر اردو یا انگریزی میں تبدیل کریں:' 
                  : 'Switch entire website copy instantly between Urdu and English:'}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLanguage('en')}
                  className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    lang === 'en'
                      ? 'bg-[#AD7A28] text-white shadow-md ring-2 ring-[#F5CA7B]/50'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>English</span>
                  {lang === 'en' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </button>

                <button
                  onClick={() => setLanguage('ur')}
                  className={`py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-urdu ${
                    lang === 'ur'
                      ? 'bg-[#AD7A28] text-white shadow-md ring-2 ring-[#F5CA7B]/50'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>اردو (پاکستان)</span>
                  {lang === 'ur' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </button>
              </div>
            </div>

            {/* Official Council Contact */}
            <div className="p-6 rounded-3xl bg-[#16232F] border border-white/10 text-xs space-y-3 text-slate-300">
              <h4 className="font-bold text-white text-sm mb-2">
                {isUrdu ? 'مرکزی رابطہ کی تفصیلات' : 'Contact Information'}
              </h4>

              {settings.contactEmail && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-mono">{settings.contactEmail}</span>
                </div>
              )}
              {settings.contactPhone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-mono">{settings.contactPhone}</span>
                </div>
              )}
              {settings.contactAddress && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{settings.contactAddress}</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Complete Navigation Links */}
          <div className="bg-[#182634] rounded-3xl p-6 border border-white/10 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-4 px-1">
                {isUrdu ? 'ویب سائٹ کے اہم صفحات' : 'Main Website Sections'}
              </h3>
              
              <div className="space-y-2">
                {navLinks.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleLink(item.id)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-slate-200 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold cursor-pointer text-left rtl:text-right"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-amber-400">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <ArrowIcon className="w-4 h-4 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                © {new Date().getFullYear()}{' '}
                <span className={isUrdu ? 'font-nastaliq' : 'font-display'}>
                  {tSetting('siteName', settings)}
                </span>
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
