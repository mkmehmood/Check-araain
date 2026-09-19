import React, { useState, useEffect } from 'react';
import { 
  isUrduText, 
  translateEnglishToUrdu, 
  translateUrduToEnglish,
  translateEnglishToUrduAsync,
  translateUrduToEnglishAsync
} from '../../utils/urduTransliterator';
import { Languages, ChevronDown, ChevronUp, Check, Sparkles } from 'lucide-react';

interface BilingualFieldProps {
  label: string;
  valueEn?: string;
  valueUr?: string;
  onChange?: (valEn: string, valUr: string) => void;
  onChangeEn?: (valEn: string) => void;
  onChangeUr?: (valUr: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  placeholderEn?: string;
  placeholderUr?: string;
  isUrdu?: boolean;
  helperText?: string;
  className?: string;
  required?: boolean;
  dir?: 'auto' | 'ltr' | 'rtl';
}

export const BilingualField: React.FC<BilingualFieldProps> = ({
  label,
  valueEn = '',
  valueUr = '',
  onChange,
  onChangeEn,
  onChangeUr,
  multiline = false,
  rows = 2,
  placeholder,
  placeholderEn,
  placeholderUr,
  isUrdu = false,
  helperText,
  className = '',
  required = false,
}) => {
  const [isFineTuneOpen, setIsFineTuneOpen] = useState(false);

  const notifyChange = (newEn: string, newUr: string) => {
    if (onChange) onChange(newEn, newUr);
    if (onChangeEn) onChangeEn(newEn);
    if (onChangeUr) onChangeUr(newUr);
  };

  // Active value shown in the single field based on current admin dashboard language or content
  const activeValue = isUrdu ? (valueUr || valueEn) : (valueEn || valueUr);
  const detectedUrdu = isUrduText(activeValue);

  const effectivePlaceholder = placeholder || (isUrdu ? (placeholderUr || placeholderEn) : (placeholderEn || placeholderUr)) || (isUrdu ? 'متن درج کریں (اردو یا انگریزی خودکار محفوظ ہوگی)...' : 'Enter text (Urdu & English auto-sync)...');

  const handleSingleInputChange = (newVal: string) => {
    const isUr = isUrduText(newVal);

    if (isUr) {
      // User typed Urdu text
      const autoEn = translateUrduToEnglish(newVal);
      notifyChange(autoEn, newVal);

      // Background refine translation with Azure API if available
      translateUrduToEnglishAsync(newVal).then((refined) => {
        if (refined && refined !== autoEn) {
          notifyChange(refined, newVal);
        }
      }).catch(() => {});
    } else {
      // User typed English text
      const autoUr = translateEnglishToUrdu(newVal);
      notifyChange(newVal, autoUr);

      // Background refine translation with Azure API if available
      translateEnglishToUrduAsync(newVal).then((refined) => {
        if (refined && refined !== autoUr) {
          notifyChange(newVal, refined);
        }
      }).catch(() => {});
    }
  };

  const handleManualEnChange = (enText: string) => {
    notifyChange(enText, valueUr);
  };

  const handleManualUrChange = (urText: string) => {
    notifyChange(valueEn, urText);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
        
        {/* Subtle dual-language status indicator & manual fine-tune toggle */}
        <button
          type="button"
          onClick={() => setIsFineTuneOpen(!isFineTuneOpen)}
          className="text-[11px] font-medium text-[#AD7A28] hover:text-[#8C601A] flex items-center gap-1 cursor-pointer transition-colors"
          title="Toggle language preview / fine-tuning"
        >
          <Languages className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isFineTuneOpen 
              ? (isUrdu ? 'بند کریں' : 'Hide dual view') 
              : (isUrdu ? 'اردو/انگریزی دیکھیں' : 'Urdu & English synced')}
          </span>
          {isFineTuneOpen ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Single Unified Input Field */}
      <div className="relative">
        {multiline ? (
          <textarea
            rows={rows}
            dir={detectedUrdu ? 'rtl' : 'ltr'}
            value={activeValue}
            onChange={(e) => handleSingleInputChange(e.target.value)}
            placeholder={effectivePlaceholder}
            className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#AD7A28] focus:border-transparent outline-none transition-all bg-slate-50/60 focus:bg-white ${
              detectedUrdu ? 'font-nastaliq leading-[1.8] text-base' : 'font-sans'
            }`}
          />
        ) : (
          <input
            type="text"
            dir={detectedUrdu ? 'rtl' : 'ltr'}
            value={activeValue}
            onChange={(e) => handleSingleInputChange(e.target.value)}
            placeholder={effectivePlaceholder}
            className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#AD7A28] focus:border-transparent outline-none transition-all bg-slate-50/60 focus:bg-white ${
              detectedUrdu ? 'font-nastaliq leading-[1.8] text-base' : 'font-sans'
            }`}
          />
        )}

        <div className="absolute right-2.5 bottom-2.5 rtl:right-auto rtl:left-2.5 pointer-events-none flex items-center gap-1 text-[10px] text-slate-400 bg-white/80 backdrop-blur-xs px-1.5 py-0.5 rounded-md border border-slate-200">
          <Sparkles className="w-2.5 h-2.5 text-[#AD7A28]" />
          <span>{detectedUrdu ? 'اردو' : 'EN'}</span>
        </div>
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-400 mt-0.5">
          {helperText}
        </p>
      )}

      {/* Optional Fine-Tune Drawer (Only if admin wants to inspect or manually edit the translation) */}
      {isFineTuneOpen && (
        <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200/80 space-y-2.5 mt-2 animate-fadeIn text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold border-b border-slate-200 pb-1">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>{isUrdu ? 'دونوں زبانوں کا متن خودکار سنک ہے' : 'Both languages synchronized'}</span>
            </span>
            <span className="text-[10px] text-slate-400">
              {isUrdu ? 'ضرورت پڑنے پر الگ الگ بھی ایڈٹ کر سکتے ہیں' : 'Edit individually if needed'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="block text-[11px] font-bold text-slate-600 mb-1">
                English version:
              </span>
              <input
                type="text"
                value={valueEn}
                onChange={(e) => handleManualEnChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-sans focus:ring-1 focus:ring-[#AD7A28] outline-none"
                placeholder="English text"
              />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-slate-600 mb-1 font-urdu">
                اردو ورژن:
              </span>
              <input
                type="text"
                dir="rtl"
                value={valueUr}
                onChange={(e) => handleManualUrChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-nastaliq focus:ring-1 focus:ring-[#AD7A28] outline-none"
                placeholder="اردو متن"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
