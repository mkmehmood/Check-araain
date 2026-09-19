import React, { useState } from 'react';
import { normalizeUrl, fetchUrlData, ResolvedUrlData } from '../../utils/urlResolver';
import { 
  Link as LinkIcon, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Globe, 
  Video, 
  Share2, 
  Camera, 
  Phone,
  MessageCircle,
  Sparkles
} from 'lucide-react';

interface UrlResolverFieldProps {
  label: string;
  value?: string;
  onChange: (resolvedUrl: string, metadata?: ResolvedUrlData) => void;
  placeholder?: string;
  isUrdu?: boolean;
  helperText?: string;
  className?: string;
  allowFetchMetadata?: boolean;
  onDataResolved?: (metadata: ResolvedUrlData) => void;
}

export const UrlResolverField: React.FC<UrlResolverFieldProps> = ({
  label,
  value = '',
  onChange,
  placeholder,
  isUrdu = false,
  helperText,
  className = '',
  allowFetchMetadata = true,
  onDataResolved,
}) => {
  const [isResolving, setIsResolving] = useState(false);
  const [metadata, setMetadata] = useState<ResolvedUrlData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (raw: string) => {
    setErrorMsg(null);
    onChange(raw);
  };

  const handleBlur = () => {
    if (value && value.trim()) {
      const normalized = normalizeUrl(value);
      if (normalized !== value) {
        onChange(normalized);
      }
    }
  };

  const handleResolveAndFetch = async () => {
    if (!value || !value.trim()) return;
    try {
      setIsResolving(true);
      setErrorMsg(null);
      const data = await fetchUrlData(value);
      if (data.ok) {
        setMetadata(data);
        if (data.resolvedUrl && data.resolvedUrl !== value) {
          onChange(data.resolvedUrl, data);
        }
        if (onDataResolved) {
          onDataResolved(data);
        }
      } else {
        setErrorMsg(data.error || 'Could not fetch metadata');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error resolving URL');
    } finally {
      setIsResolving(false);
    }
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case 'youtube':
        return <Video className="w-3.5 h-3.5 text-red-600" />;
      case 'facebook':
        return <Share2 className="w-3.5 h-3.5 text-blue-600" />;
      case 'twitter':
        return <MessageCircle className="w-3.5 h-3.5 text-sky-500" />;
      case 'instagram':
        return <Camera className="w-3.5 h-3.5 text-pink-600" />;
      case 'whatsapp':
        return <Phone className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-[#AD7A28]" />;
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <LinkIcon className="w-3.5 h-3.5 text-[#AD7A28]" />
          <span>{label}</span>
        </label>
        {value && (
          <a
            href={normalizeUrl(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-semibold text-[#AD7A28] hover:text-[#8C601A] flex items-center gap-1 transition-colors"
          >
            <span>{isUrdu ? 'کھول کر دیکھیں' : 'Test Link'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Input row with 1-click Fetch/Resolve */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder || (isUrdu ? 'https://... ویب سائٹ یا سوشل میڈیا لنک درج کریں' : 'https://example.com or social media link')}
            className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#AD7A28] focus:border-transparent outline-none bg-slate-50/60 focus:bg-white"
          />
          {metadata?.platform && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              {getPlatformIcon(metadata.platform)}
            </div>
          )}
        </div>

        {allowFetchMetadata && (
          <button
            type="button"
            onClick={handleResolveAndFetch}
            disabled={!value.trim() || isResolving}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#AD7A28]/10 text-slate-700 hover:text-[#8C601A] border border-slate-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer disabled:opacity-40"
            title="Fetch metadata, thumbnail and verify destination"
          >
            {isResolving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#AD7A28]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#AD7A28]" />
            )}
            <span className="hidden sm:inline">
              {isUrdu ? 'ڈیٹا حاصل کریں' : 'Resolve'}
            </span>
          </button>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-400 mt-0.5">
          {helperText}
        </p>
      )}

      {errorMsg && (
        <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" />
          <span>{errorMsg}</span>
        </p>
      )}

      {/* Resolved Link Preview Card */}
      {metadata && (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 mt-2 flex items-start gap-3 animate-fadeIn">
          {metadata.image ? (
            <img
              src={metadata.image}
              alt="Link Preview"
              className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0 bg-white"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              {getPlatformIcon(metadata.platform)}
            </div>
          )}
          <div className="min-w-0 flex-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 truncate">
              {metadata.favicon && (
                <img src={metadata.favicon} alt="" className="w-3.5 h-3.5 shrink-0 rounded-xs" />
              )}
              <span className="truncate">{metadata.title || metadata.siteName || metadata.resolvedUrl}</span>
            </div>
            {metadata.description && (
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                {metadata.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
              <span className="capitalize font-semibold text-[#8C601A] bg-[#AD7A28]/10 px-1.5 py-0.2 rounded-sm">
                {metadata.platform}
              </span>
              <span className="truncate">{metadata.resolvedUrl}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
