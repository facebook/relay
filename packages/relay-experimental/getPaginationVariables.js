/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

const invariant = require('invariant');

import type {Direction} from './useLoadMoreFunction';
import type {ReaderPaginationMetadata, Variables} from 'relay-runtime';

function getPaginationVariables(
  direction: Direction,
  count: number,
  cursor: ?string,
  baseVariables: Variables,
  paginationMetadata: ReaderPaginationMetadata,
): {[string]: mixed} {
  const {
    backward: backwardMetadata,
    forward: forwardMetadata,
  } = paginationMetadata;

  if (direction === 'backward') {
    invariant(
      backwardMetadata != null &&
        backwardMetadata.count != null &&
        backwardMetadata.cursor != null,
      'Relay: Expected backward pagination metadata to be available. ' +
        "If you're seeing this, this is likely a bug in Relay.",
    );
    const paginationVariables = {
      ...baseVariables,
      [backwardMetadata.cursor]: cursor,
      [backwardMetadata.count]: count,
    };
    if (forwardMetadata && forwardMetadata.cursor) {
      paginationVariables[forwardMetadata.cursor] = null;
    }
    if (forwardMetadata && forwardMetadata.count) {
      paginationVariables[forwardMetadata.count] = null;
    }
    return paginationVariables;
  }

  invariant(
    forwardMetadata != null &&
      forwardMetadata.count != null &&
      forwardMetadata.cursor != null,
    'Relay: Expected forward pagination metadata to be available. ' +
      "If you're seeing this, this is likely a bug in Relay.",
  );
  const paginationVariables = {
    ...baseVariables,
    [forwardMetadata.cursor]: cursor,
    [forwardMetadata.count]: count,
  };
  if (backwardMetadata && backwardMetadata.cursor) {
    paginationVariables[backwardMetadata.cursor] = null;
  }
  if (backwardMetadata && backwardMetadata.count) {
    paginationVariables[backwardMetadata.count] = null;
  }
  return paginationVariables;
}

module.exports = getPaginationVariables;
