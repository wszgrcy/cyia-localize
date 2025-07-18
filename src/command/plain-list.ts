import path from 'path';
import { FileFormat } from '../type';
import { parseFile } from '../util/parse-file';
import { parseMessage } from '../localize/utils';
import { formatContent } from '../util/format-content';
import { mkdir, readdir, writeFile } from 'fs/promises';

function _tagged_template_literal(strings: string[]) {
  const raw = strings.slice(0);

  return Object.freeze(
    Object.defineProperties(strings, {
      raw: {
        value: Object.freeze(raw),
      },
    })
  ) as TemplateStringsArray;
}

export async function plainList(input: string, output: string, options: { format: FileFormat; update: boolean; name: string }) {
  let content = await parseFile<string[]>(path.join(process.cwd(), input));
  let obj = {} as Record<string, any>;
  for (const item of content) {
    let result = parseMessage(_tagged_template_literal([item]));
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
      const objClone = { ...obj };
      const isSource = locName === item;
      const filePath = path.join(outputFilePath, item);
      const originContent = await parseFile(filePath);
      for (const x in objClone) {
        const item = objClone[x];
        item.target = isSource ? item.text : options.update ? originContent[x]?.target ?? '' : '';
      }
      await writeFile(filePath, formatContent(objClone, options.format));
    }
  } else {
    for (const x in obj) {
      let item = obj[x];
      item.target = item.text;
    }
    await writeFile(path.join(outputFilePath, locName), formatContent(obj, options.format));
  }
}
