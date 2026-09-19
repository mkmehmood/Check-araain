import React from 'react';
import { SiteSettings } from '../../types';
import { ImageUploadField } from './ImageUploadField';
import { BilingualField } from './BilingualField';
import { 
  ShieldCheck, 
  Sparkles, 
  Image as ImageIcon, 
  Type, 
  Eye
} from 'lucide-react';

interface LogoNamesCmsProps {
  settings: SiteSettings;
  setSettings: (settings: SiteSettings) => void;
  isUrdu: boolean;
}

export const LogoNamesCms: React.FC<LogoNamesCmsProps> = ({
  settings,
  setSettings,
  isUrdu,
}) => {
  const updateField = (field: keyof SiteSettings, val: any) => {
    setSettings({
      ...settings,
      [field]: val,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Section Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-[#AD7A28]">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
                Section 2 · Brand Identity
              </span>
            </div>
            <h4 className="text-lg font-bold text-[#16232F] mt-0.5">
              {isUrdu ? 'لوگو، مونوگرام اور تنظیمی نام' : 'Logo, Emblem & Organization Names'}
            </h4>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'مرکزی لوگو، فیو آئیکون، بنیادی و ثانوی تنظیمی نام، اور سلوگن کا ایک جگہ مکمل انتظام'
                : 'Manage official brand emblem, favicon, primary & secondary council titles, and official taglines.'}
            </p>
          </div>
        </div>
      </div>

      {/* Live Brand Navbar Preview */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#AD7A28]" />
            <span>{isUrdu ? 'لائیو نیو بار پریویو' : 'Live Navbar Brand Preview'}</span>
          </span>
          <span className="text-[10px] text-slate-400">Desktop & Mobile Header</span>
        </div>

        <div className="bg-[#16232F] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.logoData ? (
              <img
                src={settings.logoData}
                alt="Logo Preview"
                className="w-12 h-12 rounded-full object-cover border-2 border-[#AD7A28] shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#AD7A28] flex items-center justify-center font-black text-white text-base shadow-md border-2 border-amber-400">
                {isUrdu ? 'آ ب' : 'AB'}
              </div>
            )}

            <div className="flex flex-col justify-center">
              <div className={`font-bold text-base sm:text-lg text-white leading-tight ${
                isUrdu ? 'font-nastaliq' : 'font-display tracking-wider'
              }`}>
                {isUrdu ? (settings.siteNameUr || settings.siteName || 'ارائیں بنوں') : (settings.siteName || 'ARAAIN BANNU')}
              </div>
              <div className="text-xs text-amber-300 font-medium mt-0.5">
                {isUrdu ? (settings.siteSubNameUr || settings.siteSubName || 'مرکزی کونسل بنوں') : (settings.siteSubName || 'Welfare & Community Council')}
              </div>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-[11px] text-slate-300 italic">
              "{isUrdu ? (settings.siteTaglineUr || settings.siteTagline || 'اتحاد، تعلیم، خدمت') : (settings.siteTagline || 'Unity, Education & Welfare')}"
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 1. Images (Logo & Favicon) + 2. Names & Taglines */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Col: Logo & Favicon Uploads */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 space-y-5">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-[#AD7A28]" />
              <span>{isUrdu ? 'لوگو اور آئیکون اپلوڈ' : 'Logo & Icon Files'}</span>
            </h5>

            {/* Main Logo */}
            <ImageUploadField
              label={isUrdu ? 'مرکزی لوگو / مونوگرام' : 'Primary Council Logo / Monogram'}
              value={settings.logoData || ''}
              onChange={(b64) => updateField('logoData', b64)}
              onRemove={() => updateField('logoData', '')}
              aspectRatio="square"
              maxWidth={600}
              isUrdu={isUrdu}
              helperText="Recommended: 500x500 PNG with circular or transparent background"
            />

            {/* Favicon */}
            <div className="pt-4 border-t border-slate-100">
              <ImageUploadField
                label={isUrdu ? 'براؤزر فیو آئیکون (Favicon)' : 'Browser Tab Favicon (Small Icon)'}
                value={settings.faviconData || ''}
                onChange={(b64) => updateField('faviconData', b64)}
                onRemove={() => updateField('faviconData', '')}
                aspectRatio="square"
                maxWidth={128}
                isUrdu={isUrdu}
                helperText="Displays in browser tab bar (32x32 to 64x64 px)"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Single Unified Bilingual Input Fields */}
        <div className="md:col-span-7 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 space-y-5">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-[#AD7A28]" />
              <span>{isUrdu ? 'تنظیمی نام و سلوگن' : 'Organization Titles & Taglines'}</span>
            </h5>

            {/* Unified Primary Site Name */}
            <BilingualField
              label={isUrdu ? 'بنیادی تنظیمی نام' : 'Primary Organization Name'}
              valueEn={settings.siteName || ''}
              valueUr={settings.siteNameUr || ''}
              onChange={(en, ur) => {
                setSettings({
                  ...settings,
                  siteName: en,
                  siteNameUr: ur,
                });
              }}
              placeholder="e.g. ARAAIN BANNU / ارائیں بنوں"
              isUrdu={isUrdu}
              helperText={isUrdu ? 'انگریزی یا اردو کسی بھی زبان میں لکھیں، دونوں خودکار محفوظ ہوں گی' : 'Type in English or Urdu; both are synchronized in real-time.'}
              required={true}
            />

            {/* Unified Secondary Title */}
            <BilingualField
              label={isUrdu ? 'ثانوی نام / ذیلی عنوان' : 'Secondary Title / Sub-Header'}
              valueEn={settings.siteSubName || ''}
              valueUr={settings.siteSubNameUr || ''}
              onChange={(en, ur) => {
                setSettings({
                  ...settings,
                  siteSubName: en,
                  siteSubNameUr: ur,
                });
              }}
              placeholder="e.g. Welfare & Community Council / مرکزی کونسل بنوں"
              isUrdu={isUrdu}
            />

            {/* Unified Slogan / Tagline */}
            <BilingualField
              label={isUrdu ? 'تنظیمی موٹو / سلوگن' : 'Organization Motto / Tagline'}
              valueEn={settings.siteTagline || ''}
              valueUr={settings.siteTaglineUr || ''}
              onChange={(en, ur) => {
                setSettings({
                  ...settings,
                  siteTagline: en,
                  siteTaglineUr: ur,
                });
              }}
              placeholder="e.g. Unity, Education & Welfare / اتحاد، تعلیم، خدمت"
              isUrdu={isUrdu}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
