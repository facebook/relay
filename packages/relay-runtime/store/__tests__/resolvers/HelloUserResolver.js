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

import type {ConcreteClientEdgeResolverReturnType} from 'relay-runtime';

/**
 * @RelayResolver Query.hello_user(id: ID!): User
 *
 * This should return the User
 */
function hello_user(args: {
  id: string,
}): ConcreteClientEdgeResolverReturnType<> {
  return {id: args.id};
}

module.exports = {
  hello_user,
};
