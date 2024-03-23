import type { ScriptFunction } from '@code-recycle/cli';
let fn: ScriptFunction = async (util, rule, host, injector) => {
  let data = await rule.os.gitClone(
    'https://github.com/angular/angular.git',
    'packages/localize/src',
    'packages/localize/src',
    'branch',
    '17.3.1'
  );
  let digest = await rule.os.gitClone(
    'https://github.com/angular/angular.git',
    'packages/compiler/src/i18n/digest.ts',
    'packages/compiler/src/i18n',
    'branch',
    '17.3.1'
  );

  let fileObj = { ...data, ...digest };
  for (const key in fileObj) {
    if (key.endsWith('bazel') || key.includes('/test')) {
      continue;
    }
    await new Promise((res) => {
      host.write(util.path.join(util.path.normalize('./localize'), key), fileObj[key]).subscribe({
        complete: () => res(undefined),
      });
    });
  }
  let list = await util.changeList([
    {
      path: './localize/digest.ts',
      list: [
        { query: `ImportDeclaration`, multi: true, delete: true },
        {
          query: `FunctionDeclaration:has(>Identifier:is([value=digest],[value=computeDigest],[value=decimalDigest],[value=computeDecimalDigest],[value=serializeNodes],[value=sha1],[value=rol32],[value=bytesToWords32],[value=byteAt],[value=wordAt],[value=add32],[value=add32to64]))`,
          multi: true,
          delete: true,
        },
        {
          query: `ClassDeclaration:has(>Identifier:is([value=_SerializerVisitor],[value=_SerializerIgnoreIcuExpVisitor]))`,
          multi: true,
          delete: true,
        },
        {
          query: `VariableStatement:has(Identifier[value=serializerVisitor])`,
          multi: true,
          delete: true,
        },
      ],
    },
    {
      path: `./localize/utils/src/messages.ts`,
      list: [{ query: `ImportDeclaration:has(ImportSpecifier[value=computeMsgId])>FromKeyword+*`, replace: `'../../digest'` }],
    },
    {
      path: `./localize/translate.ts`,
      list: [
        {
          query: `VariableStatement:has(VariableDeclaration>[value=$localize])`,
          children: [
            { query: `>SyntaxList>DeclareKeyword`, delete: true },
            { query: `VariableDeclaration>IntersectionType`, replace: `{{''|ctxValue}}=_$localize as any` },
          ],
          callback(context, index) {
            return [{ value: `import { $localize as _$localize } from './localize';`, range: [0, 0] }];
          },
        },
      ],
    },
  ]);
  await util.updateChangeList(list);
};
export default fn;
