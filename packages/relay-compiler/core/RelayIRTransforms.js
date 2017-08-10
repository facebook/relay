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
const GraphQLIRTransforms = require('GraphQLIRTransforms');
const RelayApplyFragmentArgumentTransform = require('RelayApplyFragmentArgumentTransform');
const RelayConnectionTransform = require('RelayConnectionTransform');
const RelayFieldHandleTransform = require('RelayFieldHandleTransform');
const RelayFlattenTransform = require('RelayFlattenTransform');
const RelayGenerateRequisiteFieldsTransform = require('RelayGenerateRequisiteFieldsTransform');
const RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');
const RelaySkipHandleFieldTransform = require('RelaySkipHandleFieldTransform');
const RelayViewerHandleTransform = require('RelayViewerHandleTransform');

import type {IRTransform} from 'GraphQLIRTransforms';
import type CompilerContext from 'RelayCompilerContext';

const {
  codegenTransforms,
  fragmentTransforms,
  queryTransforms,
} = GraphQLIRTransforms;

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
  RelayGenerateRequisiteFieldsTransform.transform,
];

// Transforms applied to the code used to process a query response.
const relayCodegenTransforms: Array<IRTransform> = codegenTransforms;

// Transforms applied before printing the query sent to the server.
const relayPrintTransforms: Array<IRTransform> = [
  (ctx: CompilerContext) => RelayFlattenTransform.transform(ctx, {}),
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
