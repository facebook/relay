/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

'use strict';

jest.disableAutomock();

import type {FlattenOptions} from 'RelayFlattenTransform';

describe('RelayFlattenTransform', () => {
  let RelayCompilerContext;
  let RelayFlattenTransform;
  let RelayParser;
  let RelayPrinter;
  let RelayTestSchema;
  let getGoldenMatchers;

  beforeEach(() => {
    jest.resetModules();

    RelayCompilerContext = require('RelayCompilerContext');
    RelayFlattenTransform = require('RelayFlattenTransform');
    RelayParser = require('RelayParser');
    RelayPrinter = require('RelayPrinter');
    RelayTestSchema = require('RelayTestSchema');
    getGoldenMatchers = require('getGoldenMatchers');

    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  function printContextTransform(
    options: FlattenOptions,
  ): (text: string) => string {
    return text => {
      const context = new RelayCompilerContext(RelayTestSchema).addAll(
        RelayParser.parse(RelayTestSchema, text),
      );
      const nextContext = RelayFlattenTransform.transform(context, options);
      return nextContext
        .documents()
        .map(doc => RelayPrinter.print(doc))
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
