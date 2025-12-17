// src/i18n/languageManager.ts
import { callHFAPI } from '../utils/hfApi';
import { translations, type LanguageKey, type TranslationKey } from './translations';

const HF_API_KEY = import.meta.env.VITE_HF_API_KEY || '';
const NLLB_MODEL = 'facebook/nllb-200-distilled-600M';
const NLLB_API_URL = `https://api-inference.huggingface.co/models/${NLLB_MODEL}`;

const ENGLISH_CODE = 'eng_Latn';

export const SUPPORTED_LANGUAGES = [
  { label: 'en', name: 'English', code: 'eng_Latn' },
  { label: 'ig', name: 'Igbo', code: 'ibo_Latn' },
  { label: 'yo', name: 'Yorùbá', code: 'yor_Latn' },
  { label: 'ha', name: 'Hausa', code: 'hau_Latn' },
] as const;

export type LangLabel = typeof SUPPORTED_LANGUAGES[number]['label'];

export const getCurrentLangLabel = (): LangLabel => {
  const saved = localStorage.getItem('agri_lang') as LangLabel | null;
  const lang = SUPPORTED_LANGUAGES.find(l => l.label === saved);
  return lang?.label || 'en';
};

export const getCurrentLangCode = (): string => {
  const saved = localStorage.getItem('agri_lang') as LangLabel | null;
  const lang = SUPPORTED_LANGUAGES.find(l => l.label === saved);
  return lang?.code || ENGLISH_CODE;
};

export const setAppLanguage = (label: LangLabel) => {
  localStorage.setItem('agri_lang', label);
  window.dispatchEvent(new CustomEvent('agri:lang-changed', { detail: { label } }));
};

export const t = (key: TranslationKey): string => {
  const lang = getCurrentLangLabel();
  const translation = translations[lang as keyof typeof translations]?.[key] || translations.en[key];
  return translation || key;
};

// Updated translateText function to support both signatures
export const translateText = async (text: string, sourceCodeOrTargetCode: string, targetCode?: string): Promise<string> => {
  if (!HF_API_KEY || !text.trim()) return text;
  
  // Handle both function signatures:
  // 1. translateText(text, targetCode) - for translating to a target language from English
  // 2. translateText(text, sourceCode, targetCode) - for translating between any two languages
  
  let sourceCode = ENGLISH_CODE;
  let targetLangCode = sourceCodeOrTargetCode;
  
  if (targetCode !== undefined) {
    // Three-parameter version: translateText(text, sourceCode, targetCode)
    sourceCode = sourceCodeOrTargetCode;
    targetLangCode = targetCode;
  }
  
  // If source and target are the same, no translation needed
  if (sourceCode === targetLangCode) return text;
  
  try {
    const result = await callHFAPI(NLLB_API_URL, {
      inputs: text,
      parameters: { src_lang: sourceCode, tgt_lang: targetLangCode },
      options: { wait_for_model: true },
    });
    return result?.[0]?.translation_text?.trim() || text;
  } catch (err) {
    console.warn('Translation failed:', err);
    return text;
  }
};