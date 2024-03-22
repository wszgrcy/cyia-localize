import { mkdir, readdir, writeFile } from 'fs/promises';
import path, { basename, extname, join, resolve } from 'path';
import { parseFile } from '../util/parse-file';
import { formatContent } from '../util/format-content';
import { FileFormat } from '../type';
/** 合并多个包的配置 */
export async function merge(dirList: string[], format: FileFormat, output: string, map: string = '') {
  const cwd = process.cwd();
  let languageObj = {} as Record<string, Record<string, any>>;
  let mapObj = map.split(':').reduce((obj, item) => {
    let list = item.split(',');
    for (const item of list) {
      obj[item] = list[0];
    }
    return obj;
  }, {} as Record<string, string>);
  for (const dir of dirList) {
    let absDir = path.resolve(cwd, dir);
    let fileList = await readdir(absDir);
    for (const fileName of fileList) {
      let name = basename(fileName, extname(fileName));
      if (mapObj[name]) {
        name = mapObj[name];
      }
      let fileData = await parseFile(path.join(absDir, fileName));
      languageObj[name] ??= {};
      languageObj[name] = { ...fileData, ...languageObj[name] };
    }
  }
  let outputDir = resolve(cwd, output);
  await mkdir(outputDir, { recursive: true });
  for (const key in languageObj) {
    await writeFile(join(outputDir, `${key}.${format}`), formatContent(languageObj[key], format));
  }
}
