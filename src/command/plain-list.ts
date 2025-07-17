import path from 'path';
import { FileFormat } from '../type';
import { parseFile } from '../util/parse-file';
import { parseMessage } from '../localize/utils';
import { formatContent } from '../util/format-content';
import { mkdir, readdir, writeFile } from 'fs/promises';

export async function plainList(input: string, output: string, options: { format: FileFormat; update: boolean; name: string }) {
  let content = await parseFile<string[]>(path.join(process.cwd(), input));
  let obj = {} as Record<string, any>;
  for (const item of content) {
    let data = [item];
    (data as any).raw = item;
    let result = parseMessage(data as any, []);
    delete result.customId;
    delete result.messagePartLocations;
    delete result.substitutionLocations;
    delete (result as any).substitutions;
    delete result.location;
    delete result.legacyIds;
    obj[result.id] = result;
  }
  let outputFilePath = path.join(process.cwd(), output);
  await mkdir(outputFilePath, { recursive: true });
  let list = await readdir(outputFilePath);
  let locName = `${options.name}.${options.format}`;
  if (list.length) {
    for (const item of list) {
      let isSource = locName === item;
      let filePath = path.join(outputFilePath, item);
      let originContent = await parseFile(filePath);
      for (const x in obj) {
        let item = obj[x];
        item.target = isSource ? item.text : options.update ? originContent[x]?.target ?? '' : '';
      }
      await writeFile(filePath, formatContent(obj, options.format));
    }
  } else {
    for (const x in obj) {
      let item = obj[x];
      item.target = item.text;
    }
    await writeFile(path.join(outputFilePath, locName), formatContent(obj, options.format));
  }
}
