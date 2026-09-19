import React from 'react';
import { isUrduText } from '../../utils/urduTransliterator';

interface SingleFieldProps {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  isUrdu?: boolean;
  helperText?: string;
  className?: string;
  required?: boolean;
}

/**
 * A single plain-language input. The admin types content in whichever
 * language is natural to them (English or Urdu) - the public website
 * automatically detects the script and translates it for visitors on the
 * fly (see src/data/translations.ts). Admin never enters two versions of
 * the same text, so there is nothing to keep in sync here.
 */
export const SingleField: React.FC<SingleFieldProps> = ({
  label,
  value = '',
  onChange,
  multiline = false,
  rows = 2,
  placeholder,
  isUrdu = false,
  helperText,
  className = '',
  required = false,
}) => {
  const detectedUrdu = isUrduText(value);
  const effectivePlaceholder = placeholder || (isUrdu ? 'متن درج کریں...' : 'Enter text...');

  const sharedClasses = `w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#AD7A28] focus:border-transparent outline-none transition-all bg-slate-50/60 focus:bg-white ${
    detectedUrdu ? 'font-nastaliq leading-[1.8] text-base' : 'font-sans'
  }`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>

      {multiline ? (
        <textarea
          rows={rows}
          dir={detectedUrdu ? 'rtl' : 'ltr'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={effectivePlaceholder}
          className={sharedClasses}
        />
      ) : (
        <input
          type="text"
          dir={detectedUrdu ? 'rtl' : 'ltr'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={effectivePlaceholder}
          className={sharedClasses}
        />
      )}

      {helperText && <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>}
    </div>
  );
};
