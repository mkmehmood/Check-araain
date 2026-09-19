import { DictionaryEntry, TranslationOptions, LanguageCode } from './types';
import { COMMUNITY_DICTIONARY_ENTRIES } from './communityDictionary';
import { PROFESSIONS_DICTIONARY_ENTRIES } from './professionsDictionary';
import { PLACES_DICTIONARY_ENTRIES } from './placesDictionary';
import { NAMES_DICTIONARY_ENTRIES } from './namesDictionary';
import { GENERAL_DICTIONARY_ENTRIES } from './generalDictionary';

/**
 * Combine all dictionary collections into the master library catalog
 */
export const ALL_DICTIONARY_ENTRIES: DictionaryEntry[] = [
  ...COMMUNITY_DICTIONARY_ENTRIES,
  ...PROFESSIONS_DICTIONARY_ENTRIES,
  ...PLACES_DICTIONARY_ENTRIES,
  ...NAMES_DICTIONARY_ENTRIES,
  ...GENERAL_DICTIONARY_ENTRIES,
];

// Pre-compiled bi-directional phrase and term lookup indexes
const EN_TO_UR_MAP = new Map<string, string>();
const UR_TO_EN_MAP = new Map<string, string>();

// Multi-word phrase lists sorted descending by length (longest match priority)
interface PhrasePair {
  en: string;
  ur: string;
  enRegex: RegExp;
  urRegex: RegExp;
}
const MULTI_WORD_EN_PAIRS: PhrasePair[] = [];
const MULTI_WORD_UR_PAIRS: PhrasePair[] = [];

// Initialize lookup indexes
(function initIndexes() {
  const escapeReg = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function addMapping(enVal: string, urVal: string) {
    const enClean = enVal.trim().toLowerCase();
    const urClean = urVal.trim();

    if (!EN_TO_UR_MAP.has(enClean)) {
      EN_TO_UR_MAP.set(enClean, urVal.trim());
    }
    if (!UR_TO_EN_MAP.has(urClean)) {
      UR_TO_EN_MAP.set(urClean, enVal.trim());
    }

    // Punctuation variants (without trailing period / full stop)
    const enNoPunct = enClean.replace(/[.۔!?,;]+$/, '').trim();
    const urNoPunct = urClean.replace(/[.۔!?,;]+$/, '').trim();
    if (enNoPunct && !EN_TO_UR_MAP.has(enNoPunct)) {
      EN_TO_UR_MAP.set(enNoPunct, urNoPunct);
    }
    if (urNoPunct && !UR_TO_EN_MAP.has(urNoPunct)) {
      UR_TO_EN_MAP.set(urNoPunct, enNoPunct);
    }

    // Madda variants: 'ارائیں' <-> 'آرائیں'
    if (urClean.includes('آرائیں')) {
      const altUr = urClean.replace(/آرائیں/g, 'ارائیں');
      if (!UR_TO_EN_MAP.has(altUr)) UR_TO_EN_MAP.set(altUr, enVal.trim());
    } else if (urClean.includes('ارائیں')) {
      const altUr = urClean.replace(/ارائیں/g, 'آرائیں');
      if (!UR_TO_EN_MAP.has(altUr)) UR_TO_EN_MAP.set(altUr, enVal.trim());
    }
  }

  function addPhrasePair(enPhrase: string, urPhrase: string) {
    const enClean = enPhrase.trim();
    const urClean = urPhrase.trim();
    const pair: PhrasePair = {
      en: enClean,
      ur: urClean,
      enRegex: new RegExp(`\\b${escapeReg(enClean)}\\b`, 'gi'),
      urRegex: new RegExp(`${escapeReg(urClean)}`, 'g'),
    };

    if (enClean.includes(' ')) {
      MULTI_WORD_EN_PAIRS.push(pair);
    }

    if (urClean.includes(' ')) {
      MULTI_WORD_UR_PAIRS.push(pair);

      // Also add Madda variant if applicable
      if (urClean.includes('آرائیں')) {
        const altUr = urClean.replace(/آرائیں/g, 'ارائیں');
        MULTI_WORD_UR_PAIRS.push({
          en: enClean,
          ur: altUr,
          enRegex: pair.enRegex,
          urRegex: new RegExp(`${escapeReg(altUr)}`, 'g'),
        });
      } else if (urClean.includes('ارائیں')) {
        const altUr = urClean.replace(/ارائیں/g, 'آرائیں');
        MULTI_WORD_UR_PAIRS.push({
          en: enClean,
          ur: altUr,
          enRegex: pair.enRegex,
          urRegex: new RegExp(`${escapeReg(altUr)}`, 'g'),
        });
      }
    }
  }

  // Pass 1: Primary entries have top priority
  for (const entry of ALL_DICTIONARY_ENTRIES) {
    addMapping(entry.en, entry.ur);
    if (entry.en.includes(' ') || entry.ur.includes(' ')) {
      addPhrasePair(entry.en, entry.ur);
    }
  }

  // Pass 2: Aliases added only where primary entries did not claim them
  for (const entry of ALL_DICTIONARY_ENTRIES) {
    if (entry.aliasesEn) {
      for (const alias of entry.aliasesEn) {
        addMapping(alias, entry.ur);
        if (alias.includes(' ') || entry.ur.includes(' ')) {
          addPhrasePair(alias, entry.ur);
        }
      }
    }

    if (entry.aliasesUr) {
      for (const alias of entry.aliasesUr) {
        addMapping(entry.en, alias);
        if (alias.includes(' ') || entry.en.includes(' ')) {
          addPhrasePair(entry.en, alias);
        }
      }
    }
  }

  // Sort multi-word phrases descending by length so longer phrases match first
  MULTI_WORD_EN_PAIRS.sort((a, b) => b.en.length - a.en.length);
  MULTI_WORD_UR_PAIRS.sort((a, b) => b.ur.length - a.ur.length);
})();

/**
 * Checks if a string contains Urdu/Arabic Unicode characters
 */
export function isUrduScript(text?: string): boolean {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * Cleans corrupted or malformed transliterations and zero-width artifacts
 */
export function sanitizeTextSeparation(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, ' ') // Replace zero-width spaces with standard space where needed
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Translates English text to pure Urdu using the bilingual dictionary library
 */
export function translateEnglishToUrduWithLibrary(
  text: string,
  options: TranslationOptions = { preserveDigits: true, preserveUrlsAndEmails: true }
): string {
  if (!text || typeof text !== 'string') return '';
  const trimmed = sanitizeTextSeparation(text);
  if (!trimmed) return '';

  // Already Urdu?
  if (isUrduScript(trimmed)) return trimmed;

  // Direct exact match
  const directMatch = EN_TO_UR_MAP.get(trimmed.toLowerCase());
  if (directMatch) return directMatch;

  let result = trimmed;

  // 1. Replace multi-word phrases (longest first)
  for (const pair of MULTI_WORD_EN_PAIRS) {
    pair.enRegex.lastIndex = 0;
    result = result.replace(pair.enRegex, pair.ur);
  }

  // 2. Tokenize remaining words and replace from single-word dictionary
  const tokens = result.split(/(\s+|[,.:;!?"'()\[\]\/\\]+)/);
  const translatedTokens = tokens.map(tok => {
    // Preserve numbers, URLs, emails if requested
    if (options.preserveDigits && /^\d+[\d\-.,]*$/.test(tok.trim())) {
      return tok;
    }
    if (options.preserveUrlsAndEmails && /[@:\/.]/.test(tok) && !tok.includes(' ')) {
      return tok;
    }

    const clean = tok.toLowerCase().trim();
    if (!clean) return tok;

    const dictUr = EN_TO_UR_MAP.get(clean);
    if (dictUr) return dictUr;

    return tok;
  });

  return sanitizeTextSeparation(translatedTokens.join(''));
}

/**
 * Translates Urdu text to accurate English using the bilingual dictionary library
 */
export function translateUrduToEnglishWithLibrary(
  text: string,
  options: TranslationOptions = { preserveDigits: true, preserveUrlsAndEmails: true }
): string {
  if (!text || typeof text !== 'string') return '';
  const trimmed = sanitizeTextSeparation(text);
  if (!trimmed) return '';

  // Already English?
  if (!isUrduScript(trimmed)) return trimmed;

  // Direct exact match
  const directMatch = UR_TO_EN_MAP.get(trimmed);
  if (directMatch) return directMatch;

  let result = trimmed;

  // 1. Replace multi-word phrases (longest first)
  for (const pair of MULTI_WORD_UR_PAIRS) {
    if (result.includes(pair.ur)) {
      result = result.split(pair.ur).join(pair.en);
    }
  }

  // 2. Replace known Urdu punctuation with English punctuation
  result = result
    .replace(/،/g, ', ')
    .replace(/۔/g, '. ')
    .replace(/؟/g, '? ')
    .replace(/٪/g, '% ');

  // 3. Tokenize remaining words
  const tokens = result.split(/(\s+|[,.:;!?"'()\[\]\/\\]+)/);
  const translatedTokens = tokens.map(tok => {
    const clean = tok.trim();
    if (!clean) return tok;

    if (!isUrduScript(clean)) return tok;

    const dictEn = UR_TO_EN_MAP.get(clean);
    if (dictEn) return dictEn;

    return tok;
  });

  return sanitizeTextSeparation(translatedTokens.join(''));
}

/**
 * Searches the bilingual dictionary for matches in either English or Urdu
 */
export function searchBilingualDictionary(query: string, limit = 20): DictionaryEntry[] {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();
  const isUr = isUrduScript(q);

  const results: DictionaryEntry[] = [];
  for (const entry of ALL_DICTIONARY_ENTRIES) {
    if (isUr) {
      if (
        entry.ur.includes(q) ||
        (entry.aliasesUr && entry.aliasesUr.some(a => a.includes(q)))
      ) {
        results.push(entry);
      }
    } else {
      if (
        entry.en.toLowerCase().includes(q) ||
        (entry.aliasesEn && entry.aliasesEn.some(a => a.toLowerCase().includes(q)))
      ) {
        results.push(entry);
      }
    }
    if (results.length >= limit) break;
  }
  return results;
}

/**
 * Lookup exact word or phrase in dictionary with fuzzy punctuation and alias support
 */
export function lookupDictionaryTerm(term: string): { en?: string; ur?: string; entry?: DictionaryEntry } {
  const clean = term.trim();
  if (!clean) return {};

  if (isUrduScript(clean)) {
    let en = UR_TO_EN_MAP.get(clean);
    let entry = ALL_DICTIONARY_ENTRIES.find(e => e.ur === clean) || 
                ALL_DICTIONARY_ENTRIES.find(e => e.aliasesUr?.includes(clean));

    if (!en) {
      const stripped = clean.replace(/[.۔!?,;]+$/, '').trim();
      en = UR_TO_EN_MAP.get(stripped);
      if (!entry) {
        entry = ALL_DICTIONARY_ENTRIES.find(e => e.ur === stripped) ||
                ALL_DICTIONARY_ENTRIES.find(e => e.aliasesUr?.includes(stripped));
      }
    }

    if (!en && entry) en = entry.en;

    // Try without madda
    if (!en) {
      const alt = clean.includes('آرائیں') ? clean.replace(/آرائیں/g, 'ارائیں') : clean.replace(/ارائیں/g, 'آرائیں');
      en = UR_TO_EN_MAP.get(alt);
      if (!entry) {
        entry = ALL_DICTIONARY_ENTRIES.find(e => e.ur === alt) ||
                ALL_DICTIONARY_ENTRIES.find(e => e.aliasesUr?.includes(alt));
      }
      if (!en && entry) en = entry.en;
    }

    return { en, ur: clean, entry };
  } else {
    const cleanLower = clean.toLowerCase();
    let ur = EN_TO_UR_MAP.get(cleanLower);
    let entry = ALL_DICTIONARY_ENTRIES.find(e => e.en.toLowerCase() === cleanLower) ||
                ALL_DICTIONARY_ENTRIES.find(e => e.aliasesEn?.some(a => a.toLowerCase() === cleanLower));

    if (!ur) {
      const stripped = cleanLower.replace(/[.۔!?,;]+$/, '').trim();
      ur = EN_TO_UR_MAP.get(stripped);
      if (!entry) {
        entry = ALL_DICTIONARY_ENTRIES.find(e => e.en.toLowerCase() === stripped) ||
                ALL_DICTIONARY_ENTRIES.find(e => e.aliasesEn?.some(a => a.toLowerCase() === stripped));
      }
    }

    if (!ur && entry) ur = entry.ur;

    return { en: clean, ur, entry };
  }
}
