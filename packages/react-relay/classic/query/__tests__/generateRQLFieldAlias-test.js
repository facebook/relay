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

const generateRQLFieldAlias = require('../generateRQLFieldAlias');

const ALIAS_HEURISTIC = /^[\w-]+$/;

function expectEncode(input) {
  const encoded = generateRQLFieldAlias(input);
  expect(ALIAS_HEURISTIC.test(encoded)).toBe(true);
  expect(encoded).not.toEqual(input);
}

describe('GraphQLFieldEncoder', () => {
  it('does not encode field names without calls', () => {
    expect(generateRQLFieldAlias('friends')).toEqual('friends');
  });

  it('encodes field names with calls', () => {
    expectEncode('friends.orderby(importance).first(10)');
  });

  it('encodes field names with call variables', () => {
    expectEncode('friends.first(<count>)');
  });

  it('encodes field names with weird characters in calls', () => {
    expectEncode('friends.orderby(=  e1 \\ )');
  });

  it('returns the same hash for the same input', () => {
    const input = 'friends.orderby(importance).first(20)';
    expectEncode(input);
    expect(generateRQLFieldAlias(input)).toEqual(generateRQLFieldAlias(input));
  });
});
