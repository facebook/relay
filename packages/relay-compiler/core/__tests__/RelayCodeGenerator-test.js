/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const GraphQLCompilerContext = require('GraphQLCompilerContext');
const RelayCodeGenerator = require('RelayCodeGenerator');
const RelayTestSchema = require('RelayTestSchema');

const getGoldenMatchers = require('getGoldenMatchers');
const parseGraphQLText = require('parseGraphQLText');
const prettyStringify = require('prettyStringify');

describe('RelayCodeGenerator', () => {
  beforeEach(() => {
    expect.extend(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/code-generator').toMatchGolden(text => {
      const {definitions} = parseGraphQLText(RelayTestSchema, text);
      const context = new GraphQLCompilerContext(RelayTestSchema).addAll(
        definitions,
      );
      return context
        .documents()
        .map(doc => prettyStringify(RelayCodeGenerator.generate(doc)))
        .join('\n\n');
    });
  });
});
