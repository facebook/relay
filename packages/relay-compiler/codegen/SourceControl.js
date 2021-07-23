/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const childProcess = require('child_process');
const os = require('os');

function execFile(cmd: string, args: Array<string>): Promise<string> {
  return new Promise((resolve, reject) => {
    childProcess.execFile(cmd, args, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}

/**
 * Returns the git ignored paths of the paths provided to this function.
 */
async function getGitIgnoredPaths(
  paths: $ReadOnlyArray<string>,
): Promise<$ReadOnlyArray<string>> {
  try {
    // check-ignore commands return a list of paths that are ignored by git.
    const stdout = await execFile('git', ['check-ignore', ...paths]);
    return stdout.split(os.EOL).filter(Boolean);
  } catch (error) {
    return [];
  }
}

/**
 * An abstraction over the source control system to make it injectable.
 */
export type SourceControl = {
  addRemove(
    added: $ReadOnlyArray<string>,
    removed: $ReadOnlyArray<string>,
  ): Promise<void>,
  ...
};

const SourceControlMercurial: SourceControl = {
  async addRemove(
    added: $ReadOnlyArray<string>,
    removed: $ReadOnlyArray<string>,
  ): Promise<void> {
    // NOTE: Not using `hg addremove` as that has a bug when deleting a file
    // that was just added, but not yet committed: T10711513
    if (added.length > 0) {
      await execFile('hg', ['add', ...added]);
    }
    if (removed.length > 0) {
      await execFile('hg', ['forget', ...removed]);
    }
  },
};

const SourceControlGit: SourceControl = {
  async addRemove(added: $ReadOnlyArray<string>): Promise<void> {
    const ignoredPaths = await getGitIgnoredPaths(added);
    // remove ignored paths from the added array.
    const filteredAdded = added.filter(path => !ignoredPaths.includes(path));

    if (filteredAdded.length > 0) {
      await execFile('git', ['add', '--intent-to-add', ...filteredAdded]);
    }
  },
};

module.exports = {
  SourceControlMercurial,
  SourceControlGit,
};
