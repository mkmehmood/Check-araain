import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types';
import { BilingualField } from './BilingualField';
import { UrlResolverField } from './UrlResolverField';
import { SaveBar } from './SaveBar';
import { pushSettingsDocToCloud } from '../../services/firebase';
import { 
  BellRing, 
  Sparkles, 
  Eye, 
  Palette, 
  Layers
} from 'lucide-react';

interface AnnouncementCmsProps {
  settings: SiteSettings;
  onSaved: (patch: Partial<SiteSettings>) => void;
  isUrdu: boolean;
}

export const AnnouncementCms: React.FC<AnnouncementCmsProps> = ({
  settings,
  onSaved,
  isUrdu,
}) => {
  const [formData, setFormData] = useState({
    announcementEnabled: Boolean(settings.announcementEnabled),
    announcementBadge: settings.announcementBadge || 'OFFICIAL NOTICE',
    announcementBadgeUr: settings.announcementBadgeUr || 'اہم نوٹس',
    announcementText: settings.announcementText || '',
    announcementTextEn: settings.announcementTextEn || '',
    announcementTextUr: settings.announcementTextUr || '',
    announcementLinkText: settings.announcementLinkText || '',
    announcementAction: settings.announcementAction || 'membership',
    announcementLink: settings.announcementLink || '',
    announcementImage: settings.announcementImage || '',
    websiteThemeAccent: settings.websiteThemeAccent || '#16232F',
    lastWebsiteUpdate: settings.lastWebsiteUpdate || new Date().toISOString(),
    customNoticeHeadline: settings.customNoticeHeadline || '',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(settings.lastWebsiteUpdate || null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      announcementEnabled: Boolean(settings.announcementEnabled),
      announcementBadge: settings.announcementBadge || 'OFFICIAL NOTICE',
      announcementBadgeUr: settings.announcementBadgeUr || 'اہم نوٹس',
      announcementText: settings.announcementText || '',
      announcementTextEn: settings.announcementTextEn || '',
      announcementTextUr: settings.announcementTextUr || '',
      announcementLinkText: settings.announcementLinkText || '',
      announcementAction: settings.announcementAction || 'membership',
      announcementLink: settings.announcementLink || '',
      announcementImage: settings.announcementImage || '',
      websiteThemeAccent: settings.websiteThemeAccent || '#16232F',
      lastWebsiteUpdate: settings.lastWebsiteUpdate || new Date().toISOString(),
      customNoticeHeadline: settings.customNoticeHeadline || '',
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
      const now = new Date().toISOString();
      const payload = {
        ...formData,
        lastWebsiteUpdate: now,
      };
      // Full document replace on siteConfig/misc
      await pushSettingsDocToCloud('misc', payload);
      onSaved(payload);
      setLastSaved(now);
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
      {/* Tab Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-[#AD7A28]">
              <BellRing className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
                Firestore: siteConfig/misc
              </span>
              <h3 className="text-lg font-bold text-[#16232F] mt-0.5">
                {isUrdu ? 'ہیڈر اناؤنسمنٹ اور ٹکر' : 'Announcement & Ticker'}
              </h3>
              <p className="text-xs text-slate-500">
                {isUrdu
                  ? 'ویب سائٹ کے اوپری اعلان کی پٹی، الرٹ بیج، نوٹس، لنک اور ایکٹیویشن'
                  : 'Manage top announcement banner, alert badge, scrolling ticker notice, and action button.'}
              </p>
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-700">
              {formData.announcementEnabled ? (isUrdu ? 'فعال ہے' : 'Active') : (isUrdu ? 'غیر فعال' : 'Disabled')}
            </span>
            <button
              type="button"
              onClick={() => updateField('announcementEnabled', !formData.announcementEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                formData.announcementEnabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow-sm block transition-transform absolute top-0.5 ${
                  formData.announcementEnabled ? 'ltr:left-6.5 rtl:right-6.5' : 'ltr:left-0.5 rtl:right-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Bar */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#AD7A28]" />
            <span>{isUrdu ? 'لائیو پریویو' : 'Live Header Preview'}</span>
          </span>
          <span className="text-[10px] text-slate-400">
            {formData.announcementEnabled ? '● Visible on site' : '○ Hidden from public view'}
          </span>
        </div>
        <div 
          className="px-4 py-2.5 text-white flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{ backgroundColor: formData.websiteThemeAccent || '#16232F' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-full bg-[#AD7A28] text-white text-[10px] font-black uppercase tracking-wider shrink-0">
              {isUrdu ? (formData.announcementBadgeUr || formData.announcementBadge) : formData.announcementBadge}
            </span>
            <span className="truncate font-medium text-slate-100">
              {isUrdu 
                ? (formData.announcementTextUr || formData.announcementText || 'آرائیں بنوں کی آفیشل ممبرشپ مہم فعال ہے۔')
                : (formData.announcementText || 'Official Membership Drive is active. Register now.')}
            </span>
          </div>
          {formData.announcementLinkText && (
            <span className="text-amber-300 font-bold underline cursor-pointer text-xs shrink-0">
              {formData.announcementLinkText} →
            </span>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <BilingualField
            label={isUrdu ? 'الرٹ بیج ٹیکسٹ (Alert Badge)' : 'Alert Badge Label'}
            valueEn={formData.announcementBadge}
            valueUr={formData.announcementBadgeUr}
            onChange={(en, ur) => {
              setFormData(prev => ({
                ...prev,
                announcementBadge: en,
                announcementBadgeUr: ur,
              }));
              setIsDirty(true);
            }}
            placeholder="e.g. OFFICIAL NOTICE / اہم اطلاع"
            isUrdu={isUrdu}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#AD7A28]" />
              <span>{isUrdu ? 'بینر بیک گراؤنڈ رنگ' : 'Banner Background Accent'}</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.websiteThemeAccent}
                onChange={(e) => updateField('websiteThemeAccent', e.target.value)}
                className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={formData.websiteThemeAccent}
                onChange={(e) => updateField('websiteThemeAccent', e.target.value)}
                placeholder="#16232F"
                className="app-input font-mono uppercase text-xs"
              />
            </div>
          </div>
        </div>

        <BilingualField
          label={isUrdu ? 'مرکزی اعلان کا متن (Announcement Text)' : 'Announcement Main Text'}
          valueEn={formData.announcementText}
          valueUr={formData.announcementTextUr}
          onChange={(en, ur) => {
            setFormData(prev => ({
              ...prev,
              announcementText: en,
              announcementTextEn: en,
              announcementTextUr: ur,
            }));
            setIsDirty(true);
          }}
          multiline={true}
          rows={3}
          placeholder="Enter the message displayed in the top bar..."
          isUrdu={isUrdu}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isUrdu ? 'بٹن کا لیبل (Action Button Text)' : 'Action Button Text'}
            </label>
            <input
              type="text"
              value={formData.announcementLinkText}
              onChange={(e) => updateField('announcementLinkText', e.target.value)}
              placeholder="e.g. Register / رکنیت حاصل کریں"
              className="app-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isUrdu ? 'بٹن کی قسم (Target Action)' : 'Target Action'}
            </label>
            <select
              value={formData.announcementAction}
              onChange={(e) => updateField('announcementAction', e.target.value)}
              className="app-input"
            >
              <option value="membership">Open Membership Form</option>
              <option value="donation">Open Donation Modal</option>
              <option value="events">Scroll to Events</option>
              <option value="custom">Custom External URL</option>
            </select>
          </div>

          {formData.announcementAction === 'custom' && (
            <div>
              <UrlResolverField
                label={isUrdu ? 'کسٹم لنک URL' : 'Custom URL'}
                value={formData.announcementLink}
                onChange={(val) => updateField('announcementLink', val)}
                placeholder="https://..."
                isUrdu={isUrdu}
              />
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {isUrdu ? 'کسٹم نوٹس ہیڈ لائن (اضافی ٹکر)' : 'Notice Headline / Ticker'}
          </label>
          <input
            type="text"
            value={formData.customNoticeHeadline}
            onChange={(e) => updateField('customNoticeHeadline', e.target.value)}
            placeholder="Special packages or community updates..."
            className="app-input"
          />
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
            announcementEnabled: Boolean(settings.announcementEnabled),
            announcementBadge: settings.announcementBadge || 'OFFICIAL NOTICE',
            announcementBadgeUr: settings.announcementBadgeUr || 'اہم نوٹس',
            announcementText: settings.announcementText || '',
            announcementTextEn: settings.announcementTextEn || '',
            announcementTextUr: settings.announcementTextUr || '',
            announcementLinkText: settings.announcementLinkText || '',
            announcementAction: settings.announcementAction || 'membership',
            announcementLink: settings.announcementLink || '',
            announcementImage: settings.announcementImage || '',
            websiteThemeAccent: settings.websiteThemeAccent || '#16232F',
            lastWebsiteUpdate: settings.lastWebsiteUpdate || new Date().toISOString(),
            customNoticeHeadline: settings.customNoticeHeadline || '',
          });
          setIsDirty(false);
        }}
      />
    </div>
  );
};
