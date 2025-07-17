import * as esbuild from 'esbuild';
import * as path from 'path';
// 发布之前构建
async function main() {
  let options: esbuild.BuildOptions = {
    bundle: true,
    entryPoints: ['./src/bin/index.ts'],
    outdir: path.join(process.cwd(), '/dist/bin'),
    format: 'cjs',
    minify: false,
    tsconfig: 'tsconfig.build-cli.json',
    charset: 'utf8',
    treeShaking: false,
    packages: 'external',
    sourcemap: 'linked',
  };
  await esbuild.build(options);
  let options2: esbuild.BuildOptions = {
    bundle: true,
    entryPoints: ['./src/cli/index.ts'],
    outdir: path.join(process.cwd(), '/dist/cli'),
    format: 'esm',
    minify: false,
    tsconfig: 'tsconfig.build-cli.json',
    charset: 'utf8',
    treeShaking: false,
    packages: 'external',
    sourcemap: 'linked',
  };
  await esbuild.build({ ...options2, outExtension: { '.js': '.mjs' } });
  await esbuild.build({ ...options2, format: 'cjs' });
}
main();
