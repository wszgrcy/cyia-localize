import { QueryContext, codeRecycleByNode, completePromise, nextPromise, stringToFileBuffer } from '@code-recycle/cli';
import { parseMessage, SourceLocation } from '../localize/utils';
import { join } from 'path';
import { formatContent } from '../util/format-content';
import { FileFormat } from '../type';
import { parseFile } from '../util/parse-file';
import { fileFormat } from '../util/file-format';
import indexToPosition from 'index-to-position';
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
  options: { name: string; pattern: string; dryRun?: boolean; format: FileFormat },
  locales?: string[],
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
              let startPos = indexToPosition(context.node!.content, context.node!.node!.range[0]);
              let endPos = indexToPosition(context.node!.content, context.node!.node!.range[1]);
              let hasVar = context.getContext('hasVar', true);
              let origin = context.getContext('origin', true);
              let data = hasVar?.data || origin?.data;
              let rawTextList = (data as TextData[]).map((item) => item.rawText);
              let textList = (data as TextData[]).map((item) => item.text);
              (textList as any).raw = rawTextList;
              context.data = {
                messageParts: textList,
                location: {
                  start: startPos,
                  end: endPos,
                  file: (context as any).util.path.getSystemPath(context.node!.path),
                } as SourceLocation,
              };
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
              let list = item.data.messageParts as TemplateStringsArray[];
              if (!list.length) {
                continue;
              }
              let result = parseMessage(list as any, [], item.data.location);
              delete result.customId;
              delete result.messagePartLocations;
              delete result.substitutionLocations;
              delete (result as any).substitutions;
              delete result.legacyIds;
              (result as any).target = result.text;
              obj[result.id] = result;
            }
          }
          return formatContent(obj, options.format);
        },
      },
    ]);

    if (locales?.length) {
      for (const locale of locales) {
        const localeFileName = `${options.name}.${locale}.${options.format}`;
        const filePath = join(output, localeFileName);

        const isExist = await nextPromise(host.exists(path.normalize(filePath)));
        let existingData = (isExist ? await parseFile(filePath).catch(() => ({})) : {}) as Record<string, any>;

        let newData = {} as Record<string, any>;
        for (const key in obj) {
          if (key in existingData) {
            newData[key] = { ...obj[key], target: existingData[key].target };
          } else {
            newData[key] = obj[key];
            newData[key].target = '';
          }
        }
        await completePromise(host.write(path.normalize(filePath), stringToFileBuffer(formatContent(newData, options.format))));
      }
    }
    return host.records();
  });
}
