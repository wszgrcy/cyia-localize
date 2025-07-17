#!/usr/bin/env node
import { program, Option } from 'commander';
import { extract, DefaultOptions } from '../command/extract';
import { convert } from '../command/convert';
import { merge } from '../command/merge';
import { resolve } from 'path';
import { $localize } from '../index';
import { loadI18n } from '../load.node';
import { plainList } from '../command/plain-list';
loadI18n();
let format = new Option('-f, --format [string]', $localize`输出格式`).choices(['json', 'yaml']).default(DefaultOptions.format);
program
  .argument('<input>', $localize`待翻译代码文件夹`)
  .argument('[output]', $localize`元数据输出文件夹`, process.cwd())
  .enablePositionalOptions()
  .option('-p, --pattern [string]', $localize`正则匹配`, DefaultOptions.pattern)
  .option('-n, --name [string]', $localize`元数据名`, DefaultOptions.name)
  .option('--update [boolean]', $localize`更新翻译元数据(会更新输出文件夹内的所有文件)`, DefaultOptions.update)
  .addOption(format)
  .action(async (input, output, options) => {
    await extract(resolve(process.cwd(), input), resolve(process.cwd(), output), process.cwd(), options);
  })
  .description(
    $localize`提取代码中的 $localize 标签模板函数内容;使用 --update 可以直接更新文件夹内的翻译元数据,可以创建一个空翻译文件再执行更新`
  );
program
  .command('pl')
  .argument('<input>', $localize`纯文本列表`)
  .argument('[output]', $localize`元数据输出文件夹`, process.cwd())
  .option('--update [boolean]', $localize`更新翻译元数据(会更新输出文件夹内的所有文件)`, DefaultOptions.update)
  .option('-n, --name [string]', $localize`元数据名`, DefaultOptions.name)
  .addOption(format)

  .action(async (input: string, output: string, { update, name, format }) => {
    await plainList(input, output, { name, update, format: format });
  })
  .description($localize`纯文本翻译`);
program
  .command('convert')
  .argument('<input>', $localize`元数据文件夹`)
  .argument('[output]', $localize`输出 key-value 格式;用于直接引用`)
  .addOption(format)
  .action(async (dir: string, output: string, { format }) => {
    await convert(dir, format, output);
  })
  .description($localize`翻译元数据转换为代码可以引用的 key-value 格式`);

program
  .command('merge')
  .argument('<output>', $localize`导出文件夹`)
  .argument('<path...>', $localize`翻译文件夹列表`)
  .addOption(format)
  .option('-m, --map [string]', $localize`语言映射;第一个语言为输出名比如: en,en-us;cn,zh-cn 输出 en.json cn.json`)
  .action(async (output: string, dir: string[], { format, map }) => {
    await merge(dir, format, output, map);
  })
  .description($localize`用于合并多个包的翻译文件/元数据`);

program.parse(process.argv);
