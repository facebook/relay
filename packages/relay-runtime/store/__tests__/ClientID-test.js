/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const {
  generateClientID,
  generateUniqueClientID,
  isClientID,
} = require('../ClientID');

it('creates unique local ids', () => {
  const set = new Set();
  for (let i = 0; i < 10; i++) {
    const id = generateUniqueClientID();
    expect(set.has(id)).toBe(false);
    set.add(id);
  }
});

it('can detect created client ids', () => {
  expect(isClientID(generateUniqueClientID())).toBe(true);
  expect(isClientID(generateClientID('0', ''))).toBe(true);
  expect(isClientID('<server-id>')).toBe(false);
});

it('does not add extra prefix to a client id', () => {
  const clientID = 'client:0';
  expect(generateClientID(clientID, 'a')).toEqual(`${clientID}:a`);
});
