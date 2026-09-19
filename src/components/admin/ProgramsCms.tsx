import React, { useState, useEffect } from 'react';
import { Program, SiteSettings } from '../../types';
import { ImageUploadField } from './ImageUploadField';
import { SingleField } from './SingleField';
import { RepeatableListEditor } from './RepeatableListEditor';
import { SaveBar } from './SaveBar';
import { pushProgramsToCloud, pushSettingsDocToCloud } from '../../services/firebase';
import { 
  Heart, 
  GraduationCap, 
  Briefcase, 
  Trophy, 
  Shield, 
  Users, 
  Building, 
  Award,
  Layers,
  Sparkles,
  FolderPlus,
  Eye
} from 'lucide-react';

interface ProgramsCmsProps {
  programs: Program[];
  settings: SiteSettings;
  onProgramsSaved: (programs: Program[]) => void;
  onSettingsSaved: (patch: Partial<SiteSettings>) => void;
  isUrdu: boolean;
}

const AVAILABLE_ICONS = [
  { name: 'heart', label: 'Heart / Welfare', icon: Heart },
  { name: 'graduation-cap', label: 'Education / Academy', icon: GraduationCap },
  { name: 'briefcase', label: 'Employment / Jobs', icon: Briefcase },
  { name: 'trophy', label: 'Sports & Awards', icon: Trophy },
  { name: 'shield', label: 'Emergency Relief', icon: Shield },
  { name: 'users', label: 'Community Council', icon: Users },
  { name: 'building', label: 'Infrastructure', icon: Building },
  { name: 'award', label: 'General / Honour', icon: Award },
];

export const ProgramsCms: React.FC<ProgramsCmsProps> = ({
  programs,
  settings,
  onProgramsSaved,
  onSettingsSaved,
  isUrdu,
}) => {
  const [items, setItems] = useState<Program[]>(programs);
  const [sectionHeaders, setSectionHeaders] = useState({
    programsTitle: settings.programsTitle || '',
    programsDesc: settings.programsDesc || '',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setItems(programs);
    setSectionHeaders({
      programsTitle: settings.programsTitle || '',
      programsDesc: settings.programsDesc || '',
    });
    setIsDirty(false);
  }, [programs, settings]);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg(isUrdu ? 'محفوظ کیا جا رہا ہے...' : 'Saving to Firestore...');
    try {
      // 1. Full replace of siteConfig/programs
      await pushProgramsToCloud(items);
      onProgramsSaved(items);

      // 2. Update siteConfig/sections for program headers
      await pushSettingsDocToCloud('sections', {
        ...settings,
        programsTitle: sectionHeaders.programsTitle,
        programsDesc: sectionHeaders.programsDesc,
      });
      onSettingsSaved(sectionHeaders);

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

  const createNewProgram = (): Program => ({
    id: Date.now(),
    title: isUrdu ? 'نیا فلاحی پروگرام' : 'New Welfare Initiative',
    titleUr: 'نیا فلاحی پروگرام',
    desc: 'Dedicated community welfare initiative serving the underprivileged.',
    descUr: 'بنوں میں برادری اور عوام الناس کی فلاح و بہبود کے لیے باضابطہ منصوبہ۔',
    category: 'Community Welfare & Healthcare',
    status: 'active',
    icon_name: 'heart',
    color: '#AD7A28',
    budget: '',
    sort_order: items.length + 1,
  });

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-[#AD7A28]">
            <Heart className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
              Firestore: siteConfig/programs & siteConfig/sections
            </span>
            <h3 className="text-lg font-bold text-[#16232F] mt-0.5">
              {isUrdu ? 'فلاحی پروگرامز اور منصوبے' : 'Welfare Programs & Projects'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'تمام فعال فلاحی، تعلیمی اور مالی امداد کے منصوبوں کی مکمل فہرست اور ترتیبات'
                : 'Manage welfare projects, categories, icons, budgets, photos, and section title.'}
            </p>
          </div>
        </div>
      </div>

      {/* Section Headings Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <h4 className="text-xs font-bold text-[#16232F] uppercase tracking-wider">
          {isUrdu ? 'سیکشن کے عنوانات' : 'Section Titles on Public Website'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isUrdu ? 'مرکزی عنوان (programsTitle)' : 'Section Main Title'}
            </label>
            <input
              type="text"
              value={sectionHeaders.programsTitle}
              onChange={(e) => {
                setSectionHeaders(prev => ({ ...prev, programsTitle: e.target.value }));
                setIsDirty(true);
              }}
              placeholder="e.g. اہم منصوبے اور فلاحی پروگرامز"
              className="app-input font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isUrdu ? 'تفصیلی وضاحت (programsDesc)' : 'Section Subtitle / Description'}
            </label>
            <input
              type="text"
              value={sectionHeaders.programsDesc}
              onChange={(e) => {
                setSectionHeaders(prev => ({ ...prev, programsDesc: e.target.value }));
                setIsDirty(true);
              }}
              placeholder="e.g. خاندانوں کی مدد اور برادری کی فلاح کے لیے جامع منصوبے"
              className="app-input"
            />
          </div>
        </div>
      </div>

      {/* Repeatable List of Programs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <RepeatableListEditor<Program>
          items={items}
          onChange={(newItems) => {
            setItems(newItems);
            setIsDirty(true);
          }}
          createNewItem={createNewProgram}
          addButtonLabel={isUrdu ? 'نیا فلاحی پروگرام شامل کریں' : 'Add New Program'}
          emptyMessage={isUrdu ? 'کوئی فلاحی پروگرام موجود نہیں۔' : 'No welfare programs added yet.'}
          itemTitle={(prog) => prog.title || prog.titleUr || 'Untitled Program'}
          itemBadge={(prog) => (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-[#AD7A28] border border-amber-200">
              {prog.category || 'General'}
            </span>
          )}
          isUrdu={isUrdu}
          renderItem={(prog, index, updateProgram) => (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SingleField
                  label={isUrdu ? 'پروگرام کا نام (Title)' : 'Program Title'}
                  value={prog.title}
                  onChange={(val) => updateProgram({ title: val })}
                  required={true}
                  isUrdu={isUrdu}
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {isUrdu ? 'کیٹیگری (Category)' : 'Category'}
                  </label>
                  <input
                    type="text"
                    value={prog.category || ''}
                    onChange={(e) => updateProgram({ category: e.target.value })}
                    placeholder="e.g. Education, Healthcare, Emergency"
                    className="app-input"
                  />
                </div>
              </div>

              <SingleField
                label={isUrdu ? 'تفصیل و مقاصد (Description)' : 'Detailed Description'}
                value={prog.desc}
                onChange={(val) => updateProgram({ desc: val })}
                multiline={true}
                rows={3}
                isUrdu={isUrdu}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {isUrdu ? 'آئیکون منتخب کریں' : 'Select Icon'}
                  </label>
                  <select
                    value={prog.icon_name || 'heart'}
                    onChange={(e) => updateProgram({ icon_name: e.target.value })}
                    className="app-input"
                  >
                    {AVAILABLE_ICONS.map(ic => (
                      <option key={ic.name} value={ic.name}>{ic.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {isUrdu ? 'بجٹ یا ہدف (اختیاری)' : 'Target / Budget (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={prog.budget || ''}
                    onChange={(e) => updateProgram({ budget: e.target.value })}
                    placeholder="e.g. PKR 500,000"
                    className="app-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {isUrdu ? 'حیثیت (Status)' : 'Status'}
                  </label>
                  <select
                    value={prog.status || 'active'}
                    onChange={(e) => updateProgram({ status: e.target.value as any })}
                    className="app-input"
                  >
                    <option value="active">Active / فعال</option>
                    <option value="completed">Completed / مکمل</option>
                    <option value="upcoming">Upcoming / عنقریب</option>
                  </select>
                </div>
              </div>

              <ImageUploadField
                label={isUrdu ? 'پروگرام کی کور تصویر' : 'Program Cover Photo'}
                value={prog.image || prog.image_url || ''}
                onChange={(val) => updateProgram({ image: val, image_url: val })}
                aspectRatio="video"
                maxWidth={800}
                quality={0.8}
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
          setItems(programs);
          setSectionHeaders({
            programsTitle: settings.programsTitle || '',
            programsDesc: settings.programsDesc || '',
          });
          setIsDirty(false);
        }}
      />
    </div>
  );
};
