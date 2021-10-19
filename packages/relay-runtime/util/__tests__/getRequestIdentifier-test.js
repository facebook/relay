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

import type {RequestParameters} from '../../util/RelayConcreteNode';

const getRequestIdentifier = require('../getRequestIdentifier');

describe('getRequestIdentifier', () => {
  it('passes with `id`', () => {
    const queryIdentifier = getRequestIdentifier(
      ({
        name: 'FooQuery',
        operationKind: 'query',
        metadata: {},
        id: '123',
        text: null,
      }: RequestParameters),
      {foo: 1},
    );
    expect(queryIdentifier).toEqual('123{"foo":1}');
  });

  it('passes with `text`', () => {
    const queryIdentifier = getRequestIdentifier(
      ({
        name: 'FooQuery',
        operationKind: 'query',
        metadata: {},
        id: null,
        text: 'query Test { __typename }',
        cacheID: 'test-cache-id',
      }: RequestParameters),
      {foo: 1},
    );
    expect(queryIdentifier).toEqual('test-cache-id{"foo":1}');
  });
});
