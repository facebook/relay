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

import type {DataID} from 'relay-runtime';

/**
 * @RelayResolver
 * @fieldName client_node(id: ID!)
 * @edgeTo Node
 * @onType User
 */
function client_node(args: {id: string}): DataID {
  return args.id;
}

module.exports = {
  client_node,
};
