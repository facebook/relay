/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const NormalizationCodeGenerator = require('./NormalizationCodeGenerator');
const ReaderCodeGenerator = require('./ReaderCodeGenerator');

const invariant = require('invariant');
const murmurHash = require('../util/murmurHash');

import type {Fragment, Request, SplitOperation} from '../core/GraphQLIR';
import type {
  ReaderFragment,
  ConcreteRequest,
  NormalizationSplitOperation,
} from 'relay-runtime';

/**
 * @private
 *
 * Configures the buckets to use for migrating to `RequestParameters`. This is
 * internal, temporary, and should not be used outside of the Relay team.
 *
 * TODO: (gmonaco) T39154307 Remove this as soon as the RequestParameters migration is finished.
 */
let MIGRATION_BUCKETS: ?$ReadOnlyArray<boolean> = null;
function setMigrationBuckets(buckets: $ReadOnlyArray<boolean>): void {
  MIGRATION_BUCKETS = buckets;
}

/**
 * @public
 *
 * Converts a GraphQLIR node into a plain JS object representation that can be
 * used at runtime.
 */
declare function generate(node: Fragment): ReaderFragment;
declare function generate(node: Request): ConcreteRequest;
declare function generate(node: SplitOperation): NormalizationSplitOperation;
function generate(node) {
  switch (node.kind) {
    case 'Fragment':
      return ReaderCodeGenerator.generate(node);
    case 'Request':
      if (MIGRATION_BUCKETS != null) {
        const bucketIdx =
          murmurHash(node.name).charCodeAt(0) % MIGRATION_BUCKETS.length;
        if (MIGRATION_BUCKETS[bucketIdx] === true) {
          return {
            kind: 'Request',
            fragment: ReaderCodeGenerator.generate(node.fragment),
            operation: NormalizationCodeGenerator.generate(node.root),
            params: {
              operationKind: node.root.operation,
              name: node.name,
              id: node.id,
              text: node.text,
              metadata: node.metadata,
            },
          };
        }
      }
      return {
        kind: 'Request',
        operationKind: node.root.operation,
        name: node.name,
        id: node.id,
        text: node.text,
        metadata: node.metadata,
        fragment: ReaderCodeGenerator.generate(node.fragment),
        operation: NormalizationCodeGenerator.generate(node.root),
      };
    case 'SplitOperation':
      return NormalizationCodeGenerator.generate(node);
  }
  invariant(
    false,
    'RelayCodeGenerator: Unknown AST kind `%s`. Source: %s.',
    node.kind,
    getErrorMessage(node),
  );
}

function getErrorMessage(node: any): string {
  return `document ${node.name}`;
}

module.exports = {generate, setMigrationBuckets};
