/**
 * URL and Social Media Resolver Utility
 * Resolves, sanitizes, and extracts data & metadata from websites and social media platforms.
 */

export interface ResolvedUrlData {
  ok: boolean;
  resolvedUrl: string;
  platform: 'website' | 'youtube' | 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'tiktok' | 'linkedin' | 'email' | 'phone' | 'anchor';
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
  error?: string;
}

/**
 * Normalizes any URL, ensuring proper protocol (https://) so relative routing bugs never happen.
 */
export function normalizeUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let u = rawUrl.trim();
  if (!u) return '';

  // Internal hash anchors, phone, mailto
  if (u.startsWith('#') || u.startsWith('mailto:') || u.startsWith('tel:')) {
    return u;
  }

  // Double slash protocol relative
  if (u.startsWith('//')) {
    return 'https:' + u;
  }

  // Strip leading spaces or slashes
  u = u.replace(/^\/+/, '');

  // If already starts with http/https
  if (/^https?:\/\//i.test(u)) {
    return u;
  }

  // Prepend https://
  return 'https://' + u;
}

/**
 * Converts a social media handle, phone, or raw URL into a valid external URL
 */
export function resolveSocialUrl(
  input: string, 
  platform: 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'youtube' | 'linkedin' | 'auto'
): string {
  if (!input || !input.trim()) return '';
  const trimmed = input.trim();

  // If already full URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  const cleanHandle = trimmed.replace(/^[@/]+/, '');

  switch (platform) {
    case 'facebook':
      return `https://facebook.com/${cleanHandle}`;
    case 'twitter':
      return `https://x.com/${cleanHandle}`;
    case 'instagram':
      return `https://instagram.com/${cleanHandle}`;
    case 'whatsapp': {
      // Group link or phone
      if (trimmed.includes('chat.whatsapp.com')) {
        return `https://${trimmed.replace(/^https?:\/\//, '')}`;
      }
      const digitsOnly = trimmed.replace(/[^0-9]/g, '');
      const formattedNumber = digitsOnly.startsWith('0') ? '92' + digitsOnly.slice(1) : digitsOnly;
      return `https://wa.me/${formattedNumber}`;
    }
    case 'youtube':
      return cleanHandle.startsWith('channel/') || cleanHandle.startsWith('c/') || cleanHandle.startsWith('@')
        ? `https://youtube.com/${cleanHandle}`
        : `https://youtube.com/@${cleanHandle}`;
    case 'linkedin':
      return `https://linkedin.com/in/${cleanHandle}`;
    default:
      return normalizeUrl(trimmed);
  }
}

/**
 * Calls backend API to resolve URL and fetch open-graph preview & title data from any site
 */
export async function fetchUrlData(rawUrl: string): Promise<ResolvedUrlData> {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) {
    return {
      ok: false,
      resolvedUrl: '',
      platform: 'website',
      error: 'Empty URL provided',
    };
  }

  try {
    const response = await fetch('/api/resolve-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: normalized }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    // Client-side fallback
  }

  // Client-side heuristic fallback
  let platform: ResolvedUrlData['platform'] = 'website';
  const lower = normalized.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) platform = 'youtube';
  else if (lower.includes('facebook.com') || lower.includes('fb.me')) platform = 'facebook';
  else if (lower.includes('twitter.com') || lower.includes('x.com')) platform = 'twitter';
  else if (lower.includes('instagram.com')) platform = 'instagram';
  else if (lower.includes('wa.me') || lower.includes('whatsapp.com')) platform = 'whatsapp';

  let ytThumb = '';
  if (platform === 'youtube') {
    const match = normalized.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v)\/))([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      ytThumb = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }

  return {
    ok: true,
    resolvedUrl: normalized,
    platform,
    title: normalized.replace(/^https?:\/\//, '').split('/')[0],
    image: ytThumb || '',
  };
}
