/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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

  // Copy GratsNetwork.ts and tsconfig from project root
  await cp(
    path.join(PROJECT_ROOT, 'GratsNetwork.ts'),
    path.join(tempDir, 'GratsNetwork.ts'),
  );
  await cp(
    path.join(PROJECT_ROOT, 'tsconfig.template.json'),
    path.join(tempDir, 'tsconfig.json'),
  );

  // Symlink node_modules from project root
  await symlink(
    path.join(PROJECT_ROOT, 'node_modules'),
    path.join(tempDir, 'node_modules'),
  );

  return tempDir;
}
