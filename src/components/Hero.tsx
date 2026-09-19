import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { 
  Shield, 
  Sparkles, 
  Calendar, 
  UserPlus, 
  Heart, 
  Megaphone, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play,
  Image as ImageIcon
} from 'lucide-react';

interface HeroProps {
  onOpenMembership: () => void;
  onOpenDonation: () => void;
  onNavigateSection: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenMembership,
  onOpenDonation,
  onNavigateSection,
}) => {
  const { t, isUrdu, tSetting } = useLanguage();
  const { settings } = useData();

  // Resolve single or multiple pictures configured by admin in Firestore
  const heroImages = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(settings.heroImages) && settings.heroImages.length > 0) {
      list.push(...settings.heroImages.filter((img) => Boolean(img && typeof img === 'string' && img.trim().length > 0)));
    } else if (settings.heroImage && typeof settings.heroImage === 'string' && settings.heroImage.trim().length > 0) {
      list.push(settings.heroImage);
    }
    return list;
  }, [settings.heroImages, settings.heroImage]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideDurationSec = Math.max(3, settings.heroSlideDuration || 5);
  const isMultiple = heroImages.length > 1;

  // Touch Swipe detection for mobile devices
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    // Horizontal swipe must exceed 35px and be more horizontal than vertical
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Animated Timing Slideshow Interval
  useEffect(() => {
    if (!isMultiple || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, slideDurationSec * 1000);

    return () => clearInterval(timer);
  }, [heroImages.length, isMultiple, isPaused, slideDurationSec]);

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <section 
      id="hero"
      className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center pt-24 xs:pt-28 sm:pt-36 md:pt-40 pb-20 sm:pb-20 bg-[#16232F] text-white overflow-hidden group select-none touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ═══ ANIMATED BACKGROUND PICTURES (Single or Multiple with Animated.timing) ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {heroImages.map((imgUrl, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={`${imgUrl}-${idx}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-1' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={imgUrl}
                alt={`Hero background ${idx + 1}`}
                className={`w-full h-full object-cover object-center transform transition-transform duration-[7000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}

        {/* Cinematic Multi-layer Scrim Overlays for Pristine Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#16232F]/92 via-[#16232F]/78 to-[#16232F]/95 z-2" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#16232F]/65 to-[#16232F] z-2" />
        
        {/* Subtle Brand Ambient Glows */}
        <div className="absolute -top-40 -right-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#AD7A28]/20 blur-3xl pointer-events-none z-2"></div>
        <div className="absolute -bottom-40 -left-40 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none z-2"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Sacred Quranic Bismillah Inscription */}
        <div 
          className="font-quran text-sm xs:text-base sm:text-xl text-amber-200/90 mb-3 tracking-wider select-none drop-shadow-xs"
          aria-label="In the name of Allah, the Most Gracious, the Most Merciful"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>

        {/* Top Heritage Badge */}
        <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#AD7A28]/25 border border-[#AD7A28]/50 text-[#F5CA7B] text-[11px] sm:text-xs md:text-sm font-semibold mb-2.5 sm:mb-4 shadow-sm backdrop-blur-md max-w-full text-center">
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-300" />
          <span className={isUrdu ? 'font-naskh leading-normal' : 'font-sans tracking-wide leading-tight'}>
            {tSetting('heroBadge', settings)}
          </span>
        </div>

        {/* Main Title (Header) - Intelligent font: Noto Nastaliq in Urdu, Cinzel in English */}
        <h1 className={`text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-2 sm:mb-3.5 tracking-tight rtl:tracking-normal leading-tight sm:leading-[1.15] rtl:leading-[1.3] sm:rtl:leading-[1.35] drop-shadow-sm max-w-4xl mx-auto px-1 ${
          isUrdu ? 'font-nastaliq' : 'font-display tracking-wider'
        }`}>
          <span className="bg-gradient-to-r from-white via-slate-100 to-amber-100 bg-clip-text text-transparent inline-block pb-1 sm:pb-2">
            {tSetting('heroTitle', settings)}
          </span>
        </h1>

        {/* Subtitle (Sub-header) - Intelligent font: Noto Nastaliq in Urdu, Playfair Display in English */}
        <p className={`text-sm xs:text-base sm:text-xl lg:text-2xl font-semibold text-amber-200/90 mb-2 sm:mb-3 max-w-2xl sm:max-w-3xl mx-auto leading-snug sm:leading-normal rtl:leading-relaxed drop-shadow-sm px-2 ${
          isUrdu ? 'font-nastaliq' : 'font-editorial italic'
        }`}>
          {tSetting('heroSub', settings)}
        </p>

        {/* Detailed Tagline - Clean Body Font */}
        <p className={`text-xs sm:text-sm md:text-base text-slate-200/90 mb-5 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto leading-relaxed rtl:leading-relaxed font-normal drop-shadow-sm px-2 ${
          isUrdu ? 'font-nastaliq' : 'font-sans'
        }`}>
          {tSetting('heroTagline', settings)}
        </p>

        {/* Call to Action Buttons - Touch-Friendly Mobile Layout */}
        <div className="w-full max-w-md sm:max-w-2xl mx-auto mb-5 sm:mb-8 px-2">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-row sm:items-center sm:justify-center gap-3">
            <button
              id="hero-btn-membership"
              onClick={onOpenMembership}
              className={`app-btn-success app-btn-lg app-btn-full touch-manipulation ${
                isUrdu ? 'font-naskh' : 'font-sans'
              }`}
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>{t('btnBecomeMember', 'Become a Member')}</span>
            </button>

            <button
              id="hero-btn-donate"
              onClick={onOpenDonation}
              className={`app-btn-primary app-btn-lg app-btn-full touch-manipulation ${
                isUrdu ? 'font-naskh' : 'font-sans'
              }`}
            >
              <Heart className="w-4 h-4 fill-current shrink-0" />
              <span>{t('navDonate', 'Donate & Support')}</span>
            </button>

            <button
              id="hero-btn-events"
              onClick={() => onNavigateSection('events')}
              className={`app-btn-ghost app-btn-lg app-btn-full xs:col-span-2 sm:col-span-1 touch-manipulation ${
                isUrdu ? 'font-naskh' : 'font-sans'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{t('btnEvents', 'Upcoming Events')}</span>
            </button>
          </div>
        </div>

        {/* Custom Website Live Notice Ribbon / Council Updates (Single Line Moving / Animating) */}
        {settings.customNoticeHeadline && (
          <div className="mb-5 sm:mb-8 w-full max-w-3xl mx-auto px-3 py-1.5 sm:py-2 rounded-full bg-white/10 border border-[#AD7A28]/40 backdrop-blur-md text-amber-100 flex items-center justify-between gap-2.5 sm:gap-3 text-xs sm:text-sm shadow-md overflow-hidden group">
            <div className="flex items-center gap-1.5 shrink-0 z-10">
              <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-full bg-[#AD7A28] text-white text-[10px] sm:text-[11px] font-bold shrink-0 shadow-xs ${
                isUrdu ? 'font-naskh' : 'font-sans'
              }`}>
                <Megaphone className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
                <span className="whitespace-nowrap">{isUrdu ? 'کونسل کی اہم اپڈیٹ' : 'Council Update'}</span>
              </span>
            </div>

            {/* Single line animated moving ticker */}
            <div className="overflow-hidden whitespace-nowrap flex-1 mx-1 sm:mx-2 relative">
              <div className="animate-marquee flex items-center gap-8 whitespace-nowrap py-0.5">
                <span className={`text-slate-100 font-medium ${isUrdu ? 'font-naskh text-xs sm:text-[13px]' : 'font-sans text-xs sm:text-sm'}`}>
                  {tSetting('customNoticeHeadline', settings)}
                </span>
                <span className="text-amber-400 select-none">✦</span>
                <span className={`text-slate-100 font-medium ${isUrdu ? 'font-naskh text-xs sm:text-[13px]' : 'font-sans text-xs sm:text-sm'}`}>
                  {tSetting('customNoticeHeadline', settings)}
                </span>
                <span className="text-amber-400 select-none">✦</span>
                <span className={`text-slate-100 font-medium ${isUrdu ? 'font-naskh text-xs sm:text-[13px]' : 'font-sans text-xs sm:text-sm'}`}>
                  {tSetting('customNoticeHeadline', settings)}
                </span>
                <span className="text-amber-400 select-none">✦</span>
              </div>
            </div>

            {settings.lastWebsiteUpdate && (
              <div className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-300/90 font-mono shrink-0 z-10 pl-2 pr-1 border-l border-white/20 rtl:border-r rtl:border-l-0">
                <Clock className="w-3 h-3 text-amber-400" />
                <span className="whitespace-nowrap">{isUrdu ? 'اپڈیٹ شدہ' : 'Updated'}</span>
              </div>
            )}
          </div>
        )}

        {/* Highlight Stats Row - 3 Compact Mobile Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 w-full max-w-3xl mx-auto pt-4 sm:pt-7 border-t border-white/10">
          <div className="p-2 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center text-center">
            <div className="text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#F5CA7B] tracking-tight leading-tight font-mono">
              {tSetting('statMembers', settings)}
            </div>
            <div className={`text-[10px] sm:text-xs md:text-sm text-slate-300 mt-0.5 sm:mt-1 font-medium leading-tight line-clamp-2 ${
              isUrdu ? 'font-naskh' : 'font-sans'
            }`}>
              {t('statMembersLabel', 'Active Members')}
            </div>
          </div>

          <div className="p-2 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center text-center">
            <div className="text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#F5CA7B] tracking-tight leading-tight font-mono">
              {tSetting('statPrograms', settings)}
            </div>
            <div className={`text-[10px] sm:text-xs md:text-sm text-slate-300 mt-0.5 sm:mt-1 font-medium leading-tight line-clamp-2 ${
              isUrdu ? 'font-naskh' : 'font-sans'
            }`}>
              {t('statProgramsLabel', 'Flagship Programs')}
            </div>
          </div>

          <div className="p-2 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center text-center">
            <div className="text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#F5CA7B] tracking-tight leading-tight font-mono">
              {tSetting('statCities', settings)}
            </div>
            <div className={`text-[10px] sm:text-xs md:text-sm text-slate-300 mt-0.5 sm:mt-1 font-medium leading-tight line-clamp-2 ${
              isUrdu ? 'font-naskh' : 'font-sans'
            }`}>
              {t('statCitiesLabel', 'Connected Cities')}
            </div>
          </div>
        </div>

      </div>

      {/* ═══ SLIDESHOW CONTROLS & ANIMATED TIMING INDICATORS ═══ */}
      {isMultiple && (
        <div className="absolute bottom-2.5 sm:bottom-4 left-0 right-0 z-20 flex items-center justify-center px-4 pointer-events-none">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 shadow-lg pointer-events-auto">
            {/* Prev Arrow */}
            <button
              onClick={prevSlide}
              className="app-btn-icon app-btn-icon-sm"
              title="Previous Background Image"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Slide Dots & Progress */}
            <div className="flex items-center gap-1 px-1">
              {heroImages.map((_, dotIdx) => {
                const isCur = dotIdx === currentSlide;
                return (
                  <button
                    key={dotIdx}
                    onClick={() => goToSlide(dotIdx)}
                    className="relative p-1 focus:outline-none cursor-pointer"
                    title={`Slide ${dotIdx + 1}`}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  >
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isCur ? 'w-5 sm:w-6 bg-amber-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Next Arrow */}
            <button
              onClick={nextSlide}
              className="app-btn-icon app-btn-icon-sm"
              title="Next Background Image"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Play / Pause Toggle */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="app-btn-icon app-btn-icon-sm text-amber-300/80 hover:text-amber-300 ml-0.5"
              title={isPaused ? "Resume Slideshow" : "Pause Slideshow"}
              aria-label={isPaused ? "Resume Slideshow" : "Pause Slideshow"}
            >
              {isPaused ? <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            </button>
          </div>
        </div>
      )}

    </section>
  );
};
