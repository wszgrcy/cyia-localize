import { expect } from 'chai';
import { merge } from '../src/command';
import { readFile, stat } from 'fs/promises';
describe('merge', () => {
  it('开始', async () => {
    let outputDir = __dirname + '/fixture-output/merge';
    await merge([__dirname + '/fixture/merge/pkg1', __dirname + '/fixture/merge/pkg2'], 'json', outputDir);
    let data = JSON.parse(await readFile(outputDir + '/en.json', { encoding: 'utf-8' }));
    expect(Object.keys(data).length).eq(2);
    expect(data['1'].target).eq('not overwrite');
  });
  it('yaml', async () => {
    let outputDir = __dirname + '/fixture-output/merge';
    await merge([__dirname + '/fixture/merge/pkg1', __dirname + '/fixture/merge/pkg2'], 'yaml', outputDir);
    let result = await stat(outputDir + '/en.yaml').catch(() => false);
    expect(result).ok;
  });
  it('map', async () => {
    let outputDir = __dirname + '/fixture-output/merge';
    await merge([__dirname + '/fixture/merge/pkg1', __dirname + '/fixture/merge/pkg2'], 'json', outputDir, 'en-us,en');
    let data = JSON.parse(await readFile(outputDir + '/en-us.json', { encoding: 'utf-8' }));
    expect(Object.keys(data).length).eq(2);
    expect(data['1'].target).eq('not overwrite');
  });
});
