import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Quote, CheckCircle2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { t, isUrdu, tSetting } = useLanguage();
  const { settings, leaders } = useData();

  // Pinned leader for About page quote card (fallback to featured leader)
  const quoteLeader = leaders.find(l => l.pinnedForAbout) ?? leaders.find(l => Boolean(l.featured)) ?? leaders[0];
  const chairmanPhoto = quoteLeader?.photo_data || quoteLeader?.image || (quoteLeader as any)?.photoUrl || "";
  const chairmanName = isUrdu 
    ? (quoteLeader?.nameUr || quoteLeader?.name || 'قیادت') 
    : (quoteLeader?.name || quoteLeader?.nameUr || 'Leadership');
  const chairmanRole = isUrdu
    ? (quoteLeader?.roleUr || quoteLeader?.role || t('chairmanRole', 'Global Chairman'))
    : (quoteLeader?.role || quoteLeader?.roleUr || t('chairmanRole', 'Global Chairman'));
  const chairmanQuote = isUrdu
    ? (quoteLeader?.messageUr || quoteLeader?.message || quoteLeader?.bioUr || quoteLeader?.bio || "ہمارا اتحاد ہی ہماری سب سے بڑی طاقت ہے۔")
    : (quoteLeader?.message || quoteLeader?.messageUr || quoteLeader?.bio || quoteLeader?.bioUr || "Our unity is our greatest strength. When we empower our youth and support our families, we build a foundation that endures for generations.");

  return (
    <section id="about" className="py-20 sm:py-24 bg-[#F8F4E8] border-b border-[#AD7A28]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] text-xs font-bold uppercase tracking-wider mb-3 ${
            isUrdu ? 'font-naskh' : 'font-sans'
          }`}>
            {t('aboutTag', 'Who We Are')}
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold text-[#16232F] ltr:tracking-tight rtl:tracking-normal ltr:leading-tight rtl:leading-[1.45] ${
            isUrdu ? 'font-nastaliq' : 'font-display'
          }`}>
            {tSetting('aboutTitle', settings)}
          </h2>
          <p className={`mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 ltr:leading-relaxed rtl:leading-[1.85] font-medium rtl:tracking-normal ${
            isUrdu ? 'font-nastaliq' : 'font-sans'
          }`}>
            {tSetting('aboutSubtitle', settings)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Narrative Content */}
          <div className={`lg:col-span-7 space-y-5 text-slate-700 text-sm sm:text-base leading-relaxed ${
            isUrdu ? 'font-naskh' : 'font-sans'
          }`}>
            <p className="p-4 rounded-xl bg-white shadow-sm border border-[#16232F]/10">
              {tSetting('aboutP1', settings)}
            </p>
            <p className="p-4 rounded-xl bg-white shadow-sm border border-[#16232F]/10">
              {tSetting('aboutP2', settings)}
            </p>
            <p className="p-4 rounded-xl bg-white shadow-sm border border-[#16232F]/10">
              {tSetting('aboutP3', settings)}
            </p>

            {/* Core Values Bullet List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-600/20 text-[#16232F] font-semibold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#AD7A28] shrink-0" />
                <span>{t('valueTransparent')}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-600/20 text-[#16232F] font-semibold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#AD7A28] shrink-0" />
                <span>{t('valueScholarships')}</span>
              </div>
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-600/20 text-[#16232F] font-semibold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#AD7A28] shrink-0" />
                <span>{t('valueBrotherhood')}</span>
              </div>
            </div>
          </div>

          {/* Chairman Quote & Leadership Card */}
          <div className="lg:col-span-5">
            <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#16232F] to-[#1F3345] text-white shadow-xl border border-white/10">
              <div className="absolute top-4 right-4 text-[#AD7A28] opacity-30">
                <Quote className="w-16 h-16" />
              </div>

              <div className="relative z-10">
                <div className={`inline-block px-2.5 py-1 rounded-full bg-[#AD7A28]/20 border border-[#AD7A28]/40 text-amber-300 text-xs font-semibold mb-4 ${
                  isUrdu ? 'font-naskh' : 'font-sans'
                }`}>
                  {t('chairmanTitle', 'Leadership Message')}
                </div>

                <blockquote className={`text-base sm:text-lg font-medium text-slate-200 leading-relaxed mb-6 ${
                  isUrdu ? 'font-nastaliq text-lg sm:text-xl' : 'font-editorial italic'
                }`}>
                  "{chairmanQuote}"
                </blockquote>

                <div className="pt-4 border-t border-white/15 flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    {chairmanPhoto ? (
                      <img
                        src={chairmanPhoto}
                        alt={chairmanName}
                        className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-md ring-2 ring-[#AD7A28]/30"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#AD7A28] to-amber-300 flex items-center justify-center text-[#16232F] font-black text-base shadow-sm border-2 border-amber-400">
                        {chairmanName.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('') || 'AB'}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#16232F] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    </div>
                  </div>
                  <div>
                    <div className={`font-bold text-white text-base sm:text-lg leading-tight ${
                      isUrdu ? 'font-nastaliq' : 'font-display'
                    }`}>
                      {chairmanName}
                    </div>
                    <div className={`text-xs sm:text-sm text-amber-300/90 font-medium mt-0.5 ${
                      isUrdu ? 'font-naskh' : 'font-sans'
                    }`}>
                      {chairmanRole} ·{' '}
                      <span className={isUrdu ? 'font-nastaliq' : 'font-display'}>
                        {tSetting('siteName', settings)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
