import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types';
import { SingleField } from './SingleField';
import { SaveBar } from './SaveBar';
import { pushSettingsDocToCloud } from '../../services/firebase';
import { UserCheck, Heart, Sparkles, HandCoins } from 'lucide-react';

interface CtaCmsProps {
  settings: SiteSettings;
  onSaved: (patch: Partial<SiteSettings>) => void;
  isUrdu: boolean;
}

export const CtaCms: React.FC<CtaCmsProps> = ({
  settings,
  onSaved,
  isUrdu,
}) => {
  const [formData, setFormData] = useState({
    membershipTitle: settings.membershipTitle || '',
    membershipDesc: settings.membershipDesc || '',
    ctaMembershipBtn: settings.ctaMembershipBtn || '',
    donateTitle: settings.donateTitle || '',
    donateDesc: settings.donateDesc || '',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      membershipTitle: settings.membershipTitle || '',
      membershipDesc: settings.membershipDesc || '',
      ctaMembershipBtn: settings.ctaMembershipBtn || '',
      donateTitle: settings.donateTitle || '',
      donateDesc: settings.donateDesc || '',
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
      // Merge with existing sections doc
      const payload = {
        ...settings,
        ...formData,
      };
      await pushSettingsDocToCloud('sections', payload);
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
            <UserCheck className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
              Firestore: siteConfig/sections
            </span>
            <h3 className="text-lg font-bold text-[#16232F] mt-0.5">
              {isUrdu ? 'ممبرشپ اور عطیات کال ٹو ایکشن' : 'Membership & Donation CTAs'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'رکنیت حاصل کرنے اور عطیات دینے کے بینرز کا متن اور بٹن کی ترتیبات'
                : 'Manage call-to-action cards, invitation titles, button labels, and donation banners.'}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Membership CTA */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <UserCheck className="w-4 h-4 text-[#AD7A28]" />
          <h4 className="text-xs font-bold text-[#16232F] uppercase tracking-wider">
            {isUrdu ? '1. ممبرشپ دعوتی بینر (Membership CTA)' : '1. Membership Invitation Banner'}
          </h4>
        </div>

        <SingleField
          label={isUrdu ? 'دعوتی عنوان (Title)' : 'Invitation Title'}
          value={formData.membershipTitle}
          onChange={(val) => {
            setFormData(prev => ({ ...prev, membershipTitle: val }));
            setIsDirty(true);
          }}
          placeholder="e.g. Join the Araain Bannu Welfare Movement"
          isUrdu={isUrdu}
        />

        <SingleField
          label={isUrdu ? 'تفصیلی پیغام (Description)' : 'Invitation Message'}
          value={formData.membershipDesc}
          onChange={(val) => {
            setFormData(prev => ({ ...prev, membershipDesc: val }));
            setIsDirty(true);
          }}
          multiline={true}
          rows={3}
          placeholder="Enter the invitation description for community members..."
          isUrdu={isUrdu}
        />

        <SingleField
          label={isUrdu ? 'بٹن کا متن (Button Label)' : 'Action Button Text'}
          value={formData.ctaMembershipBtn}
          onChange={(val) => {
            setFormData(prev => ({ ...prev, ctaMembershipBtn: val }));
            setIsDirty(true);
          }}
          placeholder="e.g. Register as Official Member"
          isUrdu={isUrdu}
        />
      </div>

      {/* 2. Donation CTA */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <HandCoins className="w-4 h-4 text-[#AD7A28]" />
          <h4 className="text-xs font-bold text-[#16232F] uppercase tracking-wider">
            {isUrdu ? '2. عطیات سیکشن کا ہیڈر (Donation CTA Header)' : '2. Donation Section Header'}
          </h4>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {isUrdu ? 'عطیات سیکشن کا عنوان (donateTitle)' : 'Donation Section Title'}
          </label>
          <input
            type="text"
            value={formData.donateTitle}
            onChange={(e) => updateField('donateTitle', e.target.value)}
            placeholder="e.g. تعاون اور عطیات کی شفاف فراہمی"
            className="app-input font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {isUrdu ? 'عطیات سیکشن کی وضاحت (donateDesc)' : 'Donation Section Subtitle / Description'}
          </label>
          <textarea
            rows={3}
            value={formData.donateDesc}
            onChange={(e) => updateField('donateDesc', e.target.value)}
            placeholder="e.g. آپ کا دیا ہوا ہر ایک روپیہ حقدار اور مستحق خاندانوں تک باحفاظت پہنچایا جاتا ہے۔"
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
            membershipTitle: settings.membershipTitle || '',
            membershipDesc: settings.membershipDesc || '',
            ctaMembershipBtn: settings.ctaMembershipBtn || '',
            donateTitle: settings.donateTitle || '',
            donateDesc: settings.donateDesc || '',
          });
          setIsDirty(false);
        }}
      />
    </div>
  );
};
