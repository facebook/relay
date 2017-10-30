/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type {ReadyStateEvent} from '../tools/RelayTypes';

/**
 * Parses Relay ready state events so users of RelayRenderer can have more fine grain control in the
 * relayRender callback.
 */
module.exports = {
  parseEvents(events: Array<ReadyStateEvent>): ?Object {
    return events.reduce(
      (intermediateStatus, event) => {
        switch (event.type) {
          case 'CACHE_RESTORE_FAILED':
            return {
              ...intermediateStatus,
              error: true,
              loadingCache: false,
            };
          case 'NETWORK_QUERY_ERROR':
            return {
              ...intermediateStatus,
              error: true,
              loadingNetwork: false,
            };
          case 'NETWORK_QUERY_START':
            return {
              ...intermediateStatus,
              error: false,
              loadingNetwork: true,
              ready: false,
            };
          case 'CACHE_RESTORE_START':
            return {
              ...intermediateStatus,
              error: false,
              loadingCache: true,
              ready: false,
            };
          case 'CACHE_RESTORED_REQUIRED':
          case 'NETWORK_QUERY_RECEIVED_REQUIRED':
          case 'NETWORK_QUERY_RECEIVED_ALL':
            return {
              ...intermediateStatus,
              error: false,
              loadingCache: false,
              ready: true,
            };
          default:
            return intermediateStatus;
        }
      },
      {
        error: false,
        loadingCache: false,
        loadingNetwork: false,
        ready: false,
      },
    );
  },
};
