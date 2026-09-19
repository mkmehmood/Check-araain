import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types';
import { ImageUploadField } from './ImageUploadField';
import { BilingualField } from './BilingualField';
import { SaveBar } from './SaveBar';
import { pushSettingsDocToCloud, compressImage } from '../../services/firebase';
import { 
  Sparkles, 
  Layers, 
  ImageIcon, 
  Plus, 
  Trash2, 
  Eye, 
  Clock, 
  Sliders,
  Megaphone,
  BarChart3,
  ExternalLink,
  Upload
} from 'lucide-react';

interface HeroCmsProps {
  settings: SiteSettings;
  onSaved: (patch: Partial<SiteSettings>) => void;
  isUrdu: boolean;
}

export const HeroCms: React.FC<HeroCmsProps> = ({
  settings,
  onSaved,
  isUrdu,
}) => {
  const [formData, setFormData] = useState({
    // 1. Hero Badge
    heroBadge: settings.heroBadge || '',
    // 2. Primary Hero Title
    heroTitle: settings.heroTitle || '',
    // 3. Hero Subtitle Description
    heroSub: settings.heroSub || '',
    // 4. Hero Tagline
    heroTagline: settings.heroTagline || '',
    // 5. Upload photos for hero background
    heroImage: settings.heroImage || '',
    heroImages: settings.heroImages || (settings.heroImage ? [settings.heroImage] : []),
    heroSlideDuration: Number(settings.heroSlideDuration) || 5,
    // 6. Floating Notice Badge with floating action button
    heroNoticeBadge: settings.heroNoticeBadge || '',
    heroNoticeText: settings.heroNoticeText || '',
    heroNoticeTextUr: settings.heroNoticeTextUr || '',
    heroNoticeImage: settings.heroNoticeImage || '',
    heroNoticeButtonText: (settings as any).heroNoticeButtonText || 'View Details',
    heroNoticeButtonLink: (settings as any).heroNoticeButtonLink || '#announcement',
    // 7. Impact Counters
    statMembers: settings.statMembers || '2500+',
    statPrograms: settings.statPrograms || '15+',
    statCities: settings.statCities || '10+',
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      heroBadge: settings.heroBadge || '',
      heroTitle: settings.heroTitle || '',
      heroSub: settings.heroSub || '',
      heroTagline: settings.heroTagline || '',
      heroImage: settings.heroImage || '',
      heroImages: settings.heroImages || (settings.heroImage ? [settings.heroImage] : []),
      heroSlideDuration: Number(settings.heroSlideDuration) || 5,
      heroNoticeBadge: settings.heroNoticeBadge || '',
      heroNoticeText: settings.heroNoticeText || '',
      heroNoticeTextUr: settings.heroNoticeTextUr || '',
      heroNoticeImage: settings.heroNoticeImage || '',
      heroNoticeButtonText: (settings as any).heroNoticeButtonText || 'View Details',
      heroNoticeButtonLink: (settings as any).heroNoticeButtonLink || '#announcement',
      statMembers: settings.statMembers || '2500+',
      statPrograms: settings.statPrograms || '15+',
      statCities: settings.statCities || '10+',
    });
    setIsDirty(false);
  }, [settings]);

  const updateField = (key: string, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
    setIsDirty(true);
  };

  const handleAddHeroImage = (imgUrl: string) => {
    if (!imgUrl.trim()) return;
    const currentList = formData.heroImages || [];
    const nextList = [...currentList, imgUrl.trim()];
    setFormData(prev => ({
      ...prev,
      heroImages: nextList,
      heroImage: nextList[0] || '',
    }));
    setNewImageUrl('');
    setIsDirty(true);
  };

  const handleRemoveHeroImage = (index: number) => {
    const nextList = (formData.heroImages || []).filter((_, idx) => idx !== index);
    setFormData(prev => ({
      ...prev,
      heroImages: nextList,
      heroImage: nextList[0] || '',
    }));
    setIsDirty(true);
  };

  const handleBatchImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingBatch(true);
    const uploadedDataUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressedBase64 = await compressImage(file, 1600, 0.85);
        uploadedDataUrls.push(compressedBase64);
      } catch (err) {
        console.error('Failed to process image:', file.name, err);
      }
    }

    if (uploadedDataUrls.length > 0) {
      const currentList = formData.heroImages || [];
      const updatedList = [...currentList, ...uploadedDataUrls];
      setFormData(prev => ({
        ...prev,
        heroImages: updatedList,
        heroImage: updatedList[0] || '',
      }));
      setIsDirty(true);
    }
    setIsProcessingBatch(false);
    e.target.value = '';
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg(isUrdu ? 'محفوظ کیا جا رہا ہے...' : 'Saving to Firestore...');
    try {
      const heroDocPatch = {
        heroBadge: formData.heroBadge,
        heroTitle: formData.heroTitle,
        heroSub: formData.heroSub,
        heroTagline: formData.heroTagline,
        heroImage: formData.heroImages[0] || formData.heroImage || '',
        heroImages: formData.heroImages,
        heroSlideDuration: Number(formData.heroSlideDuration) || 5,
        heroNoticeBadge: formData.heroNoticeBadge,
        heroNoticeText: formData.heroNoticeText,
        heroNoticeTextUr: formData.heroNoticeTextUr,
        heroNoticeImage: formData.heroNoticeImage,
        heroNoticeButtonText: formData.heroNoticeButtonText,
        heroNoticeButtonLink: formData.heroNoticeButtonLink,
      };

      const aboutCountersPatch = {
        statMembers: formData.statMembers,
        statPrograms: formData.statPrograms,
        statCities: formData.statCities,
      };

      await Promise.all([
        pushSettingsDocToCloud('hero', heroDocPatch),
        pushSettingsDocToCloud('about', aboutCountersPatch),
      ]);

      onSaved({ ...heroDocPatch, ...aboutCountersPatch });
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
            <ImageIcon className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
              Hero Section Manager
            </span>
            <h3 className="text-lg font-bold text-[#16232F] mt-0.5">
              {isUrdu ? '. ہیرو سیکشن کا انتظام' : '. Hero Section Content'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'بیج، عنوان، ذیلی تفصیل، سلوگن، بیک گراؤنڈ سلائیڈ شو، تیرتا ہوا نوٹس اور اعداد و شمار'
                : 'Configure badge, title, subtitle, tagline, background photos, floating notice, and impact counters.'}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Hero Badge */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-6 h-6 rounded-full bg-[#16232F] text-amber-400 flex items-center justify-center font-bold text-xs">
            1
          </span>
          <h4 className="text-sm font-bold text-[#16232F]">
            {isUrdu ? 'ہیرو بیج (Hero Badge)' : '1. Hero Badge'}
          </h4>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isUrdu ? 'ہیرو کے اوپر نمایاں چھوٹا بیج' : 'Eyebrow / Pill Badge Label'}
          </label>
          <input
            type="text"
            value={formData.heroBadge}
            onChange={(e) => updateField('heroBadge', e.target.value)}
            placeholder="e.g. باضابطہ فلاحی و سماجی پلیٹ فارم / OFFICIAL WELFARE PORTAL"
            className="app-input text-xs font-bold text-[#AD7A28]"
          />
        </div>
      </div>

      {/* 2. Primary Hero Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-6 h-6 rounded-full bg-[#16232F] text-amber-400 flex items-center justify-center font-bold text-xs">
            2
          </span>
          <h4 className="text-sm font-bold text-[#16232F]">
            {isUrdu ? 'مرکزی ہیرو عنوان (Primary Hero Title)' : '2. Primary Hero Title'}
          </h4>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isUrdu ? 'مرکزی بڑا عنوان' : 'Primary Big Headline'}
          </label>
          <input
            type="text"
            value={formData.heroTitle}
            onChange={(e) => updateField('heroTitle', e.target.value)}
            placeholder="e.g. آرائیں قوم بنوں: اتحاد، تعلیم، فلاح و خدمت"
            className="app-input font-black text-base text-[#16232F]"
          />
        </div>
      </div>

      {/* 3. Hero Subtitle Description */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-6 h-6 rounded-full bg-[#16232F] text-amber-400 flex items-center justify-center font-bold text-xs">
            3
          </span>
          <h4 className="text-sm font-bold text-[#16232F]">
            {isUrdu ? 'ذیلی تفصیل (Hero Subtitle Description)' : '3. Hero Subtitle Description'}
          </h4>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isUrdu ? 'تفصیلی تعارفی پیراگراف' : 'Lead Introductory Description Paragraph'}
          </label>
          <textarea
            rows={3}
            value={formData.heroSub}
            onChange={(e) => updateField('heroSub', e.target.value)}
            placeholder="e.g. ضلع بنوں اور گردونواح میں بسنے والی آرائیں برادری کے حقوق کا تحفظ، ناداروں کی کفالت..."
            className="app-input text-xs leading-relaxed"
          />
        </div>
      </div>

      {/* 4. Hero Tagline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-6 h-6 rounded-full bg-[#16232F] text-amber-400 flex items-center justify-center font-bold text-xs">
            4
          </span>
          <h4 className="text-sm font-bold text-[#16232F]">
            {isUrdu ? 'ہیرو سلوگن (Hero Tagline)' : '4. Hero Tagline'}
          </h4>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isUrdu ? 'مختصر موٹو یا سلوگن' : 'Punchy Motto / Tagline'}
          </label>
          <input
            type="text"
            value={formData.heroTagline}
            onChange={(e) => updateField('heroTagline', e.target.value)}
            placeholder="e.g. خدمتِ خلق ہمارا نصب العین، تعلیم و ترقی ہمارا مقصد"
            className="app-input text-xs font-medium text-slate-700"
          />
        </div>
      </div>

      {/* 5. Upload photos for hero background */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#16232F] text-amber-400 flex items-center justify-center font-bold text-xs">
              5
            </span>
            <h4 className="text-sm font-bold text-[#16232F]">
              {isUrdu ? 'بیک گراؤنڈ تصاویر اپ لوڈ کریں (Upload Photos for Hero Background)' : '5. Upload Photos for Hero Background'}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Slide Interval:</span>
            <select
              value={formData.heroSlideDuration}
              onChange={(e) => updateField('heroSlideDuration', Number(e.target.value))}
              className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold bg-white"
            >
              <option value={4}>4s</option>
              <option value={5}>5s</option>
              <option value={7}>7s</option>
              <option value={10}>10s</option>
            </select>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-slate-200 hover:border-[#AD7A28] rounded-2xl p-6 text-center transition-all bg-slate-50/50">
          <input
            type="file"
            id="hero-multi-upload"
            multiple
            accept="image/*"
            onChange={handleBatchImageUpload}
            className="hidden"
            disabled={isProcessingBatch}
          />
          <label htmlFor="hero-multi-upload" className="cursor-pointer space-y-2 block">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#AD7A28] flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-[#16232F]">
              {isProcessingBatch
                ? (isUrdu ? 'تصاویر کمپریس اور اپ لوڈ کی جا رہی ہیں...' : 'Optimizing and uploading images...')
                : (isUrdu ? 'ہیرو سلائیڈ شو کے لیے تصاویر منتخب کریں' : 'Click to Upload Hero Background Photos')}
            </div>
            <p className="text-[11px] text-slate-400">
              High-resolution landscapes, community events, or banners (Auto-compressed to web standard)
            </p>
          </label>
        </div>

        {/* Image URL manual add */}
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="Or paste direct image URL (https://...)"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            className="app-input text-xs flex-1"
          />
          <button
            type="button"
            onClick={() => handleAddHeroImage(newImageUrl)}
            disabled={!newImageUrl.trim()}
            className="app-btn-secondary text-xs px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Gallery Thumbnails */}
        {formData.heroImages && formData.heroImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {formData.heroImages.map((img, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900">
                <img src={img} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-2">
                  <span className="text-[10px] text-white font-mono bg-black/60 px-1.5 py-0.5 rounded">
                    #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHeroImage(idx)}
                    className="p-1 rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                    title="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Floating Notice Badge with floating action button */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-6 h-6 rounded-full bg-[#16232F] text-amber-400 flex items-center justify-center font-bold text-xs">
            6
          </span>
          <h4 className="text-sm font-bold text-[#16232F]">
            {isUrdu ? 'تیرتا ہوا نوٹس اور ایکشن بٹن' : '6. Floating Notice Badge with Floating Action Button'}
          </h4>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'نوٹس بیج (Notice Badge Label)' : 'Notice Badge Label'}
            </label>
            <input
              type="text"
              value={formData.heroNoticeBadge}
              onChange={(e) => updateField('heroNoticeBadge', e.target.value)}
              placeholder="e.g. فوری اطلاع / URGENT UPDATE"
              className="app-input text-xs font-bold text-[#AD7A28]"
            />
          </div>

          <BilingualField
            label={isUrdu ? 'نوٹس کا متن (Floating Notice Text)' : 'Floating Notice Text'}
            valueEn={formData.heroNoticeText}
            valueUr={formData.heroNoticeTextUr}
            onChangeEn={(val) => updateField('heroNoticeText', val)}
            onChangeUr={(val) => updateField('heroNoticeTextUr', val)}
            multiline={true}
            rows={2}
            placeholderEn="Membership renewal drive for session 2025-2026 is currently active..."
            placeholderUr="آرائیں بنوں ممبرشپ مہم 2025-2026 کا باضابطہ آغاز ہو چکا ہے..."
            isUrdu={isUrdu}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'فلوٹنگ ایکشن بٹن کا متن' : 'Floating Action Button Text'}
              </label>
              <input
                type="text"
                value={formData.heroNoticeButtonText}
                onChange={(e) => updateField('heroNoticeButtonText', e.target.value)}
                placeholder="e.g. View Details / کارڈ حاصل کریں"
                className="app-input text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'ایکشن ٹارگٹ / لنک' : 'Action Target / Link'}
              </label>
              <input
                type="text"
                value={formData.heroNoticeButtonLink}
                onChange={(e) => updateField('heroNoticeButtonLink', e.target.value)}
                placeholder="#membership, #donation or https://..."
                className="app-input text-xs font-mono"
              />
            </div>
          </div>

          <ImageUploadField
            label={isUrdu ? 'نوٹس کے ساتھ منسلک نمایاں تصویر (اختیاری)' : 'Floating Notice Highlight Image (Optional)'}
            value={formData.heroNoticeImage}
            onChange={(val) => updateField('heroNoticeImage', val)}
            aspectRatio="banner"
            maxWidth={800}
            quality={0.85}
            isUrdu={isUrdu}
          />
        </div>
      </div>

      {/* 7. Impact Counters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-6 h-6 rounded-full bg-[#16232F] text-amber-400 flex items-center justify-center font-bold text-xs">
            7
          </span>
          <h4 className="text-sm font-bold text-[#16232F]">
            {isUrdu ? 'ہیرو امپیکٹ کاؤنٹرز (Impact Counters)' : '7. Impact Counters'}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'رجسٹرڈ اراکین کی تعداد' : 'Registered Members Count'}
            </label>
            <input
              type="text"
              value={formData.statMembers}
              onChange={(e) => updateField('statMembers', e.target.value)}
              placeholder="e.g. 2,500+"
              className="app-input font-bold text-[#AD7A28]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'فلاحی پروگرامز کی تعداد' : 'Welfare Programs Count'}
            </label>
            <input
              type="text"
              value={formData.statPrograms}
              onChange={(e) => updateField('statPrograms', e.target.value)}
              placeholder="e.g. 15+"
              className="app-input font-bold text-[#AD7A28]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isUrdu ? 'فعال شاخیں / شہر' : 'Active Branches / Regions'}
            </label>
            <input
              type="text"
              value={formData.statCities}
              onChange={(e) => updateField('statCities', e.target.value)}
              placeholder="e.g. 10+"
              className="app-input font-bold text-[#AD7A28]"
            />
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
            heroBadge: settings.heroBadge || '',
            heroTitle: settings.heroTitle || '',
            heroSub: settings.heroSub || '',
            heroTagline: settings.heroTagline || '',
            heroImage: settings.heroImage || '',
            heroImages: settings.heroImages || (settings.heroImage ? [settings.heroImage] : []),
            heroSlideDuration: Number(settings.heroSlideDuration) || 5,
            heroNoticeBadge: settings.heroNoticeBadge || '',
            heroNoticeText: settings.heroNoticeText || '',
            heroNoticeTextUr: settings.heroNoticeTextUr || '',
            heroNoticeImage: settings.heroNoticeImage || '',
            heroNoticeButtonText: (settings as any).heroNoticeButtonText || 'View Details',
            heroNoticeButtonLink: (settings as any).heroNoticeButtonLink || '#announcement',
            statMembers: settings.statMembers || '2500+',
            statPrograms: settings.statPrograms || '15+',
            statCities: settings.statCities || '10+',
          });
          setIsDirty(false);
        }}
      />
    </div>
  );
};
