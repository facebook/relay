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

import type {RelayResolverTestUtilsFlowTest$key} from './__generated__/RelayResolverTestUtilsFlowTest.graphql';

const {testResolver} = require('../RelayResolverTestUtils');
const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

function myTestResolver(rootKey: RelayResolverTestUtilsFlowTest$key): string {
  const user = readFragment(
    graphql`
      fragment RelayResolverTestUtilsFlowTest on User {
        name
      }
    `,
    rootKey,
  );

  return `Hello ${user.name ?? 'stranger'}!`;
}

testResolver(myTestResolver, {name: 'Elizabeth'});

// $FlowExpectedError[incompatible-type]  foo is an unexpected key
testResolver(myTestResolver, {
  name: 'Elizabeth',
  foo: 'bar',
});

// $FlowExpectedError[incompatible-type]  Object is not a string
testResolver(myTestResolver, {name: {}});
