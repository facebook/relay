/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

const {generateTypeID, isTypeID} = require('../TypeID');

describe('generateTypeID()', () => {
  it('returns the type ID for a type name', () => {
    expect(generateTypeID('User')).toBe('client:__type:User');
    expect(generateTypeID('Page')).toBe('client:__type:Page');
    expect(generateTypeID('User')).toBe('client:__type:User');
    expect(isTypeID(generateTypeID('Story'))).toBe(true);
  });

  it('returns distinct IDs for type names that only differ by case', () => {
    expect(generateTypeID('feed')).toBe('client:__type:feed');
    expect(generateTypeID('Feed')).toBe('client:__type:Feed');
  });
});
