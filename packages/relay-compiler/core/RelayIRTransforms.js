/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const ClientExtensionsTransform = require('../transforms/ClientExtensionsTransform');
const ConnectionFieldTransform = require('../transforms/ConnectionFieldTransform');
const FilterDirectivesTransform = require('../transforms/FilterDirectivesTransform');
const FlattenTransform = require('../transforms/FlattenTransform');
const InlineDataFragmentTransform = require('../transforms/InlineDataFragmentTransform');
const InlineFragmentsTransform = require('../transforms/InlineFragmentsTransform');
const RefineOperationVariablesTransform = require('../transforms/RefineOperationVariablesTransform');
const RelayApplyFragmentArgumentTransform = require('../transforms/RelayApplyFragmentArgumentTransform');
const RelayConnectionTransform = require('../handlers/connection//RelayConnectionTransform');
const RelayDeferStreamTransform = require('../transforms/RelayDeferStreamTransform');
const RelayFieldHandleTransform = require('../transforms/RelayFieldHandleTransform');
const RelayFlowGenerator = require('../language/javascript/RelayFlowGenerator');
const RelayGenerateIDFieldTransform = require('../transforms/RelayGenerateIDFieldTransform');
const RelayGenerateTypeNameTransform = require('../transforms/RelayGenerateTypeNameTransform');
const RelayMaskTransform = require('../transforms/RelayMaskTransform');
const RelayMatchTransform = require('../transforms/RelayMatchTransform');
const RelayRefetchableFragmentTransform = require('../transforms/RelayRefetchableFragmentTransform');
const RelayRelayDirectiveTransform = require('../transforms/RelayRelayDirectiveTransform');
const RelaySkipHandleFieldTransform = require('../transforms/RelaySkipHandleFieldTransform');
const RelaySplitModuleImportTransform = require('../transforms/RelaySplitModuleImportTransform');
const RelayTestOperationTransform = require('../transforms/RelayTestOperationTransform');
const SkipClientExtensionsTransform = require('../transforms/SkipClientExtensionsTransform');
const SkipRedundantNodesTransform = require('../transforms/SkipRedundantNodesTransform');
const SkipUnreachableNodeTransform = require('../transforms/SkipUnreachableNodeTransform');

import type {IRTransform} from './GraphQLCompilerContext';

// Transforms applied to the code used to process a query response.
const relaySchemaExtensions: Array<string> = [
  RelayConnectionTransform.SCHEMA_EXTENSION,
  RelayMatchTransform.SCHEMA_EXTENSION,
  ConnectionFieldTransform.SCHEMA_EXTENSION,
  RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
  RelayRefetchableFragmentTransform.SCHEMA_EXTENSION,
  RelayTestOperationTransform.SCHEMA_EXTENSION,
  InlineDataFragmentTransform.SCHEMA_EXTENSION,
  RelayFlowGenerator.SCHEMA_EXTENSION,
];

// Transforms applied to both operations and fragments for both reading and
// writing from the store.
const relayCommonTransforms: Array<IRTransform> = [
  RelayConnectionTransform.transform,
  RelayRelayDirectiveTransform.transform,
  RelayMaskTransform.transform,
  RelayMatchTransform.transform,
  ConnectionFieldTransform.transform,
  RelayRefetchableFragmentTransform.transform,
];

// Transforms applied to fragments used for reading data from a store
const relayFragmentTransforms: Array<IRTransform> = [
  ClientExtensionsTransform.transform,
  RelayFieldHandleTransform.transform,
  InlineDataFragmentTransform.transform,
  FlattenTransform.transformWithOptions({flattenAbstractTypes: true}),
  SkipRedundantNodesTransform.transform,
];

// Transforms applied to queries/mutations/subscriptions that are used for
// fetching data from the server and parsing those responses.
const relayQueryTransforms: Array<IRTransform> = [
  RelayApplyFragmentArgumentTransform.transform,
  RelayGenerateIDFieldTransform.transform,
  RelayDeferStreamTransform.transform,
  RelayTestOperationTransform.transform,
];

// Transforms applied to the code used to process a query response.
const relayCodegenTransforms: Array<IRTransform> = [
  SkipUnreachableNodeTransform.transform,
  RelaySplitModuleImportTransform.transform,
  InlineFragmentsTransform.transform,
  // NOTE: For the codegen context, we make sure to run ClientExtensions
  // transform after we've inlined fragment spreads (i.e. InlineFragmentsTransform)
  // This will ensure that we don't generate nested ClientExtension nodes
  ClientExtensionsTransform.transform,
  FlattenTransform.transformWithOptions({flattenAbstractTypes: true}),
  SkipRedundantNodesTransform.transform,
  RelayGenerateTypeNameTransform.transform,
  FilterDirectivesTransform.transform,
  RefineOperationVariablesTransform.transformWithOptions({
    removeUnusedVariables: false,
  }),
];

// Transforms applied before printing the query sent to the server.
const relayPrintTransforms: Array<IRTransform> = [
  // NOTE: Skipping client extensions might leave empty selections, which we
  // skip by running SkipUnreachableNodeTransform immediately after.
  ClientExtensionsTransform.transform,
  SkipClientExtensionsTransform.transform,
  SkipUnreachableNodeTransform.transform,
  FlattenTransform.transformWithOptions({}),
  RelayGenerateTypeNameTransform.transform,
  RelaySkipHandleFieldTransform.transform,
  FilterDirectivesTransform.transform,
  RefineOperationVariablesTransform.transformWithOptions({
    removeUnusedVariables: true,
  }),
];

module.exports = {
  commonTransforms: relayCommonTransforms,
  codegenTransforms: relayCodegenTransforms,
  fragmentTransforms: relayFragmentTransforms,
  printTransforms: relayPrintTransforms,
  queryTransforms: relayQueryTransforms,
  schemaExtensions: relaySchemaExtensions,
};
