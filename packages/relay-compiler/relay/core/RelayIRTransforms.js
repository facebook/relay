/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayIRTransforms
 * @flow
 * @format
 */

'use strict';

const FilterDirectivesTransform = require('FilterDirectivesTransform');
const RelayApplyFragmentArgumentTransform = require('RelayApplyFragmentArgumentTransform');
const RelayConnectionTransform = require('RelayConnectionTransform');
const RelayFieldHandleTransform = require('RelayFieldHandleTransform');
const RelayFlattenTransform = require('RelayFlattenTransform');
const RelayGenerateRequisiteFieldsTransform = require('RelayGenerateRequisiteFieldsTransform');
const RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');
const RelaySkipHandleFieldTransform = require('RelaySkipHandleFieldTransform');
const RelayViewerHandleTransform = require('RelayViewerHandleTransform');
const SkipClientFieldTransform = require('SkipClientFieldTransform');
const SkipRedundantNodesTransform = require('SkipRedundantNodesTransform');
const SkipUnreachableNodeTransform = require('SkipUnreachableNodeTransform');

import type CompilerContext from 'RelayCompilerContext';
import type {GraphQLSchema} from 'graphql';

export type IRTransform = (
  context: CompilerContext,
  schema: GraphQLSchema,
) => CompilerContext;

// Transforms applied to the code used to process a query response.
const schemaExtensions: Array<string> = [
  RelayConnectionTransform.SCHEMA_EXTENSION,
  RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
];

// Transforms applied to fragments used for reading data from a store
const FRAGMENT_TRANSFORMS: Array<IRTransform> = [
  (ctx: CompilerContext) => RelayConnectionTransform.transform(ctx),
  RelayViewerHandleTransform.transform,
  RelayRelayDirectiveTransform.transform,
  RelayFieldHandleTransform.transform,
  (ctx: CompilerContext) =>
    RelayFlattenTransform.transform(ctx, {
      flattenAbstractTypes: true,
    }),
  SkipRedundantNodesTransform.transform,
];

// Transforms applied to queries/mutations/subscriptions that are used for
// fetching data from the server and parsing those responses.
const QUERY_TRANSFORMS: Array<IRTransform> = [
  (ctx: CompilerContext) =>
    RelayConnectionTransform.transform(ctx, {
      generateRequisiteFields: true,
    }),
  RelayViewerHandleTransform.transform,
  RelayApplyFragmentArgumentTransform.transform,
  SkipClientFieldTransform.transform,
  SkipUnreachableNodeTransform.transform,
  RelayRelayDirectiveTransform.transform,
  RelayGenerateRequisiteFieldsTransform.transform,
];

// Transforms applied to the code used to process a query response.
const CODEGEN_TRANSFORMS: Array<IRTransform> = [
  FilterDirectivesTransform.transform,
  (ctx: CompilerContext) =>
    RelayFlattenTransform.transform(ctx, {
      flattenAbstractTypes: true,
      flattenFragmentSpreads: true,
    }),
  SkipRedundantNodesTransform.transform,
];

// Transforms applied before printing the query sent to the server.
const PRINT_TRANSFORMS: Array<IRTransform> = [
  FilterDirectivesTransform.transform,
  (ctx: CompilerContext) => RelayFlattenTransform.transform(ctx, {}),
  RelaySkipHandleFieldTransform.transform,
];

module.exports = {
  codegenTransforms: CODEGEN_TRANSFORMS,
  fragmentTransforms: FRAGMENT_TRANSFORMS,
  printTransforms: PRINT_TRANSFORMS,
  queryTransforms: QUERY_TRANSFORMS,
  schemaExtensions,
};
