import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Trash2, Image as ImageIcon, Eye, Check, RefreshCw } from 'lucide-react';
import { compressImage } from '../../services/firebase';

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (base64OrUrl: string) => void;
  onRemove?: () => void;
  aspectRatio?: 'square' | 'video' | 'banner' | 'avatar' | 'auto';
  maxWidth?: number;
  quality?: number;
  placeholderText?: string;
  isUrdu?: boolean;
  helperText?: string;
  className?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  onRemove,
  aspectRatio = 'video',
  maxWidth = 1000,
  quality = 0.8,
  placeholderText,
  isUrdu = false,
  helperText,
  className = '',
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessing(true);
      const b64 = await compressImage(file, maxWidth, quality);
      onChange(b64);
    } catch (err) {
      console.error('Failed to compress image:', err);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput('');
  };

  const handleClear = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange('');
    }
  };

  const aspectClass = {
    square: 'aspect-square max-w-[200px]',
    avatar: 'w-24 h-24 rounded-full',
    video: 'aspect-video max-w-sm',
    banner: 'aspect-[21/9] max-w-md',
    auto: 'min-h-[140px] max-w-sm',
  }[aspectRatio];

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'تصویر ہٹائیں' : 'Remove Image'}</span>
          </button>
        )}
      </div>

      {value ? (
        /* Image Preview with Controls */
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 shadow-xs">
          <div className={`relative ${aspectClass} overflow-hidden bg-slate-100 flex items-center justify-center`}>
            <img
              src={value}
              alt="Preview"
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                aspectRatio === 'avatar' ? 'rounded-full' : ''
              }`}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewZoom(true)}
                className="p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-white text-xs font-bold shadow-sm transition-all"
                title="View Large"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-white text-xs font-bold shadow-sm transition-all"
                title="Replace Image"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold shadow-sm transition-all"
                title="Delete Image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-2 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'تصویر منسلک ہے' : 'Image Attached & Active'}</span>
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-semibold text-[#AD7A28] hover:underline cursor-pointer"
            >
              {isUrdu ? 'تبدیل کریں' : 'Replace File'}
            </button>
          </div>
        </div>
      ) : (
        /* Empty Upload Box */
        <div className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#AD7A28]/50 bg-slate-50/70 p-4 transition-colors">
          {/* Mode Switch: Upload File vs Image URL */}
          <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
            <span className="text-xs text-slate-500 font-medium">
              {isUrdu ? 'تصویر شامل کرنے کا طریقہ منتخب کریں:' : 'Select image source:'}
            </span>
            <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setMode('upload')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  mode === 'upload' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isUrdu ? 'فائل اپلوڈ' : 'Upload File'}
              </button>
              <button
                type="button"
                onClick={() => setMode('url')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  mode === 'url' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isUrdu ? 'ویب لنک (URL)' : 'Web URL'}
              </button>
            </div>
          </div>

          {mode === 'upload' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center py-4 px-2 text-center cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#AD7A28] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                {isProcessing ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-700">
                {isProcessing
                  ? (isUrdu ? 'تصویر پروسیس ہو رہی ہے...' : 'Optimizing and processing image...')
                  : (isUrdu ? 'تصویر منتخب کرنے کے لیے کلک کریں' : 'Click or drop to upload image')}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {helperText || (isUrdu ? 'JPG, PNG, WebP — خودکار سائز و کمپریشن' : 'JPG, PNG, WebP supported (auto-compressed)')}
              </p>
            </div>
          ) : (
            <div className="space-y-2 py-1">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder={placeholderText || (isUrdu ? 'https://... تصویر کا مکمل لنک درج کریں' : 'https://example.com/image.jpg')}
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full text-xs bg-white px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-[#AD7A28] focus:border-[#AD7A28]"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={!urlInput.trim()}
                  className="px-3.5 py-2 rounded-xl bg-[#AD7A28] hover:bg-[#8C601A] disabled:opacity-40 text-white text-xs font-bold cursor-pointer shrink-0 transition-colors"
                >
                  {isUrdu ? 'منسلک کریں' : 'Apply'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                {isUrdu ? 'کسی بھی آن لائن تصویر کا براہ راست لنک چسپاں کریں' : 'Paste any publicly accessible direct image URL'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input for reuse */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Large View Zoom Modal */}
      {previewZoom && value && (
        <div
          onClick={() => setPreviewZoom(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl">
            <img src={value} alt="Large preview" className="w-full h-full object-contain max-h-[85vh] rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};
