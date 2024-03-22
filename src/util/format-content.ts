import { FileFormat } from '../type';
import { stringify } from 'yaml';
export function formatContent(data: any, format: FileFormat) {
  if (format === 'json') {
    return JSON.stringify(data, undefined, 2);
  } else {
    return stringify(data);
  }
}
