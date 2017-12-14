/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const GraphQLCompilerContext = require('GraphQLCompilerContext');
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const RelayApplyFragmentArgumentTransform = require('RelayApplyFragmentArgumentTransform');
const RelayParser = require('RelayParser');
const RelayTestSchema = require('RelayTestSchema');

const getGoldenMatchers = require('getGoldenMatchers');

describe('RelayApplyFragmentArgumentTransform', () => {
  beforeEach(() => {
    expect.extend(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/apply-fragment-argument-transform').toMatchGolden(text => {
      const ast = RelayParser.parse(RelayTestSchema, text);
      return new GraphQLCompilerContext(RelayTestSchema)
        .addAll(ast)
        .applyTransforms([RelayApplyFragmentArgumentTransform.transform])
        .documents()
        .map(GraphQLIRPrinter.print)
        .join('\n');
    });
  });
});
