import React, { useState } from 'react';
import { Program, SiteSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { FullScreenHeader } from './common/FullScreenHeader';
import { Heart, Briefcase, GraduationCap, Trophy, Shield, Users, ArrowRight, Layers, Building, Award, CheckCircle2 } from 'lucide-react';

interface ProgramsSectionProps {
  programs?: Program[];
  settings?: SiteSettings;
  onOpenDonate?: () => void;
  onSelectProgram?: (program: Program) => void;
}

export const ProgramsSection: React.FC<ProgramsSectionProps> = ({ 
  programs: propPrograms, 
  settings: propSettings,
  onOpenDonate,
  onSelectProgram
}) => {
  const { t, isUrdu, tSetting } = useLanguage();
  const { programs: contextPrograms, settings: contextSettings } = useData();

  const programs = propPrograms || contextPrograms || [];
  const settings = propSettings || contextSettings;

  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'heart': return <Heart className="w-6 h-6" />;
      case 'graduation-cap': return <GraduationCap className="w-6 h-6" />;
      case 'briefcase': return <Briefcase className="w-6 h-6" />;
      case 'trophy': return <Trophy className="w-6 h-6" />;
      case 'shield': return <Shield className="w-6 h-6" />;
      case 'users': return <Users className="w-6 h-6" />;
      case 'building': return <Building className="w-6 h-6" />;
      case 'award': return <Award className="w-6 h-6" />;
      default: return <Layers className="w-6 h-6" />;
    }
  };

  const localizedPrograms = programs.map(p => ({
    ...p,
    title: isUrdu ? (p.titleUr || p.title) : p.title,
    desc: isUrdu ? (p.descUr || p.desc) : p.desc,
  }));

  const handleSelectProgram = (program: Program) => {
    if (onSelectProgram) {
      onSelectProgram(program);
    } else {
      setSelectedProgram(program);
      window.history.pushState({ modal: 'program-details', id: program.id }, '');
    }
  };

  const handleClose = () => {
    setSelectedProgram(null);
  };

  return (
    <section id="programs" className="py-16 sm:py-24 bg-[#F8F4E8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-600/20 text-[#AD7A28] text-xs font-bold uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'کونسل کے فلاحی شعبہ جات' : 'Strategic Welfare Wings'}</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold text-[#16232F] ltr:tracking-tight rtl:tracking-normal ltr:leading-tight rtl:leading-[1.45] ${
            isUrdu ? 'font-nastaliq' : 'font-display'
          }`}>
            {tSetting('programsTitle', settings)}
          </h2>
          <p className={`mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium ltr:leading-relaxed rtl:leading-[1.85] rtl:tracking-normal ${
            isUrdu ? 'font-nastaliq' : 'font-sans'
          }`}>
            {tSetting('programsDesc', settings)}
          </p>
        </div>

        {/* Programs Grid */}
        {localizedPrograms.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            {t('noProgramsAvailable', 'No programs currently available.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {localizedPrograms.map((program) => (
              <div
                key={program.id}
                className="group relative bg-[#FBF9F4] rounded-2xl overflow-hidden border border-[#AD7A28]/20 hover:border-[#AD7A28] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Program Cover Photo if uploaded */}
                {program.image ? (
                  <div className="relative w-full h-44 bg-slate-900 overflow-hidden border-b border-[#AD7A28]/20">
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div 
                      className="absolute bottom-3 left-3 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md backdrop-blur-xs"
                      style={{ backgroundColor: program.color || '#AD7A28' }}
                    >
                      {getIcon(program.icon_name)}
                    </div>
                  </div>
                ) : null}

                <div className="p-7 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Icon when no image */}
                    {!program.image && (
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 shadow-sm transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: program.color || '#AD7A28' }}
                      >
                        {getIcon(program.icon_name)}
                      </div>
                    )}
                    
                    <h3 className={`text-xl font-bold text-[#16232F] mb-3 group-hover:text-[#AD7A28] transition-colors ${
                      isUrdu ? 'font-nastaliq leading-[1.6]' : 'font-display'
                    }`}>
                      {program.title}
                    </h3>
                    
                    <p className={`text-slate-600 text-sm leading-relaxed mb-6 ${
                      isUrdu ? 'font-naskh leading-[1.8]' : 'font-sans'
                    }`}>
                      {program.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8A5F19]">
                      {t('activeInitiative', 'Active Council Wing')}
                    </span>
                    
                    <button
                      onClick={() => handleSelectProgram(program)}
                      className="app-btn-link text-xs text-[#16232F] group-hover:text-[#AD7A28] cursor-pointer"
                    >
                      <span>{t('learnMore', 'Details')}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Complete Full-Screen Program Details View */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 bg-[#FBF9F4] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
          {/* Header */}
          <FullScreenHeader
            title={selectedProgram.title}
            subtitle={t('navPrograms', 'Programs & Initiatives')}
            badge={t('siteName', 'ARAAIN BANNU')}
            icon={<Layers className="w-4 h-4 text-amber-300" />}
            onBack={handleClose}
          />

          {/* Screen Body */}
          <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
              
              {/* If photo attached, display banner */}
              {selectedProgram.image && (
                <div className="w-full h-64 sm:h-80 bg-slate-900 overflow-hidden relative">
                  <img
                    src={selectedProgram.image}
                    alt={selectedProgram.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <span className="px-3 py-1 rounded-full bg-amber-500/90 text-white font-bold text-xs uppercase tracking-wider">
                      {selectedProgram.category || 'Welfare Initiative'}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-10">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-md"
                  style={{ backgroundColor: selectedProgram.color || '#AD7A28' }}
                >
                  {getIcon(selectedProgram.icon_name)}
                </div>

                <h2 className={`text-2xl sm:text-3xl font-extrabold text-[#16232F] mb-4 ${
                  isUrdu ? 'font-nastaliq text-3xl sm:text-4xl' : 'font-display'
                }`}>
                  {selectedProgram.title}
                </h2>

                <p className={`text-slate-700 text-base sm:text-lg leading-relaxed mb-8 ${
                  isUrdu ? 'font-naskh leading-[2]' : 'font-sans'
                }`}>
                  {selectedProgram.desc}
                </p>

                <div className={`p-6 rounded-2xl bg-[#F8F4E8] border border-[#AD7A28]/20 text-sm sm:text-base text-[#16232F] leading-relaxed mb-8 ${
                  isUrdu ? 'font-naskh leading-[1.9]' : 'font-sans'
                }`}>
                  {isUrdu ? (
                    <div>
                      <h3 className="font-bold text-[#8A5F19] text-base mb-2">کمیونٹی کا مقصد و لائحہ عمل</h3>
                      <p>یہ باضابطہ اقدام بنوں کی مجلس عاملہ کے زیر نگرانی مکمل شفافیت اور برادری کے مفاد کے تحت چلایا جاتا ہے۔ اس شعبے کے تحت رضاکارانہ خدمات انجام دینے، مالی یا تکنیکی تعاون فراہم کرنے کے لیے رابطہ فارم استعمال کریں۔</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold text-[#8A5F19] text-base mb-2">Community Mission & Operational Scope</h3>
                      <p>This initiative is supervised directly by the executive council in Bannu. To volunteer, contribute resources, or apply for direct assistance under this wing, please connect through our official contact channels.</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {isUrdu ? 'شعبہ جاتی رپورٹ — آرائیں بنوں' : 'Executive Wing Dossier — Araain Bannu'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
