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

import type {FlattenOptions} from 'FlattenTransform';

describe('FlattenTransform', () => {
  let GraphQLCompilerContext;
  let FlattenTransform;
  let RelayRelayDirectiveTransform;
  let RelayParser;
  let GraphQLIRPrinter;
  let RelayTestSchema;
  let getGoldenMatchers;

  beforeEach(() => {
    jest.resetModules();

    GraphQLCompilerContext = require('GraphQLCompilerContext');
    FlattenTransform = require('FlattenTransform');
    RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');
    RelayParser = require('RelayParser');
    GraphQLIRPrinter = require('GraphQLIRPrinter');
    RelayTestSchema = require('RelayTestSchema');
    getGoldenMatchers = require('getGoldenMatchers');
    expect.extend(getGoldenMatchers(__filename));
  });

  function printContextTransform(
    options: FlattenOptions,
  ): (text: string) => string {
    return text => {
      const {transformASTSchema} = require('ASTConvert');
      const extendedSchema = transformASTSchema(RelayTestSchema, [
        RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
      ]);
      const context = new GraphQLCompilerContext(RelayTestSchema).addAll(
        RelayParser.parse(extendedSchema, text),
      );
      const nextContext = FlattenTransform.transform(context, options);
      return nextContext
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

  it('optionally flattens fragment spreads', () => {
    expect('fixtures/flatten-transform-option-flatten-spreads').toMatchGolden(
      printContextTransform({flattenFragmentSpreads: true}),
    );
  });

  it('optionally flattens abstract fragments', () => {
    expect('fixtures/flatten-transform-option-flatten-abstract').toMatchGolden(
      printContextTransform({flattenAbstractTypes: true}),
    );
  });

  it('flattens conditions', () => {
    expect(
      'fixtures/flatten-transform-option-flatten-conditions',
    ).toMatchGolden(printContextTransform({flattenConditions: true}));
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
