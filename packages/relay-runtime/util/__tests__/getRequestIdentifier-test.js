/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import type {RequestParameters} from '../../util/RelayConcreteNode';

const getRequestIdentifier = require('../getRequestIdentifier');

describe('getRequestIdentifier', () => {
  it('passes with `id`', () => {
    const queryIdentifier = getRequestIdentifier(
      {
        id: '123',
        metadata: {},
        name: 'FooQuery',
        operationKind: 'query',
        text: null,
      } as RequestParameters,
      {foo: 1},
    );
    expect(queryIdentifier).toEqual('123{"foo":1}');
  });

  it('passes with `text`', () => {
    const queryIdentifier = getRequestIdentifier(
      {
        cacheID: 'test-cache-id',
        id: null,
        metadata: {},
        name: 'FooQuery',
        operationKind: 'query',
        text: 'query Test { __typename }',
      } as RequestParameters,
      {foo: 1},
    );
    expect(queryIdentifier).toEqual('test-cache-id{"foo":1}');
  });
});
