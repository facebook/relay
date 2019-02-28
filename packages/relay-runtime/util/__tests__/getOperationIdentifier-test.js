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

const getOperationIdentifier = require('../getOperationIdentifier');

describe('getOperationIdentifier', () => {
  it('passes with `id`', () => {
    const queryIdentifier = getOperationIdentifier(
      ({
        node: {
          params: {
            name: 'FooQuery',
            id: 123,
          },
        },
        variables: {foo: 1},
      }: any),
    );
    expect(queryIdentifier).toEqual('123{"foo":1}');
  });

  it('passes with `text`', () => {
    const queryIdentifier = getOperationIdentifier(
      ({
        node: {
          params: {
            name: 'FooQuery',
            text: 'query FooQuery {}',
          },
        },
        variables: {bar: 1},
      }: any),
    );
    expect(queryIdentifier).toEqual('query FooQuery {}{"bar":1}');
  });

  it('fails without `id` or `text`', () => {
    expect(() => {
      getOperationIdentifier(
        ({
          node: {
            params: {
              name: 'FooQuery',
            },
          },
          variables: {foo: 1},
        }: any),
      );
    }).toThrowError(
      'getOperationIdentifier: Expected operation `FooQuery` to have either a valid ' +
        '`id` or `text` property',
    );
  });
});
