/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule FileParser
 * @flow
 * @format
 */

'use strict';

const path = require('path');

const {Map: ImmutableMap} = require('immutable');

import type {DocumentNode} from 'graphql';

type ParseFn = (file: string) => ?DocumentNode;

class FileParser {
  _documents: Map<string, DocumentNode> = new Map();

  _baseDir: string;
  _parse: ParseFn;

  constructor(config: {baseDir: string, parse: ParseFn}) {
    this._baseDir = config.baseDir;
    this._parse = config.parse;
  }

  // Short-term: we don't do subscriptions/delta updates, instead always use all definitions
  documents(): ImmutableMap<string, DocumentNode> {
    return ImmutableMap(this._documents);
  }

  // parse should return the set of changes
  parseFiles(files: Set<string>): ImmutableMap<string, DocumentNode> {
    let documents = ImmutableMap();

    files.forEach(file => {
      const doc = (() => {
        const filePath = path.join(this._baseDir, file);
        try {
          return this._parse(filePath);
        } catch (error) {
          throw new Error(`Parse error: ${error} in "${filePath}"`);
        }
      })();

      if (!doc) {
        this._documents.delete(file);
        return;
      }

      documents = documents.set(file, doc);
      this._documents.set(file, doc);
    });

    return documents;
  }
}

module.exports = FileParser;
