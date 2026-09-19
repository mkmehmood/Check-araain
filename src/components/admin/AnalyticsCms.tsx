import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types';
import { SaveBar } from './SaveBar';
import { pushSettingsDocToCloud } from '../../services/firebase';
import { BarChart3, Code2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

interface AnalyticsCmsProps {
  settings: SiteSettings;
  onSaved: (patch: Partial<SiteSettings>) => void;
  isUrdu: boolean;
}

export const AnalyticsCms: React.FC<AnalyticsCmsProps> = ({
  settings,
  onSaved,
  isUrdu,
}) => {
  const [formData, setFormData] = useState({
    gaTrackingId: settings.gaTrackingId || '',
    customHeadScript: settings.customHeadScript || '',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      gaTrackingId: settings.gaTrackingId || '',
      customHeadScript: settings.customHeadScript || '',
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
      const payload = {
        ...settings,
        ...formData,
      };
      await pushSettingsDocToCloud('misc', payload);
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
            <BarChart3 className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
              Firestore: siteConfig/misc
            </span>
            <h3 className="text-lg font-bold text-[#16232F] mt-0.5">
              {isUrdu ? 'اینالیٹکس اور کسٹم اسکرپٹس' : 'Analytics & Custom Head Scripts'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'گوگل اینالیٹکس 4 میژرمینٹ آئی ڈی اور ویب سائٹ کے ہیڈر اسکرپٹس'
                : 'Configure Google Analytics 4 (G-XXXXX), Meta Pixel, or custom verification code.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-[#AD7A28]" />
            <span>Google Analytics 4 Measurement ID</span>
          </label>
          <input
            type="text"
            value={formData.gaTrackingId}
            onChange={(e) => updateField('gaTrackingId', e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="app-input font-mono text-sm max-w-md uppercase"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            {isUrdu
              ? 'گوگل اینالیٹکس پراپرٹی کا میژرمینٹ آئی ڈی (مثال کے طور پر G-ABC12345)'
              : 'Traffic and visitor tracking code from Google Analytics 4.'}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-[#AD7A28]" />
            <span>{isUrdu ? 'کسٹم ہیڈ اسکرپٹ یا میٹا ٹیگز' : 'Custom <head> Injection Script / Meta Tags'}</span>
          </label>
          <textarea
            rows={5}
            value={formData.customHeadScript}
            onChange={(e) => updateField('customHeadScript', e.target.value)}
            placeholder="<!-- Add custom tracking or verification tags here -->"
            className="app-input font-mono text-xs bg-slate-900 text-amber-300 border-slate-700 placeholder:text-slate-600"
          />
          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 mt-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              {isUrdu
                ? 'احتیاط: غیر تصدیق شدہ اسکرپٹس نہ لگائیں تاکہ ویب سائٹ کی سیکیورٹی متاثر نہ ہو۔'
                : 'Caution: Only insert trusted verification scripts or pixels.'}
            </span>
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
            gaTrackingId: settings.gaTrackingId || '',
            customHeadScript: settings.customHeadScript || '',
          });
          setIsDirty(false);
        }}
      />
    </div>
  );
};
