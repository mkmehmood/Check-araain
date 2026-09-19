import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PageItem } from '../types';
import { BookOpen } from 'lucide-react';
import { FullScreenHeader } from './common/FullScreenHeader';

interface PageModalProps {
  page: PageItem | null;
  onClose: () => void;
}

export const PageModal: React.FC<PageModalProps> = ({ page, onClose }) => {
  const { t, isUrdu, getPages } = useLanguage();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!page) return null;

  const localizedPage = getPages([page])[0] || page;

  return (
    <div className="fixed inset-0 z-50 bg-[#FBF9F4] text-[#16232F] flex flex-col min-h-screen overflow-y-auto animate-fadeIn">
      {/* Complete Screen Header with Back Movement */}
      <FullScreenHeader
        title={localizedPage.title}
        subtitle={localizedPage.label}
        badge={t('siteName', 'ARAAIN BANNU')}
        icon={<BookOpen className="w-4 h-4 text-amber-300" />}
        onBack={onClose}
      />

      {/* Screen Body Content */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <article className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
          <header className="border-b border-slate-100 pb-6 mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-[#AD7A28]/10 text-[#AD7A28] text-xs font-bold uppercase tracking-wider mb-2">
              {localizedPage.label}
            </span>
            <h1
              className={`text-2xl sm:text-3xl font-extrabold text-[#16232F] tracking-tight ${
                isUrdu ? 'font-nastaliq text-3xl sm:text-4xl' : 'font-display'
              }`}
            >
              {localizedPage.title}
            </h1>
          </header>

          {localizedPage.image && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-[420px] bg-slate-900">
              <img
                src={localizedPage.image}
                alt={localizedPage.title}
                className="w-full h-full object-cover max-h-[420px]"
              />
            </div>
          )}

          <div
            className={`prose prose-slate max-w-none text-slate-700 text-base sm:text-lg leading-relaxed whitespace-pre-line font-normal ${
              isUrdu ? 'font-naskh leading-[2]' : 'font-sans'
            }`}
          >
            {localizedPage.body}
          </div>

          <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {isUrdu ? 'مرکزی کونسل بنوں — باضابطہ اشاعت' : 'Official Publication — Central Council Bannu'}
            </span>
          </div>
        </article>
      </div>
    </div>
  );
};
