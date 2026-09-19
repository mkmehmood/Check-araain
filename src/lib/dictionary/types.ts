/**
 * Bilingual Urdu <-> English Dictionary & Translation Library Types
 */

export type LanguageCode = 'en' | 'ur';

export type DictionaryDomain = 
  | 'general'
  | 'community'
  | 'governance'
  | 'professions'
  | 'places'
  | 'names'
  | 'education'
  | 'welfare'
  | 'administrative';

export interface DictionaryEntry {
  en: string;
  ur: string;
  domain?: DictionaryDomain;
  aliasesEn?: string[];
  aliasesUr?: string[];
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'phrase' | 'properNoun' | 'prefix' | 'suffix';
}

export interface TranslationOptions {
  preserveDigits?: boolean; // Keep numbers in English digits (e.g. 11101-1234567-1)
  preserveUrlsAndEmails?: boolean;
  domainPriority?: DictionaryDomain[];
  cleanTransliterations?: boolean;
}

export interface TranslationResult {
  translatedText: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  matchedPhrases: string[];
  confidence: number;
}
