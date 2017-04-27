/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest.autoMockOff();

require('configureForRelayOSS');


const {transformASTSchema} = require('ASTConvert');
const RelayCompiler = require('RelayCompiler');
const RelayCompilerContext = require('RelayCompilerContext');
const RelayIRTransforms = require('RelayIRTransforms');
const RelayTestSchema = require('RelayTestSchema');

const getGoldenMatchers = require('getGoldenMatchers');
const parseGraphQLText = require('parseGraphQLText');
const prettyStringify = require('prettyStringify');

describe('RelayCompiler', () => {
  beforeEach(() => {
    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/compiler').toMatchGolden(text => {
      const relaySchema = transformASTSchema(
        RelayTestSchema,
        RelayIRTransforms.schemaTransforms,
      );
      const compiler = new RelayCompiler(
        RelayTestSchema,
        new RelayCompilerContext(relaySchema),
        RelayIRTransforms,
      );
      compiler.addDefinitions(parseGraphQLText(relaySchema, text).definitions);
      return Array.from(compiler.compile().values()).map(
        ({text: queryText, ...ast}) => {
          let stringified = prettyStringify(ast);
          if (queryText) {
            stringified += '\n\nQUERY:\n\n' + queryText;
          }
          return stringified;
        }
      ).join('\n\n');
    });
  });
});
