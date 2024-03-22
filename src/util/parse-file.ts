import { parseYaml } from '@code-recycle/cli';
import { readFile } from 'fs/promises';
import { fileFormat } from './file-format';
export async function parseFile<T = Record<string, any>>(filePath: string): Promise<T> {
  let result = await readFile(filePath, { encoding: 'utf-8' });
  if (fileFormat(filePath) === 'json') {
    return JSON.parse(result);
  } else {
    return parseYaml(result);
  }
}
