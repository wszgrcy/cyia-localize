import * as esbuild from 'esbuild';
import * as path from 'path';
// 发布之前构建
async function main() {
  let options: esbuild.BuildOptions = {
    bundle: true,
    entryPoints: ['./src/index.ts'],
    outdir: path.join(process.cwd(), '/dist/fesm2022'),
    format: 'esm',
    minify: false,
    tsconfig: 'tsconfig.build-import.json',
    sourcemap: 'linked',
    charset: 'utf8',
    treeShaking: false,
    packages: 'external',
  };
  await esbuild.build({ ...options, outExtension: { '.js': '.mjs' } });
  await esbuild.build({ ...options, format: 'cjs', outdir: path.join(process.cwd(), '/dist/commonjs') });
}
main();
