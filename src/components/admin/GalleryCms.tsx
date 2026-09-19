import React, { useState, useEffect } from 'react';
import { GalleryItem, SiteSettings } from '../../types';
import { BilingualField } from './BilingualField';
import { ImageUploadField } from './ImageUploadField';
import { RepeatableListEditor } from './RepeatableListEditor';
import { SaveBar } from './SaveBar';
import { pushGalleryToCloud, pushSettingsDocToCloud, compressImage } from '../../services/firebase';
import { 
  ImageIcon, 
  Upload, 
  Sparkles, 
  Trash2, 
  Layers,
  Plus
} from 'lucide-react';

interface GalleryCmsProps {
  gallery: GalleryItem[];
  settings: SiteSettings;
  onGallerySaved: (gallery: GalleryItem[]) => void;
  onSettingsSaved: (patch: Partial<SiteSettings>) => void;
  isUrdu: boolean;
}

export const GalleryCms: React.FC<GalleryCmsProps> = ({
  gallery,
  settings,
  onGallerySaved,
  onSettingsSaved,
  isUrdu,
}) => {
  const [items, setItems] = useState<GalleryItem[]>(gallery);
  const [headers, setHeaders] = useState({
    galleryTitle: settings.galleryTitle || '',
    galleryDesc: settings.galleryDesc || '',
  });
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setItems(gallery);
    setHeaders({
      galleryTitle: settings.galleryTitle || '',
      galleryDesc: settings.galleryDesc || '',
    });
    setIsDirty(false);
  }, [gallery, settings]);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg(isUrdu ? 'محفوظ کیا جا رہا ہے...' : 'Saving to Firestore...');
    try {
      // 1. Full replace of siteConfig/gallery
      await pushGalleryToCloud(items);
      onGallerySaved(items);

      // 2. Update siteConfig/sections
      await pushSettingsDocToCloud('sections', {
        ...settings,
        galleryTitle: headers.galleryTitle,
        galleryDesc: headers.galleryDesc,
      });
      onSettingsSaved(headers);

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

  const handleUploadBatch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsProcessingBatch(true);
      const newItems: GalleryItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const b64 = await compressImage(file, 1400, 0.85);
        const name = file.name.replace(/\.[^/.]+$/, "");
        newItems.push({
          id: `gal_${Date.now()}_${i}`,
          data_url: b64,
          image: b64,
          caption: name,
          captionUr: name,
          sort_order: items.length + i + 1,
        });
      }
      setItems(prev => [...prev, ...newItems]);
      setIsDirty(true);
    } catch (err) {
      console.error('Batch upload error:', err);
    } finally {
      setIsProcessingBatch(false);
      e.target.value = '';
    }
  };

  const createNewItem = (): GalleryItem => ({
    id: `gal_${Date.now()}`,
    data_url: '',
    image: '',
    caption: isUrdu ? 'کمیونٹی تقریب کی یادگار تصویر' : 'Community Event Memory',
    captionUr: 'کمیونٹی تقریب کی یادگار تصویر',
    sort_order: items.length + 1,
  });

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-[#AD7A28]">
              <ImageIcon className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
                Firestore: siteConfig/gallery & siteConfig/sections
              </span>
              <h3 className="text-lg font-bold text-[#16232F] mt-0.5">
                {isUrdu ? 'فوٹو گیلری اور تاریخی یادگاریں' : 'Photo Gallery & Memories'}
              </h3>
              <p className="text-xs text-slate-500">
                {isUrdu
                  ? 'برادری کی تقریبات، خدمات، منصوبوں اور تاریخی لمحات کی تصاویر'
                  : 'Manage photo album, high-res pictures, captions in Urdu/English, and display ordering.'}
              </p>
            </div>
          </div>

          {/* Batch Upload Button */}
          <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#AD7A28] hover:bg-[#8C601A] text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shadow-xs">
            <Upload className="w-3.5 h-3.5" />
            <span>
              {isProcessingBatch 
                ? (isUrdu ? 'پروسیسنگ...' : 'Processing...') 
                : (isUrdu ? 'ایک ساتھ کئی تصاویر اپلوڈ کریں' : 'Batch Upload Photos')}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleUploadBatch}
              className="hidden"
              disabled={isProcessingBatch}
            />
          </label>
        </div>
      </div>

      {/* Section Headings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <h4 className="text-xs font-bold text-[#16232F] uppercase tracking-wider">
          {isUrdu ? 'گیلری سیکشن کے عنوانات' : 'Gallery Section Headings'}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isUrdu ? 'گیلری کا عنوان (galleryTitle)' : 'Gallery Main Title'}
            </label>
            <input
              type="text"
              value={headers.galleryTitle}
              onChange={(e) => {
                setHeaders(prev => ({ ...prev, galleryTitle: e.target.value }));
                setIsDirty(true);
              }}
              placeholder="e.g. تصویری جھلکیاں اور تاریخی یادگاریں"
              className="app-input font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isUrdu ? 'گیلری کی تفصیل (galleryDesc)' : 'Gallery Subtitle / Description'}
            </label>
            <input
              type="text"
              value={headers.galleryDesc}
              onChange={(e) => {
                setHeaders(prev => ({ ...prev, galleryDesc: e.target.value }));
                setIsDirty(true);
              }}
              placeholder="e.g. فلاحی اقدامات، تقریبات اور کمیونٹی سرگرمیوں کے چند یادگار لمحات"
              className="app-input"
            />
          </div>
        </div>
      </div>

      {/* Repeatable List of Gallery Photos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <RepeatableListEditor<GalleryItem>
          items={items}
          onChange={(newItems) => {
            setItems(newItems);
            setIsDirty(true);
          }}
          createNewItem={createNewItem}
          addButtonLabel={isUrdu ? 'ایک نئی تصویر شامل کریں' : 'Add Single Photo'}
          emptyMessage={isUrdu ? 'گیلری میں کوئی تصویر موجود نہیں۔' : 'No gallery photos added yet.'}
          itemTitle={(gal) => gal.caption || gal.captionUr || 'Untitled Photo'}
          itemBadge={(gal) => (
            (gal.data_url || gal.image) ? (
              <img
                src={gal.data_url || gal.image}
                alt=""
                className="w-7 h-7 rounded-md object-cover border border-slate-200"
              />
            ) : null
          )}
          isUrdu={isUrdu}
          renderItem={(gal, index, updateGal) => (
            <div className="space-y-5">
              <ImageUploadField
                label={isUrdu ? 'تصویر منتخب کریں یا تبدیل کریں' : 'Photo'}
                value={gal.data_url || gal.image || ''}
                onChange={(val) => updateGal({ data_url: val, image: val })}
                aspectRatio="banner"
                maxWidth={1400}
                quality={0.85}
                isUrdu={isUrdu}
              />

              <BilingualField
                label={isUrdu ? 'تصویر کا کیپشن / وضاحت' : 'Photo Caption / Title'}
                valueEn={gal.caption}
                valueUr={gal.captionUr}
                onChange={(en, ur) => updateGal({ caption: en, captionUr: ur })}
                placeholder="e.g. Annual Youth Convention 2025"
                isUrdu={isUrdu}
              />
            </div>
          )}
        />
      </div>

      <SaveBar
        onSave={handleSave}
        isDirty={isDirty}
        isSaving={isSaving}
        lastSaved={lastSaved}
        statusMessage={statusMsg}
        isUrdu={isUrdu}
        onReset={() => {
          setItems(gallery);
          setHeaders({
            galleryTitle: settings.galleryTitle || '',
            galleryDesc: settings.galleryDesc || '',
          });
          setIsDirty(false);
        }}
      />
    </div>
  );
};
