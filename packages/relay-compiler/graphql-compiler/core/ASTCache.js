/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ASTCache
 * @flow
 * @format
 */

'use strict';

const {Map: ImmutableMap} = require('immutable');
const invariant = require('invariant');

import type {File} from '../codegen/CodegenTypes';
import type {DocumentNode} from 'graphql';

type ParseFn = (baseDir: string, file: File) => ?DocumentNode;

class ASTCache {
  _documents: Map<string, DocumentNode> = new Map();

  _baseDir: string;
  _parse: ParseFn;

  static validateDocument(doc: DocumentNode, relPath: string, fragments: ImmutableMap<string, string>, operations: ImmutableMap<string, string>) {
    let existingFragments = fragments;
    let existingOperations = operations;
    const fragmentsInFile = doc.definitions.filter(def => def.kind === 'FragmentDefinition')
    const operationsInFile = doc.definitions.filter(def => def.kind === 'OperationDefinition')
    fragmentsInFile.forEach(fragmentInFile => {
      const fragmentName = fragmentInFile.name.value;
      const existingFragmentPath = existingFragments.get(fragmentName);
      invariant(
        !existingFragmentPath,
        'duplicate fragment %s for Containers at paths: %s, %s',
        fragmentName,
        relPath,
        existingFragmentPath
      );
      existingFragments = existingFragments.set(fragmentName, relPath);
    });
    operationsInFile.forEach(operationInFile => {
      const operationName = operationInFile.name.value;
      const existingOperationPath = existingOperations.get(operationName);
      invariant(
        !existingOperationPath,
        'duplicate operation %s for Containers at paths: %s, %s',
        operationName,
        relPath,
        existingOperationPath
      );
      existingOperations = existingOperations.set(operationName, relPath);
    });

    return { fragments: existingFragments, operations: existingOperations };
  }

  constructor(config: {baseDir: string, parse: ParseFn}) {
    this._baseDir = config.baseDir;
    this._parse = config.parse;
  }

  // Short-term: we don't do subscriptions/delta updates, instead always use all definitions
  documents(): ImmutableMap<string, DocumentNode> {
    return ImmutableMap(this._documents);
  }

  // parse should return the set of changes
  parseFiles(files: Set<File>): ImmutableMap<string, DocumentNode> {
    let documents = ImmutableMap();
    let fragments = ImmutableMap();
    let operations = ImmutableMap();

    files.forEach(file => {
      const doc = (() => {
        try {
          return this._parse(this._baseDir, file);
        } catch (error) {
          throw new Error(`Parse error: ${error} in "${file.relPath}"`);
        }
      })();

      if (!doc) {
        this._documents.delete(file.relPath);
        return;
      }

      const result = ASTCache.validateDocument(doc, file.relPath, fragments, operations);
      fragments = result.fragments;
      operations = result.operations;

      documents = documents.set(file.relPath, doc);
      this._documents.set(file.relPath, doc);
    });

    return documents;
  }
}

module.exports = ASTCache;
