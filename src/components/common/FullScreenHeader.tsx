import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface FullScreenHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  onBack: () => void;
  rightActions?: React.ReactNode;
  dark?: boolean;
}

export const FullScreenHeader: React.FC<FullScreenHeaderProps> = ({
  title,
  subtitle,
  badge,
  icon,
  onBack,
  rightActions,
  dark = false,
}) => {
  const { isUrdu } = useLanguage();

  return (
    <header
      className={`sticky top-0 z-40 px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between border-b shadow-xs transition-colors shrink-0 ${
        dark
          ? 'bg-[#121D27] text-white border-white/10'
          : 'bg-[#16232F] text-white border-[#AD7A28]/30'
      }`}
    >
      {/* Leading: Screen Icon & Title */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {icon && (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#AD7A28]/20 border border-[#AD7A28]/40 text-[#F5CA7B] flex items-center justify-center shrink-0 hidden xs:flex">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            {badge && (
              <span className={`inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-300/90 leading-none mb-0.5 truncate ${
                isUrdu ? 'font-nastaliq' : 'font-display'
              }`}>
                {badge}
              </span>
            )}
            <h1
              className={`text-sm sm:text-base md:text-lg font-bold text-white tracking-tight truncate leading-snug ${
                isUrdu ? 'font-nastaliq text-base sm:text-lg' : 'font-display'
              }`}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={`text-[10px] sm:text-xs text-slate-300 truncate hidden sm:block ${
                  isUrdu ? 'font-naskh' : 'font-sans'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Trailing: Close Control & Optional Action Items */}
      <div className="flex items-center gap-2 shrink-0">
        {rightActions}
        <button
          type="button"
          onClick={onBack}
          aria-label={isUrdu ? 'بند کریں' : 'Close'}
          title={isUrdu ? 'بند کریں (Esc یا ڈیوائس بیک)' : 'Close (Esc or Device Back)'}
          className="app-btn-icon"
        >
          <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>
      </div>
    </header>
  );
};
