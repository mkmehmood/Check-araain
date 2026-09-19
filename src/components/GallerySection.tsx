import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { GalleryItem } from '../types';
import { Maximize2, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { FullScreenHeader } from './common/FullScreenHeader';

export const GallerySection: React.FC = () => {
  const { t, isUrdu, tSetting, getGallery } = useLanguage();
  const { settings, gallery } = useData();
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const displayGallery = getGallery(gallery);

  const openLightbox = (index: number) => {
    setActiveItemIndex(index);
    window.history.pushState({ galleryIndex: index }, '', `#gallery=${index}`);
  };

  const closeLightbox = useCallback(() => {
    if (activeItemIndex !== null) {
      setActiveItemIndex(null);
      if (window.location.hash.startsWith('#gallery')) {
        window.history.back();
      }
    }
  }, [activeItemIndex]);

  // Sync with device back button & popstate
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && typeof e.state.galleryIndex === 'number') {
        setActiveItemIndex(e.state.galleryIndex);
      } else if (!window.location.hash.startsWith('#gallery')) {
        setActiveItemIndex(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeItemIndex === null) return;
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        setActiveItemIndex((prev) => (prev !== null ? (prev + 1) % displayGallery.length : null));
      } else if (e.key === 'ArrowLeft') {
        setActiveItemIndex((prev) => (prev !== null ? (prev - 1 + displayGallery.length) % displayGallery.length : null));
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeItemIndex, closeLightbox, displayGallery.length]);

  const nextItem = () => {
    if (activeItemIndex === null) return;
    const nextIdx = (activeItemIndex + 1) % displayGallery.length;
    setActiveItemIndex(nextIdx);
    window.history.replaceState({ galleryIndex: nextIdx }, '', `#gallery=${nextIdx}`);
  };

  const prevItem = () => {
    if (activeItemIndex === null) return;
    const prevIdx = (activeItemIndex - 1 + displayGallery.length) % displayGallery.length;
    setActiveItemIndex(prevIdx);
    window.history.replaceState({ galleryIndex: prevIdx }, '', `#gallery=${prevIdx}`);
  };

  return (
    <section id="gallery" className="py-20 sm:py-24 bg-[#F8F4E8] border-b border-[#AD7A28]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#AD7A28]/15 text-[#8A5F19] text-xs font-bold uppercase tracking-wider mb-3 ${
            isUrdu ? 'font-naskh' : 'font-sans'
          }`}>
            {t('navGallery', 'Gallery')}
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold text-[#16232F] ltr:tracking-tight rtl:tracking-normal ltr:leading-tight rtl:leading-[1.45] ${
            isUrdu ? 'font-nastaliq' : 'font-display'
          }`}>
            {tSetting('galleryTitle', settings)}
          </h2>
          <p className={`mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 font-medium ltr:leading-relaxed rtl:leading-[1.85] rtl:tracking-normal ${
            isUrdu ? 'font-nastaliq' : 'font-sans'
          }`}>
            {tSetting('gallerySubtitle', settings)}
          </p>
        </div>

        {/* Gallery Grid */}
        {displayGallery.length === 0 ? (
          <div className="text-center py-16 bg-white/60 rounded-3xl border border-dashed border-[#AD7A28]/30 max-w-md mx-auto">
            <ImageIcon className="w-12 h-12 text-[#AD7A28]/40 mx-auto mb-3" />
            <p className="text-slate-500 font-medium text-sm">
              {t('noGalleryPhotos', 'No gallery photos published yet.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayGallery.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openLightbox(index)}
                className="group relative rounded-2xl overflow-hidden bg-white shadow-md border border-[#AD7A28]/20 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 aspect-[4/3]"
              >
                <img
                  src={item.data_url}
                  alt={item.caption || 'Gallery photo'}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                  {item.caption && (
                    <p className={`text-white text-sm font-semibold leading-snug ${
                      isUrdu ? 'font-nastaliq' : 'font-sans'
                    }`}>
                      {item.caption}
                    </p>
                  )}
                </div>

                <div className="absolute top-3 right-3 rtl:left-3 rtl:right-auto p-2 rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Complete Full-Screen Lightbox View with Back Movement */}
      {activeItemIndex !== null && displayGallery[activeItemIndex] && (
        <div className="fixed inset-0 z-50 bg-[#0A0F14] text-white flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
          {/* Full Screen Header */}
          <FullScreenHeader
            title={displayGallery[activeItemIndex].caption || (isUrdu ? 'تصویر گیلری' : 'Photo Gallery')}
            subtitle={`${activeItemIndex + 1} / ${displayGallery.length}`}
            badge={t('siteName', 'ARAAIN BANNU')}
            icon={<ImageIcon className="w-4 h-4 text-amber-300" />}
            onBack={closeLightbox}
            dark={true}
          />

          {/* Complete Screen Body */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative">
            <button
              onClick={prevItem}
              className="app-btn-icon absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
            </button>

            <button
              onClick={nextItem}
              className="app-btn-icon absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 rtl:rotate-180" />
            </button>

            <div className="max-w-5xl max-h-[75vh] flex flex-col items-center">
              <img
                src={displayGallery[activeItemIndex].data_url}
                alt={displayGallery[activeItemIndex].caption || 'Gallery photo'}
                className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
              />
              {displayGallery[activeItemIndex].caption && (
                <div className={`mt-5 px-6 py-2.5 rounded-xl bg-white/10 text-white text-sm sm:text-base font-medium text-center backdrop-blur-md border border-white/10 ${
                  isUrdu ? 'font-nastaliq leading-[1.8]' : 'font-sans'
                }`}>
                  {displayGallery[activeItemIndex].caption}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
