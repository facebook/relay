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

const FlattenTransform = require('FlattenTransform');
const GraphQLCompilerContext = require('GraphQLCompilerContext');
const InlineFragmentsTransform = require('InlineFragmentsTransform');
const RelayGenerateTypeNameTransform = require('RelayGenerateTypeNameTransform');
const RelayParser = require('RelayParser');
const RelayTestSchema = require('RelayTestSchema');

const getGoldenMatchers = require('getGoldenMatchers');

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
        InlineFragmentsTransform.transform,
        FlattenTransform.transformWithOptions({
          flattenAbstractTypes: true,
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
