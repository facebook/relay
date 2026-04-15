/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Shared utility for resolving the Relay repo root and main worktree root.
 * Used by jest config, jest transform, and runtime fixture code.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const RELAY_ROOT = path.resolve(__dirname, '../..');

/**
 * Get the main git working tree root. In a worktree, `.git` is a file
 * containing `gitdir: /path/to/main/.git/worktrees/<name>`, so we can
 * follow it back to find the main working tree without shelling out to git.
 */
function getMainRepoRoot() {
  try {
    const dotGit = path.join(RELAY_ROOT, '.git');
    const stat = fs.statSync(dotGit);
    if (stat.isFile()) {
      const content = fs.readFileSync(dotGit, 'utf-8').trim();
      const match = content.match(/^gitdir:\s+(.+)$/);
      if (match) {
        const gitdir = path.resolve(RELAY_ROOT, match[1]);
        const mainGitDir = path.resolve(gitdir, '../..');
        return path.dirname(mainGitDir);
      }
    }
    return RELAY_ROOT;
  } catch {
    return RELAY_ROOT;
  }
}

/**
 * Resolve path to a Relay source package (e.g. 'relay-runtime', 'react-relay').
 *
 * On GitHub: packages live at RELAY_ROOT/packages/<name>/
 * Internally (fbsource): packages live as siblings of __github__/ at oss/<name>/
 */
function resolveRelayPackage(name) {
  const githubPath = path.join(RELAY_ROOT, 'packages', name);
  if (fs.existsSync(path.join(githubPath, 'index.js'))) {
    return githubPath;
  }
  const ossPath = path.resolve(RELAY_ROOT, '..', name);
  if (fs.existsSync(path.join(ossPath, 'index.js'))) {
    return ossPath;
  }
  const mainRoot = getMainRepoRoot();
  if (mainRoot !== RELAY_ROOT) {
    const mainPath = path.join(mainRoot, 'packages', name);
    if (fs.existsSync(path.join(mainPath, 'index.js'))) {
      return mainPath;
    }
  }
  return githubPath;
}

module.exports = {RELAY_ROOT, getMainRepoRoot, resolveRelayPackage};
