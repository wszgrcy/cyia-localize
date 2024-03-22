import { mkdir, readdir, writeFile } from 'fs/promises';
import { basename, dirname, extname, join, resolve } from 'path';
import { parseFile } from '../util/parse-file';
import { formatContent } from '../util/format-content';
import { FileFormat } from '../type';
/** 元数据转换为 kv 格式 */
export async function convert(dir: string, format: FileFormat, output?: string) {
  dir = resolve(process.cwd(), dir);
  let pathList = await readdir(dir);
  let dirName = dirname(dir);
  let outputDir = resolve(process.cwd(), output || `${dirName}-raw`);
  await mkdir(outputDir, { recursive: true });
  for (const item of pathList) {
    let data = await parseFile(join(dir, item));
    for (const key in data) {
      data[key] = data[key].target;
    }
    let baseFileName = basename(item, extname(item));
    await writeFile(resolve(outputDir, `${baseFileName}.${format}`), formatContent(data, format));
  }
}
