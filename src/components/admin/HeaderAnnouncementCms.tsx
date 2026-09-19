import React from 'react';
import { SiteSettings } from '../../types';
import { BilingualField } from './BilingualField';
import { UrlResolverField } from './UrlResolverField';
import { 
  BellRing, 
  Sparkles, 
  Link as LinkIcon, 
  Palette, 
  Eye, 
  ExternalLink 
} from 'lucide-react';

interface HeaderAnnouncementCmsProps {
  settings: SiteSettings;
  setSettings: (settings: SiteSettings) => void;
  isUrdu: boolean;
}

export const HeaderAnnouncementCms: React.FC<HeaderAnnouncementCmsProps> = ({
  settings,
  setSettings,
  isUrdu,
}) => {
  const isEnabled = Boolean(settings.announcementEnabled);

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-[#AD7A28]">
              <BellRing className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
                Section 1 · Header Announcement
              </span>
              <h4 className="text-lg font-bold text-[#16232F] mt-0.5">
                {isUrdu ? 'ہیڈر اناؤنسمنٹ بار' : 'Header Announcement Bar'}
              </h4>
              <p className="text-xs text-slate-500">
                {isUrdu
                  ? 'ویب سائٹ کے بالکل اوپر موجود پٹی کا متن، الرٹ بیج، لنک اور ترتیبات'
                  : 'Manage top announcement bar, alert badge, message text, action links, and visibility.'}
              </p>
            </div>
          </div>

          {/* Master Enable/Disable Toggle */}
          <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-700">
              {isEnabled ? (isUrdu ? 'فعال ہے' : 'Active') : (isUrdu ? 'غیر فعال' : 'Disabled')}
            </span>
            <button
              type="button"
              onClick={() => updateField('announcementEnabled', !isEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow-sm block transition-transform absolute top-0.5 ${
                  isEnabled ? 'ltr:left-6.5 rtl:right-6.5' : 'ltr:left-0.5 rtl:right-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#AD7A28]" />
            <span>{isUrdu ? 'لائیو ہیڈر پریویو' : 'Live Public Header Preview'}</span>
          </span>
          <span className="text-[10px] text-slate-400">
            {isEnabled ? '● Visible on site' : '○ Hidden from public view'}
          </span>
        </div>
        <div 
          className="px-4 py-2.5 text-white flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{ backgroundColor: settings.websiteThemeAccent || '#16232F' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-full bg-[#AD7A28] text-white text-[10px] font-black uppercase tracking-wider shrink-0">
              {isUrdu ? (settings.announcementBadgeUr || settings.announcementBadge || 'اہم نوٹس') : (settings.announcementBadge || 'OFFICIAL NOTICE')}
            </span>
            <span className="truncate font-medium text-slate-100">
              {isUrdu 
                ? (settings.announcementTextUr || settings.announcementText || 'ارائیں بنوں ویلفیئر ایسوسی ایشن کے تمام ارکان کو مطلع کیا جاتا ہے...') 
                : (settings.announcementText || 'Membership registration drive is now open. Join our community council.')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-300 font-bold hover:underline shrink-0 text-xs">
            <span>{isUrdu ? (settings.announcementLinkTextUr || settings.announcementLinkText || 'تفصیلات دیکھیں') : (settings.announcementLinkText || 'Apply Now')}</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Edit Form - Unified Single Input Fields */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 space-y-5">
        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#AD7A28]" />
          <span>{isUrdu ? 'پیغام و بیج کی ترتیبات' : 'Announcement Content & Badge'}</span>
        </h5>

        {/* Unified Alert Badge */}
        <BilingualField
          label={isUrdu ? 'الرٹ بیج (اردو و انگریزی دونوں سپورٹ)' : 'Alert Badge (Urdu & English)'}
          valueEn={settings.announcementBadge || ''}
          valueUr={settings.announcementBadgeUr || ''}
          onChange={(en, ur) => {
            setSettings({
              ...settings,
              announcementBadge: en,
              announcementBadgeUr: ur,
            });
          }}
          placeholder="e.g. OFFICIAL NOTICE / اہم نوٹس"
          isUrdu={isUrdu}
          helperText={isUrdu ? 'متن خودکار ترجمہ اور دونوں زبانوں میں ہم آہنگ ہوگا' : 'Type in English or Urdu; auto-syncs both versions.'}
        />

        {/* Unified Announcement Message */}
        <BilingualField
          label={isUrdu ? 'اناؤنسمنٹ پیغام (اردو و انگریزی دونوں سپورٹ)' : 'Announcement Ticker Message (Urdu & English)'}
          valueEn={settings.announcementText || ''}
          valueUr={settings.announcementTextUr || ''}
          onChange={(en, ur) => {
            setSettings({
              ...settings,
              announcementText: en,
              announcementTextUr: ur,
            });
          }}
          multiline={true}
          rows={2}
          placeholder="e.g. Annual general body meeting scheduled for this Sunday. All Araain families are requested to participate."
          isUrdu={isUrdu}
          helperText={isUrdu ? 'ایک ہی فیلڈ میں درج کریں، اردو اور انگریزی دونوں ورژن خودکار تیار ہو جاتے ہیں' : 'Single field for both languages with automatic live synchronization.'}
        />

        {/* Action Link & Destination */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <LinkIcon className="w-3.5 h-3.5 text-[#AD7A28]" />
            <span>{isUrdu ? 'ایکشن، بٹن کا متن و لنک' : 'Action Destination & Link'}</span>
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Action Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isUrdu ? 'ایکشن کا ہدف' : 'Action Destination'}
              </label>
              <select
                value={settings.announcementAction || '#membership'}
                onChange={(e) => updateField('announcementAction', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#AD7A28] focus:border-transparent outline-none bg-white cursor-pointer"
              >
                <option value="#membership">Open Membership Form (#membership)</option>
                <option value="#donation">Open Donation Modal (#donation)</option>
                <option value="#events">Scroll to Events Section (#events)</option>
                <option value="#programs">Scroll to Programs Section (#programs)</option>
                <option value="#contact">Scroll to Contact Section (#contact)</option>
                <option value="custom">Custom External URL</option>
              </select>
            </div>

            {/* Unified Button / Link Text */}
            <BilingualField
              label={isUrdu ? 'بٹن / لنک کا متن' : 'Button / Link Text'}
              valueEn={settings.announcementLinkText || ''}
              valueUr={settings.announcementLinkTextUr || ''}
              onChange={(en, ur) => {
                setSettings({
                  ...settings,
                  announcementLinkText: en,
                  announcementLinkTextUr: ur,
                });
              }}
              placeholder="e.g. Apply Now / ابھی شامل ہوں"
              isUrdu={isUrdu}
            />
          </div>

          {/* Custom URL Resolver with 1-click test & metadata */}
          {settings.announcementAction === 'custom' && (
            <UrlResolverField
              label={isUrdu ? 'بیرونی ویب سائٹ یا سوشل میڈیا لنک' : 'External Website or Social Media URL'}
              value={settings.announcementLink || ''}
              onChange={(url) => updateField('announcementLink', url)}
              placeholder="https://facebook.com/..., https://youtu.be/..., or website link"
              isUrdu={isUrdu}
              helperText={isUrdu ? 'کسی بھی ویب سائٹ یا سوشل پلیٹ فارم کا لنک درج کر کے تصدیق کر سکتے ہیں' : 'Supports links from any website, YouTube, Facebook, or social platform.'}
            />
          )}
        </div>

        {/* Styling Accent */}
        <div className="pt-4 border-t border-slate-200">
          <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#AD7A28]" />
            <span>{isUrdu ? 'ہیڈر کا پس منظر رنگ' : 'Header Bar Background Color'}</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.websiteThemeAccent || '#16232F'}
              onChange={(e) => updateField('websiteThemeAccent', e.target.value)}
              className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
            />
            <span className="font-mono text-xs text-slate-600">
              {settings.websiteThemeAccent || '#16232F'}
            </span>
            <button
              type="button"
              onClick={() => updateField('websiteThemeAccent', '#16232F')}
              className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Reset to Navy Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
