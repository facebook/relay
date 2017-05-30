/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * TODO @joesavona: enable flow
 * @providesModule transformInputObjectToIR
 * @format
 */

'use strict';

const {getRawType} = require('RelaySchemaUtils');
const {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLScalarType,
} = require('graphql');

import type {LinkedField, ScalarField} from 'RelayIR';

/**
 * Transforms a GraphQLInputObjectType to a RelayIR LinkedField.
 */
function transformInputObjectToIR(node: {
  // $FlowFixMe
  kind: string,
  name: string,
  type: GraphQLNonNull | GraphQLInputObjectType,
}): LinkedField {
  const type = getRawType(node.type);
  const fields = type.getFields();
  // If the node is the root (an Argument), use the name of the type so it is
  // named 'FooBarData' instead of 'input'
  const {name} = node.kind === 'Argument' ? type : node;

  return {
    alias: null,
    args: [],
    directives: [],
    handles: null,
    kind: 'LinkedField',
    metadata: null,
    name,
    selections: Object.keys(fields).map(fieldKey => {
      return transformFieldToIR(fields[fieldKey]);
    }),
    type: node.type,
  };
}

/**
 * Transforms a field (GraphQLInputObjectType or GraphQLScalarType) to a
 * RelayIR ScalarField or LinkedField.
 */
function transformFieldToIR(node: {
  kind: string,
  name: string,
  type: GraphQLInputObjectType | GraphQLScalarType,
}): LinkedField | ScalarField {
  const type = getRawType(node.type);
  if (type instanceof GraphQLInputObjectType) {
    return transformInputObjectToIR(node);
  }

  if (type instanceof GraphQLEnumType || type instanceof GraphQLScalarType) {
    return transformScalarToIR(node.name, type);
  }

  throw new Error('Unhandled node type');
}

/**
 * Transforms a GraphQLScalarType to a RelayIR ScalarField
 */
function transformScalarToIR(
  name: string,
  type: GraphQLEnumType | GraphQLScalarType,
): ScalarField {
  return {
    alias: null,
    args: [],
    directives: [],
    handles: null,
    kind: 'ScalarField',
    metadata: null,
    name,
    type,
  };
}

module.exports = transformInputObjectToIR;
