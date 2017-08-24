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
const DefinitionRenameTransform = require('../transforms/DefinitionRenameTransform');
const ImportFragmentTransform = require('../transforms/ImportFragmentTransform');

import type CompilerContext from './GraphQLCompilerContext';
import type {GraphQLSchema, DocumentNode} from 'graphql';

export type IRTransform = (
  context: CompilerContext,
  schema: GraphQLSchema,
) => CompilerContext;

export type DocumentTransform = (
  doc: DocumentNode,
  filePath: string
) => DocumentNode;

const SCHEMA_EXTENSIONS: Array<string> = [
  ImportFragmentTransform.SCHEMA_EXTENSION,
];

// Document transforms applied documents.
const DOCUMENT_TRANSFORMS: Array<DocumentTransform> = [
  DefinitionRenameTransform.transform,
];

// Transforms applied to fragments used for reading data from a store
const FRAGMENT_TRANSFORMS: Array<IRTransform> = [
  ImportFragmentTransform.transform,
  (ctx: CompilerContext) =>
    RelayFlattenTransform.transform(ctx, {
      flattenAbstractTypes: true,
    }),
  SkipRedundantNodesTransform.transform,
];

// Transforms applied to queries/mutations/subscriptions that are used for
// fetching data from the server and parsing those responses.
const QUERY_TRANSFORMS: Array<IRTransform> = [
  ImportFragmentTransform.transform,
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
  schemaExtensions: SCHEMA_EXTENSIONS,
  documentTransforms: DOCUMENT_TRANSFORMS,
  codegenTransforms: CODEGEN_TRANSFORMS,
  fragmentTransforms: FRAGMENT_TRANSFORMS,
  queryTransforms: QUERY_TRANSFORMS,
};
