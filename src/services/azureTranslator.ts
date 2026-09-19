/**
 * Microsoft Azure Translator Client Service
 * Coordinates with the /api/translate backend route to perform genuine, high-quality
 * machine translations between Urdu and English.
 */

const STORAGE_CACHE_KEY = 'araain_azure_translations_v1';

// In-memory quick lookup cache
const memoryCache = new Map<string, string>();

// Initialize memory cache from localStorage on client
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.entries(parsed).forEach(([k, v]) => {
          if (typeof v === 'string') {
            memoryCache.set(k, v);
          }
        });
      }
    }
  } catch (e) {
    // Ignore storage parse error
  }
}

function saveMemoryCacheToStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const obj: Record<string, string> = {};
    // Cap localStorage cache to latest 500 entries to prevent quota limits
    let count = 0;
    for (const [k, v] of memoryCache.entries()) {
      obj[k] = v;
      count++;
      if (count >= 500) break;
    }
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(obj));
  } catch (e) {
    // Ignore quota errors
  }
}

export function getTranslationCacheKey(text: string, to: 'ur' | 'en', from?: 'en' | 'ur'): string {
  return `${from || 'auto'}->${to}:${text.trim().toLowerCase()}`;
}

/**
 * Synchronously checks if a translation has already been retrieved and cached.
 */
export function getCachedTranslation(text: string, to: 'ur' | 'en', from?: 'en' | 'ur'): string | null {
  if (!text || !text.trim()) return text;
  const key = getTranslationCacheKey(text, to, from);
  return memoryCache.get(key) || null;
}

/**
 * Manually seeds the cache (used when saving known translations in admin or dictionaries)
 */
export function setCachedTranslation(text: string, to: 'ur' | 'en', translated: string, from?: 'en' | 'ur'): void {
  if (!text || !text.trim() || !translated) return;
  const key = getTranslationCacheKey(text, to, from);
  memoryCache.set(key, translated);
  saveMemoryCacheToStorage();
}

/**
 * Translates a single string using Microsoft Azure Translator API via backend /api/translate.
 * Automatically checks cache first, and gracefully falls back to returning original text on failure.
 */
export async function translateViaAzure(
  text: string,
  to: 'ur' | 'en',
  from?: 'en' | 'ur'
): Promise<string> {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return text || '';
  }

  const trimmed = text.trim();
  const cached = getCachedTranslation(trimmed, to, from);
  if (cached) {
    return cached;
  }

  try {
    const endpoint = typeof window !== 'undefined' ? '/api/translate' : 'http://localhost:3000/api/translate';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: trimmed,
        to,
        from,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.translatedText === 'string' && data.translatedText.trim()) {
        const result = data.translatedText.trim();
        setCachedTranslation(trimmed, to, result, from);
        return result;
      }
    }
  } catch (err) {
    console.warn('[AzureTranslator client error]:', err);
  }

  // If translation request fails, keep the original text intact rather than mangling it
  return trimmed;
}

/**
 * Translates an array of strings in a single batch request
 */
export async function translateBatchViaAzure(
  texts: string[],
  to: 'ur' | 'en',
  from?: 'en' | 'ur'
): Promise<string[]> {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const results: string[] = new Array(texts.length);
  const uncachedIndices: number[] = [];
  const uncachedTexts: string[] = [];

  texts.forEach((txt, idx) => {
    if (!txt || !txt.trim()) {
      results[idx] = txt || '';
      return;
    }
    const cached = getCachedTranslation(txt, to, from);
    if (cached) {
      results[idx] = cached;
    } else {
      uncachedIndices.push(idx);
      uncachedTexts.push(txt.trim());
    }
  });

  if (uncachedTexts.length === 0) {
    return results;
  }

  try {
    const endpoint = typeof window !== 'undefined' ? '/api/translate' : 'http://localhost:3000/api/translate';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: uncachedTexts,
        to,
        from,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.translations) && data.translations.length === uncachedTexts.length) {
        uncachedIndices.forEach((origIdx, i) => {
          const trans = data.translations[i];
          results[origIdx] = trans;
          setCachedTranslation(uncachedTexts[i], to, trans, from);
        });
        return results;
      }
    }
  } catch (err) {
    console.warn('[AzureTranslator batch client error]:', err);
  }

  // Fallback: fill uncached with original text
  uncachedIndices.forEach((origIdx, i) => {
    results[origIdx] = uncachedTexts[i];
  });

  return results;
}
