export const APP_LANGUAGES = ['en', 'ka'] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number];

export const LOCALE_STORAGE_KEY = 'blog-app-locale';

export const DEFAULT_LANGUAGE: AppLanguage = 'en';
