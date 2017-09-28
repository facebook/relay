/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayIRTransforms
 * @flow
 * @format
 */

'use strict';

const InlineFragmentsTransform = require('../graphql-compiler/transforms/InlineFragmentsTransform');
const RelayApplyFragmentArgumentTransform = require('../transforms/RelayApplyFragmentArgumentTransform');
const RelayConnectionTransform = require('../handlers/connection//RelayConnectionTransform');
const RelayFieldHandleTransform = require('../transforms/RelayFieldHandleTransform');
const RelayGenerateIDFieldTransform = require('../transforms/RelayGenerateIDFieldTransform');
const RelayGenerateTypeNameTransform = require('../transforms/RelayGenerateTypeNameTransform');
const RelayMaskTransform = require('../graphql-compiler/transforms/RelayMaskTransform');
const RelayRelayDirectiveTransform = require('../transforms/RelayRelayDirectiveTransform');
const RelaySkipHandleFieldTransform = require('../transforms/RelaySkipHandleFieldTransform');
const RelayViewerHandleTransform = require('../handlers/viewer/RelayViewerHandleTransform');

const {
  FilterDirectivesTransform,
  FlattenTransform,
  IRTransforms,
  SkipRedundantNodesTransform,
} = require('../graphql-compiler/GraphQLCompilerPublic');

import type {
  CompilerContext,
  IRTransform,
} from '../graphql-compiler/GraphQLCompilerPublic';

const {fragmentTransforms, queryTransforms} = IRTransforms;

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
  InlineFragmentsTransform.transform,
  (ctx: CompilerContext) =>
    FlattenTransform.transform(ctx, {
      flattenAbstractTypes: true,
    }),
  SkipRedundantNodesTransform.transform,
  // Must be put after `SkipRedundantNodesTransform` which could shuffle the order.
  RelayGenerateTypeNameTransform.transform,
  FilterDirectivesTransform.transform,
];

// Transforms applied before printing the query sent to the server.
const relayPrintTransforms: Array<IRTransform> = [
  RelayMaskTransform.transform,
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
