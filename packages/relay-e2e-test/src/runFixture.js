/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import {RELAY_ROOT, getMainRepoRoot} from '../repoRoot';
import {execFile} from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * Resolve the relay-compiler binary to use.
 *
 * Priority order:
 * 1. RELAY_COMPILER_BINARY env var (explicit override)
 * 2. Local cargo build output in repo root: compiler/target/debug/relay
 * 3. Local cargo build output in main worktree (if running from a git worktree)
 * 4. Fallback to node_modules/.bin/relay-compiler (npm version)
 */
function getRelayCompilerBinary(): string {
  if (process.env.RELAY_COMPILER_BINARY) {
    return process.env.RELAY_COMPILER_BINARY;
  }

  const localBinary = path.join(
    RELAY_ROOT,
    'compiler',
    'target',
    'debug',
    'relay',
  );
  if (fs.existsSync(localBinary)) {
    return localBinary;
  }

  // In a git worktree, build artifacts live in the main worktree
  const mainRoot = getMainRepoRoot();
  if (mainRoot !== RELAY_ROOT) {
    const mainBinary = path.join(
      mainRoot,
      'compiler',
      'target',
      'debug',
      'relay',
    );
    if (fs.existsSync(mainBinary)) {
      return mainBinary;
    }
  }

  return path.join(PROJECT_ROOT, 'node_modules', '.bin', 'relay-compiler');
}

function run(
  command: string,
  args: Array<string>,
  options?: {env?: {[string]: string}, cwd?: string},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = execFile(command, args, {
      env: {...process.env, ...options?.env},
      cwd: options?.cwd ?? PROJECT_ROOT,
    });
    let stdout = '';
    let stderr = '';
    proc.stdout?.on('data', data => {
      stdout += data;
    });
    proc.stderr?.on('data', data => {
      stderr += data;
    });
    proc.on('close', code => {
      if (code !== 0) {
        reject(
          new Error(
            `${command} ${args.join(' ')} exited with code ${String(code)}\n${stderr}`,
          ),
        );
      } else {
        resolve(stdout);
      }
    });
  });
}

export async function runFixture(tempDir: string): Promise<void> {
  const tsconfigPath = path.join(tempDir, 'tsconfig.json');
  const relayConfigPath = path.join(tempDir, 'template', 'relay.config.json');
  const gratsBin = path.join(PROJECT_ROOT, 'node_modules', '.bin', 'grats');
  const relayBin = getRelayCompilerBinary();

  // 1. Run grats to generate template/schema.graphql + schema.ts
  await run(gratsBin, ['--tsconfig', tsconfigPath]);

  // 2. Run relay-compiler to generate __generated__/ artifacts
  await run(relayBin, [relayConfigPath], {
    env: {FORCE_NO_WATCHMAN: '1'},
    cwd: path.join(tempDir, 'template'),
  });
}
