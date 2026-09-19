import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types';
import { ImageUploadField } from './ImageUploadField';
import { SingleField } from './SingleField';
import { SaveBar } from './SaveBar';
import { pushSettingsDocToCloud } from '../../services/firebase';
import { ShieldCheck, Eye, Sparkles, Building2, Megaphone, Info, CheckCircle2 } from 'lucide-react';

interface IdentityCmsProps {
  settings: SiteSettings;
  onSaved: (patch: Partial<SiteSettings>) => void;
  isUrdu: boolean;
}

export const IdentityCms: React.FC<IdentityCmsProps> = ({
  settings,
  onSaved,
  isUrdu,
}) => {
  const [formData, setFormData] = useState({
    siteName: settings.siteName || '',
    siteTagline: settings.siteTagline || '',
    siteSubName: settings.siteSubName || '',
    siteSubTagline: settings.siteSubTagline || '',
    logoData: settings.logoData || '',
    faviconData: settings.faviconData || '',
    // Announcements
    announcementEnabled: settings.announcementEnabled ?? true,
    announcementBadge: settings.announcementBadge || 'UPDATE',
    announcementBadgeUr: settings.announcementBadgeUr || 'اہم اعلان',
    announcementText: settings.announcementText || '',
    announcementLink: settings.announcementLink || '',
    announcementLinkText: settings.announcementLinkText || '',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      siteName: settings.siteName || '',
      siteTagline: settings.siteTagline || '',
      siteSubName: settings.siteSubName || '',
      siteSubTagline: settings.siteSubTagline || '',
      logoData: settings.logoData || '',
      faviconData: settings.faviconData || '',
      announcementEnabled: settings.announcementEnabled ?? true,
      announcementBadge: settings.announcementBadge || 'UPDATE',
      announcementBadgeUr: settings.announcementBadgeUr || 'اہم اعلان',
      announcementText: settings.announcementText || '',
      announcementLink: settings.announcementLink || '',
      announcementLinkText: settings.announcementLinkText || '',
    });
    setIsDirty(false);
  }, [settings]);

  const updateField = (key: string, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg(isUrdu ? 'محفوظ کیا جا رہا ہے...' : 'Saving to Firestore...');
    try {
      const identityPatch = {
        siteName: formData.siteName,
        siteTagline: formData.siteTagline,
        siteSubName: formData.siteSubName,
        siteSubTagline: formData.siteSubTagline,
        logoData: formData.logoData,
        faviconData: formData.faviconData,
      };

      const announcementPatch = {
        announcementEnabled: formData.announcementEnabled,
        announcementBadge: formData.announcementBadge,
        announcementBadgeUr: formData.announcementBadgeUr,
        announcementText: formData.announcementText,
        announcementLink: formData.announcementLink,
        announcementLinkText: formData.announcementLinkText,
      };

      await Promise.all([
        pushSettingsDocToCloud('identity', identityPatch),
        pushSettingsDocToCloud('misc', announcementPatch),
      ]);

      onSaved({ ...identityPatch, ...announcementPatch });
      setLastSaved(new Date().toISOString());
      setIsDirty(false);
      setStatusMsg(isUrdu ? 'کامیابی سے محفوظ ہو گیا' : 'Saved successfully');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setStatusMsg((isUrdu ? 'خرابی: ' : 'Error: ') + (err.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-[#AD7A28]">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
              Topbar & Identity Manager
            </span>
            <h3 className="text-lg font-bold text-[#16232F] mt-0.5">
              {isUrdu ? '. ٹاپ بار اور تنظیمی شناخت' : '. Topbar & Brand Identity'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'لوگو، مرکزی تنظیمی نام، ذیلی نام، اور متحرک اعلانات کا انتظام'
                : 'Manage organization logo, master site name, sub name, and top announcements.'}
            </p>
          </div>
        </div>
      </div>

      {/* Global Impact Alert */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
        <Info className="w-5 h-5 text-[#AD7A28] shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold block text-sm text-[#8A5F19] mb-0.5">
            {isUrdu ? 'تنظیمی نام کی عالمی تجدید (Global Organization Name)' : 'Organization Name Global Sync'}
          </span>
          {isUrdu
            ? 'نوٹ: یہاں تنظیم کا نام تبدیل کرنے سے یہ خودکار طور پر پوری ویب سائٹ کے ٹاپ بار، کارڈز، رسیدوں اور فوٹر میں اپ ڈیٹ ہو جائے گا۔'
            : 'Note: Updating the Organization Name here automatically updates its usage everywhere across the entire website, including navigation topbars, membership cards, donation receipts, and footer.'}
        </div>
      </div>

      {/* 1. Logo & Favicon */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="w-6 h-6 rounded-full bg-[#16232F] text-amber-400 flex items-center justify-center font-bold text-xs">
            1
          </span>
          <h4 className="text-sm font-bold text-[#16232F]">
            {isUrdu ? 'لوگو اور براؤزر آئیکون' : 'Logo & Favicon Assets'}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUploadField
            label={isUrdu ? 'تنظیم کا سرکاری لوگو (Official Logo)' : 'Official Organization Logo'}
            value={formData.logoData}
            onChange={(val) => updateField('logoData', val)}
            aspectRatio="square"
            maxWidth={512}
            quality={0.9}
            helperText="Square or transparent PNG recommended (256x256 or 512x512)"
            isUrdu={isUrdu}
          />

          <ImageUploadField
            label={isUrdu ? 'فیو آئیکون (Browser Tab Favicon)' : 'Favicon (Browser Tab Icon)'}
            value={formData.faviconData}
            onChange={(val) => updateField('faviconData', val)}
            aspectRatio="square"
            maxWidth={128}
            quality={0.9}
            helperText="Square 32x32 to 128x128 icon for browser tabs"
            isUrdu={isUrdu}
          />
        </div>
      </div>

      {/* 2 & 3. Organization Name & Sub Name */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="w-6 h-6 rounded-full bg-[#16232F] text-amber-400 flex items-center justify-center font-bold text-xs">
            2 & 3
          </span>
          <h4 className="text-sm font-bold text-[#16232F]">
            {isUrdu ? 'تنظیمی نام اور ذیلی متن' : 'Organization Name & Sub-name'}
          </h4>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {isUrdu ? '2. تنظیم کا بنیادی نام (Organization Name)' : '2. Organization Name (Used everywhere across site)'}
            </label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => updateField('siteName', e.target.value)}
              placeholder="e.g. آرائیں بنوں / ARAAIN BANNU"
              className="app-input font-black text-base text-[#16232F]"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              {isUrdu ? 'یہ نام ہیڈر، کارڈز اور تمام نوٹسز پر نمایاں ہوگا' : 'Primary title used on header, cards, receipts, and hero display.'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {isUrdu ? '3. ذیلی نام یا برانچ کا متن (Sub Name Text)' : '3. Sub Name Text (Secondary Title)'}
            </label>
            <input
              type="text"
              value={formData.siteSubName}
              onChange={(e) => updateField('siteSubName', e.target.value)}
              placeholder="e.g. ویلفیئر ایسوسی ایشن ضلع بنوں / Welfare Association Bannu"
              className="app-input text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'بنیادی نعرہ / سلوگن' : 'Tagline / Motto (Urdu)'}
              </label>
              <input
                type="text"
                value={formData.siteTagline}
                onChange={(e) => updateField('siteTagline', e.target.value)}
                placeholder="اتحاد، تعلیم، فلاح و خدمت"
                className="app-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'انگریزی سلوگن' : 'English Motto'}
              </label>
              <input
                type="text"
                value={formData.siteSubTagline}
                onChange={(e) => updateField('siteSubTagline', e.target.value)}
                placeholder="Empowering community, youth & education"
                className="app-input text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Announcements */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#16232F] text-amber-400 flex items-center justify-center font-bold text-xs">
              4
            </span>
            <h4 className="text-sm font-bold text-[#16232F]">
              {isUrdu ? 'ٹاپ بار اعلانات (Announcements)' : 'Top Bar Announcement Ticker'}
            </h4>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.announcementEnabled}
              onChange={(e) => updateField('announcementEnabled', e.target.checked)}
              className="w-4 h-4 rounded text-[#AD7A28] focus:ring-[#AD7A28]"
            />
            <span className="text-xs font-bold text-slate-700">
              {formData.announcementEnabled ? (isUrdu ? 'فعال ہے' : 'Active') : (isUrdu ? 'غیر فعال' : 'Disabled')}
            </span>
          </label>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'بیج متن (English Badge)' : 'Badge Label (e.g. URGENT)'}
              </label>
              <input
                type="text"
                value={formData.announcementBadge}
                onChange={(e) => updateField('announcementBadge', e.target.value)}
                placeholder="UPDATE / NOTICE"
                className="app-input text-xs uppercase tracking-wider font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'اردو بیج متن' : 'Urdu Badge Label'}
              </label>
              <input
                type="text"
                value={formData.announcementBadgeUr}
                onChange={(e) => updateField('announcementBadgeUr', e.target.value)}
                placeholder="اہم اعلان"
                className="app-input text-xs font-bold"
              />
            </div>
          </div>

          <SingleField
            label={isUrdu ? 'اعلان کا متن' : 'Announcement Notice Text'}
            value={formData.announcementText}
            onChange={(val) => updateField('announcementText', val)}
            multiline={true}
            rows={2}
            placeholder="Registration for the upcoming annual general body convention is now open..."
            isUrdu={isUrdu}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'بٹن / لنک کا متن' : 'Call to Action Button Text'}
              </label>
              <input
                type="text"
                value={formData.announcementLinkText}
                onChange={(e) => updateField('announcementLinkText', e.target.value)}
                placeholder="e.g. Register Now"
                className="app-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'لنک یو آر ایل یا سیکشن ہیش' : 'Target URL / Section (e.g. #membership)'}
              </label>
              <input
                type="text"
                value={formData.announcementLink}
                onChange={(e) => updateField('announcementLink', e.target.value)}
                placeholder="#membership or https://..."
                className="app-input text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <SaveBar
        onSave={handleSave}
        isDirty={isDirty}
        isSaving={isSaving}
        lastSaved={lastSaved}
        statusMessage={statusMsg}
        isUrdu={isUrdu}
        onReset={() => {
          setFormData({
            siteName: settings.siteName || '',
            siteTagline: settings.siteTagline || '',
            siteSubName: settings.siteSubName || '',
            siteSubTagline: settings.siteSubTagline || '',
            logoData: settings.logoData || '',
            faviconData: settings.faviconData || '',
            announcementEnabled: settings.announcementEnabled ?? true,
            announcementBadge: settings.announcementBadge || 'UPDATE',
            announcementBadgeUr: settings.announcementBadgeUr || 'اہم اعلان',
            announcementText: settings.announcementText || '',
            announcementLink: settings.announcementLink || '',
            announcementLinkText: settings.announcementLinkText || '',
          });
          setIsDirty(false);
        }}
      />
    </div>
  );
};
