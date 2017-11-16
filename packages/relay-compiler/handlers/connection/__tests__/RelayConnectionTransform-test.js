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

describe('RelayConnectionTransform', () => {
  let GraphQLCompilerContext;
  let RelayConnectionTransform;
  let GraphQLIRPrinter;
  let RelayTestSchema;
  let getGoldenMatchers;
  let parseGraphQLText;
  let transformASTSchema;

  beforeEach(() => {
    jest.resetModules();

    GraphQLCompilerContext = require('GraphQLCompilerContext');
    RelayConnectionTransform = require('RelayConnectionTransform');
    GraphQLIRPrinter = require('GraphQLIRPrinter');
    RelayTestSchema = require('RelayTestSchema');
    getGoldenMatchers = require('getGoldenMatchers');
    parseGraphQLText = require('parseGraphQLText');

    ({transformASTSchema} = require('ASTConvert'));

    expect.extend(getGoldenMatchers(__filename));
  });

  function transformerWithOptions(options) {
    return text => {
      try {
        const schema = transformASTSchema(RelayTestSchema, [
          RelayConnectionTransform.SCHEMA_EXTENSION,
        ]);
        const {definitions} = parseGraphQLText(schema, text);
        let context = new GraphQLCompilerContext(schema).addAll(definitions);
        context = RelayConnectionTransform.transform(context, options);
        return context
          .documents()
          .map(
            doc =>
              GraphQLIRPrinter.print(doc) +
              '# Metadata:\n' +
              JSON.stringify(doc.metadata, null, 2),
          )
          .join('\n');
      } catch (error) {
        return error.message;
      }
    };
  }

  it('transforms @connection fields', () => {
    expect('fixtures').toMatchGolden(transformerWithOptions());
  });
});
