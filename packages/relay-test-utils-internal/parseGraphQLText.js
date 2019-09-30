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

const {extendSchema, parse} = require('graphql');
const {Parser, Schema, convertASTDocuments} = require('relay-compiler');

import type {GraphQLSchema} from 'graphql';
import type {Fragment, Root} from 'relay-compiler';

function parseGraphQLText(
  schema: GraphQLSchema,
  text: string,
): {
  definitions: $ReadOnlyArray<Fragment | Root>,
  schema: GraphQLSchema,
} {
  const ast = parse(text);
  const extendedSchema = extendSchema(schema, ast, {assumeValid: true});
  const definitions = convertASTDocuments(
    Schema.DEPRECATED__create(schema, extendedSchema),
    [ast],
    [],
    Parser.transform.bind(Parser),
  );
  return {
    definitions,
    schema: extendedSchema,
  };
}

module.exports = parseGraphQLText;
