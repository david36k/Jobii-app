import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { translations, Language } from '@/constants/translations';

const LANGUAGE_KEY = '@jobii_language';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [language, setLanguage] = useState<Language>('he');
  const [isRTL, setIsRTL] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (stored) {
        const lang = stored as Language;
        setLanguage(lang);
        setIsRTL(lang === 'he');
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const switchLanguage = async (newLang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, newLang);
      setLanguage(newLang);
      setIsRTL(newLang === 'he');
      
      if ((newLang === 'he' && !I18nManager.isRTL) || (newLang === 'en' && I18nManager.isRTL)) {
        I18nManager.forceRTL(newLang === 'he');
      }
    } catch (error) {
      console.error('Failed to switch language:', error);
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[language];

    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }

    return typeof value === 'string' ? value : key;
  };

  return {
    language,
    isRTL,
    isLoading,
    switchLanguage,
    t,
  };
});
