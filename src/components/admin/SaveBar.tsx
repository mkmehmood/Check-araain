import React from 'react';
import { Save, Check, Clock, AlertCircle, RefreshCw } from 'lucide-react';

export interface SaveBarProps {
  onSave: () => Promise<void> | void;
  isDirty?: boolean;
  isSaving?: boolean;
  lastSaved?: string | Date | null;
  statusMessage?: string | null;
  isUrdu?: boolean;
  onReset?: () => void;
  className?: string;
}

export const SaveBar: React.FC<SaveBarProps> = ({
  onSave,
  isDirty = false,
  isSaving = false,
  lastSaved,
  statusMessage,
  isUrdu = false,
  onReset,
  className = '',
}) => {
  const formattedLastSaved = React.useMemo(() => {
    if (!lastSaved) return null;
    try {
      const d = typeof lastSaved === 'string' ? new Date(lastSaved) : lastSaved;
      if (isNaN(d.getTime())) return String(lastSaved);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return null;
    }
  }, [lastSaved]);

  return (
    <div
      className={`sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 sm:px-6 py-3 shadow-lg rounded-b-2xl transition-all ${className}`}
    >
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Status / Dirty Indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          {isDirty ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>{isUrdu ? 'غیر محفوظ شدہ تبدیلیاں' : 'Unsaved Changes'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>{isUrdu ? 'کلاؤڈ پر ہم آہنگ' : 'Saved to Cloud'}</span>
            </span>
          )}

          {formattedLastSaved && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {isUrdu ? 'آخری بار محفوظ:' : 'Last saved:'} {formattedLastSaved}
              </span>
            </span>
          )}

          {statusMessage && (
            <span className="text-xs font-medium text-[#AD7A28] truncate">
              {statusMessage}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 ml-auto">
          {onReset && isDirty && (
            <button
              type="button"
              onClick={onReset}
              disabled={isSaving}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              {isUrdu ? 'تبدیلیاں منسوخ کریں' : 'Reset'}
            </button>
          )}

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-sm transition-all cursor-pointer ${
              isDirty
                ? 'bg-[#AD7A28] hover:bg-[#8C601A] shadow-amber-900/10'
                : 'bg-[#16232F] hover:bg-[#203140]'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                <span>{isUrdu ? 'محفوظ کیا جا رہا ہے...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isUrdu ? 'محفوظ کریں' : 'Save Changes'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
