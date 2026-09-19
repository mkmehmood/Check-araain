// Vercel Serverless Function: POST /api/translate
//
// This is the production translation endpoint. The site is deployed to Vercel
// as a static build (see vercel.json) — files under /api are the only backend
// code that actually runs there. server.ts (Express) is for local dev only
// (`npm run dev`) and is NOT what serves /api/translate on the live site.
//
// Requires the following Vercel Environment Variables to be set (Project
// Settings -> Environment Variables, for Production/Preview/Development as
// needed) — a local .env file is NOT read by Vercel in production:
//   AZURE_TRANSLATOR_KEY    - your Azure Translator resource key
//   AZURE_TRANSLATOR_REGION - e.g. "global" or your resource's region
//
// Falls back to the free MyMemory API if the Azure key is missing or the
// Azure call fails, and finally to returning the original text untouched so
// the UI never shows an error - it just won't have upgraded the wording yet.

type VercelRequest = {
  method?: string;
  body?: any;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: any) => void;
  setHeader: (name: string, value: string) => void;
};

// In-memory cache. Lives only as long as this function instance stays warm
// (Vercel may reuse it across nearby invocations, but never assume it
// persists) - the client's own cache (src/services/azureTranslator.ts) is
// the durable one.
const translationCache = new Map<string, string>();

function getCacheKey(text: string, to: string, from?: string): string {
  return `${from || 'auto'}->${to}:${text.trim().toLowerCase()}`;
}

async function translateWithAzure(
  texts: string[],
  to: 'ur' | 'en',
  from?: 'en' | 'ur'
): Promise<string[] | null> {
  const apiKey = process.env.AZURE_TRANSLATOR_KEY;
  if (!apiKey) return null;

  const region = process.env.AZURE_TRANSLATOR_REGION || 'global';
  const endpoint = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${to}${from ? `&from=${from}` : ''}`;

  const body = texts.map((t) => ({ Text: t }));

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.warn(`[Azure Translator API error] Status ${response.status}: ${await response.text()}`);
      return null;
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map((item: any, idx: number) => {
        if (item?.translations?.[0]?.text) {
          return item.translations[0].text;
        }
        return texts[idx];
      });
    }
    return null;
  } catch (err) {
    console.error('[Azure Translator network error]:', err);
    return null;
  }
}

async function translateWithFallbackAPI(
  text: string,
  to: 'ur' | 'en',
  from?: 'en' | 'ur'
): Promise<string | null> {
  if (!text || !text.trim()) return text;
  const sourceLang = from || (to === 'ur' ? 'en' : 'ur');
  const targetLang = to;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=${sourceLang}|${targetLang}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const data = await response.json();
      const translated = data?.responseData?.translatedText;
      if (translated && typeof translated === 'string' && !translated.startsWith('MYMEMORY WARNING:')) {
        return translated;
      }
    }
  } catch (e) {
    // Network or timeout - fall through to null
  }

  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { text, texts, to = 'ur', from } = req.body || {};

    if (!text && (!texts || !Array.isArray(texts) || texts.length === 0)) {
      res.status(400).json({ error: 'Missing "text" or "texts" parameter' });
      return;
    }

    const isArray = Array.isArray(texts);
    const inputList: string[] = isArray ? texts : [text];
    const results: string[] = new Array(inputList.length);
    const toTranslateIndices: number[] = [];
    const toTranslateTexts: string[] = [];

    inputList.forEach((raw, idx) => {
      if (!raw || !raw.trim()) {
        results[idx] = raw || '';
        return;
      }
      const key = getCacheKey(raw, to, from);
      if (translationCache.has(key)) {
        results[idx] = translationCache.get(key)!;
      } else {
        toTranslateIndices.push(idx);
        toTranslateTexts.push(raw);
      }
    });

    if (toTranslateTexts.length === 0) {
      res.json({
        translatedText: isArray ? undefined : results[0],
        translations: isArray ? results : undefined,
        provider: 'cache',
      });
      return;
    }

    let provider = 'none';

    const azureResults = await translateWithAzure(toTranslateTexts, to, from);
    if (azureResults && azureResults.length === toTranslateTexts.length) {
      provider = 'azure';
      toTranslateIndices.forEach((origIdx, i) => {
        const trans = azureResults[i];
        results[origIdx] = trans;
        const key = getCacheKey(inputList[origIdx], to, from);
        translationCache.set(key, trans);
      });
    } else {
      provider = 'fallback-api';
      await Promise.all(
        toTranslateIndices.map(async (origIdx, i) => {
          const raw = toTranslateTexts[i];
          const fb = await translateWithFallbackAPI(raw, to, from);
          const finalResult = fb || raw;
          results[origIdx] = finalResult;
          if (fb) {
            const key = getCacheKey(raw, to, from);
            translationCache.set(key, fb);
          }
        })
      );
    }

    res.json({
      translatedText: isArray ? undefined : results[0],
      translations: isArray ? results : undefined,
      provider,
    });
  } catch (error) {
    console.error('[Translate Route Error]:', error);
    res.status(500).json({ error: 'Internal translation failure' });
  }
}
