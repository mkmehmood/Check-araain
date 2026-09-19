import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types';
import { BilingualField } from './BilingualField';
import { SaveBar } from './SaveBar';
import { pushSettingsDocToCloud } from '../../services/firebase';
import { 
  Share2, 
  Globe, 
  MessageCircle, 
  Sparkles,
  ShieldAlert,
  AtSign,
  Link2
} from 'lucide-react';

interface FooterCmsProps {
  settings: SiteSettings;
  onSaved: (patch: Partial<SiteSettings>) => void;
  isUrdu: boolean;
}

export const FooterCms: React.FC<FooterCmsProps> = ({
  settings,
  onSaved,
  isUrdu,
}) => {
  const [formData, setFormData] = useState({
    footerDesc: settings.footerDesc || '',
    footerDescUr: settings.footerDescUr || '',
    footerCopy: settings.footerCopy || '',
    footerCopyUr: settings.footerCopyUr || '',
    socialFacebook: settings.socialFacebook || '',
    socialTwitter: settings.socialTwitter || '',
    socialWhatsapp: settings.socialWhatsapp || '',
    socialWhatsappGroup: settings.socialWhatsappGroup || '',
    socialInstagram: settings.socialInstagram || '',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      footerDesc: settings.footerDesc || '',
      footerDescUr: settings.footerDescUr || '',
      footerCopy: settings.footerCopy || '',
      footerCopyUr: settings.footerCopyUr || '',
      socialFacebook: settings.socialFacebook || '',
      socialTwitter: settings.socialTwitter || '',
      socialWhatsapp: settings.socialWhatsapp || '',
      socialWhatsappGroup: settings.socialWhatsappGroup || '',
      socialInstagram: settings.socialInstagram || '',
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
      // 1. siteConfig/footer
      await pushSettingsDocToCloud('footer', {
        footerDesc: formData.footerDesc,
        footerDescUr: formData.footerDescUr,
        footerCopy: formData.footerCopy,
        footerCopyUr: formData.footerCopyUr,
      });

      // 2. siteConfig/social
      await pushSettingsDocToCloud('social', {
        socialFacebook: formData.socialFacebook,
        socialTwitter: formData.socialTwitter,
        socialWhatsapp: formData.socialWhatsapp,
        socialWhatsappGroup: formData.socialWhatsappGroup,
        socialInstagram: formData.socialInstagram,
      });

      onSaved(formData);
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
            <Share2 className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
              Firestore: siteConfig/footer & siteConfig/social
            </span>
            <h3 className="text-lg font-bold text-[#16232F] mt-0.5">
              {isUrdu ? 'فوٹر اور سوشل میڈیا لنکس' : 'Footer & Social Media Links'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'ویب سائٹ کے نچلے حصے کا تعارفی نوٹ، کاپی رائٹ اور آفیشل سوشل ہینڈلز'
                : 'Manage footer tagline, copyright text, Facebook, WhatsApp community, and social channels.'}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Footer Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
        <h4 className="text-xs font-bold text-[#16232F] uppercase tracking-wider pb-2 border-b border-slate-100">
          {isUrdu ? '1. فوٹر کا مختصر تعارف اور کاپی رائٹ' : '1. Footer Description & Copyright'}
        </h4>

        <BilingualField
          label={isUrdu ? 'فوٹر کی مختصر تفصیل (footerDesc)' : 'Footer About Paragraph'}
          valueEn={formData.footerDesc}
          valueUr={formData.footerDescUr}
          onChange={(en, ur) => {
            setFormData(prev => ({ ...prev, footerDesc: en, footerDescUr: ur }));
            setIsDirty(true);
          }}
          multiline={true}
          rows={3}
          placeholder="Brief summary of the welfare association at the bottom of every page..."
          isUrdu={isUrdu}
        />

        <BilingualField
          label={isUrdu ? 'کاپی رائٹ کی تحریر (footerCopy)' : 'Copyright Notice'}
          valueEn={formData.footerCopy}
          valueUr={formData.footerCopyUr}
          onChange={(en, ur) => {
            setFormData(prev => ({ ...prev, footerCopy: en, footerCopyUr: ur }));
            setIsDirty(true);
          }}
          placeholder="e.g. © 2025 Araain Welfare Association Bannu. All rights reserved."
          isUrdu={isUrdu}
        />
      </div>

      {/* 2. Social Media Links */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
        <h4 className="text-xs font-bold text-[#16232F] uppercase tracking-wider pb-2 border-b border-slate-100">
          {isUrdu ? '2. سوشل میڈیا نیٹ ورکس اور واٹس ایپ گروپ' : '2. Official Social Channels'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Facebook Official Page</span>
            </label>
            <input
              type="url"
              value={formData.socialFacebook}
              onChange={(e) => updateField('socialFacebook', e.target.value)}
              placeholder="https://facebook.com/araainbannu"
              className="app-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-sky-500" />
              <span>X / Twitter Handle</span>
            </label>
            <input
              type="url"
              value={formData.socialTwitter}
              onChange={(e) => updateField('socialTwitter', e.target.value)}
              placeholder="https://x.com/araainbannu"
              className="app-input text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Direct / Channel Number</span>
            </label>
            <input
              type="text"
              value={formData.socialWhatsapp}
              onChange={(e) => updateField('socialWhatsapp', e.target.value)}
              placeholder="+923319051410"
              className="app-input font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Official Group Invite Link</span>
            </label>
            <input
              type="url"
              value={formData.socialWhatsappGroup}
              onChange={(e) => updateField('socialWhatsappGroup', e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="app-input text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-pink-600" />
            <span>Instagram Profile URL</span>
          </label>
          <input
            type="url"
            value={formData.socialInstagram}
            onChange={(e) => updateField('socialInstagram', e.target.value)}
            placeholder="https://instagram.com/araainbannu"
            className="app-input text-xs"
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
            footerDesc: settings.footerDesc || '',
            footerDescUr: settings.footerDescUr || '',
            footerCopy: settings.footerCopy || '',
            footerCopyUr: settings.footerCopyUr || '',
            socialFacebook: settings.socialFacebook || '',
            socialTwitter: settings.socialTwitter || '',
            socialWhatsapp: settings.socialWhatsapp || '',
            socialWhatsappGroup: settings.socialWhatsappGroup || '',
            socialInstagram: settings.socialInstagram || '',
          });
          setIsDirty(false);
        }}
      />
    </div>
  );
};
