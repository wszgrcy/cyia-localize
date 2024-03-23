import path from 'path';
import fs from 'fs';
import { loadTranslations } from './index';
export const LanguageMap: Record<string, string> = {
  zh_cn: 'zh-Hans',
  cn: 'zh-Hans',
  en: 'en-US',
  en_us: 'en-US',
};

export function loadI18n() {
  let lang = process.env['CR_LANG']?.toLowerCase();
  if (!lang) {
    if (process.env['LANGUAGE']) {
      lang = process.env['LANGUAGE'].split(':')[0].toLowerCase();
    } else if (process.env['LANG']) {
      lang = process.env['LANG'].split('.')[0].toLowerCase();
    }
  }
  let cache;
  try {
    const filePath = path.join(__dirname, `./i18n/${LanguageMap[lang!] || lang || 'zh-Hans'}.json`);

    if (!fs.existsSync(filePath)) {
      cache = require('./i18n/zh-Hans.json');
    } else {
      cache = require(filePath);
    }
    loadTranslations(cache);
  } catch (error) {
    console.warn(error);
    loadTranslations({});
  }
}
