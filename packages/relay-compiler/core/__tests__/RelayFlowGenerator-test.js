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
const RelayFlowGenerator = require('RelayFlowGenerator');
const RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');
const RelayTestSchema = require('RelayTestSchema');

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
      const context = new GraphQLCompilerContext(RelayTestSchema).addAll(
        definitions,
      );
      const flowContext = RelayFlowGenerator.flowTransforms.reduce(
        (ctx, transform) => transform(ctx, schema),
        context,
      );
      return flowContext
        .documents()
        .map(doc => RelayFlowGenerator.generate(doc))
        .join('\n\n');
    });
  });
});
