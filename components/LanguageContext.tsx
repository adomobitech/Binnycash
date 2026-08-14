'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '@/messages/en.json';
import hi from '@/messages/hi.json';
import es from '@/messages/es.json';
import fr from '@/messages/fr.json';
import de from '@/messages/de.json';
import pt from '@/messages/pt.json';
import ru from '@/messages/ru.json';
import zh from '@/messages/zh-CN.json';
import ja from '@/messages/ja.json';
import ko from '@/messages/ko.json';
import it from '@/messages/it.json';
import tr from '@/messages/tr.json';
import vi from '@/messages/vi.json';
import th from '@/messages/th.json';
import id from '@/messages/id.json';
import ar from '@/messages/ar.json';
import bn from '@/messages/bn.json';
import ur from '@/messages/ur.json';

const dictionaries: any = { 
  en, hi, es, fr, de, pt, ru, 'zh-CN': zh, ja, ko, it, tr, vi, th, id, ar, bn, ur 
};

const LanguageContext = createContext<any>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState('en');
  const [t, setT] = useState(en);

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLang') || 'en';
    if (dictionaries[savedLang]) {
      setLocale(savedLang);
      setT(dictionaries[savedLang]);
    } else {
      setLocale('en');
      setT(en);
    }
  }, []);

  const changeLanguage = (newLang: string) => {
    if (dictionaries[newLang]) {
      setLocale(newLang);
      setT(dictionaries[newLang]);
      localStorage.setItem('preferredLang', newLang);
    } else {
      setLocale(newLang);
      setT(en);
      localStorage.setItem('preferredLang', newLang);
    }
  };

  return (
    <LanguageContext.Provider value={{ locale, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);