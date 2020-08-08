/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {ReactFlightPayloadData} from '../network/RelayNetworkTypes';

const REACT_FLIGHT_QUERIES_STORAGE_KEY = 'queries';
const REACT_FLIGHT_TREE_STORAGE_KEY = 'tree';
const REACT_FLIGHT_TYPE_NAME = 'ReactFlightComponent';

function refineToReactFlightPayloadData(
  payload: mixed,
): ?ReactFlightPayloadData {
  if (
    payload == null ||
    typeof payload !== 'object' ||
    !Array.isArray(payload.tree) ||
    !Array.isArray(payload.queries)
  ) {
    return null;
  }
  return (payload: $FlowFixMe);
}

module.exports = {
  REACT_FLIGHT_QUERIES_STORAGE_KEY,
  REACT_FLIGHT_TREE_STORAGE_KEY,
  REACT_FLIGHT_TYPE_NAME,
  refineToReactFlightPayloadData,
};
