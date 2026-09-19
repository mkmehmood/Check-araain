import React, { useState, useEffect } from 'react';
import { PageItem } from '../../types';
import { ImageUploadField } from './ImageUploadField';
import { BilingualField } from './BilingualField';
import { RepeatableListEditor } from './RepeatableListEditor';
import { SaveBar } from './SaveBar';
import { pushPagesToCloud } from '../../services/firebase';
import { 
  BookOpen, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  FolderKanban, 
  History, 
  Trees, 
  Images, 
  Building2, 
  Newspaper,
  Layers,
  ArrowRight
} from 'lucide-react';

export type PolicyCategory = 
  | 'all'
  | 'blog'
  | 'history'
  | 'documentation'
  | 'environmental'
  | 'gallery'
  | 'department';

interface PagesCmsProps {
  pages: PageItem[];
  onPagesSaved: (pages: PageItem[]) => void;
  isUrdu: boolean;
  initialCategory?: PolicyCategory;
  onNavigateToGallery?: () => void;
}

export const PagesCms: React.FC<PagesCmsProps> = ({
  pages,
  onPagesSaved,
  isUrdu,
  initialCategory = 'all',
  onNavigateToGallery,
}) => {
  const [items, setItems] = useState<PageItem[]>(pages);
  const [selectedCategory, setSelectedCategory] = useState<PolicyCategory>(initialCategory);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setItems(pages);
    setIsDirty(false);
  }, [pages]);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg(isUrdu ? 'محفوظ کیا جا رہا ہے...' : 'Saving to Firestore...');
    try {
      await pushPagesToCloud(items);
      onPagesSaved(items);
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

  const categories: { id: PolicyCategory; labelEn: string; labelUr: string; icon: any }[] = [
    { id: 'all', labelEn: 'All Documents', labelUr: 'تمام دستاویزات', icon: Layers },
    { id: 'documentation', labelEn: 'Documentation', labelUr: 'سرکاری دستاویزات و آئین', icon: FileText },
    { id: 'history', labelEn: 'Our History', labelUr: 'ہماری تاریخ و پس منظر', icon: History },
    { id: 'blog', labelEn: 'Our Blog', labelUr: 'بلاگ و مضامین', icon: Newspaper },
    { id: 'environmental', labelEn: 'Environmental', labelUr: 'ماحولیاتی مہمات', icon: Trees },
    { id: 'department', labelEn: 'Department', labelUr: 'شعبہ جات و انتظامیہ', icon: Building2 },
    { id: 'gallery', labelEn: 'Town Gallery Info', labelUr: 'ٹاؤن گیلری معلومات', icon: Images },
  ];

  const getPageCategory = (pg: PageItem): PolicyCategory => {
    const slug = (pg.slug || '').toLowerCase();
    const cat = ((pg as any).category || '').toLowerCase();
    if (cat) return cat as PolicyCategory;
    if (slug.includes('blog')) return 'blog';
    if (slug.includes('history') || slug.includes('tarikh')) return 'history';
    if (slug.includes('env') || slug.includes('green') || slug.includes('climate')) return 'environmental';
    if (slug.includes('gallery') || slug.includes('photo')) return 'gallery';
    if (slug.includes('dept') || slug.includes('department') || slug.includes('wing')) return 'department';
    return 'documentation';
  };

  const filteredItems = items.filter(pg => {
    if (selectedCategory === 'all') return true;
    return getPageCategory(pg) === selectedCategory;
  });

  const createNewPage = (): PageItem => {
    const cat = selectedCategory === 'all' ? 'documentation' : selectedCategory;
    const slugId = `${cat}_${Date.now().toString().slice(-5)}`;
    return {
      slug: slugId,
      label: isUrdu ? 'نئی دستاویز' : 'Official Document',
      labelUr: 'نئی دستاویز',
      title: isUrdu ? 'تنظیمی ضوابط و آئین' : 'Organization By-laws & Governance',
      titleUr: 'تنظیمی ضوابط و آئین',
      body: 'Official published document content for community review and governance.',
      bodyUr: 'کمیونٹی کی رہنمائی اور تنظیمی نظم و ضبط کے لیے باضابطہ جاری کردہ دستاویز کا متن۔',
      published: true,
      sort_order: items.length + 1,
      ...({ category: cat } as any)
    };
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-[#AD7A28]">
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
              Information & Policies CMS
            </span>
            <h3 className="text-lg font-bold text-[#16232F] mt-0.5">
              {isUrdu ? '. معلوماتی صفحات، پالیسیز و دستاویزی ریکارڈ' : '. Information & Policies / Documentation'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'ہماری تاریخ، بلاگ، سرکاری دستاویزات، ماحولیاتی مہم اور شعبہ جات کے صفحات کا انتظام'
                : 'Manage Our Blog, Our History, Documentation, Environmental, Town Gallery, and Department pages.'}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            const count = cat.id === 'all' 
              ? items.length 
              : items.filter(i => getPageCategory(i) === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#16232F] text-amber-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#AD7A28]' : 'text-slate-400'}`} />
                <span>{isUrdu ? cat.labelUr : cat.labelEn}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Town Gallery Shortcut Callout if gallery category selected */}
      {selectedCategory === 'gallery' && onNavigateToGallery && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Images className="w-5 h-5 text-[#AD7A28]" />
            <div className="text-xs text-slate-700">
              <span className="font-bold block text-slate-900">
                {isUrdu ? 'فوٹو گیلری اثاثے مینیجر' : 'Town Gallery Photo Assets Manager'}
              </span>
              {isUrdu
                ? 'فوٹو گیلری میں نئی تصاویر، کیپشنز اور کیٹیگریز کا انتظام کرنے کے لیے میڈیا گیلری میں جائیں'
                : 'To upload new photos, albums, and community events images, use the dedicated Town Gallery CMS.'}
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToGallery}
            className="app-btn-primary text-xs shrink-0 flex items-center gap-1.5"
          >
            <span>{isUrdu ? 'گیلری کھولیں' : 'Open Photo Gallery'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Repeatable List of Pages */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-[#16232F]">
              {isUrdu ? 'دستاویزات کی فہرست' : 'Document Records'}
            </h4>
            <span className="text-xs text-slate-400">
              Showing {filteredItems.length} of {items.length} total pages
            </span>
          </div>
        </div>

        <RepeatableListEditor<PageItem>
          items={items}
          onChange={(newItems) => {
            setItems(newItems);
            setIsDirty(true);
          }}
          createNewItem={createNewPage}
          addButtonLabel={
            selectedCategory === 'all'
              ? (isUrdu ? 'نئی دستاویز شامل کریں' : 'Add New Document')
              : `${isUrdu ? 'شامل کریں' : 'Add to'} ${categories.find(c => c.id === selectedCategory)?.labelEn || ''}`
          }
          emptyMessage={isUrdu ? 'کوئی دستاویز شامل نہیں کی گئی۔' : 'No document pages added in this category yet.'}
          itemTitle={(pg) => pg.title || pg.titleUr || pg.label || pg.slug}
          itemBadge={(pg) => (
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-slate-100 text-slate-700 capitalize">
                {getPageCategory(pg)}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                pg.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {pg.published ? 'Published' : 'Draft'}
              </span>
            </div>
          )}
          isUrdu={isUrdu}
          renderItem={(page, index, updatePage) => (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {isUrdu ? 'شعبہ / زمرہ' : 'Section Category'}
                  </label>
                  <select
                    value={getPageCategory(page)}
                    onChange={(e) => updatePage({ ...page, category: e.target.value } as any)}
                    className="app-input text-xs font-semibold"
                  >
                    <option value="documentation">Documentation (آئین و ضوابط)</option>
                    <option value="history">Our History (ہماری تاریخ)</option>
                    <option value="blog">Our Blog (بلاگ و مضامین)</option>
                    <option value="environmental">Environmental (ماحولیات)</option>
                    <option value="department">Department (شعبہ جات)</option>
                    <option value="gallery">Town Gallery (ٹاؤن گیلری)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {isUrdu ? 'یو آر ایل سلگ (URL Slug)' : 'URL Slug (unique identifier)'}
                  </label>
                  <input
                    type="text"
                    value={page.slug}
                    onChange={(e) => updatePage({ ...page, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="e.g. constitution_2025"
                    className="app-input font-mono text-xs"
                  />
                </div>

                <div className="flex items-end gap-3 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(page.published ?? true)}
                      onChange={(e) => updatePage({ ...page, published: e.target.checked })}
                      className="w-4 h-4 rounded text-[#AD7A28] focus:ring-[#AD7A28]"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {page.published ? (isUrdu ? 'شائع شدہ (Published)' : 'Published Live') : (isUrdu ? 'ڈرافٹ (Draft)' : 'Draft')}
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {isUrdu ? 'مختصر لیبل (English Label)' : 'English Nav Label'}
                  </label>
                  <input
                    type="text"
                    value={page.label || ''}
                    onChange={(e) => updatePage({ ...page, label: e.target.value })}
                    placeholder="e.g. Constitution"
                    className="app-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {isUrdu ? 'اردو مختصر لیبل' : 'Urdu Nav Label'}
                  </label>
                  <input
                    type="text"
                    value={page.labelUr || ''}
                    onChange={(e) => updatePage({ ...page, labelUr: e.target.value })}
                    placeholder="e.g. آئین و منشور"
                    className="app-input text-xs"
                  />
                </div>
              </div>

              <BilingualField
                label={isUrdu ? 'دستاویز کا مکمل عنوان' : 'Document Main Title'}
                valueEn={page.title || ''}
                valueUr={page.titleUr || ''}
                onChangeEn={(val) => updatePage({ ...page, title: val })}
                onChangeUr={(val) => updatePage({ ...page, titleUr: val })}
                placeholderEn="e.g. Constitution & Governance By-laws of Araain Bannu"
                placeholderUr="e.g. مرکزی آئین و تنظیمی ضوابط برائے آرائیں بنوں"
                isUrdu={isUrdu}
              />

              <BilingualField
                label={isUrdu ? 'دستاویز کا مکمل مواد (Markdown سپورٹ)' : 'Full Document Content (Markdown Supported)'}
                valueEn={page.body || ''}
                valueUr={page.bodyUr || ''}
                onChangeEn={(val) => updatePage({ ...page, body: val })}
                onChangeUr={(val) => updatePage({ ...page, bodyUr: val })}
                multiline={true}
                rows={8}
                placeholderEn="Enter official document text, clauses, historical notes, or announcements..."
                placeholderUr="سرکاری دستاویز کا مکمل متن، دفعات، تاریخی پس منظر یا پالیسی تحریر فرمائیں..."
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
          setItems(pages);
          setIsDirty(false);
        }}
      />
    </div>
  );
};
