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
}
main();
