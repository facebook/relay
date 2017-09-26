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

const RelayParser = require('RelayParser');

const {convertASTDocuments} = require('ASTConvert');
const {extendSchema, parse} = require('graphql');

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
  const extendedSchema = extendSchema(schema, ast);
  const definitions = convertASTDocuments(
    extendedSchema,
    [ast],
    [],
    RelayParser.transform.bind(RelayParser),
  );
  return {
    definitions,
    schema: extendedSchema !== schema ? extendedSchema : null,
  };
}

module.exports = parseGraphQLText;
