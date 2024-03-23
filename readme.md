| [中文](https://github.com/wszgrcy/cyia-localize/blob/master/readme.zh-Hans.md) | [English](./readme.md) |
| --------------------------- | ---------------------- |

---

# Introduction

- `@angular/localize` standalone version, allowed for use in any node/front-end project
- Extract/merge/convert translation files through commands `i18n` / `l10n`


# Source

- Angular 17.3.1

## Usage

```ts
import { $localize } from '@cyia/localize';
$localize`one`;
```
- Use `i18n ./src` Extract all `$localize` label template contents under `src` and generate `extract.json` metadata
  > Generate ID consistent with `@angular/localize`
- Copy `extract.json` custom language translation and write the translation content into the `target` field
- Use `i18n convert ./i18n-merge ./i18n` Convert translation metadata to `key-value` format for reference
- Custom reference format import translation, such as

```ts
// Node environment demonstration
import path from 'path';
import fs from 'fs';
import { loadTranslations } from '@cyia/localize';
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
  const filePath = path.join(__dirname, `./i18n/${LanguageMap[lang!] || lang || 'zh-Hans'}.json`);
  if (ENV === 'test') {
    cache = {};
  } else {
    if (!fs.existsSync(filePath)) {
      cache = __non_webpack_require__('./i18n/zh-Hans.json');
    } else {
      cache = __non_webpack_require__(filePath);
    }
  }

  loadTranslations(cache);
}

loadI18n();
```

## Merge other translations
- If other dependency packages also use `@cyia/localize` and the published package contains translated/metadata text, use `i18n merge ./output ./pkg1 ./pkg2` merge multiple and then import them again