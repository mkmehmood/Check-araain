import React, { useState, useEffect } from 'react';
import { EventItem, SiteSettings } from '../../types';
import { ImageUploadField } from './ImageUploadField';
import { SingleField } from './SingleField';
import { RepeatableListEditor } from './RepeatableListEditor';
import { SaveBar } from './SaveBar';
import { pushEventsToCloud, pushSettingsDocToCloud } from '../../services/firebase';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  Tag
} from 'lucide-react';

interface EventsCmsProps {
  events: EventItem[];
  settings: SiteSettings;
  onEventsSaved: (events: EventItem[]) => void;
  onSettingsSaved: (patch: Partial<SiteSettings>) => void;
  isUrdu: boolean;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const EventsCms: React.FC<EventsCmsProps> = ({
  events,
  settings,
  onEventsSaved,
  onSettingsSaved,
  isUrdu,
}) => {
  const [items, setItems] = useState<EventItem[]>(events);
  const [eventsTitle, setEventsTitle] = useState(settings.eventsTitle || '');

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setItems(events);
    setEventsTitle(settings.eventsTitle || '');
    setIsDirty(false);
  }, [events, settings]);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg(isUrdu ? 'محفوظ کیا جا رہا ہے...' : 'Saving to Firestore...');
    try {
      // 1. Full replace of siteConfig/events
      await pushEventsToCloud(items);
      onEventsSaved(items);

      // 2. Update siteConfig/sections for eventsTitle
      await pushSettingsDocToCloud('sections', {
        ...settings,
        eventsTitle,
      });
      onSettingsSaved({ eventsTitle });

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

  const createNewEvent = (): EventItem => ({
    id: Date.now(),
    title: isUrdu ? 'نئی تقریب یا اجلاس' : 'New Community Event',
    titleUr: 'نئی تقریب یا اجلاس',
    month: 'DEC',
    day: '25',
    time_str: '02:00 PM - 05:00 PM',
    place: 'Community Hall, Bannu City',
    placeUr: 'کمیونٹی ہال، بنوں سٹی',
    tag: 'Community Gathering',
    desc: 'Important community event for all members and families.',
    descUr: 'تمام اراکین اور خاندانوں کے لیے اہم تقریب اور اجلاس۔',
    status: 'upcoming',
    sort_order: items.length + 1,
  });

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-[#AD7A28]">
            <Calendar className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] uppercase tracking-wider">
              Firestore: siteConfig/events & siteConfig/sections
            </span>
            <h3 className="text-lg font-bold text-[#16232F] mt-0.5">
              {isUrdu ? 'تقریبات، سیمینار اور اجلاس' : 'Community Events & Seminars'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'آئندہ اور گزشتہ تمام تقریبات، تاریخ، وقت، مقام اور تصویری پوسٹرز کا انتظام'
                : 'Manage upcoming gatherings, seminars, dates, venues, timings, and posters.'}
            </p>
          </div>
        </div>
      </div>

      {/* Section Heading */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <label className="block text-xs font-semibold text-slate-700">
          {isUrdu ? 'تقریبات سیکشن کا عنوان (eventsTitle)' : 'Events Section Title (Public Site)'}
        </label>
        <input
          type="text"
          value={eventsTitle}
          onChange={(e) => {
            setEventsTitle(e.target.value);
            setIsDirty(true);
          }}
          placeholder="e.g. آئندہ اہم تقریبات اور سیمینارز"
          className="app-input font-bold"
        />
      </div>

      {/* Repeatable List of Events */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <RepeatableListEditor<EventItem>
          items={items}
          onChange={(newItems) => {
            setItems(newItems);
            setIsDirty(true);
          }}
          createNewItem={createNewEvent}
          addButtonLabel={isUrdu ? 'نئی تقریب شامل کریں' : 'Add New Event'}
          emptyMessage={isUrdu ? 'کوئی تقریب درج نہیں۔' : 'No events scheduled yet.'}
          itemTitle={(evt) => evt.title || evt.titleUr || 'Untitled Event'}
          itemBadge={(evt) => (
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#16232F] text-amber-300">
                {evt.month || 'DEC'} {evt.day || '25'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                evt.status === 'upcoming' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {evt.status || 'upcoming'}
              </span>
            </div>
          )}
          isUrdu={isUrdu}
          renderItem={(evt, index, updateEvent) => (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SingleField
                  label={isUrdu ? 'تقریب کا عنوان (Event Title)' : 'Event Title'}
                  value={evt.title}
                  onChange={(val) => updateEvent({ title: val })}
                  required={true}
                  isUrdu={isUrdu}
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {isUrdu ? 'کیٹیگری یا ٹیگ (Tag)' : 'Category Tag'}
                  </label>
                  <input
                    type="text"
                    value={evt.tag || ''}
                    onChange={(e) => updateEvent({ tag: e.target.value })}
                    placeholder="e.g. General Assembly, Medical Camp"
                    className="app-input"
                  />
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isUrdu ? 'مہینہ' : 'Month'}
                  </label>
                  <select
                    value={evt.month || 'DEC'}
                    onChange={(e) => updateEvent({ month: e.target.value })}
                    className="app-input"
                  >
                    {MONTHS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isUrdu ? 'دن (Day)' : 'Day'}
                  </label>
                  <input
                    type="text"
                    value={evt.day || ''}
                    onChange={(e) => updateEvent({ day: e.target.value })}
                    placeholder="e.g. 25"
                    className="app-input font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isUrdu ? 'وقت (Timing)' : 'Timing'}
                  </label>
                  <input
                    type="text"
                    value={evt.time_str || ''}
                    onChange={(e) => updateEvent({ time_str: e.target.value })}
                    placeholder="e.g. 02:00 PM"
                    className="app-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isUrdu ? 'حیثیت (Status)' : 'Status'}
                  </label>
                  <select
                    value={evt.status || 'upcoming'}
                    onChange={(e) => updateEvent({ status: e.target.value as any })}
                    className="app-input"
                  >
                    <option value="upcoming">Upcoming / عنقریب</option>
                    <option value="completed">Completed / مکمل</option>
                    <option value="cancelled">Cancelled / منسوخ</option>
                  </select>
                </div>
              </div>

              {/* Venue */}
              <SingleField
                label={isUrdu ? 'مقام و پتہ (Venue / Location)' : 'Venue / Location'}
                value={evt.place}
                onChange={(val) => updateEvent({ place: val })}
                placeholder="e.g. Community Center, Bannu City"
                isUrdu={isUrdu}
              />

              {/* Description */}
              <SingleField
                label={isUrdu ? 'تفصیل و ایجنڈا (Description & Agenda)' : 'Event Description / Agenda'}
                value={evt.desc}
                onChange={(val) => updateEvent({ desc: val })}
                multiline={true}
                rows={3}
                isUrdu={isUrdu}
              />

              {/* Poster Photo */}
              <ImageUploadField
                label={isUrdu ? 'پوسٹر یا بینر تصویر (اختیاری)' : 'Event Banner / Poster Photo (Optional)'}
                value={evt.image || evt.poster_url || ''}
                onChange={(val) => updateEvent({ image: val, poster_url: val })}
                aspectRatio="banner"
                maxWidth={1000}
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
          setItems(events);
          setEventsTitle(settings.eventsTitle || '');
          setIsDirty(false);
        }}
      />
    </div>
  );
};
