import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Mail, Star, Eye, MessageSquare, ChevronRight, MapPin, Users } from 'lucide-react';
import { Leader } from '../types';
import { LeaderDetailModal } from './LeaderDetailModal';

export const LeadershipSection: React.FC = () => {
  const { t, isUrdu, tSetting, getLeaders } = useLanguage();
  const { settings, leaders } = useData();
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  const localizedLeaders = getLeaders(leaders);

  const handleSelectLeader = (leader: Leader) => {
    setSelectedLeader(leader);
    window.history.pushState({ leaderId: leader.id }, '', `#leader=${leader.id}`);
  };

  const handleCloseLeader = () => {
    setSelectedLeader(null);
    if (window.location.hash.startsWith('#leader')) {
      window.history.back();
    }
  };

  React.useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#leader=')) {
        const id = hash.replace('#leader=', '');
        const target = localizedLeaders.find((l) => l.id === id);
        if (target) setSelectedLeader(target);
      } else {
        setSelectedLeader(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [localizedLeaders]);

  return (
    <section id="leadership" className="py-20 sm:py-24 bg-[#F8F4E8] border-b border-[#AD7A28]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] text-xs font-bold uppercase tracking-wider mb-3 ${
            isUrdu ? 'font-naskh' : 'font-sans'
          }`}>
            {t('navLeadership', 'Our Leadership')}
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold text-[#16232F] ltr:tracking-tight rtl:tracking-normal ltr:leading-tight rtl:leading-[1.45] ${
            isUrdu ? 'font-nastaliq' : 'font-display'
          }`}>
            {tSetting('leadershipTitle', settings)}
          </h2>
          <p className={`mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium ltr:leading-relaxed rtl:leading-[1.85] rtl:tracking-normal ${
            isUrdu ? 'font-nastaliq' : 'font-sans'
          }`}>
            {tSetting('leadershipDesc', settings) || t('leadershipDesc', 'Committed community servants providing strategic guidance and global connection. Click on any leader to view their profile, portfolio, and message.')}
          </p>
        </div>

        {/* Leadership Grid or Graceful Empty State */}
        {localizedLeaders.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-white border border-dashed border-[#AD7A28]/30 max-w-xl mx-auto shadow-xs">
            <Users className="w-10 h-10 text-[#AD7A28]/60 mx-auto mb-3" />
            <h3 className={`text-base font-bold text-[#16232F] ${isUrdu ? 'font-naskh' : 'font-sans'}`}>
              {isUrdu ? 'مجلس عاملہ کی تفصیلات جلد فراہم کی جائیں گی' : 'Executive council directory updating'}
            </h3>
            <p className={`text-xs text-slate-500 mt-1 ${isUrdu ? 'font-naskh' : 'font-sans'}`}>
              {isUrdu ? 'مرکزی عہدیداران اور تنظیمی ڈھانچے کی تصدیق جاری ہے' : 'Leadership profiles will appear once confirmed'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {localizedLeaders.map((leader, idx) => {
              const leaderPhoto = leader.photo_data || leader.image || (leader as any).photoUrl;
              return (
                <div
                  key={leader.id || idx}
                  onClick={() => handleSelectLeader(leader)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectLeader(leader);
                    }
                  }}
                  className={`group relative rounded-2xl bg-white p-6 sm:p-7 shadow-sm border transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${
                    leader.featured 
                      ? 'border-[#AD7A28]/50 ring-1 ring-[#AD7A28]/30 hover:border-[#AD7A28]' 
                      : 'border-[#16232F]/10 hover:border-[#AD7A28]/60'
                  }`}
                >
                  {Boolean(leader.featured) && (
                    <div className={`absolute top-4 right-4 rtl:left-4 rtl:right-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#AD7A28]/15 text-[#8A5F19] text-[11px] font-bold ${
                      isUrdu ? 'font-naskh' : 'font-sans'
                    }`}>
                      <Star className="w-3 h-3 fill-current" />
                      <span>{t('featuredBadge', 'Featured')}</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      {leaderPhoto ? (
                        <img
                          src={leaderPhoto}
                          alt={leader.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#AD7A28]/40 shadow-inner group-hover:border-[#AD7A28] transition-colors"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#16232F] to-[#25394C] text-[#F5CA7B] font-black text-xl flex items-center justify-center border-2 border-[#AD7A28]/40 shadow-sm group-hover:border-[#AD7A28] transition-colors font-sans">
                          {leader.initials || (isUrdu ? 'آ ب' : 'AB')}
                        </div>
                      )}

                      <div className="pr-12 rtl:pr-0 rtl:pl-12">
                        <h3 className={`text-lg font-bold text-[#16232F] leading-snug group-hover:text-[#AD7A28] transition-colors ${
                          isUrdu ? 'font-nastaliq' : 'font-display'
                        }`}>
                          {leader.name}
                        </h3>
                        <p className={`text-xs sm:text-sm font-semibold text-[#AD7A28] ${
                          isUrdu ? 'font-naskh' : 'font-sans'
                        }`}>
                          {leader.role}
                        </p>
                        {leader.location && (
                          <p className={`text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 ${
                            isUrdu ? 'font-naskh' : 'font-sans'
                          }`}>
                            <MapPin className="w-3 h-3 text-[#AD7A28]/70" />
                            <span>{leader.location}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Teaser quote if message exists */}
                    {leader.message && (
                      <div className={`mb-4 p-3 rounded-xl bg-[#F8F4E8]/60 border border-[#AD7A28]/20 text-xs text-slate-700 line-clamp-2 ${
                        isUrdu ? 'font-nastaliq leading-[2]' : 'font-editorial italic'
                      }`}>
                        "{leader.message}"
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#16232F]/5 flex items-center justify-between text-xs">
                    {leader.email ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `mailto:${leader.email}`;
                        }}
                        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#AD7A28] transition-colors truncate max-w-[150px]"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{leader.email}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-[#AD7A28]" />
                        <span>{isUrdu ? 'کونسل پیغام' : 'Council Message'}</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 text-[#AD7A28] font-bold group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
                      <span>{isUrdu ? 'تفصیلات و پیغام' : 'View Message'}</span>
                      <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for Clicked Leader */}
        <LeaderDetailModal
          leader={selectedLeader}
          isOpen={Boolean(selectedLeader)}
          onClose={handleCloseLeader}
        />

      </div>
    </section>
  );
};
