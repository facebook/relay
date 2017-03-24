/**
 * Copyright 2004-present Facebook. All Rights Reserved.
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
