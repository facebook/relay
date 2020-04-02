/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const NormalizationCodeGenerator = require('./NormalizationCodeGenerator');
const ReaderCodeGenerator = require('./ReaderCodeGenerator');
const Rollout = require('../util/Rollout');

const {createCompilerError} = require('../core/CompilerError');

import type {Fragment, Request, SplitOperation} from '../core/IR';
import type {Schema} from '../core/Schema';
import type {
  ConcreteRequest,
  NormalizationSplitOperation,
  ReaderFragment,
} from 'relay-runtime';

/**
 * @public
 *
 * Converts an IR node into a plain JS object representation that can be
 * used at runtime.
 */
declare function generate(schema: Schema, node: Fragment): ReaderFragment;
declare function generate(schema: Schema, node: Request): ConcreteRequest;
declare function generate(
  schema: Schema,
  node: SplitOperation,
): NormalizationSplitOperation;
function generate(
  schema: Schema,
  node: Fragment | Request | SplitOperation,
): $FlowFixMe {
  switch (node.kind) {
    case 'Fragment':
      if (node.metadata?.inlineData === true) {
        return {
          kind: 'InlineDataFragment',
          name: node.name,
        };
      }
      return ReaderCodeGenerator.generate(schema, node);
    case 'Request':
      return {
        fragment: ReaderCodeGenerator.generate(schema, node.fragment),
        kind: 'Request',
        operation: NormalizationCodeGenerator.generate(schema, node.root),
        params: {
          id: node.id,
          metadata: node.metadata,
          name: node.name,
          operationKind: node.root.operation,
          text: node.text,
        },
      };
    case 'SplitOperation':
      return NormalizationCodeGenerator.generate(schema, node);
  }
  throw createCompilerError(
    `RelayCodeGenerator: Unknown AST kind '${node.kind}'.`,
    [node.loc],
  );
}

module.exports = {generate};
