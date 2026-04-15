/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const {parseMarkdown} = require('../src/parseMarkdown');
const {runFixture} = require('../src/runFixture');
const {runInteractions} = require('../src/runInteractions');
const {setupTempDir} = require('../src/setupTempDir');
const {cleanup, render} = require('@testing-library/react');
const {readdirSync, readFileSync} = require('fs');
const {rm} = require('fs/promises');
const path = require('path');
const React = require('react');

const fixturesDir = path.resolve(__dirname, '..', 'fixtures');

const fixtureFiles = readdirSync(fixturesDir, {recursive: true})
  .map(f => String(f))
  .filter(f => f.endsWith('.md') && !f.endsWith('.snap.md'));

function formatConsoleArgs(args: Array<mixed>): string {
  if (args.length === 0) {return '';}
  const first = args[0];
  if (typeof first === 'string' && args.length > 1) {
    let i = 1;
    const formatted = first.replace(/%[sdioOcf%]/g, match => {
      if (match === '%%') {return '%';}
      if (i >= args.length) {return match;}
      return String(args[i++]);
    });
    const rest = args.slice(i);
    return [formatted, ...rest.map(String)].join(' ');
  }
  return args.map(String).join(' ');
}

for (const file of fixtureFiles) {
  const name = file.slice(0, -'.md'.length);
  const snapPath = path.join(fixturesDir, name + '.snap.md');

  test(name, async () => {
    const markdown = readFileSync(path.join(fixturesDir, file), 'utf-8');
    const {codeBlocks, steps} = parseMarkdown(markdown);
    const tempDir = await setupTempDir(codeBlocks);

    const logs: Array<string> = [];
    const logSpy = jest
      .spyOn(console, 'log')
      .mockImplementation((...args: Array<mixed>) => {
        logs.push(formatConsoleArgs(args));
      });
    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation((...args: Array<mixed>) => {
        logs.push(`warn: ${formatConsoleArgs(args)}`);
      });
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((...args: Array<mixed>) => {
        logs.push(`error: ${formatConsoleArgs(args)}`);
      });

    try {
      await runFixture(tempDir);

      // Dynamic require of the built App component
      // Jest's transform will handle TSX compilation
      const appPath = path.join(tempDir, 'template', 'App.tsx');
      const appModule = require(appPath);
      const TestApp = appModule.default;

      // Render with React Testing Library
      const {container} = render(<TestApp />);

      // Run interactions from the steps block
      if (steps.length > 0) {
        await runInteractions(steps);
      }

      // Build snapshot string
      const sections: Array<string> = [];

      if (logs.length > 0) {
        sections.push('## Console\n');
        sections.push('```\n' + logs.join('\n') + '\n```\n');
      }

      sections.push('## HTML\n');
      sections.push('```html\n' + container.innerHTML + '\n```\n');

      const actual = sections.join('\n');

      // File-based snapshot comparison
      let expected: string | null = null;
      try {
        expected = readFileSync(snapPath, 'utf-8');
      } catch {
        // Snap file doesn't exist yet
      }

      if (expected == null) {
        // Write new snapshot
        const {writeFileSync} = require('fs');
        writeFileSync(snapPath, actual);
      } else {
        expect(actual).toBe(expected);
      }
    } finally {
      logSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
      cleanup();
      await rm(tempDir, {recursive: true, force: true});
    }
  });
}
