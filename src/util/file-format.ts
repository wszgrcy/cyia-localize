import { extname } from 'path';

export function fileFormat(filePath: string) {
  let ext = extname(filePath);

  if (ext === '.json') {
    return 'json';
  } else if (ext === '.yaml' || ext === '.yml') {
    return 'yaml';
  } else {
    throw new Error('error format');
  }
}
