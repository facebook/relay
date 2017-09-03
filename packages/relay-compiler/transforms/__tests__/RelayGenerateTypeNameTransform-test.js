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
const RelayFlattenTransform = require('RelayFlattenTransform');
const RelayGenerateTypeNameTransform = require('RelayGenerateTypeNameTransform');
const RelayParser = require('RelayParser');
const RelayTestSchema = require('RelayTestSchema');

const getGoldenMatchers = require('getGoldenMatchers');

import type CompilerContext from 'GraphQLCompilerContext';

describe('RelayGenerateTypeNameTransform', () => {
  beforeEach(() => {
    expect.extend(getGoldenMatchers(__filename));
  });

  it('matches expected output for codegen', () => {
    expect('fixtures/generate-typename-transform').toMatchGolden(text => {
      const ast = RelayParser.parse(RelayTestSchema, text);
      const context = ast.reduce(
        (ctx, node) => ctx.add(node),
        new GraphQLCompilerContext(RelayTestSchema),
      );
      const transformContext = ((ctx, transform) => transform(ctx): any);
      const codegenContext = [
        (ctx: CompilerContext) =>
          RelayFlattenTransform.transform(ctx, {
            flattenAbstractTypes: true,
            flattenFragmentSpreads: true,
          }),
        RelayGenerateTypeNameTransform.transform,
      ].reduce(transformContext, context);
      return codegenContext
        .documents()
        .map(doc => JSON.stringify(doc, null, '  '))
        .join('\n');
    });
  });
});
