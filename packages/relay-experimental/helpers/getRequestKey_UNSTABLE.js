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

import type {RequestNode, Variables} from 'relay-runtime';

function getRequestKey_UNSTABLE(
  requestNode: RequestNode,
  variables: Variables,
) {
  let queryKey = '';
  const requestID = requestNode.id != null ? requestNode.id : requestNode.text;
  queryKey = String(requestID);
  return queryKey + JSON.stringify(variables);
}

module.exports = getRequestKey_UNSTABLE;
