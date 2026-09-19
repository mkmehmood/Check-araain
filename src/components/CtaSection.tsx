import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { UserCheck, Heart, ArrowRight } from 'lucide-react';

interface CtaSectionProps {
  onOpenMembership: () => void;
  onOpenDonation: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({
  onOpenMembership,
  onOpenDonation,
}) => {
  const { t, isUrdu, tSetting } = useLanguage();
  const { settings } = useData();

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-[#16232F]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Membership Card */}
          <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#16232F] to-[#1E3040] text-white shadow-xl flex flex-col justify-between relative overflow-hidden border border-white/10 min-h-[360px]">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mb-6">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className={`text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 ltr:tracking-tight rtl:tracking-normal ltr:leading-tight rtl:leading-[1.45] ${
                isUrdu ? 'font-nastaliq' : 'font-display tracking-wider'
              }`}>
                {tSetting('membershipTitle', settings)}
              </h3>
              <p className={`text-slate-300 text-sm sm:text-base ltr:leading-relaxed rtl:leading-[1.85] mb-8 rtl:tracking-normal ${
                isUrdu ? 'font-nastaliq' : 'font-sans'
              }`}>
                {tSetting('membershipDesc', settings)}
              </p>
            </div>

            <div className="relative z-10">
              <button
                onClick={onOpenMembership}
                className={`app-btn-success app-btn-lg app-btn-full ${
                  isUrdu ? 'font-naskh' : 'font-sans'
                }`}
              >
                <span>{tSetting('ctaMembershipBtn', settings) || t('btnBecomeMember', 'Apply for Membership')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* Donation Card */}
          <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-[#2A1E0E] to-[#3B2912] text-white shadow-xl flex flex-col justify-between relative overflow-hidden border border-[#AD7A28]/30 min-h-[360px]">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#AD7A28]/30 border border-[#AD7A28]/50 text-amber-300 flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <h3 className={`text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 ltr:tracking-tight rtl:tracking-normal ltr:leading-tight rtl:leading-[1.45] ${
                isUrdu ? 'font-nastaliq' : 'font-display tracking-wider'
              }`}>
                {tSetting('donateTitle', settings)}
              </h3>
              <p className={`text-amber-100/80 text-sm sm:text-base ltr:leading-relaxed rtl:leading-[1.85] mb-8 rtl:tracking-normal ${
                isUrdu ? 'font-nastaliq' : 'font-sans'
              }`}>
                {tSetting('donateDesc', settings)}
              </p>
            </div>

            <div className="relative z-10">
              <button
                onClick={onOpenDonation}
                className={`app-btn-primary app-btn-lg app-btn-full ${
                  isUrdu ? 'font-naskh' : 'font-sans'
                }`}
              >
                <span>{tSetting('ctaDonateBtn', settings) || t('navDonate', 'Make a Contribution')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
