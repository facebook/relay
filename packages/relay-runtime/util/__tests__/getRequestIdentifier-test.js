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

// flowlint ambiguous-object-type:error

'use strict';

const getRequestIdentifier = require('../getRequestIdentifier');

describe('getRequestIdentifier', () => {
  it('passes with `requestID`', () => {
    const queryIdentifier = getRequestIdentifier(
      ({
        name: 'FooQuery',
        requestID: '123',
      }: any),
      {foo: 1},
    );
    expect(queryIdentifier).toEqual('123{"foo":1}');
  });

  it('fails without `requestID`', () => {
    expect(() => {
      getRequestIdentifier(
        ({
          name: 'FooQuery',
        }: any),
        {foo: 1},
      );
    }).toThrowError(
      'getRequestIdentifier: Expected request `FooQuery` to have a valid `requestID` property',
    );
  });
});
