import React, { useState, useEffect } from 'react';
import { Leader, SiteSettings } from '../../types';
import { ImageUploadField } from './ImageUploadField';
import { BilingualField } from './BilingualField';
import { RepeatableListEditor } from './RepeatableListEditor';
import { SaveBar } from './SaveBar';
import { pushLeadersToCloud, pushSettingsDocToCloud } from '../../services/firebase';
import { 
  Users, 
  Star, 
  Quote, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface LeadersCmsProps {
  leaders: Leader[];
  settings: SiteSettings;
  onLeadersSaved: (leaders: Leader[]) => void;
  onSettingsSaved: (patch: Partial<SiteSettings>) => void;
  isUrdu: boolean;
}

export const LeadersCms: React.FC<LeadersCmsProps> = ({
  leaders,
  settings,
  onLeadersSaved,
  onSettingsSaved,
  isUrdu,
}) => {
  const [items, setItems] = useState<Leader[]>(leaders);
  const [leadershipTitle, setLeadershipTitle] = useState(settings.leadershipTitle || '');

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setItems(leaders);
    setLeadershipTitle(settings.leadershipTitle || '');
    setIsDirty(false);
  }, [leaders, settings]);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg(isUrdu ? 'محفوظ کیا جا رہا ہے...' : 'Saving to Firestore...');
    try {
      // 1. Full replace of siteConfig/leaders
      await pushLeadersToCloud(items);
      onLeadersSaved(items);

      // 2. Update siteConfig/sections for leadershipTitle
      await pushSettingsDocToCloud('sections', {
        ...settings,
        leadershipTitle,
      });
      onSettingsSaved({ leadershipTitle });

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

  const createNewLeader = (): Leader => ({
    id: Date.now(),
    name: isUrdu ? 'رہنما کا نام' : 'Executive Leader',
    nameUr: 'رہنما کا نام',
    role: isUrdu ? 'رکن مجلس عاملہ' : 'Executive Council Member',
    roleUr: 'رکن مجلس عاملہ',
    email: 'secretariat@araainbannu.org',
    phone: '+92 331 9051410',
    location: 'Bannu, Khyber Pakhtunkhwa',
    locationUr: 'بنوں، خیبر پختونخوا',
    message: 'Dedicated to community welfare, youth education, and collective growth.',
    messageUr: 'شفاف فلاح و بہبود، تعلیم اور باہمی اتحاد کے ذریعے برادری کی خدمت کے لیے پرعزم۔',
    bio: 'Active leader with proven track record in community development.',
    bioUr: 'سماجی فلاحی منصوبوں اور برادری کی ترقی میں فعال کردار۔',
    featured: 0,
    pinnedForAbout: false,
    sort_order: items.length + 1,
  });

  const handleTogglePinForAbout = (index: number) => {
    const willPin = !items[index].pinnedForAbout;
    const updated = items.map((l, idx) => ({
      ...l,
      pinnedForAbout: idx === index ? willPin : false, // ensure only one is pinned
    }));
    setItems(updated);
    setIsDirty(true);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-[#AD7A28]">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
              Firestore: siteConfig/leaders & siteConfig/sections
            </span>
            <h3 className="text-lg font-bold text-[#16232F] mt-0.5">
              {isUrdu ? 'مرکزی قیادت اور کابینہ' : 'Executive Leadership & Council'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'کابینہ، عہدیداران، رابطہ کی تفصیلات اور تعارف سیکشن میں چیئرمین کا اقتباس منتخب کریں'
                : 'Manage cabinet members, photos, roles, bios, and pin the Chairman Quote for the About page.'}
            </p>
          </div>
        </div>
      </div>

      {/* Section Heading */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <label className="block text-xs font-semibold text-slate-700">
          {isUrdu ? 'قیادت سیکشن کا عنوان (leadershipTitle)' : 'Leadership Section Title (Public Site)'}
        </label>
        <input
          type="text"
          value={leadershipTitle}
          onChange={(e) => {
            setLeadershipTitle(e.target.value);
            setIsDirty(true);
          }}
          placeholder="e.g. آرائیں بنوں کی مرکزی قیادت اور کابینہ"
          className="app-input font-bold"
        />
      </div>

      {/* Repeatable List of Leaders */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <RepeatableListEditor<Leader>
          items={items}
          onChange={(newItems) => {
            setItems(newItems);
            setIsDirty(true);
          }}
          createNewItem={createNewLeader}
          addButtonLabel={isUrdu ? 'نیا رہنما شامل کریں' : 'Add New Leader'}
          emptyMessage={isUrdu ? 'کوئی رہنما موجود نہیں۔' : 'No leaders added yet.'}
          itemTitle={(leader) => leader.name || leader.nameUr || 'Untitled Leader'}
          itemBadge={(leader, idx) => (
            <div className="flex items-center gap-1.5">
              {leader.pinnedForAbout && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#16232F] text-amber-300 border border-amber-400/40">
                  <Quote className="w-2.5 h-2.5 text-[#AD7A28]" />
                  <span>{isUrdu ? 'تعارف اقتباس' : 'Pinned Quote'}</span>
                </span>
              )}
              {Boolean(leader.featured) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-[#AD7A28] border border-amber-200">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>Featured</span>
                </span>
              )}
              <span className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">
                {leader.role || leader.roleUr || ''}
              </span>
            </div>
          )}
          isUrdu={isUrdu}
          renderItem={(leader, index, updateLeader) => (
            <div className="space-y-5">
              {/* Highlight / Pin for About Quote Bar */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Quote className="w-4 h-4 text-[#AD7A28] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {isUrdu ? 'ہمارا تعارف سیکشن میں چیئرمین کا اقتباس بنائیں' : 'Show as Chairman Quote on About Page'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {isUrdu
                        ? 'اس رہنما کا نام، تصویر اور پیغام فرنٹ پیج کے About سیکشن میں نمایاں ہوگا'
                        : 'This leader’s name, photo, title, and quote message will feed the About-section quote card.'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTogglePinForAbout(index)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    leader.pinnedForAbout
                      ? 'bg-[#16232F] text-amber-300 shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {leader.pinnedForAbout
                    ? (isUrdu ? '✓ منتخب شدہ ہے' : '✓ Pinned as Chairman')
                    : (isUrdu ? 'چیئرمین بنائیں' : 'Pin as Chairman Quote')}
                </button>
              </div>

              {/* Leader Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BilingualField
                  label={isUrdu ? 'رہنما کا نام (Name)' : 'Leader Full Name'}
                  valueEn={leader.name}
                  valueUr={leader.nameUr}
                  onChange={(en, ur) => updateLeader({ name: en, nameUr: ur })}
                  required={true}
                  isUrdu={isUrdu}
                />

                <BilingualField
                  label={isUrdu ? 'عہدہ یا منصب (Role / Position)' : 'Designation / Role'}
                  valueEn={leader.role}
                  valueUr={leader.roleUr}
                  onChange={(en, ur) => updateLeader({ role: en, roleUr: ur })}
                  required={true}
                  isUrdu={isUrdu}
                />
              </div>

              {/* Photo & Featured Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                <ImageUploadField
                  label={isUrdu ? 'پورٹریٹ تصویر' : 'Official Portrait Photo'}
                  value={leader.photo_data || leader.image || (leader as any).photoUrl || ''}
                  onChange={(val) => updateLeader({ photo_data: val, image: val })}
                  aspectRatio="avatar"
                  maxWidth={500}
                  quality={0.85}
                  isUrdu={isUrdu}
                />

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {isUrdu ? 'نمایاں قیادت (Featured in Highlights)' : 'Featured Profile'}
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(leader.featured)}
                        onChange={(e) => updateLeader({ featured: e.target.checked ? 1 : 0 })}
                        className="w-4 h-4 rounded text-[#AD7A28] focus:ring-[#AD7A28]"
                      />
                      <span className="text-xs text-slate-700">
                        {isUrdu ? 'صفحہ اول پر نمایاں کارڈ کے طور پر دکھائیں' : 'Show on homepage leadership highlights'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isUrdu ? 'فون نمبر' : 'Phone'}
                      </label>
                      <input
                        type="text"
                        value={leader.phone || ''}
                        onChange={(e) => updateLeader({ phone: e.target.value })}
                        placeholder="+92 331 9051410"
                        className="app-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isUrdu ? 'ای میل' : 'Email'}
                      </label>
                      <input
                        type="email"
                        value={leader.email || ''}
                        onChange={(e) => updateLeader({ email: e.target.value })}
                        placeholder="leader@araainbannu.org"
                        className="app-input text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Leadership Message & Quote */}
              <BilingualField
                label={isUrdu ? 'قائدانہ پیغام یا اقتباس (Leadership Quote / Message)' : 'Leadership Quote / Message (Feeds About Card)'}
                valueEn={leader.message}
                valueUr={leader.messageUr}
                onChange={(en, ur) => updateLeader({ message: en, messageUr: ur })}
                multiline={true}
                rows={3}
                placeholder="Inspiring words for the community..."
                isUrdu={isUrdu}
              />

              {/* Bio */}
              <BilingualField
                label={isUrdu ? 'مختصر سوانح حیات (Bio)' : 'Biographical Profile Summary'}
                valueEn={leader.bio}
                valueUr={leader.bioUr}
                onChange={(en, ur) => updateLeader({ bio: en, bioUr: ur })}
                multiline={true}
                rows={2}
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
          setItems(leaders);
          setLeadershipTitle(settings.leadershipTitle || '');
          setIsDirty(false);
        }}
      />
    </div>
  );
};
