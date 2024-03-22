#!/usr/bin/env node
import { program, Option } from 'commander';
import { extract, DefaultOptions } from '../command/extract';
import { convert } from '../command/convert';
import { merge } from '../command/merge';
import { resolve } from 'path';
let format = new Option('-f,--format [string]', 'output format').choices(['json', 'yaml']).default(DefaultOptions.format);
program
  .argument('<input>', 'input dir')
  .argument('[output]', 'output dir', process.cwd())
  .enablePositionalOptions()
  .option('-p,--pattern [string]', 'pattern', DefaultOptions.pattern)
  .option('-n,--name [string]', 'name', DefaultOptions.name)
  .option('--update [string]', 'update language', DefaultOptions.update)
  .addOption(format)
  .action(async (input, output, options) => {
    await extract(resolve(process.cwd(), input), resolve(process.cwd(), output), process.cwd(), options);
  });
program
  .command('convert')
  .argument('<input>', 'input dir')
  .argument('[output]', 'output dir')
  .addOption(format)
  .action(async (dir: string, output: string, { format }) => {
    await convert(dir, format, output);
  });

program
  .command('merge')
  .argument('<output>', 'output path')
  .argument('<path...>', 'filePath list')
  .addOption(format)
  .option('-m,--map [string]', 'language map;output first language as name.eg: en,en-us;cn,zh-cn output en.json cn.json')
  .action(async (output: string, dir: string[], { format, map }) => {
    await merge(dir, format, output, map);
  });

program.parse(process.argv);
