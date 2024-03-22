import { expect } from 'chai';
import { convert } from '../src/command';
import { readFile, stat } from 'fs/promises';
describe('convert', () => {
  it('开始', async () => {
    let outputDir = __dirname + '/fixture-output/convert';
    await convert(__dirname + '/fixture/convert', 'json', outputDir);
    let data = JSON.parse(await readFile(outputDir + '/en.json', { encoding: 'utf-8' }));
    expect(Object.keys(data).length).eq(2);
    expect(data['1']).eq('not overwrite');
  });
  it('yaml', async () => {
    let outputDir = __dirname + '/fixture-output/convert';
    await convert(__dirname + '/fixture/convert', 'yaml', outputDir);
    let result = await stat(outputDir + '/en.yaml').catch(() => false);
    expect(result).ok
  });
});
