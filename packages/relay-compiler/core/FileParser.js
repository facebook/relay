/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @providesModule FileParser
 * @flow
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

  constructor(config: {
    baseDir: string,
    parse: ParseFn,
  }) {
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
      const doc = this._parse(path.join(this._baseDir, file));
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
