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

const RelayApplyFragmentArgumentTransform = require('../transforms/RelayApplyFragmentArgumentTransform');
const RelayConnectionTransform = require('../handlers/connection//RelayConnectionTransform');
const RelayFieldHandleTransform = require('../transforms/RelayFieldHandleTransform');
const RelayGenerateIDFieldTransform = require('../transforms/RelayGenerateIDFieldTransform');
const RelayGenerateTypeNameTransform = require('../transforms/RelayGenerateTypeNameTransform');
const RelayMaskTransform = require('../transforms/RelayMaskTransform');
const RelayRelayDirectiveTransform = require('../transforms/RelayRelayDirectiveTransform');
const RelaySkipHandleFieldTransform = require('../transforms/RelaySkipHandleFieldTransform');
const RelayViewerHandleTransform = require('../handlers/viewer/RelayViewerHandleTransform');

const {
  FilterDirectivesTransform,
  FlattenTransform,
  InlineFragmentsTransform,
  IRTransforms,
  SkipRedundantNodesTransform,
} = require('graphql-compiler');

import type {IRTransform} from 'graphql-compiler';

const {fragmentTransforms, queryTransforms} = IRTransforms;

// Transforms applied to the code used to process a query response.
const relaySchemaExtensions: Array<string> = [
  RelayConnectionTransform.SCHEMA_EXTENSION,
  RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
];

// Transforms applied to fragments used for reading data from a store
const relayFragmentTransforms: Array<IRTransform> = [
  RelayConnectionTransform.transform,
  RelayViewerHandleTransform.transform,
  RelayRelayDirectiveTransform.transform,
  RelayFieldHandleTransform.transform,
  RelayMaskTransform.transform,
  ...fragmentTransforms,
];

// Transforms applied to queries/mutations/subscriptions that are used for
// fetching data from the server and parsing those responses.
const relayQueryTransforms: Array<IRTransform> = [
  RelayMaskTransform.transform,
  RelayConnectionTransform.transform,
  RelayViewerHandleTransform.transform,
  RelayApplyFragmentArgumentTransform.transform,
  ...queryTransforms,
  RelayRelayDirectiveTransform.transform,
  RelayGenerateIDFieldTransform.transform,
];

// Transforms applied to the code used to process a query response.
const relayCodegenTransforms: Array<IRTransform> = [
  InlineFragmentsTransform.transform,
  FlattenTransform.transformWithOptions({
    flattenAbstractTypes: true,
  }),
  SkipRedundantNodesTransform.transform,
  RelayGenerateTypeNameTransform.transform,
  FilterDirectivesTransform.transform,
];

// Transforms applied before printing the query sent to the server.
const relayPrintTransforms: Array<IRTransform> = [
  FlattenTransform.transformWithOptions({}),
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
