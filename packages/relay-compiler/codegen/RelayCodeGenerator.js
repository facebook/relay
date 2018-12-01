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

import type {Fragment, Request, SplitOperation} from 'graphql-compiler';
import type {
  ConcreteFragment,
  ConcreteRequest,
  ConcreteSplitOperation,
  ReaderFragment,
} from 'relay-runtime';

/**
 * @public
 *
 * Converts a GraphQLIR node into a plain JS object representation that can be
 * used at runtime.
 */
declare function generate(node: Fragment): ReaderFragment;
declare function generate(node: Request): ConcreteRequest;
declare function generate(node: SplitOperation): ConcreteSplitOperation;
function generate(node) {
  switch (node.kind) {
    case 'Fragment':
      return ReaderCodeGenerator.generate(node);
    case 'Request':
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

module.exports = {generate};
