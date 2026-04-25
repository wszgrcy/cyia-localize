import { mkdir, writeFile } from 'fs/promises';
import { basename, extname, join, resolve } from 'path';
import { mergeToData } from './merge';
import { formatContent } from '../util/format-content';
import { FileFormat } from '../type';

export async function mergeConvert(dirList: string[], format: FileFormat, output: string, map: string = '') {
  const mergedData = await mergeToData(dirList, map);

  let outputDir = resolve(process.cwd(), output);
  await mkdir(outputDir, { recursive: true });
  for (const lang in mergedData) {
    let langOldData = mergedData[lang];
    let langData = {} as any;
    for (const key in langOldData) {
      if ('target' in langOldData[key]) {
        langData[key] = langOldData[key].target;
      }
    }

    await writeFile(join(outputDir, `${lang}.${format}`), formatContent(langData, format));
  }
}
