/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule parseGraphQLText
 * @flow
 */

'use strict';

const {convertASTDocuments} = require('ASTConvert');
const {extendSchema, parse} = require('graphql');

import type {Fragment, Root} from 'RelayIR';
import type {GraphQLSchema} from 'graphql';

function parseGraphQLText(schema: GraphQLSchema, text: string): {
  definitions: Array<Fragment | Root>,
  schema: ?GraphQLSchema,
} {
  const ast = parse(text);
  const extendedSchema = extendSchema(schema, ast);
  const definitions = convertASTDocuments(extendedSchema, [ast], []);
  return {
    definitions,
    schema: extendedSchema !== schema ? extendedSchema : null,
  };
}

module.exports = parseGraphQLText;
