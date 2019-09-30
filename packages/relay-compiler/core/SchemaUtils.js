/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

import type {ScalarField} from '../core/GraphQLIR';
import type {ScalarFieldTypeID} from './Schema';
import type {ASTNode} from 'graphql';

const ID = 'id';

/**
 * @public
 *
 * Determine if an AST node contains a fragment/operation definition.
 */
function isExecutableDefinitionAST(ast: ASTNode): boolean %checks {
  return (
    ast.kind === 'FragmentDefinition' || ast.kind === 'OperationDefinition'
  );
}

/**
 * @public
 *
 * Determine if an AST node contains a schema definition.
 */
function isSchemaDefinitionAST(ast: ASTNode): boolean %checks {
  return (
    ast.kind === 'SchemaDefinition' ||
    ast.kind === 'ScalarTypeDefinition' ||
    ast.kind === 'ObjectTypeDefinition' ||
    ast.kind === 'InterfaceTypeDefinition' ||
    ast.kind === 'UnionTypeDefinition' ||
    ast.kind === 'EnumTypeDefinition' ||
    ast.kind === 'InputObjectTypeDefinition' ||
    ast.kind === 'DirectiveDefinition' ||
    ast.kind === 'ScalarTypeExtension' ||
    ast.kind === 'ObjectTypeExtension' ||
    ast.kind === 'InterfaceTypeExtension' ||
    ast.kind === 'UnionTypeExtension' ||
    ast.kind === 'EnumTypeExtension' ||
    ast.kind === 'InputObjectTypeExtension'
  );
}

function generateIDField(idType: ScalarFieldTypeID): ScalarField {
  return {
    kind: 'ScalarField',
    alias: ID,
    args: [],
    directives: [],
    handles: null,
    loc: {kind: 'Generated'},
    metadata: null,
    name: ID,
    type: idType,
  };
}

module.exports = {
  generateIDField,
  isExecutableDefinitionAST,
  isSchemaDefinitionAST,
};
