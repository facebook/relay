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

const {createCompilerError} = require('../core/RelayCompilerError');

import type {Fragment, Request, SplitOperation} from '../core/GraphQLIR';
import type {
  ReaderFragment,
  ConcreteRequest,
  NormalizationSplitOperation,
} from 'relay-runtime';

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
    case 'SplitOperation':
      return NormalizationCodeGenerator.generate(node);
  }
  throw createCompilerError(
    `RelayCodeGenerator: Unknown AST kind '${node.kind}'.`,
    [node.loc],
  );
}

module.exports = {generate};
