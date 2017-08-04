/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLIRTransforms
 * @flow
 * @format
 */

'use strict';

const FilterDirectivesTransform = require('../transforms/FilterDirectivesTransform');
const RelayFlattenTransform = require('../transforms/RelayFlattenTransform');
const SkipClientFieldTransform = require('../transforms/SkipClientFieldTransform');
const SkipRedundantNodesTransform = require('../transforms/SkipRedundantNodesTransform');
const SkipUnreachableNodeTransform = require('../transforms/SkipUnreachableNodeTransform');

import type CompilerContext from './RelayCompilerContext';
import type {GraphQLSchema} from 'graphql';

export type IRTransform = (
  context: CompilerContext,
  schema: GraphQLSchema,
) => CompilerContext;

// Transforms applied to fragments used for reading data from a store
const FRAGMENT_TRANSFORMS: Array<IRTransform> = [
  (ctx: CompilerContext) =>
    RelayFlattenTransform.transform(ctx, {
      flattenAbstractTypes: true,
    }),
  SkipRedundantNodesTransform.transform,
];

// Transforms applied to queries/mutations/subscriptions that are used for
// fetching data from the server and parsing those responses.
const QUERY_TRANSFORMS: Array<IRTransform> = [
  SkipClientFieldTransform.transform,
  SkipUnreachableNodeTransform.transform,
];

// Transforms applied to the code used to process a query response.
const CODEGEN_TRANSFORMS: Array<IRTransform> = [
  (ctx: CompilerContext) =>
    RelayFlattenTransform.transform(ctx, {
      flattenAbstractTypes: true,
      flattenFragmentSpreads: true,
    }),
  SkipRedundantNodesTransform.transform,
  FilterDirectivesTransform.transform,
];

module.exports = {
  codegenTransforms: CODEGEN_TRANSFORMS,
  fragmentTransforms: FRAGMENT_TRANSFORMS,
  queryTransforms: QUERY_TRANSFORMS,
};
