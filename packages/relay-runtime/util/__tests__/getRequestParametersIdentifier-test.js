/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow
 * @format
 */

'use strict';

const getRequestParametersIdentifier = require('../getRequestParametersIdentifier');

describe('getRequestParametersIdentifier', () => {
  it('passes with `id`', () => {
    const queryIdentifier = getRequestParametersIdentifier(
      ({
        name: 'FooQuery',
        id: '123',
      }: any),
      {foo: 1},
    );
    expect(queryIdentifier).toEqual('123{"foo":1}');
  });

  it('passes with `text`', () => {
    const queryIdentifier = getRequestParametersIdentifier(
      ({
        name: 'FooQuery',
        text: 'query FooQuery {}',
      }: any),
      {bar: 1},
    );
    expect(queryIdentifier).toEqual('query FooQuery {}{"bar":1}');
  });

  it('fails without `id` or `text`', () => {
    expect(() => {
      getRequestParametersIdentifier(
        ({
          name: 'FooQuery',
        }: any),
        {foo: 1},
      );
    }).toThrowError(
      'getRequestParametersIdentifier: Expected request `FooQuery` to have ' +
        'either a valid `id` or `text` property',
    );
  });
});
