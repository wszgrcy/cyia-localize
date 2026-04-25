import { DefaultOptions, extract } from '../src/command/extract';
import { expect } from 'chai';
import { fileBufferToString, parseYaml } from '@code-recycle/cli';
describe('main', () => {
  it('测试', async () => {
    let [runner] = await extract(__dirname + '/fixture/start', __dirname + '/fixture/start', __dirname, {
      ...DefaultOptions,
      dryRun: true,
    });
    expect(runner).ok;
    expect(runner.kind).includes('create');
    expect((runner as any).path).includes('start/extract.json');
    let content = fileBufferToString((runner as any).content);
    let data = JSON.parse(content);
    expect(Object.keys(data).length).eq(8);
    for (const key in data) {
      expect(data[key].location).ok;
    }
  });
  it('yaml', async () => {
    let [runner] = await extract(__dirname + '/fixture/start', __dirname + '/fixture/start', __dirname, {
      ...DefaultOptions,
      dryRun: true,
      format: 'yaml',
    });
    expect(runner).ok;
    expect(runner.kind).includes('create');
    expect((runner as any).path).includes('start/extract.yaml');
    let content = fileBufferToString((runner as any).content);
    let data = parseYaml(content);
    expect(Object.keys(data).length).eq(8);
  });
  it('空', async () => {
    let [runner] = await extract(__dirname + '/fixture/empty', __dirname + '/fixture/empty', __dirname, {
      ...DefaultOptions,
      dryRun: true,
    });
    expect(runner).ok;
    expect(runner.kind).includes('create');
    expect((runner as any).path).includes('empty/extract.json');
    let content = fileBufferToString((runner as any).content);
    let data = JSON.parse(content);
    expect(Object.keys(data).length).eq(0);
  });
  it('多文件', async () => {
    let [runner] = await extract(__dirname + '/fixture/multi-file', __dirname + '/fixture/multi-file', __dirname, {
      ...DefaultOptions,
      dryRun: true,
    });
    expect(runner).ok;
    expect(runner.kind).includes('create');
    expect((runner as any).path).includes('multi-file/extract.json');
    let content = fileBufferToString((runner as any).content);
    let data = JSON.parse(content);
    expect(Object.keys(data).length).eq(2);
  });
  it('更新', async () => {
    let [runner, changed] = await extract(
      __dirname + '/fixture/update',
      __dirname + '/fixture/update',
      __dirname,
      {
        ...DefaultOptions,
        dryRun: true,
      },
      ['num'],
    );
    expect(runner).ok;
    expect(runner.kind).eq('overwrite');
    let changedString = fileBufferToString((runner as any).content);
    expect(Object.keys(JSON.parse(changedString)).length).eq(2);
    let update2 = fileBufferToString((changed as any).content);
    let changedData = JSON.parse(update2);
    expect(changedData['6269992297457029737'].target).eq('1');
    expect(changedData['6269992297457029737'].location.start.line).eq(1);
    expect(Object.keys(changedData).length).eq(2);
  });
});
