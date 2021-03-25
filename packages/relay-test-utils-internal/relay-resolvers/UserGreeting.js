/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+relay
 */

'use strict';

const {graphql} = require('../../relay-runtime/query/GraphQLTag');

import type {UserGreeting$key} from './__generated__/UserGreeting.graphql.js';

export type ResolvedValueType = string;

// Eventually our schema definition will be derived from this function. For now, it's `../schema-extensions/User.graphql`
function userGreeting(rootKey: UserGreeting$key): string {
  graphql`
    fragment UserGreeting on User {
      name
    }
  `;

  return 'Hello <TODO: ADD THIS>';
}

module.exports = userGreeting;
