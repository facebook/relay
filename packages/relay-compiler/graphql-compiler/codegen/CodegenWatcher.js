/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CodegenWatcher
 * @flow
 * @format
 */
'use strict';

const GraphQLWatchmanClient = require('../core/GraphQLWatchmanClient');

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

import type {File} from './CodegenTypes';

const SUBSCRIPTION_NAME = 'graphql-codegen';

export type WatchmanExpression = Array<string | WatchmanExpression>;

export type FileFilter = (file: File) => boolean;

type WatchmanChange = {
  name: string,
  exists: boolean,
  'content.sha1hex': ?string,
};
type WatchmanChanges = {
  files?: Array<WatchmanChange>,
};

async function queryFiles(
  baseDir: string,
  expression: WatchmanExpression,
  filter: FileFilter,
): Promise<Set<File>> {
  const client = new GraphQLWatchmanClient();
  const [watchResp, fields] = await Promise.all([
    client.watchProject(baseDir),
    getFields(client),
  ]);
  const resp = await client.command('query', watchResp.root, {
    expression,
    fields: fields,
    relative_root: watchResp.relativePath,
  });
  client.end();
  return updateFiles(new Set(), baseDir, filter, resp.files);
}

async function getFields(client: GraphQLWatchmanClient): Promise<Array<string>> {
  const fields = ['name', 'exists'];
  if (await client.hasCapability('field-content.sha1hex')) {
    fields.push('content.sha1hex');
  }
  return fields;
}

// For use when not using Watchman.
async function queryFilepaths(
  baseDir: string,
  filepaths: Array<string>,
  filter: FileFilter,
): Promise<Set<File>> {
  // Construct WatchmanChange objects as an intermediate step before
  // calling updateFiles to produce file content.
  const files = filepaths.map(filepath => ({
    name: filepath,
    exists: true,
    'content.sha1hex': null,
  }));
  return updateFiles(new Set(), baseDir, filter, files);
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
  const client = new GraphQLWatchmanClient();
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
  client: GraphQLWatchmanClient,
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
  const fields = await getFields(client);
  await client.command('subscribe', root, SUBSCRIPTION_NAME, {
    expression,
    fields: fields,
    relative_root: relativePath,
  });
}

/**
 * Further simplifies `watch` and calls the callback on every change with a
 * full list of files that match the conditions.
 */
async function watchFiles(
  baseDir: string,
  expression: WatchmanExpression,
  filter: FileFilter,
  callback: (files: Set<File>) => any,
): Promise<void> {
  let files = new Set();
  await watch(baseDir, expression, changes => {
    if (!changes.files) {
      // Watchmen fires a change without files when a watchman state changes,
      // for example during an hg update.
      return;
    }
    files = updateFiles(files, baseDir, filter, changes.files);
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
  compile: (files: Set<File>) => Promise<any>,
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
  files: Set<File>,
  baseDir: string,
  filter: FileFilter,
  fileChanges: Array<WatchmanChange>,
): Set<File> {
  const fileMap = new Map();
  files.forEach(file => {
    fileMap.set(file.relPath, file);
  });

  fileChanges.forEach(({name, exists, 'content.sha1hex': hash}) => {
    const file = {
      relPath: name,
      hash: hash || hashFile(path.join(baseDir, name)),
    };
    if (exists && filter(file)) {
      fileMap.set(name, file);
    } else {
      fileMap.delete(name);
    }
  });
  return new Set(fileMap.values());
}

function hashFile(filename: string): string {
  const content = fs.readFileSync(filename);
  return crypto.createHash('sha1').update(content).digest('hex');
}

module.exports = {
  queryFiles,
  queryFilepaths,
  watch,
  watchFiles,
  watchCompile,
};
