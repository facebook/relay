/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule parseGraphQLText
 * @flow
 * @format
 */

'use strict';

const {extendSchema, parse} = require('graphql');
const {Parser, convertASTDocuments} = require('relay-compiler');

import type {Fragment, Root} from 'GraphQLIR';
import type {GraphQLSchema} from 'graphql';

function parseGraphQLText(
  schema: GraphQLSchema,
  text: string,
): {
  definitions: Array<Fragment | Root>,
  schema: ?GraphQLSchema,
} {
  const ast = parse(text);
  // TODO T24511737 figure out if this is dangerous
  const extendedSchema = extendSchema(schema, ast, {assumeValid: true});
  const definitions = convertASTDocuments(
    extendedSchema,
    [ast],
    [],
    Parser.transform.bind(Parser),
  );
  return {
    definitions,
    schema: extendedSchema !== schema ? extendedSchema : null,
  };
}

module.exports = parseGraphQLText;
