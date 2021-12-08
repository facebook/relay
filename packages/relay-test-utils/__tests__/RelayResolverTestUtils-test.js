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

import type {RelayResolverTestUtilsTest$key} from './__generated__/RelayResolverTestUtilsTest.graphql';

const {testResolver} = require('../RelayResolverTestUtils');
const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

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
    $fragmentType: (null: any),
  };
  const actual = testResolver(myTestResolver, input);
  expect(actual).toBe('Hello Elizabeth!');
});
