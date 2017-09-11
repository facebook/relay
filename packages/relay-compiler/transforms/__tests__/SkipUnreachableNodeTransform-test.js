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
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const RelayParser = require('RelayParser');
const RelayTestSchema = require('RelayTestSchema');
const SkipUnreachableNodeTransform = require('SkipUnreachableNodeTransform');

const getGoldenMatchers = require('getGoldenMatchers');

describe('SkipUnreachableNodeTransform', () => {
  beforeEach(() => {
    expect.extend(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/skip-unreachable-node-transform').toMatchGolden(text => {
      const ast = RelayParser.parse(RelayTestSchema, text);
      const context = ast.reduce(
        (ctx, node) => ctx.add(node),
        new GraphQLCompilerContext(RelayTestSchema),
      );
      const nextContext = SkipUnreachableNodeTransform.transform(context);
      const documents = [];
      nextContext.documents().forEach(doc => {
        documents.push(GraphQLIRPrinter.print(doc));
      });
      return documents.join('\n');
    });
  });
});
