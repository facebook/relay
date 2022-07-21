/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

'use strict';

import type {DataID} from 'relay-runtime';

/**
 * @RelayResolver
 * @fieldName client_object(id: ID!)
 * @edgeTo ClientObject
 * @onType User
 */
function UserClientEdgeClientObjectResolver(args: {id: string}): ?DataID {
  if (args.id === '0') {
    return null;
  }
  return args.id;
}

module.exports = UserClientEdgeClientObjectResolver;
