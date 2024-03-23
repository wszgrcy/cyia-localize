| [中文](./readme.zh-Hans.md) | [English](./readme.md) |
| --------------------------- | ---------------------- |

---

# 简介

- `@angular/localize`独立版本,允许用于任何 node/前端 项目
- 通过命令`i18n`/`l10n`提取/合并/转换翻译文件


# 来源

- Angular 17.3.1

## 使用方法

```ts
import { $localize } from '@cyia/localize';
$localize`one`;
```

- 使用`i18n ./src` 提取`src`下所有`$localize`标签模板内容生成`extract.json`元数据
  > 与`@angular/localize` 生成 id 一致
- 复制`extract.json`自定义语言翻译,将翻译内容写入到`target`字段
- 使用`i18n convert ./i18n-merge ./i18n`将翻译元数据转换为`key-value`格式用于引用
- 自定义引用格式导入翻译,如

```ts
// node环境演示
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

## 合并其他翻译

- 如果其他依赖包也使用了`@cyia/localize`并且发布包中含有翻译文本/元数据文本,可以使用`i18n merge ./output ./pkg1 ./pkg2`将多个合并,然后再导入
