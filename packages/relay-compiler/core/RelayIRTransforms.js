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
const FlattenTransform = require('FlattenTransform');
const GraphQLIRTransforms = require('GraphQLIRTransforms');
const RelayApplyFragmentArgumentTransform = require('RelayApplyFragmentArgumentTransform');
const RelayConnectionTransform = require('RelayConnectionTransform');
const RelayFieldHandleTransform = require('RelayFieldHandleTransform');
const RelayGenerateIDFieldTransform = require('RelayGenerateIDFieldTransform');
const RelayGenerateTypeNameTransform = require('RelayGenerateTypeNameTransform');
const RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');
const RelaySkipHandleFieldTransform = require('RelaySkipHandleFieldTransform');
const RelayViewerHandleTransform = require('RelayViewerHandleTransform');
const SkipRedundantNodesTransform = require('SkipRedundantNodesTransform');

import type CompilerContext from 'GraphQLCompilerContext';
import type {IRTransform} from 'GraphQLIRTransforms';

const {fragmentTransforms, queryTransforms} = GraphQLIRTransforms;

// Transforms applied to the code used to process a query response.
const relaySchemaExtensions: Array<string> = [
  RelayConnectionTransform.SCHEMA_EXTENSION,
  RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
];

// Transforms applied to fragments used for reading data from a store
const relayFragmentTransforms: Array<IRTransform> = [
  (ctx: CompilerContext) => RelayConnectionTransform.transform(ctx),
  RelayViewerHandleTransform.transform,
  RelayRelayDirectiveTransform.transform,
  RelayFieldHandleTransform.transform,
  ...fragmentTransforms,
];

// Transforms applied to queries/mutations/subscriptions that are used for
// fetching data from the server and parsing those responses.
const relayQueryTransforms: Array<IRTransform> = [
  (ctx: CompilerContext) => RelayConnectionTransform.transform(ctx),
  RelayViewerHandleTransform.transform,
  RelayApplyFragmentArgumentTransform.transform,
  ...queryTransforms,
  RelayRelayDirectiveTransform.transform,
  RelayGenerateIDFieldTransform.transform,
];

// Transforms applied to the code used to process a query response.
const relayCodegenTransforms: Array<IRTransform> = [
  (ctx: CompilerContext) =>
    FlattenTransform.transform(ctx, {
      flattenAbstractTypes: true,
      flattenFragmentSpreads: true,
    }),
  SkipRedundantNodesTransform.transform,
  // Must be put after `SkipRedundantNodesTransform` which could shuffle the order.
  RelayGenerateTypeNameTransform.transform,
  FilterDirectivesTransform.transform,
];

// Transforms applied before printing the query sent to the server.
const relayPrintTransforms: Array<IRTransform> = [
  (ctx: CompilerContext) => FlattenTransform.transform(ctx, {}),
  RelayGenerateTypeNameTransform.transform,
  RelaySkipHandleFieldTransform.transform,
  FilterDirectivesTransform.transform,
];

module.exports = {
  codegenTransforms: relayCodegenTransforms,
  fragmentTransforms: relayFragmentTransforms,
  printTransforms: relayPrintTransforms,
  queryTransforms: relayQueryTransforms,
  schemaExtensions: relaySchemaExtensions,
};
