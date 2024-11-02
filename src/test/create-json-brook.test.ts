import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import createJsonBrook from '../create-json-brook';

type TestCase = {
  name: string;
  input: string;
  output: unknown[] | null;
};

function getTestCases() {
  const folderPath = join(__dirname, 'testcases');
  const folder = readdirSync(folderPath);
  return folder
    .filter(filename => !filename.includes('result.'))
    .map(filename => {
      const file = readFileSync(join(folderPath, filename), 'utf-8');
      const name = basename(filename, '.json');
      const resultPath = join(folderPath, `${name}.result.json`);
      const output = existsSync(resultPath)
        ? JSON.parse(readFileSync(resultPath, 'utf-8'))
        : null;
      return {
        name: basename(filename, '.json'),
        input: file,
        output,
      } as TestCase;
    });
}

const allTestCases = (
  [
    {
      name: '单个数',
      input: '12345',
      output: [void 0, void 0, void 0, void 0, void 0],
    },
    {
      name: '单个字符串',
      input: '"Some text"',
      output: [
        void 0,
        void 0,
        void 0,
        void 0,
        void 0,
        void 0,
        void 0,
        void 0,
        void 0,
        void 0,
        'Some text',
      ],
    },
  ] as TestCase[]
).concat(getTestCases());

describe('createJsonBrook', () => {
  test('初始化', () => {
    const jsonBrook = createJsonBrook();
    expect(jsonBrook.getCurrent()).toStrictEqual(void 0);
  });
  for (const testcase of allTestCases) {
    const output = testcase.output;
    if (output) {
      test(testcase.name, () => {
        const chars = [...testcase.input];
        expect(chars.length).toEqual(output.length);
        const jsonBrook = createJsonBrook();
        for (const [index, char] of chars.entries()) {
          jsonBrook.write(char);
          expect(jsonBrook.getCurrent()).toStrictEqual(output[index]);
        }
        jsonBrook.end();
        if (testcase.input) {
          expect(jsonBrook.getCurrent()).toStrictEqual(
            JSON.parse(testcase.input),
          );
        }
      });
    } else {
      test.todo(testcase.name);
    }
  }
});
