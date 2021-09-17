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

const {testResolver} = require('../RelayResolverTestUtils');

import type {RelayResolverTestUtilsTest$key} from '../__tests__/__generated__/RelayResolverTestUtilsTest.graphql';

declare function myTestResolver(
  rootKey: RelayResolverTestUtilsTest$key,
): string;

testResolver(myTestResolver, {
  name: 'Elizabeth',
  $refType: (null: any),
});

testResolver(
  myTestResolver,
  // $FlowExpectedError foo is an unexpected key
  {
    name: 'Elizabeth',
    foo: 'bar',
    $refType: (null: any),
  },
);

testResolver(myTestResolver, {
  // $FlowExpectedError Object is not a string
  name: {},
  $refType: (null: any),
});
