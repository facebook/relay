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
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const RelayParser = require('RelayParser');
const RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');
const RelayTestSchema = require('RelayTestSchema');

const getGoldenMatchers = require('getGoldenMatchers');

import type {FlattenOptions} from 'FlattenTransform';

expect.extend(getGoldenMatchers(__filename));

describe('FlattenTransform', () => {
  function printContextTransform(
    options: FlattenOptions,
  ): (text: string) => string {
    return text => {
      const {transformASTSchema} = require('ASTConvert');
      const extendedSchema = transformASTSchema(RelayTestSchema, [
        RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
      ]);
      let context = new GraphQLCompilerContext(RelayTestSchema).addAll(
        RelayParser.parse(extendedSchema, text),
      );

      context = FlattenTransform.transformWithOptions(options)(context);

      return context
        .documents()
        .map(doc => GraphQLIRPrinter.print(doc))
        .join('\n');
    };
  }

  it('flattens inline fragments with compatible types', () => {
    expect('fixtures/flatten-transform').toMatchGolden(
      printContextTransform({}),
    );
  });

  it('optionally flattens abstract fragments', () => {
    expect('fixtures/flatten-transform-option-flatten-abstract').toMatchGolden(
      printContextTransform({flattenAbstractTypes: true}),
    );
  });

  it('flattens inline fragments', () => {
    expect('fixtures/flatten-transform-option-flatten-inline').toMatchGolden(
      printContextTransform({flattenInlineFragments: true}),
    );
  });

  it('throws errors under some conditions', () => {
    expect('fixtures/flatten-transform-errors').toMatchGolden(text => {
      try {
        printContextTransform({})(text);
      } catch (error) {
        return error.toString();
      }
      throw new Error('This transform should have thrown an error');
    });
  });
});
