/**
 * @flow
 */

'use strict';

import type {CodeBlock} from './parseMarkdown';

import {cp, mkdir, mkdtemp, symlink, writeFile} from 'fs/promises';
import {tmpdir} from 'os';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');

export async function setupTempDir(
  codeBlocks: Array<CodeBlock>,
): Promise<string> {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'relay-e2e-'));

  // Create template/ subdirectory
  const templateDir = path.join(tempDir, 'template');
  await mkdir(templateDir, {recursive: true});

  // Write code blocks from markdown into template/
  for (const block of codeBlocks) {
    const filePath = path.join(templateDir, block.filename);
    await mkdir(path.dirname(filePath), {recursive: true});
    await writeFile(filePath, block.content);
  }

  // Copy GratsNetwork.ts from project root
  await cp(
    path.join(PROJECT_ROOT, 'GratsNetwork.ts'),
    path.join(tempDir, 'GratsNetwork.ts'),
  );

  // Generate tsconfig.json with grats config
  const tsconfig = {
    grats: {
      graphqlSchema: './template/schema.graphql',
    },
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ['template/**/*', 'GratsNetwork.ts'],
  };
  await writeFile(
    path.join(tempDir, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2),
  );

  // Symlink node_modules from project root
  await symlink(
    path.join(PROJECT_ROOT, 'node_modules'),
    path.join(tempDir, 'node_modules'),
  );

  return tempDir;
}
