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

require('configureForRelayOSS');

const {transformASTSchema} = require('ASTConvert');
const {generate} = require('RelayCodeGenerator');
const RelayCompiler = require('RelayCompiler');
const GraphQLCompilerContext = require('GraphQLCompilerContext');
const RelayIRTransforms = require('RelayIRTransforms');
const RelayTestSchema = require('RelayTestSchema');

const getGoldenMatchers = require('getGoldenMatchers');
const parseGraphQLText = require('parseGraphQLText');

describe('RelayCompiler', () => {
  beforeEach(() => {
    expect.extend(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/compiler').toMatchGolden(text => {
      const relaySchema = transformASTSchema(
        RelayTestSchema,
        RelayIRTransforms.schemaExtensions,
      );
      const compiler = new RelayCompiler(
        RelayTestSchema,
        new GraphQLCompilerContext(relaySchema),
        RelayIRTransforms,
        generate,
      );
      compiler.addDefinitions(parseGraphQLText(relaySchema, text).definitions);
      return Array.from(compiler.compile().values())
        .map(({text: queryText, ...ast}) => {
          let stringified = JSON.stringify(ast, null, 2);
          if (queryText) {
            stringified += '\n\nQUERY:\n\n' + queryText;
          }
          return stringified;
        })
        .join('\n\n');
    });
  });
});
