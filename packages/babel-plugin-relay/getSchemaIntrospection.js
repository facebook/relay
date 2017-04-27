/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

'use strict';

const fs = require('fs');

const {parse} = require('graphql');

const RELAY_DIRECTIVES = `
  directive @include(if: Boolean) on FRAGMENT_DEFINITION | FRAGMENT_SPREAD | INLINE_FRAGMENT | FIELD
  directive @skip(if: Boolean) on FRAGMENT_DEFINITION | FRAGMENT_SPREAD | INLINE_FRAGMENT | FIELD
  directive @relay(
    isConnectionWithoutNodeID: Boolean,
    isStaticFragment: Boolean,
    pattern: Boolean,
    plural: Boolean,
    variables: [String],
  ) on FRAGMENT_DEFINITION | FRAGMENT_SPREAD | INLINE_FRAGMENT | FIELD
  directive ${'@'}generated on OPERATION | FRAGMENT_DEFINITION | FRAGMENT_SPREAD | INLINE_FRAGMENT
`;

function getSchemaIntrospection(schemaPath /*: string*/) {
  try {
    const source = fs.readFileSync(schemaPath, 'utf8');
    if (source[0] === '{') {
      return JSON.parse(source);
    }
    return parse(RELAY_DIRECTIVES + '\n' + source);
  } catch (error) {
    // Log a more helpful warning (by including the schema path).
    console.error(
      'Encountered the following error while loading the GraphQL schema: ' +
      schemaPath + '\n\n' +
      error.stack.split('\n').map(line => '> ' + line).join('\n')
    );
    throw error;
  }
}

module.exports = getSchemaIntrospection;
