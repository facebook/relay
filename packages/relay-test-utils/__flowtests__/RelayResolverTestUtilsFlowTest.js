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

testResolver(myTestResolver, {
  name: 'Elizabeth',
  $fragmentType: (null: any),
});

testResolver(
  myTestResolver,
  // $FlowExpectedError foo is an unexpected key
  {
    name: 'Elizabeth',
    foo: 'bar',
    $fragmentType: (null: any),
  },
);

testResolver(myTestResolver, {
  // $FlowExpectedError Object is not a string
  name: {},
  $fragmentType: (null: any),
});
