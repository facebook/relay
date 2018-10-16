/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {OperationSelector} from 'relay-runtime';

/**
 * Returns a stable identifier for a query OperationSelector,
 * i.e. for the query + the variables being used.
 */
function getQueryIdentifier_UNSTABLE(query: OperationSelector) {
  const {node, variables} = query;
  const requestID = node.id != null ? node.id : node.text;
  const queryKey = String(requestID);
  return queryKey + JSON.stringify(variables);
}

module.exports = getQueryIdentifier_UNSTABLE;
