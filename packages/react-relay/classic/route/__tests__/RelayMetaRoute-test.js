/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const RelayMetaRoute = require('../RelayMetaRoute');

describe('RelayMetaRoute', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('is immutable', () => {
    const route = new RelayMetaRoute('TestRoute');
    expect(() => {
      route.name = 'foo';
    }).toThrow();
  });

  it('returns caches objects when using `get`', () => {
    expect(RelayMetaRoute.get('TestRoute')).toBe(
      RelayMetaRoute.get('TestRoute'),
    );

    expect(RelayMetaRoute.get('TestRoute')).not.toBe(
      RelayMetaRoute.get('TestRoute2'),
    );

    expect(RelayMetaRoute.get('TestRoute2')).toBe(
      RelayMetaRoute.get('TestRoute2'),
    );
  });
});
