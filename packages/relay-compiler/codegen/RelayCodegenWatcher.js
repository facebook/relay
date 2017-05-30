/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayCodegenWatcher
 * @flow
 * @format
 */
'use strict';

const watchman = require('fb-watchman');

const SUBSCRIPTION_NAME = 'relay-codegen';

export type WatchmanExpression = Array<string | WatchmanExpression>;
export type FileFilter = (filename: string) => boolean;

type WatchmanChange = {
  name: string,
  exists: boolean,
};
type WatchmanChanges = {
  files?: Array<WatchmanChange>,
};

async function queryFiles(
  baseDir: string,
  expression: WatchmanExpression,
  filter: FileFilter,
): Promise<Set<string>> {
  const client = new PromiseClient();
  const watchResp = await client.watchProject(baseDir);
  const resp = await client.command(
    'query',
    watchResp.root,
    makeQuery(watchResp.relativePath, expression),
  );
  client.end();
  return updateFiles(new Set(), filter, resp.files);
}

/**
 * Provides a simplified API to the watchman API.
 * Given some base directory and a list of subdirectories it calls the callback
 * with watchman change events on file changes.
 */
async function watch(
  baseDir: string,
  expression: WatchmanExpression,
  callback: (changes: WatchmanChanges) => any,
): Promise<void> {
  const client = new PromiseClient();
  const watchResp = await client.watchProject(baseDir);

  await makeSubscription(
    client,
    watchResp.root,
    watchResp.relativePath,
    expression,
    callback,
  );
}

async function makeSubscription(
  client: PromiseClient,
  root: string,
  relativePath: string,
  expression: WatchmanExpression,
  callback,
): Promise<void> {
  client.on('subscription', resp => {
    if (resp.subscription === SUBSCRIPTION_NAME) {
      callback(resp);
    }
  });
  await client.command(
    'subscribe',
    root,
    SUBSCRIPTION_NAME,
    makeQuery(relativePath, expression),
  );
}

/**
 * Further simplifies `watch` and calls the callback on every change with a
 * full list of files that match the conditions.
 */
async function watchFiles(
  baseDir: string,
  expression: WatchmanExpression,
  filter: FileFilter,
  callback: (files: Set<string>) => any,
): Promise<void> {
  let files = new Set();
  await watch(baseDir, expression, changes => {
    if (!changes.files) {
      // Watchmen fires a change without files when a watchman state changes,
      // for example during an hg update.
      return;
    }
    files = updateFiles(files, filter, changes.files);
    callback(files);
  });
}

/**
 * Similar to watchFiles, but takes an async function. The `compile` function
 * is awaited and not called in parallel. If multiple changes are triggered
 * before a compile finishes, the latest version is called after the compile
 * finished.
 *
 * TODO: Consider changing from a Promise to abortable, so we can abort mid
 *       compilation.
 */
async function watchCompile(
  baseDir: string,
  expression: WatchmanExpression,
  filter: FileFilter,
  compile: (files: Set<string>) => Promise<any>,
): Promise<void> {
  let compiling = false;
  let needsCompiling = false;
  let latestFiles = null;

  watchFiles(baseDir, expression, filter, async files => {
    needsCompiling = true;
    latestFiles = files;
    if (compiling) {
      return;
    }
    compiling = true;
    while (needsCompiling) {
      needsCompiling = false;
      await compile(latestFiles);
    }
    compiling = false;
  });
}

function updateFiles(
  files: Set<string>,
  filter: FileFilter,
  fileChanges: Array<WatchmanChange>,
): Set<string> {
  const newFiles = new Set(files);
  fileChanges.forEach(({name, exists}) => {
    if (exists && filter(name)) {
      newFiles.add(name);
    } else {
      newFiles.delete(name);
    }
  });
  return newFiles;
}

function makeQuery(relativePath: string, expression: WatchmanExpression) {
  return {
    expression,
    fields: ['name', 'exists'],
    relative_root: relativePath,
  };
}

class PromiseClient {
  _client: any;

  constructor() {
    this._client = new watchman.Client();
  }

  command(...args: Array<mixed>): Promise<any> {
    return new Promise((resolve, reject) => {
      this._client.command(args, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async watchProject(
    baseDir: string,
  ): Promise<{
    root: string,
    relativePath: string,
  }> {
    const resp = await this.command('watch-project', baseDir);
    if ('warning' in resp) {
      console.error('Warning:', resp.warning);
    }
    return {
      root: resp.watch,
      relativePath: resp.relative_path,
    };
  }

  on(event: string, callback: Function): void {
    this._client.on(event, callback);
  }

  end(): void {
    this._client.end();
  }
}

module.exports = {
  queryFiles,
  watch,
  watchFiles,
  watchCompile,
};
