import React from 'react';
import { EventItem, SiteSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Calendar, Clock, MapPin, Tag, ArrowRight } from 'lucide-react';

interface EventsSectionProps {
  events?: EventItem[];
  settings?: SiteSettings;
}

export const EventsSection: React.FC<EventsSectionProps> = ({ events: propEvents, settings: propSettings }) => {
  const { isUrdu, tSetting } = useLanguage();
  const { events: contextEvents, settings: contextSettings } = useData();

  const events = propEvents || contextEvents || [];
  const settings = propSettings || contextSettings;

  const localizedEvents = events.map(ev => ({
    ...ev,
    title: isUrdu ? (ev.titleUr || ev.title) : ev.title,
    place: isUrdu ? (ev.placeUr || ev.place) : ev.place,
    desc: isUrdu ? (ev.descUr || ev.desc) : ev.desc,
  }));

  return (
    <section id="events" className="py-16 sm:py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-600/20 text-[#AD7A28] text-xs font-bold uppercase tracking-wider mb-4">
            <Calendar className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'تقریبات و اعلانات' : 'Community Calendar'}</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold text-[#16232F] ${isUrdu ? 'font-nastaliq' : 'font-display'}`}>
            {tSetting('eventsTitle', settings) || (isUrdu ? 'آئندہ کی تقریبات و باہمی نشستیں' : 'Upcoming Community Events')}
          </h2>
          <p className={`mt-3 text-slate-600 text-sm sm:text-base ${isUrdu ? 'font-naskh' : 'font-sans'}`}>
            {tSetting('eventsDesc', settings) || (isUrdu ? 'ارائیں کونسل بنوں کے باضابطہ سیمینارز، فری میڈیکل کیمپس اور سالانہ اجتماعات کا شیڈول' : 'Stay informed about scheduled gatherings, healthcare camps, seminars, and annual council assemblies in Bannu.')}
          </p>
        </div>

        {/* Events Grid */}
        {localizedEvents.length === 0 ? (
          <div className="text-center py-12 bg-[#FBF9F4] rounded-2xl border border-dashed border-slate-300 max-w-lg mx-auto p-6">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className={`text-sm font-bold text-slate-700 ${isUrdu ? 'font-nastaliq' : 'font-sans'}`}>
              {isUrdu ? 'فی الحال کوئی نئی تقریب شیڈول نہیں ہے' : 'No upcoming events scheduled at this time'}
            </h3>
            <p className={`text-xs text-slate-500 mt-1 ${isUrdu ? 'font-naskh' : 'font-sans'}`}>
              {isUrdu ? 'تازہ ترین اعلانات اور آئندہ کی سرگرمیوں کے لیے رابطہ میں رہیں' : 'Check back soon for upcoming community gatherings and announcements'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {localizedEvents.map((ev, idx) => (
              <div
                key={ev.id || idx}
                className="group rounded-2xl bg-[#FBF9F4] border border-[#16232F]/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                {/* Event Poster / Image if attached */}
                {ev.image && (
                  <div className="relative w-full h-44 bg-slate-900 overflow-hidden border-b border-[#16232F]/10">
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-xs font-bold ${
                        isUrdu ? 'font-naskh' : 'font-sans'
                      }`}>
                        <Tag className="w-3 h-3 text-amber-300" />
                        <span>{ev.tag}</span>
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header Row when no image */}
                    {!ev.image && (
                      <div className="flex items-start justify-between gap-3 mb-4">
                        {/* Date badge */}
                        <div className="w-14 h-16 rounded-xl bg-[#16232F] text-white flex flex-col items-center justify-center shadow-sm">
                          <span className={`text-xs uppercase font-bold text-amber-300 tracking-wider ${isUrdu ? 'font-naskh' : 'font-mono'}`}>
                            {ev.month}
                          </span>
                          <span className="text-xl font-extrabold leading-none mt-0.5 font-mono">
                            {ev.day}
                          </span>
                        </div>

                        {/* Category tag */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#AD7A28]/15 text-[#8A5F19] text-xs font-bold ${
                          isUrdu ? 'font-naskh' : 'font-sans'
                        }`}>
                          <Tag className="w-3 h-3" />
                          <span>{ev.tag}</span>
                        </span>
                      </div>
                    )}

                    {/* Date pill when image IS present */}
                    {ev.image && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#16232F] text-amber-300 font-mono text-xs font-bold">
                          {ev.day} {ev.month}
                        </span>
                      </div>
                    )}

                    <h3 className={`text-lg font-bold text-[#16232F] mb-3 leading-snug group-hover:text-[#AD7A28] transition-colors ${
                      isUrdu ? 'font-nastaliq text-xl' : 'font-display'
                    }`}>
                      {ev.title}
                    </h3>

                    {ev.desc && (
                      <p className={`text-slate-600 text-xs leading-relaxed line-clamp-2 mb-4 ${
                        isUrdu ? 'font-naskh' : 'font-sans'
                      }`}>
                        {ev.desc}
                      </p>
                    )}
                  </div>

                  <div className={`space-y-2 pt-4 border-t border-[#16232F]/10 text-xs text-slate-600 ${
                    isUrdu ? 'font-naskh' : 'font-sans'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#AD7A28] shrink-0" />
                      <span>{ev.time_str}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#AD7A28] shrink-0" />
                      <span className="truncate">{ev.place}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
