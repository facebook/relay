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

const RelayCompilerContext = require('RelayCompilerContext');
const RelayFlowGenerator = require('RelayFlowGenerator');
const RelayTestSchema = require('RelayTestSchema');
const RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');

const getGoldenMatchers = require('getGoldenMatchers');
const parseGraphQLText = require('parseGraphQLText');

const {transformASTSchema} = require('ASTConvert');

describe('RelayFlowGenerator', () => {
  beforeEach(() => {
    expect.extend(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/flow-generator').toMatchGolden(text => {
      const schema = transformASTSchema(RelayTestSchema, [
        RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
      ]);
      const {definitions} = parseGraphQLText(schema, text);
      const context = new RelayCompilerContext(RelayTestSchema).addAll(
        definitions,
      );
      return context
        .documents()
        .map(doc => RelayFlowGenerator.generate(doc))
        .join('\n\n');
    });
  });
});
