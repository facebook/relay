/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const {parse} = require('graphql');
const {Parser, convertASTDocuments} = require('relay-compiler');

import type {Fragment, Root, Schema} from 'relay-compiler';

function parseGraphQLText(
  schema: Schema,
  text: string,
): {
  definitions: $ReadOnlyArray<Fragment | Root>,
  schema: Schema,
  ...
} {
  const ast = parse(text);
  const extendedSchema = schema.extend(ast);
  const definitions = convertASTDocuments(
    extendedSchema,
    [ast],
    Parser.transform.bind(Parser),
  );
  return {
    definitions,
    schema: extendedSchema,
  };
}

module.exports = parseGraphQLText;
