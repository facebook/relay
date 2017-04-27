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
 */

'use strict';

const RelayApplyFragmentArgumentTransform = require('RelayApplyFragmentArgumentTransform');
const RelayConnectionTransform = require('RelayConnectionTransform');
const RelayExportTransform = require('RelayExportTransform');
const RelayFieldHandleTransform = require('RelayFieldHandleTransform');
const RelayFilterDirectivesTransform = require('RelayFilterDirectivesTransform');
const RelayFlattenTransform = require('RelayFlattenTransform');
const RelayGenerateRequisiteFieldsTransform = require('RelayGenerateRequisiteFieldsTransform');
const RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');
const RelaySkipClientFieldTransform = require('RelaySkipClientFieldTransform');
const RelaySkipHandleFieldTransform = require('RelaySkipHandleFieldTransform');
const RelaySkipRedundantNodesTransform = require('RelaySkipRedundantNodesTransform');
const RelaySkipUnreachableNodeTransform = require('RelaySkipUnreachableNodeTransform');
const RelayViewerHandleTransform = require('RelayViewerHandleTransform');

import type CompilerContext from 'RelayCompilerContext';
import type {GraphQLSchema} from 'graphql';

export type SchemaTransform = (schema: GraphQLSchema) => GraphQLSchema;
export type IRTransform = (context: CompilerContext, schema: GraphQLSchema) => CompilerContext;

// Transforms applied to the code used to process a query response.
const SCHEMA_TRANSFORMS: Array<SchemaTransform> = [
  RelayConnectionTransform.transformSchema,
  RelayExportTransform.transformSchema,
  RelayRelayDirectiveTransform.transformSchema,
];

// Transforms applied to fragments used for reading data from a store
const FRAGMENT_TRANSFORMS: Array<IRTransform> = [
  (ctx: CompilerContext) => RelayConnectionTransform.transform(ctx),
  RelayViewerHandleTransform.transform,
  RelayRelayDirectiveTransform.transform,
  RelayFieldHandleTransform.transform,
  (ctx: CompilerContext) => RelayFlattenTransform.transform(ctx, {
    flattenAbstractTypes: true,
  }),
  RelaySkipRedundantNodesTransform.transform,
];

// Transforms applied to queries/mutations/subscriptions that are used for
// fetching data from the server and parsing those responses.
/* $FlowFixMe(>=0.44.0 site=react_native_fb) Flow error found while deploying
 * v0.44.0. Remove this comment to see the error */
const QUERY_TRANSFORMS: Array<IRTransform> = [
  (ctx: CompilerContext) => RelayConnectionTransform.transform(ctx, {
    generateRequisiteFields: true,
  }),
  RelayViewerHandleTransform.transform,
  RelayApplyFragmentArgumentTransform.transform,
  RelaySkipClientFieldTransform.transform,
  RelaySkipUnreachableNodeTransform.transform,
  RelayExportTransform.transform,
  RelayRelayDirectiveTransform.transform,
  RelayGenerateRequisiteFieldsTransform.transform,
];

// Transforms applied to the code used to process a query response.
const CODEGEN_TRANSFORMS: Array<IRTransform> = [
  RelayFilterDirectivesTransform.transform,
  (ctx: CompilerContext) => RelayFlattenTransform.transform(ctx, {
    flattenAbstractTypes: true,
    flattenFragmentSpreads: true,
  }),
  RelaySkipRedundantNodesTransform.transform,
];

// Transforms applied before printing the query sent to the server.
const PRINT_TRANSFORMS: Array<IRTransform> = [
  RelayFilterDirectivesTransform.transform,
  (ctx: CompilerContext) => RelayFlattenTransform.transform(ctx, {}),
  RelaySkipHandleFieldTransform.transform,
];

module.exports = {
  codegenTransforms: CODEGEN_TRANSFORMS,
  fragmentTransforms: FRAGMENT_TRANSFORMS,
  printTransforms: PRINT_TRANSFORMS,
  queryTransforms: QUERY_TRANSFORMS,
  schemaTransforms: SCHEMA_TRANSFORMS,
};
