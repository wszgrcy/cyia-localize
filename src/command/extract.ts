import { QueryContext, codeRecycleByNode, completePromise, stringToFileBuffer } from '@code-recycle/cli';
import { parseMessage } from '../localize/utils';
import { join } from 'path';
import { formatContent } from '../util/format-content';
import { FileFormat } from '../type';
import { parseFile } from '../util/parse-file';
import { fileFormat } from '../util/file-format';
type TextData = { rawText: string; text: string };
function getNodeTextData(item: QueryContext): TextData {
  return {
    rawText: (item.node!.node! as any).context.node.rawText,
    text: (item.node!.node! as any).context.node.text,
  };
}
export const DefaultOptions = {
  name: 'extract',
  pattern: '**/*.ts',
  format: 'json',
  update: false,
} as const;
/** 提取 */
export async function extract(
  path: string,
  output: string,
  root: string,
  options: { name: string; pattern: string; dryRun?: boolean; format: FileFormat; update: boolean }
) {
  let result = await codeRecycleByNode(path, root, { config: { dryRun: options.dryRun } });
  const createFileName = `${options.name}.${options.format}`;
  let obj = {} as Record<string, any>;

  return result(async (util, rule, host, injector) => {
    let path = util.path;
    await util.changeList([
      {
        path: options.pattern,
        glob: true,
        name: 'match',
        list: [
          {
            query: `TaggedTemplateExpression:has(Identifier[value=$localize])`,
            multi: true,
            optional: true,
            name: 'transList',
            children: [
              {
                query: `>TemplateExpression`,
                name: 'hasVar',
                optional: true,
                children: [
                  {
                    query: `:use(TemplateHead,SyntaxList>TemplateSpan>TemplateMiddle)`,
                    name: 'startList',
                    multi: true,
                    optional: true,
                    callback(context, index) {
                      context.data = getNodeTextData(context);
                    },
                  },
                  {
                    query: `:use(SyntaxList>TemplateSpan>TemplateTail)`,
                    name: 'end',
                    optional: true,
                    callback(context, index) {
                      context.data = getNodeTextData(context);
                    },
                  },
                ],
                callback(context) {
                  let startList = context.getContext('startList', true)?.children || [];
                  let end = context.getContext('end', true);
                  let list = [...startList, end]
                    .map((item) => item?.data)
                    .filter(Boolean)
                    .flat(1);
                  context.data = list;
                },
              },
              {
                query: `>NoSubstitutionTemplateLiteral`,
                name: 'origin',
                optional: true,
                callback(context, index) {
                  context.data = [getNodeTextData(context)];
                },
              },
            ],
            callback(context, index) {
              let hasVar = context.getContext('hasVar', true);
              let origin = context.getContext('origin', true);
              let data = hasVar?.data || origin?.data;
              let rawTextList = (data as TextData[]).map((item) => item.rawText);
              let textList = (data as TextData[]).map((item) => item.text);
              (textList as any).raw = rawTextList;
              context.data = textList;
            },
          },
        ],
      },
      {
        type: 'create',
        path: join(output, createFileName),
        content: async (context) => {
          context = context.getContext('root.match');
          for (const childContext of context.children) {
            let listContext = childContext.getContext('transList', true);
            for (const item of listContext!.children) {
              let list = item.data as TemplateStringsArray[];
              if (!list.length) {
                continue;
              }
              let result = parseMessage(list as any, []);
              delete result.customId;
              delete result.messagePartLocations;
              delete result.substitutionLocations;
              delete (result as any).substitutions;
              delete result.location;
              delete result.legacyIds;
              (result as any).target = options.update ? result.text : '';
              obj[result.id] = result;
            }
          }
          return formatContent(obj, options.format);
        },
      },
    ]);
    if (options.update) {
      let outputDir = util.path.normalize(output);
      let fileList = await host.listAll(outputDir, { excludeList: [createFileName] });

      for (const item of fileList) {
        if (['.yaml', '.yml', '.json'].some((ext) => item.endsWith(ext))) {
          let filePath = path.join(outputDir, item);
          let data = await parseFile(filePath).catch(() => ({} as Record<string, any>));
          let newData = {} as Record<string, any>;
          for (const key in obj) {
            if (key in data) {
              newData[key] = data[key];
            } else {
              newData[key] = obj[key];
              newData[key].target = '';
            }
          }
          await completePromise(host.write(filePath, stringToFileBuffer(formatContent(newData, fileFormat(item)))));
        }
      }
    }
    return host.records();
  });
}
