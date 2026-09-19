import React, { useState, useEffect } from 'react';
import { SiteSettings, Leader } from '../../types';
import { SaveBar } from './SaveBar';
import { pushSettingsDocToCloud } from '../../services/firebase';
import { 
  Info, 
  Quote, 
  CheckCircle2, 
  ExternalLink,
  Users,
  Award,
  MapPin,
  Eye
} from 'lucide-react';

interface AboutCmsProps {
  settings: SiteSettings;
  leaders: Leader[];
  onSaved: (patch: Partial<SiteSettings>) => void;
  onNavigateToLeadership?: () => void;
  isUrdu: boolean;
}

export const AboutCms: React.FC<AboutCmsProps> = ({
  settings,
  leaders,
  onSaved,
  onNavigateToLeadership,
  isUrdu,
}) => {
  const [formData, setFormData] = useState({
    aboutTitle: settings.aboutTitle || '',
    aboutSubtitle: settings.aboutSubtitle || '',
    aboutP1: settings.aboutP1 || '',
    aboutP2: settings.aboutP2 || '',
    aboutP3: settings.aboutP3 || '',
    statMembers: settings.statMembers || '50',
    statPrograms: settings.statPrograms || '8',
    statCities: settings.statCities || '30+',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      aboutTitle: settings.aboutTitle || '',
      aboutSubtitle: settings.aboutSubtitle || '',
      aboutP1: settings.aboutP1 || '',
      aboutP2: settings.aboutP2 || '',
      aboutP3: settings.aboutP3 || '',
      statMembers: settings.statMembers || '50',
      statPrograms: settings.statPrograms || '8',
      statCities: settings.statCities || '30+',
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
      // Full replacement of siteConfig/about - chairman* fields are permanently omitted!
      await pushSettingsDocToCloud('about', formData);
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

  // Pinned leader quote preview
  const pinnedLeader = leaders.find(l => l.pinnedForAbout) ?? leaders.find(l => Boolean(l.featured)) ?? leaders[0];

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-[#AD7A28]">
            <Info className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
              Firestore: siteConfig/about
            </span>
            <h3 className="text-lg font-bold text-[#16232F] mt-0.5">
              {isUrdu ? 'ہمارا تعارف سیکشن (About Us)' : 'About Us / Narrative'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'تنظیمی تعارف کے پیراگراف، کاؤنٹرز اور تعارفی عنوانات'
                : 'Manage organization story, narrative paragraphs, impact metrics, and leadership message link.'}
            </p>
          </div>
        </div>
      </div>

      {/* Leadership Quote Pin Info Callout */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#16232F] text-amber-300 shrink-0">
            <Quote className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">
              {isUrdu ? 'چیئرمین / قائدانہ پیغام کا کارڈ' : 'Chairman / Leadership Quote Card'}
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {isUrdu
                ? `تعارف سیکشن میں نظر آنے والا پیغام قیادت ٹیب میں منتخب کردہ لیڈر سے آتا ہے: ${pinnedLeader?.name || 'کوئی منتخب نہیں'}`
                : `The quote card on the About section is linked directly to your Leadership directory: ${pinnedLeader ? pinnedLeader.name : 'None pinned'}.`}
            </p>
          </div>
        </div>

        {onNavigateToLeadership && (
          <button
            type="button"
            onClick={onNavigateToLeadership}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16232F] hover:bg-[#223546] text-amber-300 text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <span>{isUrdu ? 'قیادت کا انتظام کریں' : 'Manage in Leadership'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-6">
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-[#16232F] uppercase tracking-wider">
            {isUrdu ? '1. تعارفی عنوانات' : '1. Section Headings'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isUrdu ? 'سیکشن کا مرکزی عنوان (aboutTitle)' : 'Section Main Title'}
              </label>
              <input
                type="text"
                value={formData.aboutTitle}
                onChange={(e) => updateField('aboutTitle', e.target.value)}
                placeholder="e.g. آرائیں بنوں"
                className="app-input font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isUrdu ? 'ذیلی عنوان (aboutSubtitle)' : 'Section Subtitle'}
              </label>
              <input
                type="text"
                value={formData.aboutSubtitle}
                onChange={(e) => updateField('aboutSubtitle', e.target.value)}
                placeholder="e.g. دنیا بھر میں آرائیں برادری کی ترقی کے لیے کوشاں"
                className="app-input"
              />
            </div>
          </div>
        </div>

        {/* Narrative Paragraphs */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h4 className="text-xs font-bold text-[#16232F] uppercase tracking-wider">
            {isUrdu ? '2. تعارفی پیراگراف (3 پیراگراف)' : '2. Narrative Paragraphs (3 Blocks)'}
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isUrdu ? 'پہلا پیراگراف (aboutP1)' : 'Paragraph 1 (Core Identity)'}
            </label>
            <textarea
              rows={3}
              value={formData.aboutP1}
              onChange={(e) => updateField('aboutP1', e.target.value)}
              placeholder="Enter first paragraph text..."
              className="app-input text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isUrdu ? 'دوسرا پیراگراف (aboutP2)' : 'Paragraph 2 (Initiatives & Vision)'}
            </label>
            <textarea
              rows={3}
              value={formData.aboutP2}
              onChange={(e) => updateField('aboutP2', e.target.value)}
              placeholder="Enter second paragraph text..."
              className="app-input text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isUrdu ? 'تیسرا پیراگراف (aboutP3)' : 'Paragraph 3 (Local Community & Bannu Chapter)'}
            </label>
            <textarea
              rows={3}
              value={formData.aboutP3}
              onChange={(e) => updateField('aboutP3', e.target.value)}
              placeholder="Enter third paragraph text..."
              className="app-input text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Impact Counters */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h4 className="text-xs font-bold text-[#16232F] uppercase tracking-wider">
            {isUrdu ? '3. شماریاتی کاؤنٹرز (Impact Stats)' : '3. Impact Counters'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#AD7A28]" />
                <span>{isUrdu ? 'اراکین کی تعداد' : 'Members Count (statMembers)'}</span>
              </label>
              <input
                type="text"
                value={formData.statMembers}
                onChange={(e) => updateField('statMembers', e.target.value)}
                placeholder="e.g. 50"
                className="app-input font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#AD7A28]" />
                <span>{isUrdu ? 'پروگرامز کی تعداد' : 'Active Programs (statPrograms)'}</span>
              </label>
              <input
                type="text"
                value={formData.statPrograms}
                onChange={(e) => updateField('statPrograms', e.target.value)}
                placeholder="e.g. 8"
                className="app-input font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#AD7A28]" />
                <span>{isUrdu ? 'شہروں کی تعداد' : 'Cities / Regions (statCities)'}</span>
              </label>
              <input
                type="text"
                value={formData.statCities}
                onChange={(e) => updateField('statCities', e.target.value)}
                placeholder="e.g. 30+"
                className="app-input font-bold"
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
            aboutTitle: settings.aboutTitle || '',
            aboutSubtitle: settings.aboutSubtitle || '',
            aboutP1: settings.aboutP1 || '',
            aboutP2: settings.aboutP2 || '',
            aboutP3: settings.aboutP3 || '',
            statMembers: settings.statMembers || '50',
            statPrograms: settings.statPrograms || '8',
            statCities: settings.statCities || '30+',
          });
          setIsDirty(false);
        }}
      />
    </div>
  );
};
