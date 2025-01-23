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

import type {RelayResolverTestUtilsTest$key} from './__generated__/RelayResolverTestUtilsTest.graphql';

// TODO: T109483224 Make sure the test utils are working correctly, when `readFragment` is
// required from `relay-runtime`.
const {readFragment} = require('../../relay-runtime/store/ResolverFragments');
const {testResolver} = require('../RelayResolverTestUtils');
const {graphql} = require('relay-runtime');

function myTestResolver(rootKey: RelayResolverTestUtilsTest$key): string {
  const user = readFragment(
    graphql`
      fragment RelayResolverTestUtilsTest on User {
        name
      }
    `,
    rootKey,
  );

  return `Hello ${user.name ?? 'stranger'}!`;
}

test('testResolver', () => {
  const input = {
    name: 'Elizabeth',
  };
  const actual = testResolver(myTestResolver, input);
  expect(actual).toBe('Hello Elizabeth!');
});
